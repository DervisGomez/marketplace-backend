const logger = require('../../../../infrastructure/logging/logger');
const User = require('../repositories/UserRepository');
const UserTemp = require('../repositories/UserTempRepository');
const Increment = require('../repositories/IncrementRepository');
const RandString = require('../../../../../../services/randString');
const Message = require('../../../../../../services/message');
const Token = require('../../../../../../services/token');
const bcrypt = require('bcryptjs');
const Validate = require('../../infrastructure/validators/LegacyValidationAdapter');
const MagicNumbers = require('../../../../../../src/modules/user/shared/constants/MagicNumbers');
import type { Response } from 'express';
import type { UserServiceHandler } from '../dtos/UserContracts';

async function validateErr(res: Response, err: unknown): Promise<void> {
    logger.error({ err: err }, 'Legacy operation failed');
    let errors = await Validate.required(err);
    if (errors.length > 0) {
        res.status(500).json({ status: 0, data: errors });
    } else {
        res.status(500).json({ status: 0, data: ['Ha ocurrido un erro en el servidor'] });
    }
}

/**
 * Casos de uso de Registration.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    createIncrement: async (req, res) => {
        let increment = Increment.create();
        increment = await increment.save();
        let user = await User.find();
        for (let i = 0; i < user.length; i++) {
            increment = await Increment.findOneAndUpdate({ status: 1 }, { $inc: { number: 1 } }, { new: true });
            await User.findByIdAndUpdate(user[i]._id, { number: increment.number });
        }
        res.status(201).json({ status: 1, data: increment });
    },
    codeRegister: async (req, res, next) => {
        try {
            let user = await User.findOne({
                $or: [
                    { userName: req.body.userName },
                    { phone: req.body.phone },
                    { email: req.body.email },
                    { identification: req.body.identification }
                ]
            });
            if (!user) {
                /*var regex = new RegExp(/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/);
                var rex = regex.test(req.body.password);
                logger.debug(rex);*/
                logger.debug(req.body);
                let date = req.body.birthdate.split('-');
                req.body.month = parseInt(date[1]);
                req.body.day = parseInt(date[2]);
                if (
                    req.body.password.length > MagicNumbers.PASSWORD_MIN_LENGTH_EXCLUSIVE &&
                    req.body.password.length < MagicNumbers.PASSWORD_MAX_LENGTH_EXCLUSIVE
                ) {
                    await UserTemp.deleteOne({
                        $or: [
                            { phone: req.body.phone },
                            { email: req.body.email },
                            { identification: req.body.identification }
                        ]
                    });
                    req.body.codeRegister = RandString.create(7);
                    logger.debug({ codeRegister: req.body.codeRegister }, 'Registration code received');
                    req.body.password = await bcrypt.hash(req.body.password, global.config.token.bcrypt_salt_rounds);
                    let newUserTemp = UserTemp.create(req.body);
                    let userTemp = await newUserTemp.save();
                    let code = await Message.sendMessage(
                        'Bienvenido a nuestra plataforma de compra y venta tu codigo de registro es: ' +
                            req.body.codeRegister,
                        req.body.phone
                    );
                    if (code) {
                        res.status(201).json({ status: 1, data: userTemp._id });
                    } else {
                        res.status(500).json({ status: 0, data: ['Numero de teléfono invalido'] });
                    }
                } else {
                    res.status(500).json({ status: 0, data: ['Debe tener entre 8 y 16 caracteres.'] });
                }
            } else {
                if (user.phone == req.body.phone) {
                    res.status(500).json({
                        status: 0,
                        data: ['Numero de telefono ya esta siendo usado por otro usuario']
                    });
                } else if (user.email == req.body.email) {
                    res.status(500).json({ status: 0, data: ['Correo ya esta siendo usado por otro usuario'] });
                } else if (user.userName == req.body.userName) {
                    res.status(500).json({ status: 0, data: ['Usuario ya esta siendo usado por otro usuario'] });
                } else {
                    res.status(500).json({ status: 0, data: ['Cédula ya registrada'] });
                }
            }
        } catch (err) {
            validateErr(res, err);
        }
    },
    resendCode: async (req, res) => {
        try {
            let codeRegister = RandString.create(7);
            let userTemp = await UserTemp.findByIdAndUpdate(
                req.body._id,
                { codeRegister: codeRegister },
                { new: true }
            );
            await Message.sendMessage(
                'Bienvenido a nuestra plataforma de compra y venta tu codigo de registro es: ' + userTemp.codeRegister,
                userTemp.phone
            );
            res.status(201).json({ status: 1, data: userTemp._id });
        } catch (err) {
            let errors = await Validate.required(err);
            res.status(500).json({ status: 0, data: errors });
        }
    },
    register: async (req, res, next) => {
        try {
            let userTemp = await UserTemp.findById(req.body._id);
            if (userTemp.codeRegister == req.body.codeRegister.toLowerCase()) {
                let increment = await Increment.findOneAndUpdate({ status: 1 }, { $inc: { number: 1 } }, { new: true });
                let newUser = User.create({
                    name: userTemp.name,
                    lastName: userTemp.lastName,
                    userName: userTemp.userName,
                    password: userTemp.password,
                    phone: userTemp.phone,
                    linkInvitation: userTemp.name.toLowerCase() + '/' + RandString.create(7),
                    identification: userTemp.identification,
                    email: userTemp.email,
                    department: userTemp.department,
                    city: userTemp.city,
                    birthdate: userTemp.birthdate,
                    month: userTemp.month,
                    day: userTemp.day,
                    number: increment.number
                });
                if (userTemp.referred) {
                    newUser.referred = userTemp.referred;
                }
                let user = await newUser.save();
                user = await User.findById(user._id, userData);
                let token = await Token.encode(user, global.config.token.days);
                res.status(201).json({ status: 1, data: user, token: token });
            } else {
                res.status(500).json({ status: 0, data: ['Código incorrecto'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    linkInvitation: async (req, res) => {
        try {
            let user = await User.findOne({ linkInvitation: req.query.linkInvitation });
            if (user) {
                res.status(200).json({ status: 1, data: user._id });
            } else {
                res.status(500).json({ status: 0, data: ['Link de invitación invalido'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, UserServiceHandler>>;
