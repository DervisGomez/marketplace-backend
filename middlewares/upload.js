'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const randString = require('../services/randString.js');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_MIME_TYPES = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

function sanitizeFilename(filename) {
    const basename = path.basename(filename).normalize('NFKC');
    const sanitized = basename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/^\.+/, '')
        .slice(-120);

    return sanitized || 'file';
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, path.join(__dirname, '/../uploads'));
    },
    filename: (_req, file, callback) => {
        callback(null, `${randString.create()}-${sanitizeFilename(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    },
    fileFilter: (_req, file, callback) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            callback(null, true);
            return;
        }

        const error = new Error(`Unsupported upload MIME type: ${file.mimetype}`);
        error.code = 'UNSUPPORTED_MEDIA_TYPE';
        error.status = 415;
        callback(error);
    }
});

upload.handleError = async (error, req, res, next) => {
    if (!error) {
        next();
        return;
    }

    const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    await Promise.all(
        files
            .filter(file => typeof file.path === 'string')
            .map(file => fs.promises.unlink(file.path).catch(() => undefined))
    );

    if (error instanceof multer.MulterError) {
        res.status(413).json({ error: 'Upload limit exceeded', code: error.code });
        return;
    }

    if (error.code === 'UNSUPPORTED_MEDIA_TYPE') {
        res.status(415).json({ error: error.message, code: error.code });
        return;
    }

    next(error);
};

upload.limits = Object.freeze({
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    mimeTypes: Object.freeze([...ALLOWED_MIME_TYPES])
});
upload.sanitizeFilename = sanitizeFilename;

module.exports = upload;
