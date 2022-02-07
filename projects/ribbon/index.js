const evm = require('./evm')
const solana = require('./solana')

module.exports = {
    ...evm,
    ...solana,
    methodology: "Sums the totalBalance of all Ribbon Theta Vaults"
}
