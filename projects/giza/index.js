const arma = require('./arma');
const pulse = require('./pulse');

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Giza smart wallet accounts across DeFi lending protocols for the Arma product, and Pendle PT token holdings for the Pulse product.',
    ...arma,
    ...pulse,
}
