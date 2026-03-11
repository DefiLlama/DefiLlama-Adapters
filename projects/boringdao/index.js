const { sumTokensExport } = require("../helper/sumTokens")
const contracts = require("./contracts.json");
const sdk = require("@defillama/sdk");
const { staking } = require('../helper/staking')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


function chainTvl(chain) {
  const owners = Object.values(contracts[chain].contracts)
  const tokens = Object.values(contracts[chain].tokens)
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens }),
  }
}

module.exports = {
  timetravel: false,
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.boringdao })
  },
  litecoin: {
    tvl: async (_, block) => {
      return {
        litecoin: (await sdk.api.erc20.totalSupply({ target: '0x07C44B5Ac257C2255AA0933112c3b75A6BFf3Cb1', block })).output / 1e18
      }
    }
  },
  doge: {
    tvl: async (_, block) => {
      return {
        dogecoin: (await sdk.api.erc20.totalSupply({ target: '0x9c306A78b1a904e83115c05Ac67c1Ef07C653651', block })).output / 1e18
      }
    }
  }
};

Object.keys(contracts).forEach(chainTvl)

module.exports.ethereum.staking = staking('0x204c87CDA5DAAC87b2Fc562bFb5371a0B066229C', '0xbc19712feb3a26080ebf6f2f7849b417fdd792ca')