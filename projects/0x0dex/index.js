const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const ETH_POOL_ADDRESS = "0x3d18AD735f949fEbD59BBfcB5864ee0157607616";

module.exports = {
    start: 1685386800, // 19/05/2023 @ 07:00pm UTC
    ethereum: { tvl: sumTokensExport({ owner: ETH_POOL_ADDRESS, tokens: [nullAddress]}) },
};