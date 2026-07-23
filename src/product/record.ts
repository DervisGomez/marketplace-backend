const logger = require('../infrastructure/logging/logger');
// TODO(v2): Move to Reputation Module.
// Encapsulado por LegacyReputationGateway; no modificar esta lógica durante
// la modernización estructural de Product.
let Buy = require('../../../src/buy/buySchema');
let Account = require('../../../src/account/accountSchema');

interface RoleContract extends Record<string, unknown> {
    readonly id: number;
}

interface RecordInfo {
    bank: number;
    category: RoleContract;
    categoryNext: RoleContract | null;
    count: number;
    total: number;
}

let Role = [
    {
        id: 8,
        name: 'Vendedor profesional',
        count: 250,
        money: 100000000,
        gain: 6,
        max: 2000000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'goldenrod',
        bank: 1
    },
    {
        id: 7,
        name: 'Vendedor estrella',
        count: 200,
        money: 50000000,
        gain: 6,
        max: 1000000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'seagreen',
        bank: 1
    },
    {
        id: 6,
        name: 'Vendedor experto',
        count: 100,
        money: 20000000,
        gain: 6,
        max: 500000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'limegreen',
        bank: 1
    },
    {
        id: 5,
        name: 'Vendedor distingido',
        count: 50,
        money: 5000000,
        gain: 6,
        max: 200000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'turquoise',
        bank: 1
    },
    {
        id: 4,
        name: 'Vendedor destacado',
        count: 20,
        money: 1000000,
        gain: 7,
        max: 50000,
        official: 8,
        highlight: 10,
        highlightGain: 9,
        color: 'blue',
        bank: 1
    },
    {
        id: 3,
        name: 'Vendedor novato',
        count: 10,
        money: 200000,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'darkorchid',
        bank: 0
    },
    {
        id: 2,
        name: 'Vendedor principiante',
        count: 2,
        money: 0,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'fuchsia',
        bank: 0
    },
    {
        id: 1,
        name: 'Vendedor nuevo',
        count: 0,
        money: 0,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'black',
        bank: 0
    }
];

let RoleBuyer = [
    {
        id: 8,
        name: 'Comprador profesional',
        count: 250,
        money: 100000000,
        gain: 6,
        max: 2000000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'goldenrod',
        bank: 1
    },
    {
        id: 7,
        name: 'Comprador estrella',
        count: 200,
        money: 50000000,
        gain: 6,
        max: 1000000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'seagreen',
        bank: 1
    },
    {
        id: 6,
        name: 'Comprador experto',
        count: 100,
        money: 20000000,
        gain: 6,
        max: 500000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'limegreen',
        bank: 1
    },
    {
        id: 5,
        name: 'Comprador distingido',
        count: 50,
        money: 5000000,
        gain: 6,
        max: 200000,
        official: 8,
        highlight: 10,
        highlightGain: 8,
        color: 'turquoise',
        bank: 1
    },
    {
        id: 4,
        name: 'Comprador destacado',
        count: 20,
        money: 1000000,
        gain: 7,
        max: 50000,
        official: 8,
        highlight: 10,
        highlightGain: 9,
        color: 'blue',
        bank: 1
    },
    {
        id: 3,
        name: 'Comprador novato',
        count: 5,
        money: 200000,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'darkorchid',
        bank: 0
    },
    {
        id: 2,
        name: 'Comprador principiante',
        count: 2,
        money: 0,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'fuchsia',
        bank: 0
    },
    {
        id: 1,
        name: 'Comprador nuevo',
        count: 0,
        money: 0,
        gain: 8,
        max: 0,
        official: 8,
        highlight: 10,
        highlightGain: 10,
        color: 'black',
        bank: 0
    }
];

