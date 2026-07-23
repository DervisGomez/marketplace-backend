const logger = require('../../../../../infrastructure/logging/logger');
const Chat = require('../../../infrastructure/mongoose/repositories/ChatRepository');
const OnlineChat = require('../../../infrastructure/mongoose/repositories/OnlineChatRepository');
const Files = require('../../../infrastructure/gateways/LegacyImageGateway');
import type { ChatHandler } from '../../../presentation/dto/ChatContracts';

module.exports = {
    newMessage: async (req, res) => {
        try {
            if (req.type == 'img') {
                let image = req.body.image;
                req.body.message == (await Files.uploadImage(image));
            }
            req.body.user = req.user._id;
            if (req.body.chat == '') {
                let newOnline = await OnlineChat.create({ user: req.user._id });
                await newOnline.save();
                req.body.chat = newOnline._id;
            }
            let newComment = await Chat.create(req.body);
            let chat = await newComment.save();
            await OnlineChat.findByIdAndUpdate(
                req.body.chat,
                {
                    $addToSet: {
                        message: chat._id
                    }
                },
                { multi: true }
            );
            res.status(201).json({ status: 1, data: chat, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    meChat: async (req, res) => {
        try {
            let chats = await OnlineChat.find({ user: req.user._id, status: 1 });
            logger.debug(chats);
            if (chats.length > 0) {
                let chat = await Chat.find({ chat: chats[0]._id }).sort({ $natural: -1 });
                res.status(201).json({ status: 1, data: chat, token: req.token });
            } else {
                res.status(201).json({ status: 1, data: [], token: req.token });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    find: async (req, res) => {
        try {
            let message = await Chat.find({ chat: req.query._id }).sort({ $natural: -1 });
            let chat = await OnlineChat.findById(req.query._id, { message: 0 }).populate('user');
            res.status(201).json({ status: 1, data: { message, chat }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    take: async (req, res) => {
        try {
            logger.debug(req.body._id);
            let chat = await OnlineChat.findByIdAndUpdate(
                req.body._id,
                { status: 2, admin: req.user._id },
                { projection: { message: 0 }, new: true }
            ).populate('user');
            logger.debug(chat);
            res.status(200).json({ status: 1, data: { chat }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    end: async (req, res) => {
        try {
            logger.debug(req.body._id);
            let chat = await OnlineChat.findByIdAndUpdate(
                req.body._id,
                { status: 0 },
                { projection: { message: 0 }, new: true }
            ).populate('user');
            logger.debug(chat);
            res.status(200).json({ status: 1, data: { chat }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (req, res) => {
        try {
            let chats = [];
            let numPages;
            let count;
            let skip;

            switch (req.query.status) {
                case '0':
                    count = await OnlineChat.countDocuments({ status: req.query.status });
                    numPages = parseInt(String(count / Number(req.query.limit) + 1));
                    skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
                    chats = await OnlineChat.find({ status: req.query.status })
                        .populate('user')
                        .populate('message')
                        .skip(skip)
                        .limit(parseInt(req.query.limit))
                        .sort({ createdAt: -1 });
                    break;
                case '1':
                    count = await OnlineChat.countDocuments({ status: req.query.status });
                    numPages = parseInt(String(count / Number(req.query.limit) + 1));
                    skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
                    chats = await OnlineChat.find({ status: req.query.status })
                        .populate('user')
                        .populate('message')
                        .skip(skip)
                        .limit(parseInt(req.query.limit));
                    break;
                case '2':
                    count = await OnlineChat.countDocuments({ status: req.query.status });
                    numPages = parseInt(String(count / Number(req.query.limit) + 1));
                    skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
                    chats = await OnlineChat.find({ status: req.query.status })
                        .populate('user')
                        .populate('message')
                        .skip(skip)
                        .limit(parseInt(req.query.limit));
                    break;
                case '3':
                    logger.debug(req.user._id);
                    count = await OnlineChat.countDocuments({ status: 2, admin: req.user._id });
                    numPages = parseInt(String(count / Number(req.query.limit) + 1));
                    skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
                    chats = await OnlineChat.find({ status: 2, admin: req.user._id })
                        .populate('user')
                        .populate('message')
                        .skip(skip)
                        .limit(parseInt(req.query.limit));
                    break;
            }

            res.status(201).json({ status: 1, data: { chats, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, ChatHandler>>;
