const { sumTokensExport } = require('../helper/sumTokens')

const ETHEREUM_STAKING_CONTRACT = '0x0e9bD42dE657fF590d214CcC8d4f94B77D2BD908';
const ETH = '0x0000000000000000000000000000000000000000';
const PTB = '0x30a25CC9c9EADe4D4d9e9349BE6e68c3411367D3';    
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';      

const cfg = {
  ethereum: {
      owners: [ETHEREUM_STAKING_CONTRACT],
      tokens: [ETH, USDC],
  },
}

module.exports = {
  methodology:
    'TVL = Portal staking contract balances. No AMM liquidity included because Portal uses atomic swaps.',

     ...Object.fromEntries(
    Object.entries(cfg).map(([chain, { owners, tokens }]) => [
      chain,
      {
        tvl: sumTokensExport({ owners, tokens }),
      },
    ])
  )

}