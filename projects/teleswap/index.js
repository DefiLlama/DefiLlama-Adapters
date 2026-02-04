const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens.js');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport: sumBRC20TokensExport } = require('../helper/chain/brc20.js');

const TST = "0x0828096494ad6252F0F853abFC5b6ec9dfe9fDAd";
const TST_DELEGATION = "0x93AD6C8B3a273E0B4aeeBd6CF03422C885217D3B";


module.exports = {
  methodology: 'TVL is the sum of all BTC locked by users, collateral locked by Lockers, and TST delegated to Lockers.',
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.teleswap }),
      sumBRC20TokensExport({ owners: bitcoinAddressBook.teleswap }),
    ])
  },
  ethereum: { staking: sumTokensExport({ owners: [TST_DELEGATION], tokens: [TST] }) },
}

const config = {
  polygon: { owners: ['0xf5D6D369A7F4147F720AEAdd4C4f903aE8046166'], tokens: [ADDRESSES.null] },
  bsc: { owners: ['0x84F74e97ebab432CeE185d601290cE0A483987A5'], tokens: [ADDRESSES.null] },
  bsquared: { owners: ['0x20752a82fe75996a582Ae2be1b7C3D4866C5b733'], tokens: [ADDRESSES.bsquared.WBTC] },
  bob: { owners: ['0xd720996f0D8fFD9154c8271D2991f54E5d93D2A9'], tokens: [ADDRESSES.bob.WBTC] },
}

Object.keys(config).forEach(chain => {
  const { owners, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens })
  }
})