const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _1, _2, { api }) {
    const stakedMetis = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.metis.Metis,
        params: ['0x810Ef8Aa1326FB1c5Ce57cD79d549CF9B2cC32aF']
    });

    api.add(ADDRESSES.metis.Metis, stakedMetis);
}

module.exports = {
    metis: {
        tvl
    }
};