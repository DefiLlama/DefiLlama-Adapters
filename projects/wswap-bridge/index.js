const {sumTokens2} = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    ethereum: {
        collateralLocker: "0xc74478e6B3285312bfDeF91Aea14D07a7aec8855",
        tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT]
    },
    bsc: {
        collateralLocker: "0xBCeD2AF67a3BE7cEd7870FFC386A9759E7481D50",
        tokens: [
            ADDRESSES.bsc.USDC, 
            ADDRESSES.bsc.USDT, 
            "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe", // Binance-Peg XRP
            "0xba2ae424d960c26247dd6c32edc70b295c744c43", // Binance-Peg DOGE
            "0x570a5d26f7765ecb712c0924e4de545b89fd43df", // Binance-Peg SOL
        ]
    }
}

async function tvl(api) {
    const {collateralLocker, tokens} = config[api.chain]
    await sumTokens2({api, owner: collateralLocker, tokens})
}

module.exports = {
  methodology:
    "Bridge TVL counts collateral locked on source chain bridge contracts (BSC and Ethereum).",
  misrepresentedTokens: true,
  bsc: { tvl },
  ethereum: { tvl },
};