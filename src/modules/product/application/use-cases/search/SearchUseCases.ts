const logger = require('../../../../../infrastructure/logging/logger');
import type { ProductHandler } from '../../../presentation/dto/ProductContracts';
const serializeLegacyError = require('../../../../../infrastructure/http/serializeLegacyError');
const Product = require('../../../infrastructure/mongoose/repositories/ProductRepository');
const Category = require('../../../infrastructure/mongoose/repositories/ProductRelationsRepository').Category;
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');
const Location = require('../../../../../../../src/data/locations');

const productData = {
    title: 1,
    images: 1,
    price: 1,
    quantitySold: 1,
    city: 1,
    department: 1,
    favorite: 1,
    visits: 1,
    status: 1,
    number: 1
};

// TODO(v2): los bugs documentados se preservan para mantener compatibilidad.
module.exports = {
    category: async (req, res) => {
        try {
            let category = await Category.findById(req.query._id);

            let count = await Product.countDocuments({ category: { $in: category.subcategory } });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            let product = await Product.find({ category: { $in: category.subcategory } }, productData)
                .populate('user', { city: 1, department: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit));
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    subcategory: async (req, res) => {
        try {
            let count = await Product.countDocuments({ category: req.query._id });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            let product = await Product.find({ category: req.query._id }, productData)
                .populate('user', { city: 1, department: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit));
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    filter: async (req, res) => {
        try {
            let filter: Record<string, unknown> = { status: 1 };
            let match: Record<string, unknown> = { status: 1 };
            let match2: Record<string, unknown> = { status: 1 };
            let match3: Record<string, unknown> = { status: 1 };
            let group: Record<string, unknown> = { category: '$category' };
            let group2: Record<string, unknown> = { department: '$department' };
            let group3: Record<string, unknown> = {};
            if (req.query.category) {
                group = { subcategory: '$subcategory' };
                match.category = toObjectId(req.query.category);
                if (req.query.subcategory) {
                    filter.subcategory = req.query.subcategory;
                    match2.subcategory = toObjectId(req.query.subcategory);
                    match3.subcategory = toObjectId(req.query.subcategory);
                } else {
                    match2.category = toObjectId(req.query.category);
                    match3.category = toObjectId(req.query.category);
                    filter.category = req.query.category;
                }
            }
            if (req.query.department) {
                group2 = { city: '$city' };
                match2.department = req.query.department;
                if (req.query.city) {
                    filter.city = req.query.city;
                    match.city = req.query.city;
                    match3.city = req.query.city;
                } else {
                    filter.department = req.query.department;
                    match.department = req.query.department;
                    match3.department = req.query.department;
                }
            }
            group3 = { condition: '$condition' };
            if (req.query.condition) {
                filter.condition = req.query.condition;
                match.condition = req.query.condition;
                match2.condition = req.query.condition;
            }

            if (req.query.min && req.query.max) {
                filter.price = { $gt: parseInt(req.query.min), $lt: parseInt(req.query.max) };
                match.price = { $gt: parseInt(req.query.min), $lt: parseInt(req.query.max) };
                match2.price = { $gt: parseInt(req.query.min), $lt: parseInt(req.query.max) };
                match3.price = { $gt: parseInt(req.query.min), $lt: parseInt(req.query.max) };
            }

            if (req.query.search) {
                filter.$text = { $search: req.query.search };
                match.$text = { $search: req.query.search };
                match2.$text = { $search: req.query.search };
                match3.$text = { $search: req.query.search };
            }
            /*if(req.query.user){
                let user = await User.findById(req.query.user,{complaints:1});
                filter.user = {$ne:user.complaints};
                let complaints=[toObjectId('5ee8fb5e0464343940b6f7a3')];
                user.complaints.forEach(user => {
                    complaints.push(toObjectId(user))
                });                
                logger.debug(complaints);
                match.user = {$ne:complaints[0]};
                match2.user = {$ne:complaints[0]};
                match3.user = {$ne:complaints[0]};
            }*/

            let count = await Product.countDocuments(filter);
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            let filterCategory = await Product.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 } } }
            ]);
            let filterLocation = await Product.aggregate([
                { $match: match2 },
                { $group: { _id: group2, count: { $sum: 1 } } }
            ]);
            let filterCondition = await Product.aggregate([
                { $match: match3 },
                { $group: { _id: group3, count: { $sum: 1 } } }
            ]);

            let categoryFilter = [];
            let category;
            if (req.query.category) {
                category = await Category.findById(req.query.category, { name: 1 }).populate('subcategory', {
                    name: 1
                });
                let cate: Record<string, unknown> & { subcategory: unknown[] } = {
                    _id: category._id,
                    name: category.name,
                    subcategory: []
                };
                for (let i = 0; i < category.subcategory.length; i++) {
                    let subcate = { _id: category.subcategory[i]._id, name: category.subcategory[i].name, count: 0 };
                    for (let e = 0; e < filterCategory.length; e++) {
                        if (subcate._id.toString() == filterCategory[e]._id.subcategory.toString()) {
                            subcate.count = filterCategory[e].count;
                        }
                    }
                    cate.subcategory.push(subcate);
                }
                categoryFilter.push(cate);
            } else {
                category = await Category.find({ father: 1 }, { name: 1 });
                for (let i = 0; i < category.length; i++) {
                    let subcate = { _id: category[i]._id, name: category[i].name, count: 0, subcategory: [] };
                    for (let e = 0; e < filterCategory.length; e++) {
                        if (subcate._id.toString() == filterCategory[e]._id.category.toString()) {
                            subcate.count = filterCategory[e].count;
                        }
                    }
                    categoryFilter.push(subcate);
                }
            }

            let locationFilter = [];
            let location;
            if (req.query.department) {
                location = Location[req.query.department];
                let loca: Record<string, unknown> & { city: unknown[] } = {
                    name: req.query.department,
                    city: []
                };
                for (let i = 0; i < location.length; i++) {
                    let city = { name: location[i], count: 0 };
                    for (let e = 0; e < filterLocation.length; e++) {
                        if (city.name == filterLocation[e]._id.city) {
                            city.count = filterLocation[e].count;
                        }
                    }
                    loca.city.push(city);
                }
                locationFilter.push(loca);
            } else {
                location = Location.Department;
                for (let i = 0; i < location.length; i++) {
                    let subloca = { name: location[i], count: 0, city: [] };
                    for (let e = 0; e < filterLocation.length; e++) {
                        if (subloca.name == filterLocation[e]._id.department) {
                            subloca.count = filterLocation[e].count;
                        }
                    }
                    locationFilter.push(subloca);
                }
            }
            let conditionFilter = [];
            conditionFilter.push({ name: 'Nuevo', subname: 'new', count: 0 });
            conditionFilter.push({ name: 'Usado', subname: 'used', count: 0 });
            for (let i = 0; i < filterCondition.length; i++) {
                if (filterCondition[i]._id.condition == 'new') {
                    conditionFilter[0].count = filterCondition[i].count;
                } else {
                    conditionFilter[1].count = filterCondition[i].count;
                }
            }
            logger.debug(filterCondition);

            let product = await Product.find(filter, productData)
                .populate('user', { city: 1, department: 1 })
                .skip(0)
                .limit(parseInt(req.query.limit));
            res.status(200).json({
                status: 1,
                data: { product, numPages, categoryFilter, locationFilter, conditionFilter },
                token: req.token
            });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [serializeLegacyError(err, 'products')] });
        }
    },
    search: async (req, res) => {
        try {
            let filter: Record<string, unknown> = { status: 1 };
            if (req.query.category) {
                if (req.query.subcategory) {
                    filter.subcategory = req.query.subcategory;
                } else {
                    filter.category = req.query.category;
                }
            }
            if (req.query.department) {
                if (req.query.city) {
                    filter.city = req.query.city;
                } else {
                    filter.department = req.query.department;
                }
            }
            if (req.query.condition) {
                filter.condition = req.query.condition;
            }

            if (req.query.min && req.query.max) {
                filter.price = { $gt: parseInt(req.query.min), $lt: parseInt(req.query.max) };
            }

            if (req.query.search) {
                filter = { $text: { $search: req.query.search } };
            }

            let count = await Product.countDocuments(filter);
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            let product = await Product.find(filter, productData)
                .populate('user', { city: 1, department: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit));
            res.status(200).json({ status: 1, data: { product, numPages } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [serializeLegacyError(err, 'products')] });
        }
    },
    keywords: async (req, res) => {
        try {
            //let filter={ $text : { $search : req.query.keywords}}
            let filter = {
                title: { $regex: req.query.keywords, $options: '-i' }
            };
            let product = await Product.find(filter, { title: 1 }).limit(10);
            res.status(200).json({ status: 1, data: product });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [serializeLegacyError(err, 'products')] });
        }
    }
} satisfies Readonly<Record<string, ProductHandler>>;
