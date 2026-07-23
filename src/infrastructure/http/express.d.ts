declare global {
    var image: unknown;

    namespace Express {
        interface Request {
            requestId?: string;
            token?: string;
            type?: string;
            user: {
                _id: string;
                city: string;
                department: string;
                email: string;
                favorite: unknown[];
                name: string;
                phone: string;
                referred?: string;
            };
        }
    }
}

declare var image: unknown;

export {};
