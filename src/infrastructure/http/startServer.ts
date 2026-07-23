interface Application {
    get(name: string): string | number;
}

interface Database {
    connect(uri: string): Promise<unknown>;
}

interface HttpServer {
    listen(port: string | number, callback: () => void): HttpServer;
    once(event: 'error', listener: (error: Error) => void): HttpServer;
}

interface SocketServer {
    on(event: 'connection', listener: (socket: unknown) => void): void;
}

interface SocketServerConstructor {
    new (server: HttpServer, options: Readonly<{ allowEIO3: boolean }>): SocketServer;
}

interface Logger {
    fatal(context: Readonly<{ err: unknown }>, message: string): void;
    info(context: Readonly<Record<string, unknown>>, message: string): void;
}

interface StartServerOptions {
    readonly SocketServer: SocketServerConstructor;
    readonly app: Application;
    readonly connection: Readonly<{
        socket(io: SocketServer, socket: unknown): void;
    }>;
    readonly createServer: (app: Application) => HttpServer;
    readonly db: Database;
    readonly logger: Logger;
    readonly mongoUri: string;
}

interface StartedServer {
    readonly io: SocketServer;
    readonly server: HttpServer;
}

async function listen(server: HttpServer, port: string | number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, resolve);
    });
}

async function startServer(options: StartServerOptions): Promise<StartedServer> {
    try {
        await options.db.connect(options.mongoUri);
    } catch (err) {
        options.logger.fatal({ err }, 'Database connection failed');
        throw err;
    }

    options.logger.info({ database: options.mongoUri }, 'Database connected');

    const server = options.createServer(options.app);
    const io = new options.SocketServer(server, { allowEIO3: true });
    io.on('connection', socket => {
        options.connection.socket(io, socket);
    });

    const port = options.app.get('port');
    await listen(server, port);
    options.logger.info({ port }, 'HTTP server listening');

    return { io, server };
}

export = startServer;
