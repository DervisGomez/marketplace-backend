const logger = require('../../../../infrastructure/logging/logger');
const User = require('../repositories/UserRepository');
const Code = require('../repositories/CodeRepository');
const RandString = require('../../../../../services/randString');
const Message = require('../../../../../services/message');
const Token = require('../../../../../services/token');
const EmailService = require('../../../../../services/email');
const bcrypt = require('bcryptjs');
const Validate = require('../../infrastructure/validators/LegacyValidationAdapter');
const MagicNumbers = require('../../shared/constants/MagicNumbers');

const userData = { password: 0, passwordFailures: 0, __v: 0 };

/**
 * Casos de uso de PasswordRecovery.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    recoverPasswordPhone: async (req, res) => {
        try {
            let user = await User.findOne({ phone: req.body.phone });
            if (user) {
                await Code.deleteOne({ medium: user.phone });
                let codeSend = RandString.create(8);
                logger.debug({ codeSend }, 'Password recovery code generated');
                let newCode = Code.create({ medium: user.phone, code: codeSend });
                let code = await newCode.save();
                await Message.sendMessage('Tu codigo de recuperación es: ' + codeSend, user.phone);
                res.status(200).json({ status: 1, data: code.id });
            } else {
                res.status(500).json({ status: 0, data: ['Celular no registrado'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recoverPasswordEmail: async (req, res) => {
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                await Code.deleteOne({ medium: user.email });
                let codeSend = RandString.create(8);
                let newCode = Code.create({ medium: user.email, code: codeSend });
                let code = await newCode.save();
                //await Message.sendMessage('Tu codigo de recuperación es: '+codeSend,user.phone);
                let token = await Token.encode(code, global.config.token.days);
                let body = `
                <p>Hola ${user.name}, para recuperar la contraseña haz click en el botón de abajo</p>
                <a href="${global.config.url.web + 'password/' + token}" target="_blank">Nueva contraseña</a>
                <p>Equipo de MLOLX</p>`;
                const result = await EmailService.send(req.body.email, 'MLOLX', 'Recuperar contraseña', body);
                logger.debug(result);
                if (result.status == 1) {
                    res.status(200).json({ status: 1, data: code.id });
                } else {
                    res.status(500).json({ status: 0, data: ['Correo no valido'] });
                }
            } else {
                res.status(500).json({ status: 0, data: ['Celular no registrado'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recoveryCodePhone: async (req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if (code.code == req.body.code.toLowerCase()) {
                let user = await User.findOne({ phone: code.medium });
                res.status(200).json({ status: 1, data: user.id });
            } else {
                res.status(500).json({ status: 0, data: ['Código incorrecto'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    codeResendPhone: async (req, res) => {
        try {
            let code = RandString.create(7);
            let codeTemp = await Code.findByIdAndUpdate(req.body._id, { code: code }, { new: true });
            logger.debug({ code }, 'Password recovery code lookup');
            await Message.sendMessage('Tu codigo de recuperación es: ' + codeTemp.code, codeTemp.medium);
            res.status(201).json({ status: 1, data: codeTemp._id });
        } catch (err) {
            let errors = await Validate.required(err);
            res.status(500).json({ status: 0, data: errors });
        }
    },
    newPassword: async (req, res) => {
        try {
            if (
                req.body.password.length > MagicNumbers.PASSWORD_MIN_LENGTH_EXCLUSIVE &&
                req.body.password.length < MagicNumbers.PASSWORD_MAX_LENGTH_EXCLUSIVE
            ) {
                req.body.password = await bcrypt.hash(req.body.password, global.config.token.bcrypt_salt_rounds);
                let user = await User.findByIdAndUpdate(
                    req.body._id,
                    { password: req.body.password, passwordFailures: 0 },
                    { projection: userData, new: true }
                );
                let token = await Token.encode(user, global.config.token.days);
                res.status(200).json({ status: 1, data: user, token: token });
            } else {
                res.status(500).json({ status: 0, data: ['Debe tener entre 8 y 16 caracteres.'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    newPasswordEmail: async (req, res) => {
        try {
            let token2 = await Token.decodeEmail(req.body.token);
            if (token2.status == 200) {
                let code = await Code.findById(token2.code._id);
                logger.debug({ code }, 'Password recovery code generated');
                if (code && code.code == token2.code.code) {
                    await Code.deleteMany({ _id: token2.code._id });
                    if (
                        req.body.password.length > MagicNumbers.PASSWORD_MIN_LENGTH_EXCLUSIVE &&
                        req.body.password.length < MagicNumbers.PASSWORD_MAX_LENGTH_EXCLUSIVE
                    ) {
                        req.body.password = await bcrypt.hash(
                            req.body.password,
                            global.config.token.bcrypt_salt_rounds
                        );
                        let user = await User.findOneAndUpdate(
                            { email: code.medium },
                            { password: req.body.password, passwordFailures: 0 },
                            { projection: userData, new: true }
                        );
                        let token = await Token.encode(user, global.config.token.days);
                        res.status(200).json({ status: 1, data: true, token: token });
                    } else {
                        res.status(500).json({ status: 0, data: ['Debe tener entre 8 y 16 caracteres.'] });
                    }
                } else {
                    res.status(500).json({ status: 0, data: ['Tiempo expirado'] });
                }
            } else {
                res.status(500).json({ status: 0, data: ['Tiempo expirado2'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
