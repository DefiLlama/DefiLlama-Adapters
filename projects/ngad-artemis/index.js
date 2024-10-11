const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _1, _2, {api}) {
    const depositedMetis = await api.call({
        abi: 'function totalDeposits() view returns (uint256)',
        target: '0x96C4A48Abdf781e9c931cfA92EC0167Ba219ad8E'
    });

    api.add(ADDRESSES.metis.Metis, depositedMetis);
}

module.exports = {
    metis: {
        tvl
    }
};
