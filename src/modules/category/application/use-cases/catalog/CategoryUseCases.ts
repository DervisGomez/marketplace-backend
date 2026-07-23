const mongoose = require('mongoose');
const logger = require('../../../../../infrastructure/logging/logger');
const { deleteResult } = require('../../../../../infrastructure/http/serializeLegacyWriteResult');
const Category = require('../../../infrastructure/mongoose/repositories/CategoryRepository');
const ProductCatalog = require('../../../infrastructure/gateways/LegacyProductCatalogGateway');
const SellerRecord = require('../../../infrastructure/gateways/LegacySellerRecordGateway');
import type { CategoryHandler } from '../../../presentation/dto/CategoryContracts';

interface CategorySeed {
    readonly name: string;
    readonly subcategory: readonly string[];
}

const categories = require('../../../shared/constants/CategoryList') as readonly CategorySeed[];
const ObjectId = mongoose.Types.ObjectId;
const categoryProjection = { createdAt: 0, status: 0, __v: 0 };
const subcategoryProjection = { subcategory: 0, createdAt: 0, status: 0, __v: 0 };

module.exports = {
    load: async (_req, res) => {
        try {
            await ProductCatalog.deleteMany({});
            await Category.deleteMany({});
            logger.debug(categories);
            await categories.forEach(async category => {
                const newCategory = Category.create({
                    name: category.name,
                    father: 1
                });
                const categoryNew = await newCategory.save();
                await category.subcategory.forEach(async subcategory => {
                    const newSubcategory = Category.create({
                        name: subcategory,
                        categoryFather: categoryNew._id
                    });
                    const subcategoryNew = await newSubcategory.save();
                    await Category.findByIdAndUpdate(
                        categoryNew._id,
                        {
                            $addToSet: {
                                subcategory: subcategoryNew._id
                            }
                        },
                        { multi: true }
                    );
                });
            });
            res.status(201).json({ status: 1, data: categories });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (_req, res) => {
        try {
            const category = await Category.find({ father: 1 }, categoryProjection).populate(
                'subcategory',
                subcategoryProjection
            );
            res.status(201).json({ status: 1, data: category });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    listProduct: async (req, res) => {
        try {
            const category = await Category.find({ father: 1 }, categoryProjection).populate(
                'subcategory',
                subcategoryProjection
            );
            const record = await SellerRecord.calculate(new ObjectId(req.user._id));
            res.status(201).json({ status: 1, data: { category, record } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    listHome: async (_req, res) => {
        try {
            const category = await Category.find({ father: 1 }, categoryProjection).populate(
                'subcategory',
                subcategoryProjection
            );
            const product = await ProductCatalog.find(
                { status: 1 },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1 }
            )
                .sort({ $natural: -1 })
                .limit(8);
            const productQuantity = await ProductCatalog.find(
                { status: 1, quantitySold: { $gt: 0 } },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1, quantitySold: 1 }
            )
                .sort({ quantitySold: -1 })
                .limit(8);
            const productHighlight = await ProductCatalog.find(
                { status: 1, highlight: 'highlight' },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1, highlight: 1 }
            )
                .sort({ $natural: -1 })
                .limit(16);
            res.status(201).json({ status: 1, data: { category, product, productQuantity, productHighlight } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    add: async (req, res) => {
        try {
            const newCategory = Category.create(req.body);
            newCategory.subcategory = [];
            newCategory.father = 1;
            const category = await newCategory.save();
            res.status(201).json({ status: 1, data: { category } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    addSub: async (req, res) => {
        try {
            const newCategory = Category.create(req.body);
            newCategory.subcategory = [];
            newCategory.father = 0;
            const subcategory = await newCategory.save();
            await Category.findByIdAndUpdate(
                req.body.category,
                {
                    $addToSet: {
                        subcategory: subcategory._id
                    }
                },
                { multi: true }
            );
            res.status(201).json({ status: 1, data: { subcategory } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            const category = await Category.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { category } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    editSub: async (req, res) => {
        try {
            const category = await Category.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { category } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    remove: async (req, res) => {
        try {
            let category = await Category.deleteMany({ _id: req.query._id });
            category = deleteResult(category);
            res.status(201).json({ status: 1, data: { category } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    removeSub: async (req, res) => {
        try {
            let subcategory = await Category.deleteMany({ _id: req.query._id });
            subcategory = deleteResult(subcategory);
            await Category.findByIdAndUpdate(
                req.body.category,
                {
                    $addToSet: {
                        subcategory: req.query._id
                    }
                },
                { multi: true }
            );
            res.status(201).json({ status: 1, data: { subcategory } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, CategoryHandler>>;
