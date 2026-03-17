const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/stacks')
const { call } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const POOL_READ = 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1-4'

const V1_ASSETS = [
    'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx',
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2',
    ADDRESSES.stacks.aeUSDC,
    ADDRESSES.stacks.USDh,
    ADDRESSES.stacks.USDT,
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
    'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
]

async function tvl() {
    return sumTokens({
        owners: [
            'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-vault',
            'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2',
        ],
    })
}

async function borrowed(api) {
    await Promise.all(V1_ASSETS.map(async (asset) => {
        const data = await call({
            target: POOL_READ,
            abi: 'get-reserve-data',
            inputArgs: [{ type: 'principal', value: asset }],
        })
        const tokenId = asset === 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx' ? nullAddress : asset
        const borrows = data?.['total-borrows-variable']?.value ?? '0'
        api.add(tokenId, borrows)
    }))
    return api.getBalances()
}

module.exports = {
    stacks: {
        tvl,
        borrowed,
    },
};
