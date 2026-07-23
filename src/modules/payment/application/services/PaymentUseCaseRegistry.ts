const DepositAdministration = require('../use-cases/deposits/DepositAdministrationUseCases');
const Withdrawals = require('../use-cases/withdrawals/WithdrawalUseCases');
const Balances = require('../use-cases/balances/BalanceUseCases');
const Transactions = require('../use-cases/transactions/TransactionUseCases');
const Reporting = require('../use-cases/reporting/ReportingUseCases');

module.exports = Object.assign({}, DepositAdministration, Withdrawals, Balances, Transactions, Reporting);
