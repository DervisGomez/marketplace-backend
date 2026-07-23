const logger = require('../../../../infrastructure/logging/logger');
const User = require('../repositories/UserRepository');
const Token = require('../../../../../../services/token');
const bcrypt = require('bcryptjs');
const MagicNumbers = require('../../../../../../src/modules/user/shared/constants/MagicNumbers');
import type { UserServiceHandler } from '../dtos/UserContracts';

const userData = { password: 0, passwordFailures: 0, __v: 0 };

/**
 * Casos de uso de Authentication.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    login: async (req, res) => {
        try {
            let user = await User.findOne({
                $or: [{ phone: req.body.userName }, { userName: req.body.userName }, { email: req.body.userName }]
            });
            if (user != null) {
                if (user.passwordFailures < MagicNumbers.LOGIN_FAILURE_LIMIT) {
                    let match = await bcrypt.compare(req.body.password, user.password);
                    if (match) {
                        user = await User.findByIdAndUpdate(
                            user._id,
                            { passwordFailures: 0 },
                            { projection: userData, new: true }
                        );
                        let token = await Token.encode(user, global.config.token.days);
                        logger.debug(user);
                        res.status(200).json({ status: 1, data: user, token: token });
                    } else {
                        user = await User.findByIdAndUpdate(
                            user._id,
                            { passwordFailures: user.passwordFailures + 1 },
                            { new: true }
                        );
                        if (user.passwordFailures == 5) {
                            res.status(500).json({ status: 0, data: ['Usuario bloqueado'] });
                        } else {
                            res.status(500).json({ status: 0, data: ['Contraseña Invalido'] });
                        }
                    }
                } else {
                    res.status(500).json({ status: 0, data: ['Usuario bloqueado'] });
                }
            } else {
                res.status(500).json({ status: 0, data: ['Usuario o teléfono Invalido'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    me: async (req, res) => {
        try {
            let user = await User.findById(req.user, userData);
            res.status(200).json({ status: 1, data: user, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyPassword: async (req, res) => {
        try {
            let user = await User.findById(req.user._id);
            let match = await bcrypt.compare(req.body.password, user.password);
            if (match) {
                if (req.body.passwordNew == req.body.passwordConfirmed) {
                    if (
                        req.body.passwordNew.length > MagicNumbers.PASSWORD_MIN_LENGTH_EXCLUSIVE &&
                        req.body.passwordNew.length < MagicNumbers.PASSWORD_MAX_LENGTH_EXCLUSIVE
                    ) {
                        let password = await bcrypt.hash(req.body.passwordNew, global.config.token.bcrypt_salt_rounds);
                        let user = await User.findByIdAndUpdate(
                            req.user._id,
                            { password: password },
                            { projection: userData, new: true }
                        );
                        res.status(200).json({ status: 1, data: user, token: req.token });
                    } else {
                        res.status(500).json({
                            status: 0,
                            data: ['La contraseña debe tener entre 8 y 16 caracteres.']
                        });
                    }
                } else {
                    res.status(500).json({ status: 0, data: ['Contraseñas no coinciden'] });
                }
            } else {
                res.status(500).json({ status: 0, data: ['Contraseña incorrecta'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, UserServiceHandler>>;
