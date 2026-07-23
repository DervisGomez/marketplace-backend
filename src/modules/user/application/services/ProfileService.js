const logger = require('../../../../infrastructure/logging/logger');
const User = require('../repositories/UserRepository');
const Files = require('../../../../file/fileCtrl');
const Product = require('../repositories/MarketplaceRepository').Product;
const ModifyPermissions = require('../../shared/constants/ModifyPermissions');
const ProfileContactService = require('./profile/ProfileContactService');

const userData = { password: 0, passwordFailures: 0, __v: 0 };

/**
 * Casos de uso de Profile.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    modifyUser: async (req, res) => {
        try {
            let user = await User.findOne({ userName: req.body.userName });
            if (!user) {
                let user = await User.findByIdAndUpdate(req.user._id, req.body, { projection: userData, new: true });
                res.status(200).json({ status: 1, data: user, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Usuario ya utilizado por otra persona'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyUserFirst: async (req, res) => {
        try {
            let user = await User.findOne({ userName: req.body.userName });
            if (!user) {
                let userValidate = await User.findById(req.user._id);
                if (userValidate.modify.length > 0) {
                    let modify = false;
                    userValidate.modify.forEach(element => {
                        if (element == ModifyPermissions.USERNAME) {
                            modify = true;
                        }
                    });
                    if (modify) {
                        req.body.$pull = { modify: ModifyPermissions.USERNAME };
                        let user = await User.findByIdAndUpdate(req.user._id, req.body, {
                            projection: userData,
                            new: true
                        });
                        res.status(200).json({ status: 1, data: user, token: req.token });
                    } else {
                        res.status(500).json({
                            status: 0,
                            data: ['No tiene permisos para modificar este dato'],
                            token: req.token
                        });
                    }
                } else {
                    res.status(500).json({
                        status: 0,
                        data: ['No tiene permisos para modificar este dato'],
                        token: req.token
                    });
                }
            } else {
                res.status(500).json({ status: 0, data: ['Usuario ya utilizado por otra persona'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyName: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if (userValidate.modify.length > 0) {
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == ModifyPermissions.NAME) {
                        modify = true;
                    }
                });
                if (modify) {
                    req.body.$pull = { modify: ModifyPermissions.NAME };
                    let user = await User.findByIdAndUpdate(req.user._id, req.body, {
                        projection: userData,
                        new: true
                    });
                    res.status(200).json({ status: 1, data: user, token: req.token });
                } else {
                    res.status(500).json({
                        status: 0,
                        data: ['No tiene permisos para modificar estos datos'],
                        token: req.token
                    });
                }
            } else {
                res.status(500).json({
                    status: 0,
                    data: ['No tiene permisos para modificar estos datos'],
                    token: req.token
                });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyIdentification: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if (userValidate.modify.length > 0) {
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == ModifyPermissions.IDENTIFICATION) {
                        modify = true;
                    }
                });
                if (modify) {
                    req.body.$pull = { modify: ModifyPermissions.IDENTIFICATION };
                    let user = await User.findByIdAndUpdate(req.user._id, req.body, {
                        projection: userData,
                        new: true
                    });
                    res.status(200).json({ status: 1, data: user, token: req.token });
                } else {
                    res.status(500).json({
                        status: 0,
                        data: ['No tiene permisos para modificar este dato'],
                        token: req.token
                    });
                }
            } else {
                res.status(500).json({
                    status: 0,
                    data: ['No tiene permisos para modificar este dato'],
                    token: req.token
                });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyLocation: async (req, res) => {
        try {
            let userValidate = await User.findById(req.user._id);
            if (userValidate.modify.length > 0) {
                let modify = false;
                userValidate.modify.forEach(element => {
                    if (element == ModifyPermissions.LOCATION) {
                        modify = true;
                    }
                });
                if (modify) {
                    req.body.$pull = { modify: ModifyPermissions.LOCATION };
                    let user = await User.findByIdAndUpdate(req.user._id, req.body, {
                        projection: userData,
                        new: true
                    });
                    let product = await Product.updateMany({ user: req.user._id }, { $set: req.body });
                    res.status(200).json({ status: 1, data: user, token: req.token });
                } else {
                    res.status(500).json({
                        status: 0,
                        data: ['No tiene permisos para modificar estos datos'],
                        token: req.token
                    });
                }
            } else {
                res.status(500).json({
                    status: 0,
                    data: ['No tiene permisos para modificar estos datos'],
                    token: req.token
                });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyPhoto: async (req, res) => {
        try {
            let image = await Files.uploadImage(req.body.photo);
            let user = await User.findByIdAndUpdate(
                req.user._id,
                { photo: image },
                { projection: userData, new: true }
            );
            res.status(200).json({ status: 1, data: user, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyDocument: async (req, res) => {
        try {
            let user = await User.findById(req.user._id);
            if (user.photoDocumentSend == 0) {
                let image = await Files.uploadImage(req.body.photoDocument);
                let user = await User.findByIdAndUpdate(
                    req.user._id,
                    { photoDocument: image, photoDocumentSend: 1 },
                    { projection: userData, new: true }
                );
                res.status(200).json({ status: 1, data: user, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Ya usted envió su foto del documento'], token: req.token });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    modifyPhone: ProfileContactService.modifyPhone,
    newPhone: ProfileContactService.newPhone,
    modifyEmail: ProfileContactService.modifyEmail,
    newEmail: ProfileContactService.newEmail
};
