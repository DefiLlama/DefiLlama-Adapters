const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const LEVEL_STAKING_CONTRACT = '0x7FDA203f6F77545548E984133be62693bCD61497';

const TOKEN_CONTRACTS = [
    ADDRESSES.ethereum.USDT, // USDT
    ADDRESSES.ethereum.USDC, // USDC
];

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ 
          owner: LEVEL_STAKING_CONTRACT, 
          tokens: TOKEN_CONTRACTS,
        }),
    }
};
