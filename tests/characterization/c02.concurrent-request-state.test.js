function responseRecorder() {
    const response = {
        body: undefined,
        statusCode: undefined,
        status(code) {
            response.statusCode = code;
            return response;
        },
        json(body) {
            response.body = body;
            return response;
        }
    };

    return response;
}

function resolvedQuery(value, beforeResolve) {
    const query = {
        limit() {
            return query;
        },
        populate() {
            return query;
        },
        skip() {
            return query;
        },
        sort() {
            return query;
        },
        then(resolve, reject) {
            return Promise.resolve()
                .then(beforeResolve)
                .then(() => value)
                .then(resolve, reject);
        }
    };

    return query;
}

describe('C-02 concurrent request state characterization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        delete globalThis.group;
        delete globalThis.image;
        delete globalThis.notification;
        delete globalThis.numPages;
    });

    it('keeps pagination independent across simultaneous question requests', async () => {
        const QuestionUseCases = require('../../dist/src/modules/question/application/use-cases/questions/QuestionUseCases');
        const Question = require('../../dist/src/modules/question/infrastructure/mongoose/repositories/QuestionRepository');
        let releaseFirst;
        const firstCanFinish = new Promise(resolve => {
            releaseFirst = resolve;
        });

        vi.spyOn(Question, 'countDocuments').mockImplementation(filter =>
            Promise.resolve(filter.product === 'first-product' ? 1 : 5)
        );
        vi.spyOn(Question, 'find').mockImplementation(filter => {
            if (filter.product === 'first-product') {
                return resolvedQuery([], () => firstCanFinish);
            }
            return resolvedQuery([], () => releaseFirst());
        });

        const firstResponse = responseRecorder();
        const secondResponse = responseRecorder();
        await Promise.all([
            QuestionUseCases.product(
                { query: { _id: 'first-product', limit: '2', skip: '0' }, token: 'first-token' },
                firstResponse
            ),
            QuestionUseCases.product(
                { query: { _id: 'second-product', limit: '2', skip: '0' }, token: 'second-token' },
                secondResponse
            )
        ]);

        expect(firstResponse.body.data.numPages).toBe(1);
        expect(secondResponse.body.data.numPages).toBe(3);
    });

    it('does not publish concurrent notification request data on globalThis', async () => {
        const QuestionUseCases = require('../../dist/src/modules/question/application/use-cases/questions/QuestionUseCases');
        const Question = require('../../dist/src/modules/question/infrastructure/mongoose/repositories/QuestionRepository');
        const Relations = require('../../dist/src/modules/question/infrastructure/gateways/QuestionRelationsGateway');
        const sentinel = Object.freeze({ source: 'sentinel' });
        globalThis.notification = sentinel;

        vi.spyOn(Question, 'create').mockImplementation(body => ({
            save: vi.fn().mockResolvedValue({ question: body.question })
        }));
        vi.spyOn(Relations.Notification, 'create').mockImplementation(body => ({
            save: vi.fn().mockResolvedValue({ user: body.user })
        }));

        const firstResponse = responseRecorder();
        const secondResponse = responseRecorder();
        await Promise.all([
            QuestionUseCases.new(
                {
                    body: { question: 'first-question', user: 'first-user' },
                    token: 'first-token',
                    user: { _id: 'first-client' }
                },
                firstResponse
            ),
            QuestionUseCases.new(
                {
                    body: { question: 'second-question', user: 'second-user' },
                    token: 'second-token',
                    user: { _id: 'second-client' }
                },
                secondResponse
            )
        ]);

        expect(firstResponse.body.data.notification).toEqual({ user: 'first-user' });
        expect(secondResponse.body.data.notification).toEqual({ user: 'second-user' });
        expect(globalThis.notification).toBe(sentinel);
    });

    it('does not publish reporting aggregation state on globalThis', async () => {
        const ReportingService = require('../../dist/src/modules/user/application/services/ReportingService');
        const User = require('../../dist/src/modules/user/application/repositories/UserRepository');
        const sentinel = Object.freeze({ source: 'sentinel' });
        globalThis.group = sentinel;
        vi.spyOn(User, 'find').mockResolvedValue([]);

        const firstResponse = responseRecorder();
        const secondResponse = responseRecorder();
        await Promise.all([
            ReportingService.userNew({ query: { date: 'day' } }, firstResponse),
            ReportingService.userNew({ query: { date: 'week' } }, secondResponse)
        ]);

        expect(firstResponse.body).toEqual({ status: 1, data: { users: [] } });
        expect(secondResponse.body).toEqual({ status: 1, data: { users: [] } });
        expect(globalThis.group).toBe(sentinel);
    });

    it('uses each message request image instead of process-global image state', async () => {
        const MessagingUseCases = require('../../dist/src/modules/buy/application/use-cases/orders/MessagingUseCases');
        const Message = require('../../dist/src/modules/buy/infrastructure/mongoose/repositories/MessageRepository');
        const Buy = require('../../dist/src/modules/buy/infrastructure/mongoose/repositories/BuyRepository');
        const FileGateway = require('../../src/shared/infrastructure/gateways/LegacyFileGateway');
        const uploadedImages = [];
        globalThis.image = 'global-image';

        vi.spyOn(FileGateway, 'uploadImage').mockImplementation(async image => {
            uploadedImages.push(image);
            return `uploaded:${image}`;
        });
        vi.spyOn(Message, 'create').mockImplementation(body => ({
            save: vi.fn().mockResolvedValue({ _id: `${body.buy}-message` })
        }));
        vi.spyOn(Buy, 'findByIdAndUpdate').mockResolvedValue({});

        const firstResponse = responseRecorder();
        const secondResponse = responseRecorder();
        await Promise.all([
            MessagingUseCases.newComment(
                {
                    body: { buy: 'first-buy', image: 'first-image', message: 'first-message' },
                    token: 'first-token',
                    type: 'img'
                },
                firstResponse
            ),
            MessagingUseCases.newComment(
                {
                    body: { buy: 'second-buy', image: 'second-image', message: 'second-message' },
                    token: 'second-token',
                    type: 'img'
                },
                secondResponse
            )
        ]);

        expect(uploadedImages).toEqual(['first-image', 'second-image']);
        expect(firstResponse.statusCode).toBe(201);
        expect(secondResponse.statusCode).toBe(201);
    });
});
