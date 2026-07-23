const Publication = require('../use-cases/publication/PublicationUseCases');
const Catalog = require('../use-cases/catalog/CatalogUseCases');
const Search = require('../use-cases/search/SearchUseCases');
const Favorites = require('../use-cases/favorites/FavoriteUseCases');
const Reporting = require('../use-cases/reporting/ReportingUseCases');

module.exports = Object.assign({}, Publication, Catalog, Search, Favorites, Reporting);
