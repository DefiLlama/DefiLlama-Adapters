const ADDRESSES = require('../helper/coreAssets.json')
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
    'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
    'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx',
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx',
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2::ststxbtc',
    ADDRESSES.stacks.aeUSDC + '::aeUSDC',
    ADDRESSES.stacks.USDh + '::usdh',
    ADDRESSES.stacks.USDT + '::bridged-usdt',
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token::usda',
    'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex',
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token::diko',
]

const VAULT_OWNERS = [
    'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-vault',
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2',
]

function getContract(asset) {
    return asset.split('::')[0]
}

function getTokenId(asset) {
    const contract = getContract(asset)
    return contract === 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx' ? nullAddress : asset
}

async function tvl(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    await Promise.all(VAULT_OWNERS.flatMap(owner =>
        V1_ASSETS.map(async (asset) => {
            try {
                const bal = await call({
                    target: getContract(asset),
                    abi: 'get-balance',
                    inputArgs: [{ type: 'principal', value: owner }],
                    block,
                })
                api.add(getTokenId(asset), bal?.value ?? bal)
            } catch (e) {
                if (e.message?.includes('429')) throw e
            }
        })
    ))
    return api.getBalances()
}

async function borrowed(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    const poolRead = getPoolRead(block)
    await Promise.all(V1_ASSETS.map(async (asset) => {
        try {
            const data = await call({
                target: poolRead,
                abi: 'get-reserve-data',
                inputArgs: [{ type: 'principal', value: getContract(asset) }],
                block,
            })
            const borrows = data?.['total-borrows-variable']?.value ?? '0'
            api.add(getTokenId(asset), borrows)
        } catch (e) {
            if (e.message?.includes('429')) throw e
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
