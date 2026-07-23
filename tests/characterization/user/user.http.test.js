const { characterizeModule } = require('../../helpers/characterizeModule');

characterizeModule('user');

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

describe('C-01 undefined identifier characterization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('completes the modify-phone success branch without a ReferenceError', async () => {
        const ProfileContactService = require('../../../dist/src/modules/user/application/services/profile/ProfileContactService');
        const User = require('../../../dist/src/modules/user/application/repositories/UserRepository');
        const Code = require('../../../dist/src/modules/user/application/repositories/CodeRepository');
        const EmailService = require('../../../services/email');

        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(Code, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 0 });
        vi.spyOn(Code, 'create').mockReturnValue({
            save: vi.fn().mockResolvedValue({ _id: 'verification-code-id' })
        });
        vi.spyOn(EmailService, 'send').mockResolvedValue(true);

        const response = responseRecorder();
        await ProfileContactService.modifyPhone(
            {
                body: { phone: '3001234567' },
                token: 'preserved-token',
                user: { email: 'user@example.test', name: 'User' }
            },
            response
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            status: 1,
            data: 'verification-code-id',
            token: 'preserved-token'
        });
    });

    it('completes the registration success branch without a ReferenceError', async () => {
        const RegistrationService = require('../../../dist/src/modules/user/application/services/RegistrationService');
        const User = require('../../../dist/src/modules/user/application/repositories/UserRepository');
        const UserTemp = require('../../../dist/src/modules/user/application/repositories/UserTempRepository');
        const Increment = require('../../../dist/src/modules/user/application/repositories/IncrementRepository');
        const Token = require('../../../services/token');

        vi.spyOn(UserTemp, 'findById').mockResolvedValue({
            _id: 'temporary-user-id',
            birthdate: new Date('2000-01-01T00:00:00.000Z'),
            city: 'Bogota',
            codeRegister: 'abc123',
            day: 1,
            department: 'Cundinamarca',
            email: 'user@example.test',
            identification: '123',
            lastName: 'Example',
            month: 1,
            name: 'User',
            password: 'hash',
            phone: '3001234567',
            userName: 'user'
        });
        vi.spyOn(Increment, 'findOneAndUpdate').mockResolvedValue({ number: 7 });
        vi.spyOn(User, 'create').mockReturnValue({
            save: vi.fn().mockResolvedValue({ _id: 'registered-user-id' })
        });
        vi.spyOn(User, 'findById').mockResolvedValue({ _id: 'registered-user-id', name: 'User' });
        vi.spyOn(Token, 'encode').mockResolvedValue('preserved-token');

        const response = responseRecorder();
        await RegistrationService.register({ body: { _id: 'temporary-user-id', codeRegister: 'ABC123' } }, response);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            status: 1,
            data: { _id: 'registered-user-id', name: 'User' },
            token: 'preserved-token'
        });
    });

    it('delegates the missing-token branch to its supplied continuation', async () => {
        const Token = require('../../../services/token');
        const next = vi.fn();

        const result = await Token.decode(undefined, next);

        expect(result).toBeUndefined();
        expect(next).toHaveBeenCalledOnce();
    });
});
