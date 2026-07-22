const modules = [
    require('../use-cases/deposits/DepositAdministrationUseCases'),
    require('../use-cases/withdrawals/WithdrawalUseCases'),
    require('../use-cases/balances/BalanceUseCases'),
    require('../use-cases/transactions/TransactionUseCases'),
    require('../use-cases/reporting/ReportingUseCases')
];

module.exports = Object.assign({}, ...modules);
