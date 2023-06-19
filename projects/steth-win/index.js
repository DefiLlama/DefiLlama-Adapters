const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const POOL_CONTRACT = '0x2758b8d894b08342f0d00ac5f9466fdc795e4618';
const STETH_CONTRACT = ADDRESSES.ethereum.STETH;

module.exports = {
    methodology: 'Counts the number of stETH tokens in the pool and calculates its TVL',
    ethereum: {
        tvl: sumTokensExport({ owner: POOL_CONTRACT, tokens: [STETH_CONTRACT] }),
    }
};
