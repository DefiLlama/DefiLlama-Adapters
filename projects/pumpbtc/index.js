const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/sumTokens');
const utils = require('../helper/utils');
const { getConfig } = require('../helper/cache')

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total value of WBTC, FBTC, BTCB held in the contract that were utilized in the minting process of pumpBTC.',
}
const config = {
  ethereum: { owners: ['0x1fCca65fb6Ae3b2758b9b2B394CB227eAE404e1E', '0x3d9bCcA8Bc7D438a4c5171435f41a0AF5d5E6083'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364', ADDRESSES.ethereum.WBTC], },
  bsc: { owners: ['0x2Ee808F769AB697C477E0aF8357315069b66bCBb'], tokens: [ADDRESSES.bsc.BTCB], },
  mantle: { owners: ['0xd6Ab15B2458B6EC3E94cE210174d860FdBdd6b96'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364'], },
  bitcoin: {},
}

Object.keys(config).forEach(chain => {
  const { owners, tokens, } = config[chain]

  if (chain === 'bitcoin') {
    module.exports[chain] = {
      tvl:
        async (api) => {
          const addresses = await getConfig('pumpbtc', undefined, { fetcher: getStakingAddresses })
          return sumTokens({ api, owners: addresses })
        }
    }
  } else {
    module.exports[chain] = {
      tvl: async (api) => api.sumTokens({ owners, tokens })
    }
  }
})

async function getStakingAddresses() {
  let res = await utils.fetchURL('https://dashboard.pumpbtc.xyz/api/dashboard/btc/addresses')

  const btcAddresses = res.data.data || []
  //console.log('>>', btcAddresses.length) 
  return btcAddresses
}

module.exports.isHeavyProtocol = true
