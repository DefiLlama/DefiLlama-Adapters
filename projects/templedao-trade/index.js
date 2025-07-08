const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ owner: '0x98257C876ACe5009e7B97843F8c71b3AE795c71E', tokens: [ADDRESSES.ethereum.FRAX], }),
        
    }
};