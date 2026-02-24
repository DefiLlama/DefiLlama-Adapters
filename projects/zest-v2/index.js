const { sumTokens } = require('../helper/chain/stacks')
const { call } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const V2_VAULTS = [
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',     tokenId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc',     tokenId: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx',      tokenId: nullAddress },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx',    tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',     tokenId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token' },
    { vault: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc', tokenId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2' },
]

function toBI(v) {
    return typeof v === 'object' ? BigInt(v.value) : BigInt(v)
}

async function tvl() {
    return sumTokens({
        owners: [
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-market-vault',
        ],
    })
}

async function borrowed(api) {
    await Promise.all(V2_VAULTS.map(async ({ vault, tokenId }) => {
        const [assets, available] = await Promise.all([
            call({ target: vault, abi: 'get-assets' }),
            call({ target: vault, abi: 'get-available-assets' }),
        ])
        const borrowedAmt = toBI(assets) - toBI(available)
        if (borrowedAmt > 0n)
            api.add(tokenId, borrowedAmt.toString())
    }))
}

module.exports = {
    stacks: {
        tvl,
        borrowed,
    },
};
