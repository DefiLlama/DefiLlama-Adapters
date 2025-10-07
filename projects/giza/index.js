const arma = require('./arma');
const pulse = require('./pulse');

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by Giza protocol across multiple DeFi protocols. Includes Arma product (USD/USDT0 vaults on Base/Plasma) and Pulse product (Pendle PT tokens on Arbitrum)',
    ...arma,
    ...pulse,
}
