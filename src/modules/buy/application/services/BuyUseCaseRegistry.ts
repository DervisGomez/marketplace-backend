const Purchase = require('../use-cases/checkout/PurchaseUseCases');
const Payment = require('../../../payment/application/services/PaymentUseCaseRegistry');
const OrderQuery = require('../use-cases/orders/OrderQueryUseCases');
const PublicOrder = require('../use-cases/orders/PublicOrderUseCases');
const Messaging = require('../use-cases/orders/MessagingUseCases');
const Qualification = require('../use-cases/qualification/QualificationUseCases');
const Reputation = require('../use-cases/qualification/ReputationUseCases');
const PendingQualification = require('../use-cases/qualification/PendingQualificationUseCases');
const OperationReporting = require('../use-cases/reporting/OperationReportingUseCases');
const Reporting = require('../use-cases/reporting/ReportUseCases');

module.exports = Object.assign(
    {},
    Purchase,
    Payment,
    OrderQuery,
    PublicOrder,
    Messaging,
    Qualification,
    Reputation,
    PendingQualification,
    OperationReporting,
    Reporting
);
