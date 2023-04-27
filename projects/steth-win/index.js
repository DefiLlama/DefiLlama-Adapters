const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const POOL_CONTRACT = '0x2758b8d894b08342f0d00ac5f9466fdc795e4618';
const STETH_CONTRACT = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';

async function tvl(_, _1, _2, { api }) {
    const balances = {};

    const poolBalance = await api.call({
        abi: abi['accountedBalance'],
        target: POOL_CONTRACT,
    });

    await sdk.util.sumSingleBalance(balances, STETH_CONTRACT, poolBalance, api.chain)

    return balances;
}

module.exports = {
    methodology: 'Counts the number of stETH tokens in the pool and calculates its TVL',
    ethereum: {
        tvl,
    }
};
