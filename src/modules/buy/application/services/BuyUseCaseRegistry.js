const modules = [
    require('../use-cases/checkout/PurchaseUseCases'),
    require('../../../payment/application/services/PaymentUseCaseRegistry'),
    require('../use-cases/orders/OrderQueryUseCases'),
    require('../use-cases/orders/PublicOrderUseCases'),
    require('../use-cases/orders/MessagingUseCases'),
    require('../use-cases/qualification/QualificationUseCases'),
    require('../use-cases/qualification/ReputationUseCases'),
    require('../use-cases/qualification/PendingQualificationUseCases'),
    require('../use-cases/reporting/OperationReportingUseCases'),
    require('../use-cases/reporting/ReportUseCases')
];

module.exports = Object.assign({}, ...modules);
