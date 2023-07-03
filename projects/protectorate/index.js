const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
    ethereum: {
        tokens: [
            ADDRESSES.ethereum.WETH,
        ],
        owners: ["0xaF53431488E871D103baA0280b6360998F0F9926"],
    },
})