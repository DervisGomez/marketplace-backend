const express = require('express');
const fs = require('node:fs');
const request = require('supertest');

const TEN_MEGABYTES = 10 * 1024 * 1024;

function createUploadApp() {
    const upload = require('../../middlewares/upload');
    const app = express();

    app.post('/upload', upload.array('files', 10), async (req, res) => {
        await Promise.all(req.files.map(file => fs.promises.unlink(file.path)));
        res.status(200).json({
            files: req.files.map(file => file.originalname),
            storedNames: req.files.map(file => file.filename)
        });
    });
    app.use(upload.handleError);

    return app;
}

describe('request and upload security limits', () => {
    it('accepts valid JSON within the configured limit', async () => {
        process.env.JWT_SECRET ||= 'coverage-test-secret';
        const { app } = require('../../app');

        const response = await request(app)
            .post('/api')
            .set('Content-Type', 'application/json')
            .send({ value: 'accepted' });

        expect(response.status).not.toBe(413);
    });

    it('rejects JSON exceeding the configured limit', async () => {
        process.env.JWT_SECRET ||= 'coverage-test-secret';
        const { app } = require('../../app');

        const response = await request(app)
            .post('/api')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ value: 'x'.repeat(TEN_MEGABYTES) }));

        expect(response.status).toBe(413);
    });

    it('accepts a valid file with an allowed MIME type', async () => {
        const response = await request(createUploadApp()).post('/upload').attach('files', Buffer.from('valid image'), {
            filename: 'photo.png',
            contentType: 'image/png'
        });

        expect(response.status).toBe(200);
        expect(response.body.files).toEqual(['photo.png']);
        expect(response.body.storedNames[0]).toMatch(/^[a-z0-9]{8}-photo\.png$/);
    });

    it('rejects a file exceeding the configured size limit', async () => {
        const response = await request(createUploadApp())
            .post('/upload')
            .attach('files', Buffer.alloc(TEN_MEGABYTES + 1), {
                filename: 'large.png',
                contentType: 'image/png'
            });

        expect(response.status).toBe(413);
        expect(response.body.code).toBe('LIMIT_FILE_SIZE');
    });

    it('rejects a file with a disallowed MIME type', async () => {
        const response = await request(createUploadApp()).post('/upload').attach('files', Buffer.from('executable'), {
            filename: 'payload.exe',
            contentType: 'application/x-msdownload'
        });

        expect(response.status).toBe(415);
        expect(response.body.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    });

    it('rejects requests containing too many files', async () => {
        let pendingRequest = request(createUploadApp()).post('/upload');

        for (let index = 0; index < 11; index += 1) {
            pendingRequest = pendingRequest.attach('files', Buffer.from('image'), {
                filename: `photo-${index}.png`,
                contentType: 'image/png'
            });
        }

        const response = await pendingRequest;

        expect(response.status).toBe(413);
        expect(response.body.code).toBe('LIMIT_FILE_COUNT');
    });
});
