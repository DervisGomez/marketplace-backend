const RegistrationService = require('../../application/services/RegistrationService');
const AuthenticationService = require('../../application/services/AuthenticationService');
const PasswordRecoveryService = require('../../application/services/PasswordRecoveryService');
const ProfileService = require('../../application/services/ProfileService');
const ReferralService = require('../../application/services/ReferralService');
const ReportingService = require('../../application/services/ReportingService');
const UserRequestDto = require('../../application/dtos/UserRequestDto');

function handler(service, method) {
    return function userRequestHandler(req, res, next) {
        req.body = UserRequestDto.from(req.body);
        return service[method](req, res, next);
    };
}

module.exports = {
    createIncrement: handler(RegistrationService, 'createIncrement'),
    linkInvitation: handler(RegistrationService, 'linkInvitation'),
    codeRegister: handler(RegistrationService, 'codeRegister'),
    resendCode: handler(RegistrationService, 'resendCode'),
    register: handler(RegistrationService, 'register'),
    login: handler(AuthenticationService, 'login'),
    recoverPasswordPhone: handler(PasswordRecoveryService, 'recoverPasswordPhone'),
    recoverPasswordEmail: handler(PasswordRecoveryService, 'recoverPasswordEmail'),
    codeResendPhone: handler(PasswordRecoveryService, 'codeResendPhone'),
    recoveryCodePhone: handler(PasswordRecoveryService, 'recoveryCodePhone'),
    newPassword: handler(PasswordRecoveryService, 'newPassword'),
    newPasswordEmail: handler(PasswordRecoveryService, 'newPasswordEmail'),
    modifyUser: handler(ProfileService, 'modifyUser'),
    modifyUserFirst: handler(ProfileService, 'modifyUserFirst'),
    modifyPhone: handler(ProfileService, 'modifyPhone'),
    newPhone: handler(ProfileService, 'newPhone'),
    modifyEmail: handler(ProfileService, 'modifyEmail'),
    newEmail: handler(ProfileService, 'newEmail'),
    me: handler(AuthenticationService, 'me'),
    modifyPassword: handler(AuthenticationService, 'modifyPassword'),
    modifyName: handler(ProfileService, 'modifyName'),
    modifyIdentification: handler(ProfileService, 'modifyIdentification'),
    modifyPhoto: handler(ProfileService, 'modifyPhoto'),
    modifyLocation: handler(ProfileService, 'modifyLocation'),
    modifyDocument: handler(ProfileService, 'modifyDocument'),
    recordUser: handler(ReportingService, 'recordUser'),
    record: handler(ReportingService, 'record'),
    referred: handler(ReferralService, 'referred'),
    operations: handler(ReportingService, 'operations'),
    userNew: handler(ReportingService, 'userNew'),
    userActive: handler(ReportingService, 'userActive'),
    operationsSeller: handler(ReportingService, 'operationsSeller'),
    operationsBuyer: handler(ReportingService, 'operationsBuyer'),
    recordInfo: handler(ReportingService, 'recordInfo'),
    birthdate: handler(ReportingService, 'birthdate')
};
