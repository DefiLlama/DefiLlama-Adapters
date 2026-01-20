const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const ETHEREUM_STAKING_CONTRACT = '0x0e9bD42dE657fF590d214CcC8d4f94B77D2BD908';
const ETH = ADDRESSES.null;
const PTB = '0x30a25CC9c9EADe4D4d9e9349BE6e68c3411367D3';    
const USDC = ADDRESSES.ethereum.USDC;      

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