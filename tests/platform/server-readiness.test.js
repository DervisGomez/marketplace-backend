const { spawnSync } = require('node:child_process');
const path = require('node:path');

const startServer = require('../../dist/src/infrastructure/http/startServer');

function dependencies(connect) {
    const events = [];
    const server = {
        listen: vi.fn((_port, callback) => {
            events.push('listen');
            callback();
            return server;
        }),
        once: vi.fn(() => server)
    };
    const io = {
        on: vi.fn((event, handler) => {
            events.push(`socket:${event}`);
            handler({ id: 'socket-id' });
        })
    };
    const logger = {
        fatal: vi.fn(),
        info: vi.fn()
    };

    return {
        events,
        io,
        logger,
        options: {
            SocketServer: vi.fn(function SocketServer() {
                events.push('socket-server');
                return io;
            }),
            app: { get: vi.fn(() => 3000) },
            connection: {
                socket: vi.fn(() => events.push('socket-handler'))
            },
            createServer: vi.fn(() => {
                events.push('create-server');
                return server;
            }),
            db: {
                connect: vi.fn(async uri => {
                    events.push('database-connect');
                    return connect(uri);
                })
            },
            logger,
            mongoUri: 'mongodb://test/readiness'
        },
        server
    };
}

describe('server readiness bootstrap', () => {
    it('opens the HTTP server only after MongoDB connects', async () => {
        const fixture = dependencies(async () => undefined);

        const result = await startServer(fixture.options);

        expect(fixture.events).toEqual([
            'database-connect',
            'create-server',
            'socket-server',
            'socket:connection',
            'socket-handler',
            'listen'
        ]);
        expect(result.server).toBe(fixture.server);
        expect(fixture.logger.info).toHaveBeenCalledWith(
            { database: 'mongodb://test/readiness' },
            'Database connected'
        );
    });

    it('does not create or listen on a server when MongoDB fails', async () => {
        const databaseError = new Error('database unavailable');
        const fixture = dependencies(async () => {
            throw databaseError;
        });

        await expect(startServer(fixture.options)).rejects.toBe(databaseError);

        expect(fixture.options.createServer).not.toHaveBeenCalled();
        expect(fixture.server.listen).not.toHaveBeenCalled();
    });

    it('logs a fatal database connection error', async () => {
        const databaseError = new Error('database unavailable');
        const fixture = dependencies(async () => {
            throw databaseError;
        });

        await expect(startServer(fixture.options)).rejects.toBe(databaseError);

        expect(fixture.logger.fatal).toHaveBeenCalledWith({ err: databaseError }, 'Database connection failed');
    });

    it('terminates the process without listening when MongoDB cannot connect', () => {
        const result = spawnSync(process.execPath, ['server.js'], {
            cwd: path.resolve(__dirname, '../..'),
            encoding: 'utf8',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                JWT_SECRET: 'test',
                MONGODB_URI: 'invalid://readiness',
                CLOUDINARY_CLOUD_NAME: 'test',
                CLOUDINARY_API_KEY: 'test',
                CLOUDINARY_API_SECRET: 'test',
                MAILJET_API_KEY: 'test',
                MAILJET_SECRET: 'test',
                MAILJET_FROM_EMAIL: 'marketplace@example.test',
                TWILIO_ACCOUNT_SID: 'test',
                TWILIO_AUTH_TOKEN: 'test',
                TWILIO_PHONE_NUMBER: '+570000000000'
            },
            timeout: 10000
        });
        const output = `${result.stdout}\n${result.stderr}`;

        expect(result.status).not.toBe(0);
        expect(output).toContain('Database connection failed');
        expect(output).not.toContain('HTTP server listening');
    });
});
