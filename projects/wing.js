
const { get } = require('./helper/http');
const { compoundExports2 } = require('./helper/compound');
const { mergeExports } = require('./helper/utils');
const { sumTokensExport } = require('./helper/unwrapLPs');
const ADDRESSES = require('./helper/coreAssets.json')

const config = {
  ontology: {
    url: 'https://flashapi.wing.finance/api/v1/flashpooldetail',
  },
}

const apiExports = {
  misrepresentedTokens: true,
};

const data = {}

async function getData(chain) {
  const { url } = config[chain]
  if (!data[chain]) data[chain] = get(url)
  return data[chain]
}

Object.keys(config).forEach(chain => {
  apiExports[chain] = {
    tvl: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      if (!result.totalSupply) result.totalSupply = result.TotalSupply
      
      return {
        tether: result.totalSupply - result.totalBorrow
      }
    },
    staking: async () => {
      const { result } = await getData(chain)
      if (!result.totalLockedWingDollar) result.totalLockedWingDollar = result.TotalLockedWingDollar
      if (result.totalLockedWingDollar == undefined) result.totalLockedWingDollar = 0
      if (result.totalInsurance != undefined && !result.totalInsurance) result.totalLockedWingDollar += result.totalInsurance
      return {
        tether: result.totalLockedWingDollar
      }
    },
    borrowed: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      return {
        tether: result.totalBorrow
      }
    },
  }
})


module.exports = mergeExports([
  {  // flash pool
    ethereum: compoundExports2({ comptroller: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' }),
    okexchain: compoundExports2({ comptroller: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' }),
    bsc: compoundExports2({ comptroller: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' }),
    ontology_evm: compoundExports2({ comptroller: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' }),
  }, {  // p2p pool
    ethereum: {
      tvl: sumTokensExport({
        owner: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
        tokens: [
          ADDRESSES.ethereum.DAI,
          ADDRESSES.ethereum.WETH,
          '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ADDRESSES.ethereum.USDT,
          '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
        ]

      })
    },
  }, {  // nft pool
    ethereum: {
      tvl: sumTokensExport({
        owner: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
        tokens: [
          ADDRESSES.ethereum.WETH,
        ]

      })
    },
  },
  apiExports,
])
