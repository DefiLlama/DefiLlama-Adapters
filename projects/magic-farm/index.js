const { sumTokensExport } = require('../helper/sumTokens')

// === Constants (Base) ===
const MAGIC_RWA_BASE = '0xe147b006b0d7c5270fba6c6679d29ddd7a92e043'
const RWA_BASE = '0xE2B1dc2D4A3b4E59FDF0c47B71A7A86391a8B35a'
// === Constants (Ethereum) ===
const MAGIC_STABUL_ETH = '0xa1AFeAe52f055e11Da2ac65a5f41A488C3F053f4'
const STABUL_ETH = '0x6A43795941113c2F58EB487001f4f8eE74b6938A'
const MAGIC_MNRY_ETH = '0x83960386c8700e9CCA269537130D816608e5a58E'
const MNRY_ETH = '0x06904a21f2dB805487FcBDC3b3Fe9607dAaa5D54'
// === Constants (BSC) ===
const MAGIC_TDS_BSC = '0xf2B87D3b264560dD3A91832f6d685965DB78e25a'
const TDS_BSC = '0x82f0508797A7167ADD9274b3AEe4293158A8645E'
// === Constants (OP) ===
const MAGIC_FASH_OPTIMISM = '0x957Cd76D7558Ace37c2e37f7c6ef0ddf1e53F54A'
const FASH_OPTIMISM = '0x7D3Ce1265d5eA5848Dc1C96AADbf754E2baD33b1'
// === Constants (Avalanche) ===
const MAGIC_COLS_AVALANCHE = '0xb6943369cba1248071ddd5b9e23dd35eb9d0fcd9'
const COLS_AVALANCHE = '0x97f2624D5f99A953AE5574ea57d3268785941DE4'


module.exports = {
    methodology:
        'TVL equals the balance of the specified ERC20 held by the target Magic Farm contract on specific network.',
    timetravel: true,
    misrepresentedTokens: false,

    base: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [RWA_BASE, MAGIC_RWA_BASE],
            ],
        }),
    },
    ethereum: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [STABUL_ETH, MAGIC_STABUL_ETH],
                [MNRY_ETH, MAGIC_MNRY_ETH],
            ],
        }),
    },
    bsc : {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [TDS_BSC, MAGIC_TDS_BSC],
            ],
        }),
    },
    optimism : {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [FASH_OPTIMISM, MAGIC_FASH_OPTIMISM],
            ],
        }),
    },
    avax : {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [COLS_AVALANCHE, MAGIC_COLS_AVALANCHE],
            ],
        }),
    },
}
