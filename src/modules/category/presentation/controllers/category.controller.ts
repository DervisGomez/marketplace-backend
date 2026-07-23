const useCases = require('../../application/services/CategoryUseCaseRegistry');
const CategoryRequestDto = require('../dto/CategoryRequestDto');
import type { NextFunction, Response } from 'express';
import type { CategoryHandler, CategoryHttpRequest } from '../dto/CategoryContracts';

function handler(name: string): CategoryHandler {
    return function categoryRequestHandler(req: CategoryHttpRequest, res: Response, next: NextFunction) {
        req.body = CategoryRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    load: handler('load'),
    list: handler('list'),
    listProduct: handler('listProduct'),
    listHome: handler('listHome'),
    add: handler('add'),
    addSub: handler('addSub'),
    edit: handler('edit'),
    editSub: handler('editSub'),
    remove: handler('remove'),
    removeSub: handler('removeSub')
};
