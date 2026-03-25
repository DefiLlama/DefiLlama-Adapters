const ADDRESSES = require('../helper/coreAssets.json')
const { call, getBlockAtTimestamp } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const V2_VAULTS = [
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',     tokenId: ADDRESSES.stacks.USDh },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc',     tokenId: ADDRESSES.stacks.USDCx },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx',      tokenId: nullAddress },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx',    tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',     tokenId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc', tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2' },
]

function toBI(v) {
    return typeof v === 'object' ? BigInt(v.value) : BigInt(v)
}

async function tvl(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    await Promise.all(V2_VAULTS.map(async ({ vault, tokenId }) => {
        try {
            const assets = await call({ target: vault, abi: 'get-assets', block })
            api.add(tokenId, toBI(assets).toString())
        } catch (e) {
            if (e.message?.includes('429')) throw e
        }
    }))
    try {
        const bal = await call({
            target: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
            abi: 'get-balance',
            inputArgs: [{ type: 'principal', value: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-market-vault' }],
            block,
        })
        api.add('SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token', toBI(bal).toString())
    } catch (e) {
        if (e.message?.includes('429')) throw e
    }
}

async function borrowed(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    await Promise.all(V2_VAULTS.map(async ({ vault, tokenId }) => {
        try {
            const [assets, available] = await Promise.all([
                call({ target: vault, abi: 'get-assets', block }),
                call({ target: vault, abi: 'get-available-assets', block }),
            ])
            const borrowedAmt = toBI(assets) - toBI(available)
            if (borrowedAmt > 0n)
                api.add(tokenId, borrowedAmt.toString())
        } catch (e) {
            if (e.message?.includes('429')) throw e
            // Vault may not have existed at this block height
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
