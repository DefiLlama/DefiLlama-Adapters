const { sumTokensExport } = require('../helper/unwrapLPs');

const POOL_CONTRACT = '0x2758b8d894b08342f0d00ac5f9466fdc795e4618';
const STETH_CONTRACT = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';

module.exports = {
    methodology: 'Counts the number of stETH tokens in the pool and calculates its TVL',
    ethereum: {
        tvl: sumTokensExport({ owner: POOL_CONTRACT, tokens: [STETH_CONTRACT] }),
    }
};
