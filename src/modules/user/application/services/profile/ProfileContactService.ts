const logger = require('../../../../../infrastructure/logging/logger');
const User = require('../../repositories/UserRepository');
const Code = require('../../repositories/CodeRepository');
const Message = require('../../../../../../../services/message');
const EmailService = require('../../../../../../../services/email');

const userData = { password: 0, passwordFailures: 0, __v: 0 };
import type { UserServiceHandler } from '../../dtos/UserContracts';

/**
 * Casos de uso de ProfileContact.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    modifyPhone: async (req, res) => {
        try {
            let user = await User.findOne({ phone: req.body.phone });
            if (!user) {
                let code = RandString.create(8);
                await Code.deleteMany({ medium: req.body.phone });
                let body = `
                    <p>Hola ${req.user.name}, tu código de actualización de datos es el siguiente:</p>
                    <h1>${code}</h1>
                    <p>Equipo de MLOLX</p>
                `;
                const result = await EmailService.send(req.user.email, 'MLOLX', 'Recuperar contraseña', body);
                let newCode = Code.create({
                    medium: req.body.phone,
                    code: code
                });
                let codeNew = await newCode.save();
                res.status(200).json({ status: 1, data: codeNew._id, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Celular ya utilizado por otra persona'] });
            }
        } catch (err) {
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    newPhone: async (req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if (code.code == req.body.code) {
                let user = await User.findByIdAndUpdate(
                    req.user._id,
                    { phone: code.medium },
                    { projection: userData, new: true }
                );
                res.status(200).json({ status: 1, data: user, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Codigo incorrecto'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyEmail: async (req, res) => {
        try {
            let user = await User.findOne({ email: req.body.email });
            if (!user) {
                let code = RandString.create(8);
                await Code.deleteMany({ medium: req.body.email });
                logger.debug({ code }, 'Profile verification code generated');
                let send = await Message.sendMessage('Tu codigo de actualización de datos es: ' + code, req.user.phone);

                let newCode = Code.create({
                    medium: req.body.email,
                    code: code
                });
                let codeNew = await newCode.save();
                res.status(200).json({ status: 1, data: codeNew._id, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Correo ya utilizado por otra persona'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    newEmail: async (req, res) => {
        try {
            let code = await Code.findById(req.body._id);
            if (code.code == req.body.code) {
                let user = await User.findByIdAndUpdate(
                    req.user._id,
                    { email: code.medium },
                    { projection: userData, new: true }
                );
                res.status(200).json({ status: 1, data: user, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Codigo incorrecto'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, UserServiceHandler>>;
