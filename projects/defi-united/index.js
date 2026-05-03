const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const DEFI_UNITED_WALLET = '0x0fCa5194baA59a362a835031d9C4A25970effE68'

module.exports = {
  methodology: 'Counts the total ETH, USDC, USDT, and DAI contributions held in the DeFi United relief fund address (defiunited.eth), a coordinated recovery effort to restore rsETH backing after the April 2026 KelpDAO exploit.',
  start: 24934540,
  ethereum: {
    tvl: sumTokensExport({
      owner: DEFI_UNITED_WALLET,
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
      ],
    }),
  },
}
