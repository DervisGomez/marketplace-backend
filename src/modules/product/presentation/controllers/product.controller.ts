const useCases = require('../../application/services/ProductUseCaseRegistry');
const ProductRequestDto = require('../dto/ProductRequestDto');
import type { NextFunction, Response } from 'express';
import type { ProductHandler, ProductHttpRequest } from '../dto/ProductContracts';

function handler(name: string): ProductHandler {
    return function productRequestHandler(req: ProductHttpRequest, res: Response, next: NextFunction) {
        req.body = ProductRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    createIncrement: handler('createIncrement'),
    new: handler('new'),
    edit: handler('edit'),
    pause: handler('pause'),
    start: handler('start'),
    me: handler('me'),
    user: handler('user'),
    query: handler('query'),
    queryNumber: handler('queryNumber'),
    queryFind: handler('queryFind'),
    find: handler('find'),
    category: handler('category'),
    subcategory: handler('subcategory'),
    filter: handler('filter'),
    search: handler('search'),
    keywords: handler('keywords'),
    favoriteAdd: handler('favoriteAdd'),
    favoriteRemove: handler('favoriteRemove'),
    favorite: handler('favorite'),
    operations: handler('operations'),
    outstanding: handler('outstanding'),
    last: handler('last'),
    sold: handler('sold')
};
