const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _1, _2, { api }) {
    const stakedMetis = await api.call({
        abi: 'erc20:totalSupply',
        target: '0x97a2de3A09F4A4229369ee82c7F76be1a5564661',
    });

    api.add(ADDRESSES.metis.Metis, stakedMetis);
}

module.exports = {
    metis: {
        tvl
    }
};