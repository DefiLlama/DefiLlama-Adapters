const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
    const assets = await api.call({target: '0xcd69123b3FBBfC666E1f6a501da27B564C00De54', abi: 'uint:getTotalAssets'});
    api.add(ADDRESSES.ethereum.USDC, assets / 1e12);
}

module.exports = {
    methodology: 'Counts total value of assets staked into the Upshift Tori ecosystem vault.',
    doublecounted: true,
    ethereum: { tvl } // temp until trUSD is priced on dex
    // ethereum: { tvl: sumERC4626VaultsExport({vaults: ['0xcd69123b3FBBfC666E1f6a501da27B564C00De54'], tokenAbi: 'address:asset', balanceAbi: 'uint:getTotalAssets'}) }
}