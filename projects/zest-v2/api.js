const ADDRESSES = require('../helper/coreAssets.json')
const { call, getBlockAtTimestamp } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'
const STBTC = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stbtc-token'

const V2_VAULTS = [
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',     tokenId: ADDRESSES.stacks.USDh },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc',     tokenId: ADDRESSES.stacks.USDCx },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx',      tokenId: nullAddress },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx',    tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',     tokenId: SBTC },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc', tokenId: ADDRESSES.stacks.stSTXbtc },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stbtc',    tokenId: SBTC },
]

function toBI(v) {
    return typeof v === 'object' ? BigInt(v.value) : BigInt(v)
}

async function tvl(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    await Promise.all(V2_VAULTS.map(async ({ vault, tokenId }) => {
        const assets = await call({ target: vault, abi: 'get-assets', block })
        api.add(tokenId, toBI(assets).toString())
    }))
    const bal = await call({
        target: SBTC,
        abi: 'get-balance',
        inputArgs: [{ type: 'principal', value: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-market-vault' }],
        block,
    })
    api.add(SBTC, toBI(bal).toString())
    const stateBal = await call({
        target: STBTC,
        abi: 'get-balance',
        inputArgs: [{ type: 'principal', value: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.zv-state-stbtc-0' }],
        block,
    })
    api.add(SBTC, toBI(stateBal).toString())

    return api.getBalances()
}

async function borrowed(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    await Promise.all(V2_VAULTS.map(async ({ vault, tokenId }) => {
        const [assets, available] = await Promise.all([
            call({ target: vault, abi: 'get-assets', block }),
            call({ target: vault, abi: 'get-available-assets', block }),
        ])
        const borrowedAmt = toBI(assets) - toBI(available)
        if (borrowedAmt > 0n)
            api.add(tokenId, borrowedAmt.toString())
    }))
    return api.getBalances()
}

module.exports = {
    stacks: {
        tvl,
        borrowed,
    },
};