module.exports = {
    calculate2: async (id: unknown) => {
        try {
            let dateA = new Date();
            let dateB = new Date();
            dateB.setMonth(dateB.getMonth() - 1);
            logger.debug(dateA, dateB, id);
            let group = { type: '$qualifySeller' };
            let match = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateB, $lt: dateA } };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug(sales);
            if (sales.length > 0) {
                let bank = await Account.countDocuments({ user: id });
                for (let i = 0; i < Role.length; i++) {
                    if (sales[0].count >= Role[i].count && sales[0].total >= Role[i].money && bank >= Role[i].bank) {
                        logger.debug('si');
                        return Role[i];
                    }
                }
            }

            return Role[Role.length - 1];
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    },
    info2: async (id: unknown) => {
        try {
            let info = {} as RecordInfo;
            let dateA = new Date();
            let dateB = new Date();
            dateB.setMonth(dateB.getMonth() - 1);
            logger.debug(dateA, dateB, id);
            let group = { type: '$qualifySeller' };
            let match = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateB, $lt: dateA } };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug(sales);
            info.bank = await Account.countDocuments({ user: id });
            if (sales.length > 0) {
                info.count = sales[0].count;
                info.total = sales[0].total;
                info.category = {} as RoleContract;
                info.categoryNext = null;
                for (let i = 0; i < Role.length; i++) {
                    if (
                        sales[0].count >= Role[i].count &&
                        sales[0].total >= Role[i].money &&
                        info.bank >= Role[i].bank
                    ) {
                        logger.debug('si');
                        info.category = Role[i];
                        return info;
                    } else {
                        info.categoryNext = Role[i];
                    }
                }
            }
            info.count = 0;
            info.total = 0;
            info.category = Role[Role.length - 1];
            info.categoryNext = Role[Role.length - 2];
            return info;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    },
    infoBuyer: async (id: unknown) => {
        try {
            let info = {} as RecordInfo;
            let dateA = new Date();
            let dateB = new Date();
            dateB.setMonth(dateB.getMonth() - 1);
            logger.debug(dateA, dateB, id);

            let group = { type: '$qualifyBuyer' };
            let match = { buyer: id, qualifyBuyer: 'positive' /*, createdAt:{ $gt: dateB, $lt: dateA }*/ };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug(sales);
            //info.bank = await Account.countDocuments({user:id});
            if (sales.length > 0) {
                info.count = sales[0].count;
                info.total = sales[0].total;
                info.category = {} as RoleContract;
                info.categoryNext = null;
                for (let i = 0; i < RoleBuyer.length; i++) {
                    if (sales[0].count >= RoleBuyer[i].count) {
                        logger.debug('si');
                        info.category = RoleBuyer[i];
                        return info;
                    } else {
                        info.categoryNext = RoleBuyer[i];
                    }
                }
            }
            info.count = 0;
            info.total = 0;
            info.category = RoleBuyer[RoleBuyer.length - 1];
            info.categoryNext = RoleBuyer[RoleBuyer.length - 2];
            return info;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    },
    calculateBuyer: async (id: unknown) => {
        try {
            let dateA = new Date();
            let dateB = new Date();
            dateB.setMonth(dateB.getMonth() - 1);
            logger.debug(dateA, dateB, id);

            let group = { type: '$qualifyBuyer' };
            let match = { user: id, qualifyBuyer: 'positive' /*, createdAt:{ $gt: dateB, $lt: dateA }*/ };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug(sales);
            if (sales.length > 0) {
                let bank = await Account.countDocuments({ user: id });
                for (let i = 0; i < RoleBuyer.length; i++) {
                    if (sales[0].count >= RoleBuyer[i].count) {
                        logger.debug('si');
                        return RoleBuyer[i];
                    }
                }
            }

            return RoleBuyer[RoleBuyer.length - 1];
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    },
    calculate: async (id: unknown) => {
        try {
            let info = {} as RecordInfo;
            let info2 = {} as RecordInfo;
            //Consultar mes actual
            let dateA = new Date();
            let dateB = new Date();
            dateB.setDate(1);
            dateB.setHours(0);
            dateB.setMinutes(0);
            dateB.setSeconds(0);
            logger.debug('Mes actual', dateA, dateB, id);

            let group = { type: '$qualifySeller' };
            let match = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateB, $lt: dateA } };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug('Sales', sales);

            //Consultar mes anterior
            let dateAA = new Date();
            dateAA.setHours(23);
            dateAA.setMinutes(59);
            dateAA.setSeconds(59);
            dateAA.setDate(1);
            dateAA.setDate(dateAA.getDate() - 1);

            let dateBB = new Date();
            dateBB.setDate(1);
            dateBB.setHours(0);
            dateBB.setMinutes(0);
            dateBB.setSeconds(0);
            dateBB.setMonth(dateB.getMonth() - 1);

            logger.debug('Mes anterior', dateAA, dateBB, id);

            let group2 = { type: '$qualifySeller' };
            let match2 = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateBB, $lt: dateAA } };
            let sales2 = await Buy.aggregate([
                { $match: match2 },
                { $group: { _id: group2, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug('Sales2', sales2);

            info.bank = await Account.countDocuments({ user: id });
            info2.bank = info.bank;

            if (sales.length > 0) {
                info.count = sales[0].count;
                info.total = sales[0].total;
                info.category = {} as RoleContract;
                info.categoryNext = null;
                for (let i = 0; i < Role.length; i++) {
                    if (
                        sales[0].count >= Role[i].count &&
                        sales[0].total >= Role[i].money &&
                        info.bank >= Role[i].bank
                    ) {
                        info.category = Role[i];
                        i = 200;
                        //return info;
                    } else {
                        info.categoryNext = Role[i];
                    }
                }
            }

            if (sales2.length > 0) {
                info2.count = sales2[0].count;
                info2.total = sales2[0].total;
                info2.category = {} as RoleContract;
                info2.categoryNext = null;
                for (let i = 0; i < Role.length; i++) {
                    if (
                        sales2[0].count >= Role[i].count &&
                        sales2[0].total >= Role[i].money &&
                        info2.bank >= Role[i].bank
                    ) {
                        info2.category = Role[i];
                        i = 200;
                        //return info;
                    } else {
                        info2.categoryNext = Role[i];
                    }
                }
            }

            if (info.count && info2.count) {
                if (info.category.id > info2.category.id) {
                    return info;
                } else {
                    return info2;
                }
            }

            if (info.count) {
                logger.debug(info.category);
                return info;
            }

            if (info2.count) {
                logger.debug(info2.category);
                return info2;
            }
            logger.debug(Role[Role.length - 1]);
            info.category = Role[Role.length - 1];
            info.categoryNext = Role[Role.length - 2];
            return info;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    },
    info: async (id: unknown) => {
        try {
            let info = {} as RecordInfo;
            let info2 = {} as RecordInfo;
            //Consultar mes actual
            let dateA = new Date();
            let dateB = new Date();
            dateB.setDate(1);
            dateB.setHours(0);
            dateB.setMinutes(0);
            dateB.setSeconds(0);
            logger.debug('Mes actual', dateA, dateB, id);

            let group = { type: '$qualifySeller' };
            let match = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateB, $lt: dateA } };
            let sales = await Buy.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug('Sales', sales);

            //Consultar mes anterior
            let dateAA = new Date();
            dateAA.setHours(23);
            dateAA.setMinutes(59);
            dateAA.setSeconds(59);
            dateAA.setDate(1);
            dateAA.setDate(dateAA.getDate() - 1);

            let dateBB = new Date();
            dateBB.setDate(1);
            dateBB.setHours(0);
            dateBB.setMinutes(0);
            dateBB.setSeconds(0);
            dateBB.setMonth(dateB.getMonth() - 1);

            logger.debug('Mes anterior', dateAA, dateBB, id);

            let group2 = { type: '$qualifySeller' };
            let match2 = { user: id, qualifySeller: 'positive', createdAt: { $gt: dateBB, $lt: dateAA } };
            let sales2 = await Buy.aggregate([
                { $match: match2 },
                { $group: { _id: group2, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            logger.debug('Sales2', sales2);

            info.bank = await Account.countDocuments({ user: id });
            info2.bank = info.bank;

            if (sales.length > 0) {
                info.count = sales[0].count;
                info.total = sales[0].total;
                info.category = {} as RoleContract;
                info.categoryNext = null;
                for (let i = 0; i < Role.length; i++) {
                    if (
                        sales[0].count >= Role[i].count &&
                        sales[0].total >= Role[i].money &&
                        info.bank >= Role[i].bank
                    ) {
                        info.category = Role[i];
                        i = 200;
                        //return info;
                    } else {
                        info.categoryNext = Role[i];
                    }
                }
            }

            if (sales2.length > 0) {
                info2.count = sales2[0].count;
                info2.total = sales2[0].total;
                info2.category = {} as RoleContract;
                info2.categoryNext = null;
                for (let i = 0; i < Role.length; i++) {
                    if (
                        sales2[0].count >= Role[i].count &&
                        sales2[0].total >= Role[i].money &&
                        info2.bank >= Role[i].bank
                    ) {
                        info2.category = Role[i];
                        i = 200;
                        //return info;
                    } else {
                        info2.categoryNext = Role[i];
                    }
                }
            }

            if (info.count && info2.count) {
                if (info.category.id > info2.category.id) {
                    return info;
                } else {
                    return info2;
                }
            }

            if (info.count) {
                return info;
            }

            if (info2.count) {
                return info2;
            }

            info.count = 0;
            info.total = 0;
            info.category = Role[Role.length - 1];
            info.categoryNext = Role[Role.length - 2];
            return info;
        } catch (error) {
            logger.error({ err: error }, 'Legacy operation failed');
            return {};
        }
    }
};
