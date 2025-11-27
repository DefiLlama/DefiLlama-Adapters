const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokensExport, sumTokens} = require('../helper/sumTokens')
const {sumTokens2} = require('../helper/unwrapLPs');

const config = {
    ethereum: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.ethereum.USDT,
            USDC: ADDRESSES.ethereum.USDC,
            DAI: ADDRESSES.ethereum.DAI,
            ETH: ADDRESSES.ethereum.WETH,
            BTC: ADDRESSES.ethereum.WBTC,
        }
    },
    bsc: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.bsc.USDT,
            USDC: ADDRESSES.bsc.USDC,
            DAI: ADDRESSES.bsc.DAI,
            ETH: ADDRESSES.bsc.ETH,
            BTC: ADDRESSES.bsc.BTCB,
        }
    },
    polygon: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.polygon.USDT,
            USDC: ADDRESSES.polygon.USDC,
            ETH: ADDRESSES.polygon.WETH_1,
            // MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
        }
    },
    arbitrum: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.arbitrum.USDT,
            USDC: ADDRESSES.arbitrum.USDC,
            ETH: ADDRESSES.arbitrum.WETH,
            BTC: ADDRESSES.arbitrum.WBTC,
            // DAI: ADDRESSES.arbitrum.DAI,
        }
    },
    base: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDC: ADDRESSES.base.USDC,
            ETH: ADDRESSES.base.WETH,
        }
    },
    optimism: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.optimism.USDT,
            USDC: ADDRESSES.optimism.USDC,
            ETH: ADDRESSES.optimism.WETH_1,
        }
    },
    linea: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.linea.USDT,
            // USDC: ADDRESSES.linea.USDC,
            ETH: ADDRESSES.linea.WETH,
        }
    },
    mantle: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.mantle.USDT,
            // USDC: ADDRESSES.linea.USDC,
            ETH: ADDRESSES.mantle.WETH,
        }
    },
    xlayer: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.astarzk.USDT,
            USDC: ADDRESSES.xlayer.USDC,
            ETH: ADDRESSES.xlayer.WETH,
            BTC: ADDRESSES.astarzk.WBTC,
            OKB: ADDRESSES.xlayer.WOKB,
        }
    },

    klaytn: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            // USDT: ADDRESSES.klaytn.USDT,
            USDT: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
            USDC: ADDRESSES.klaytn.USDC,
            ETH: ADDRESSES.klaytn.WETH,
        }
    },
    blast: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            // USDT: ADDRESSES.blast.USDT,
            // USDC: ADDRESSES.blast.USDC,
            ETH: ADDRESSES.blast.WETH,
            // DAI: ADDRESSES.blast.DAI,
        }
    },
    map: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
            USDC: ADDRESSES.map.USDC,
            ETH: ADDRESSES.map.ETH,
            MAP: ADDRESSES.map.WMAPO,
            BTC: '0xb877e3562a660c7861117c2f1361a26abaf19beb',
            TRX: '0x593a37fe0f6dfd0b6c5a051e9a44aa0f6922a1a2',
        }
    },
    merlin: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            WBTC: ADDRESSES.merlin.WBTC,
            WBTC_1: ADDRESSES.merlin.WBTC_1,
            SolvBTC: "0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71",
            iUSD: ADDRESSES.bsc.iUSD
        }
    },
    scroll: {
        mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
        tokens: {
            USDT: ADDRESSES.scroll.USDT,
            USDC: ADDRESSES.scroll.USDC,
            WBTC: ADDRESSES.scroll.WBTC,
            WETH: ADDRESSES.scroll.WETH,
        }
    },

    tron: {
        mosContract: "TXsDYB9ovFEFg4cja6gn1t1tpmrnSbYhHA",
        tokens: {
            TRX: ADDRESSES.tron.null,
            USDC: ADDRESSES.tron.USDC,
            USDT: ADDRESSES.tron.USDT,
        }
    },

    // solana: {
    //   mosContract: "AGwu8gfXJshkB9UMM3eexeq26m7zf8wM1FgNdBt5wkqN",
    //   tokens: {
    //     SOL: ADDRESSES.solana.SOL,
    //     USDC: ADDRESSES.solana.USDC,
    //     USDT: ADDRESSES.solana.USDT,
    //   }
    // },

    // near: {
    //   mosContract: "mosv21.mfac.butternetwork.near",
    //   tokens: {
    //     USDT: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
    //     USDC: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
    //     DAI: "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
    //     ETH: "aurora",
    //     // MAP: "mapo.mfac.butternetwork.near"
    //   }
    // },

}
module.exports = {
    methodology: 'get the amount of token deposited in MOS contract on each supported chain.',
};

Object.keys(config).forEach(chain => {
    const {mosContract, tokens} = config[chain]
    module.exports[chain] = {
        tvl: sumTokensExport({owners:[mosContract], tokens: Object.values(tokens), logCalls: true})
    }
})
