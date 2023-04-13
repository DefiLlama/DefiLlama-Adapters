
const { default: BigNumber } = require('bignumber.js');
const { get } = require('./helper/http')

const nft_url = "https://nftapi.wing.finance/backend/nft-pool/pool-overview"

const config = {
  ontology: {
    url: 'https://flashapi.wing.finance/api/v1/flashpooldetail',
  },
  ethereum: {
    url: 'https://ethapi.wing.finance/eth/flash-pool/detail',
  },
  okexchain: {
    url: 'https://ethapi.wing.finance/okexchain/flash-pool/detail',
  },
  bsc: {
    url: "https://ethapi.wing.finance/bsc/flash-pool/detail",
  },
  ontology_evm: {
    url: "https://ethapi.wing.finance/ontevm/flash-pool/detail",
  },
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
};

const data = {}

async function getData(chain) {
  const { url } = config[chain]
  if (!data[chain]) data[chain] = get(url)
  return data[chain]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      if (!result.totalSupply) result.totalSupply = result.TotalSupply
      if (chain == "ethereum") {
        const result_nft  = await get(nft_url)
        console.log("result_nft:", result_nft);
        if (result_nft.nftCollateralTVL !=undefined && !result_nft.nftCollateralTVL) result.totalSupply += result_nft.nftCollateralTVL
      }
      return {
        tether: BigNumber(result.totalSupply - result.totalBorrow).toFixed(0)
      }
    },
    staking: async () => {
      const { result } = await getData(chain)
      if (!result.totalLockedWingDollar) result.totalLockedWingDollar = result.TotalLockedWingDollar
      if (result.totalLockedWingDollar == undefined) result.totalLockedWingDollar = BigNumber(0)
      if (result.totalInsurance != undefined && !result.totalInsurance) result.totalLockedWingDollar += result.totalInsurance
      return {
        tether: BigNumber(result.totalLockedWingDollar).toFixed(0)
      }
    },
    borrowed: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      return {
        tether:new BigNumber(result.totalBorrow).toFixed(0)
      }
    },
  }
})
