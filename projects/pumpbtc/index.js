const { sumTokens } = require('../helper/sumTokens');
const utils = require('../helper/utils');
const { getConfig } = require('../helper/cache');
const bitcoinBook = require('../helper/bitcoin-book');

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
  const owners = await bitcoinBook.pumpBTC()
  return sumTokens({ api, owners })
}

async function otherTvl(api) {
  const addresses = await getConfig('pumpbtc/v2-other', undefined, { fetcher: getStakingAddresses })

  if (!addresses[api.chain]) {
    return;
  }

  const { owners, tokens } = addresses[api.chain]
  return api.sumTokens({ owners, tokens })
}

module.exports.isHeavyProtocol = true;

['bitcoin', 'ethereum', 'bsc', 'mantle', 'base', 'arbitrum', 'bob'].forEach(chain => {
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