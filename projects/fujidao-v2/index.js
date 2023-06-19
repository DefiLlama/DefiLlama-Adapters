const {polygonSupply, polygonDebt} = require('./polygon');
const {arbitrumSupply, arbitrumDebt} = require('./arbitrum');
const {optimismSupply, optimismDebt} = require('./optimism');
// const {gnosisSupply, gnosisDebt} = require('./gnosis');

module.exports = {
    methodology: "Counts on-chain balance of underlying asset deposited and borrowed debt for all Fuji V2 vaults.",
    polygon: {
        tvl: polygonSupply,
        borrowed: polygonDebt
    },
    arbitrum: {
        tvl: arbitrumSupply,
        borrowed: arbitrumDebt
    },
    optimism: {
        tvl: optimismSupply,
        borrowed:  optimismDebt
    },
    // xdai: {
    //     tvl: gnosisSupply
    // }
}