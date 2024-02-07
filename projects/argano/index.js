const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getUniTVL } = require('../helper/unknownTokens')

const contracts = {
    factory: '0xdAc31E70c2C4Fea0629e85e7B67222127A8672d8',
    usdtPool: '0x250EFcd45D9f83036f2D403223c7cCb2E1e9D00b',
    usdt: ADDRESSES.polygon.USDT,
    wbtcPool: '0x610094adF401626D6B62df62bF6E67A7A6E22043',
    wbtc: ADDRESSES.polygon.WBTC
};

module.exports = {
    misrepresentedTokens: true,
    polygon: {
        tvl: sdk.util.sumChainTvls([
            sumTokensExport({ tokensAndOwners: [
                [contracts.wbtc, contracts.wbtcPool],
                [contracts.usdt, contracts.usdtPool],
            ]}),
            getUniTVL({ factory: contracts.factory, useDefaultCoreAssets: true, })
        ])
    }
};