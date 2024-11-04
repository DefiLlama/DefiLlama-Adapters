const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/sumTokens');
const utils = require('../helper/utils');
const { getConfig } = require('../helper/cache')

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total value of WBTC, FBTC, BTCB held in the contract that were utilized in the minting process of pumpBTC.',
}

async function getStakingAddresses() {
  let res = await utils.fetchURL('https://dashboard.pumpbtc.xyz/api/dashboard/asset/tokenowners')

  const btcAddresses = res.data.data || {}
  //console.log('>>', btcAddresses.length) 
  return btcAddresses
}

async function bitcoinTvl(api) {
  const addresses = await getConfig('pumpbtc-new', undefined, { fetcher: getStakingAddresses })

  if (!addresses.bitcoin?.owners) {
    return;
  }

  const btcAddresses = addresses.bitcoin.owners
  return sumTokens({ api, owners: btcAddresses })
}

async function otherTvl(api) {
  const addresses = await getConfig('pumpbtc-new', undefined, { fetcher: getStakingAddresses })

  if (!addresses[api.chain]) {
    return;
  }

  const chainData = addresses[api.chain]
  const owners = chainData['owners']
  const tokens = chainData['tokens']
  return api.sumTokens({ owners, tokens })
}

module.exports.isHeavyProtocol = true;

['bitcoin', 'ethereum', 'bsc', 'mantle',  'base'].forEach(chain => {
  if (chain == 'bitcoin') {
    module.exports[chain] = {
      tvl: bitcoinTvl,
    }
  } else {
    module.exports[chain] = {
      tvl: otherTvl
    }
  }
})
