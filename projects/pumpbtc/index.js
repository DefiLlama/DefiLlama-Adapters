const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokensExport, sumTokens } = require('../helper/sumTokens');
const utils = require('../helper/utils');

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total value of WBTC, FBTC, BTCB held in the contract that were utilized in the minting process of pumpBTC.',
}
const config = {
  ethereum: { owners: ['0x1fCca65fb6Ae3b2758b9b2B394CB227eAE404e1E', '0x3d9bCcA8Bc7D438a4c5171435f41a0AF5d5E6083'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364', ADDRESSES.ethereum.WBTC], },
  bsc: { owners: ['0x2Ee808F769AB697C477E0aF8357315069b66bCBb'], tokens: [ADDRESSES.bsc.BTCB], },
  mantle: { owners: ['0xd6Ab15B2458B6EC3E94cE210174d860FdBdd6b96'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364'], },
  bitcoin: { owners: ['1Py9RuYSh1bF1T7PJ7LJZs5RjC5xEeSEbc'], tokens: [], },
}

Object.keys(config).forEach(async chain => {
    const { owners, tokens, } = config[chain]

  if (chain === 'bitcoin') {
    module.exports[chain] = {
      tvl: 
        sdk.util.sumChainTvls([
          async (api) => {
            const addresses = await getStakingAddresses()
            return sumTokens({...api, api, ...{owners: addresses}})
          }
        ])
    }
  } else {
    module.exports[chain] = {
      tvl: async (api) => api.sumTokens({ owners, tokens })
    }
  }
})

async function getStakingAddresses() {
  let res = await utils.fetchURL('https://dashboard.pumpbtc.xyz/api/dashboard/btc/realtime')

  const nativeBtcAddresses = res.data.data.details.btc.details.map(d => d.address)
  const babylonAddresses = res.data.data.details.babylon.details.map(d => d.address)
  return [...nativeBtcAddresses, ...babylonAddresses].slice(0, 100)
}
