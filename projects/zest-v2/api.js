const ADDRESSES = require('../helper/coreAssets.json')
const { call, getBlockAtTimestamp, getStxBalance } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'
const STBTC = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stbtc-token::stbtc'

const V2_VAULTS = [
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh', tokenId: ADDRESSES.stacks.USDh },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc', tokenId: ADDRESSES.stacks.USDCx },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx', tokenId: nullAddress },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx', tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc', tokenId: SBTC },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc', tokenId: ADDRESSES.stacks.stSTXbtc },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stbtc', tokenId: STBTC },
]

function toBI(v) {
    return typeof v === 'object' ? BigInt(v.value) : BigInt(v)
}

// returns null instead of throwing when the contract was not yet deployed at the queried block
async function callSafe(args) {
    try {
        return await call(args)
    } catch (e) {
        if (String(e.message).includes('NoSuchContract')) return null
        throw e
    }
}

const MARKET_VAULT = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-market-vault'
const ZV_STATE_STBTC = 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.zv-state-stbtc-0'

// each owner holds one token of interest - used for historical refills,
// where balances must be read on-chain per token instead of via the balances API
const TOKENS_AND_OWNERS = [
    ...V2_VAULTS.map(({ vault, tokenId }) => [tokenId, vault]),
    [SBTC, MARKET_VAULT],
    [STBTC, ZV_STATE_STBTC],
]

async function tvl(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)

    // historical: the balances API cannot timetravel, read balances on-chain at the block tip
    for (const [token, owner] of TOKENS_AND_OWNERS) {
        if (token === nullAddress) {
            api.add(nullAddress, await getStxBalance(owner, block))
            continue
        }
        const balance = await callSafe({ target: token.split('::')[0], abi: 'get-balance', inputArgs: [{ type: 'principal', value: owner }], block })
        if (balance !== null) api.add(token, toBI(balance).toString())
    }
    return api.getBalances()
}

async function borrowed(api) {
    const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
    for (const { vault, tokenId } of V2_VAULTS) {
        const assets = await callSafe({ target: vault, abi: 'get-assets', block })
        const available = await callSafe({ target: vault, abi: 'get-available-assets', block })
        if (assets === null || available === null) continue
        const borrowedAmt = toBI(assets) - toBI(available)
        if (borrowedAmt > 0n)
            api.add(tokenId, borrowedAmt.toString())
    }
    return api.getBalances()
}

module.exports = {
    stacks: {
        tvl,
        borrowed,
    },
};
