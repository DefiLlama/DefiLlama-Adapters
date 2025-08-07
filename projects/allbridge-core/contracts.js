const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
    "ethereum": {
        "tokens": [
            {
                "poolAddress": "0xa7062bbA94c91d565Ae33B893Ab5dFAF1Fc57C4d",
                "tokenAddress": ADDRESSES.ethereum.USDC
            },
            {
                "poolAddress": "0x7DBF07Ad92Ed4e26D5511b4F285508eBF174135D",
                "tokenAddress": ADDRESSES.ethereum.USDT
            }
        ]
    },
    "bsc": {
        "tokens": [
            {
                "poolAddress": "0x8033d5b454Ee4758E4bD1D37a49009c1a81D8B10",
                "tokenAddress": ADDRESSES.bsc.BUSD
            },
            {
                "poolAddress": "0xf833afA46fCD100e62365a0fDb0734b7c4537811",
                "tokenAddress": ADDRESSES.bsc.USDT
            }
        ]
    },
    "polygon": {
        "tokens": [
            {
                "poolAddress": "0x58Cc621c62b0aa9bABfae5651202A932279437DA",
                "tokenAddress": ADDRESSES.polygon.USDC
            },
            {
                "poolAddress": "0x0394c4f17738A10096510832beaB89a9DD090791",
                "tokenAddress": ADDRESSES.polygon.USDT
            },
            {
                "poolAddress": "0x4C42DfDBb8Ad654b42F66E0bD4dbdC71B52EB0A6",
                "tokenAddress": ADDRESSES.polygon.USDC_CIRCLE
            }
        ]
    },
    "arbitrum": {
        "tokens": [
            {
                "poolAddress": "0x690e66fc0F8be8964d40e55EdE6aEBdfcB8A21Df",
                "tokenAddress": ADDRESSES.arbitrum.USDC_CIRCLE
            },
            {
                "poolAddress": "0x47235cB71107CC66B12aF6f8b8a9260ea38472c7",
                "tokenAddress": ADDRESSES.arbitrum.USDT
            }
        ]
    },
    "avax": {
        "tokens": [
            {
                "poolAddress": "0xe827352A0552fFC835c181ab5Bf1D7794038eC9f",
                "tokenAddress": ADDRESSES.avax.USDC
            },
            {
                "poolAddress": "0x2d2f460d7a1e7a4fcC4Ddab599451480728b5784",
                "tokenAddress": ADDRESSES.avax.USDt
            }
        ]
    },
    "optimism": {
        "tokens": [
            {
                "poolAddress": "0x3B96F88b2b9EB87964b852874D41B633e0f1f68F",
                "tokenAddress": ADDRESSES.optimism.USDC_CIRCLE
            },
            {
                "poolAddress": "0xb24A05d54fcAcfe1FC00c59209470d4cafB0deEA",
                "tokenAddress": ADDRESSES.optimism.USDT
            }
        ]
    },
    "celo": {
        "tokens": [
            {
                "poolAddress": "0xfb2C7c10e731EBe96Dabdf4A96D656Bfe8e2b5Af",
                "tokenAddress": ADDRESSES.celo.USDT_1
            }
        ]
    },
    "tron": {
        "tokens": [
            {
                "poolAddress": "TAC21biCBL9agjuUyzd4gZr356zRgJq61b",
                "tokenAddress": ADDRESSES.tron.USDT
            }
        ]
    },
    "solana": {
        "tokens": [
            {
                "poolAddress": "7DyZQw3iV5zhHssnNA6Nopi5zc8NGLbYjHMcaok6NN66",
                "tokenAddress": ADDRESSES.solana.USDC
            },
            {
                "poolAddress": "DW4a2Eq7X5MiPkzscGMJmgjsDaSWrWMkqPtRGLFyZwCX",
                "tokenAddress": ADDRESSES.solana.USDT
            }
        ],
        "bridgeAddress": "BrdgN2RPzEMWF96ZbnnJaUtQDQx7VRXYaHHbYCBvceWB"
    },
    "base": {
        "tokens": [
            {
                "poolAddress": "0xDA6bb1ec3BaBA68B26bEa0508d6f81c9ec5e96d5",
                "tokenAddress": ADDRESSES.base.USDC
            }
        ],
        "bridgeAddress": "0x001E3f136c2f804854581Da55Ad7660a2b35DEf7"
    },
    "sui": {
        "bridgeAddress": "0x83d6f864a6b0f16898376b486699aa6321eb6466d1daf6a2e3764a51908fe99d",
        "bridgeId": "0x1bb428a8bfca7eac7dd60eae9f5c434096249752f9d9cd3100ffa178305ea219",
        "tokens": [
            {
                "tokenAddress": ADDRESSES.sui.USDC_CIRCLE
            }
        ]
    }
}
