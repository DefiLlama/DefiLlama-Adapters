const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/stacks')
const { call, getBlockAtTimestamp } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const POOL_READ_VERSIONS = [
    { height: 140386, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read' },
    { height: 140925, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-0' },
    { height: 143592, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-2' },
    { height: 149408, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3' },
    { height: 151852, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3-1' },
    { height: 151995, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3-2' },
    { height: 236579, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3-3' },
    { height: 260962, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3-4' },
    { height: 293417, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v1-3-5' },
    { height: 344537, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-0' },
    { height: 348194, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-0-1' },
    { height: 498152, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1' },
    { height: 498807, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1-1' },
    { height: 1050003, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1-2' },
    { height: 2012635, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1-3' },
    { height: 2036349, contract: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-read-v2-1-4' },
]

function getPoolRead(blockHeight) {
    if (!blockHeight) return POOL_READ_VERSIONS[POOL_READ_VERSIONS.length - 1].contract
    for (let i = POOL_READ_VERSIONS.length - 1; i >= 0; i--) {
        if (blockHeight >= POOL_READ_VERSIONS[i].height) return POOL_READ_VERSIONS[i].contract
    }
    return POOL_READ_VERSIONS[0].contract
}

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
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    const poolRead = getPoolRead(block)
    await Promise.all(V1_ASSETS.map(async (asset) => {
        try {
            const data = await call({
                target: poolRead,
                abi: 'get-reserve-data',
                inputArgs: [{ type: 'principal', value: asset }],
                block,
            })
            const tokenId = asset === 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx' ? nullAddress : asset
            const borrows = data?.['total-borrows-variable']?.value ?? '0'
            api.add(tokenId, borrows)
        } catch (e) {
            // Asset may not have existed at this block height
        }
    }))
    return api.getBalances()
}

module.exports = {
    stacks: {
        tvl,
        borrowed,
    },
};
