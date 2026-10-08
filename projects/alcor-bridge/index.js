const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Alcor Bridge: lock/mint between EVM chains and Antelope (Telos is the hub, WAX a spoke),
// verified by light clients on both sides. Every asset bridged from a chain is locked in
// that chain's AlcorVault; the vaults are the bridge's TVL.
// Addresses: https://telos.alcor.exchange/api/bridge/docs/bot
const config = {
  ethereum: {
    vault: '0x3e447d533321ad6a8412f97034ac295a9ff8d858',
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
  },
  bsc: {
    vault: '0x53F18eaa8Bf8099b5bA21Bb7E11ed311b677690e',
    tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
  },
  polygon: {
    vault: '0x15bbd21148f98c4daeb30450eb05666f7859993d',
    tokens: [ADDRESSES.null, ADDRESSES.polygon.USDC_CIRCLE],
  },
}

module.exports = {
  methodology: 'Assets locked in the AlcorVault contract on each EVM chain (Ethereum, BNB Chain, Polygon): native ETH/BNB/POL, USDC and USDT backing the tokens minted on Telos and WAX.',
}

Object.entries(config).forEach(([chain, { vault, tokens }]) => {
  module.exports[chain] = { tvl: sumTokensExport({ owner: vault, tokens }) }
})
