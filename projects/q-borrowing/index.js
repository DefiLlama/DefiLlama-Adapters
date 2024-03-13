const ADDRESSES = require('../helper/coreAssets.json')

const BORROWING_CONTRACT = "0xb9c29d9A24B233C53020891D47F82043da615Dcc"

async function tvl(_, _1, _2, { api }) {
    const wbtcBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.q.WBTC,
        params: [BORROWING_CONTRACT],
    });

    const usdcBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.q.WUSDC,
        params: [BORROWING_CONTRACT],
    });

    const daiBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.q.WDAI,
        params: [BORROWING_CONTRACT],
    });

    api.add(ADDRESSES.q.WBTC, wbtcBalance / 1e8)
    api.add(ADDRESSES.q.WUSDC, usdcBalance / 1e6)
    api.add(ADDRESSES.q.WDAI, daiBalance / 1e18)
}

module.exports = {
    q: { tvl },
};
