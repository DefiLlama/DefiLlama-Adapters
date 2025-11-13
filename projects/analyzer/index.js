const { sumTokensExport } = require('../helper/unwrapLPs')

const contracts = {
  linea: '0xa4D4ab44e4946ecD3849530eFa0161adf33bba1F',
  arbitrum: '0xdA801fd8dA4A22AAEa61195b9E91fA239B15Cc4f',
  ethereum: '0x743dEdBBd87E467FCD7f793a9181Ee0F4B942CdE',
  base: '0xa9CF64F158D7D9445555c73D89FfA700397c7d64',
  bsc: '0xAd1f5252AD29da8eE60956B5B534ab8d22f7B655'
}

const NATIVE = '0x0000000000000000000000000000000000000000'

module.exports = {
  methodology: 'TVL counts the native tokens (ETH on L2s/Ethereum and BNB on BSC) currently held in the Subscription contracts.',
  linea: {
    tvl: sumTokensExport({ owner: contracts.linea, tokens: [NATIVE] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: contracts.arbitrum, tokens: [NATIVE] })
  },
  ethereum: {
    tvl: sumTokensExport({ owner: contracts.ethereum, tokens: [NATIVE] })
  },
  base: {
    tvl: sumTokensExport({ owner: contracts.base, tokens: [NATIVE] })
  },
  bsc: {
    tvl: sumTokensExport({ owner: contracts.bsc, tokens: [NATIVE] })
  }
}
