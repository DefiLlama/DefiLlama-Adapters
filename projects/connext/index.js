const { chainExports } = require("../helper/exports");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache')

// Taken from @connext/nxtp-contracts
async function getContracts() {
  return getConfig('connect/contracts', 'https://raw.githubusercontent.com/connext/monorepo/main/packages/deployments/contracts/deployments.json')
}

async function getDeployedContractAddress(chainId) {
  const allContracts = await getContracts()
  const record = allContracts[chainId + ''] ?? []
  const contracts =  (record ?? [])[0]?.contracts ?? {}
  return [
    contracts.Connext?.address,
    contracts.Connext_DiamondProxy?.address,
  ].filter(i => i)
}

let getAssetsPromise
// Taken from @connext/nxtp-utils
async function getAssetIds(chainId) {
  const url = "https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json"
  if (!getAssetsPromise)
    getAssetsPromise = getConfig('connect/assets/'+chainId, url)
  const data = await getAssetsPromise
  const chainData = data.find(item => item.chainId === chainId) || {}
  return Object.entries(chainData.assetId || {}).filter(i => i[0].length && !i[1].symbol.startsWith('next')).map(i => i[0])
}


function chainTvl(chain) {
  return async (api) => {

    const chainId = api.chainId
    const owners = await getDeployedContractAddress(chainId)
    if (!owners.length)
      return {}
    const tokens = await getAssetIds(chainId)
    return sumTokens2({ owners, tokens, api, })
  };
}

const chains = [
  "ethereum",
  "bsc",
  "polygon",
  "xdai",
  "optimism",
  "arbitrum",
  "mode",

  // deprecated?
  "moonriver",
  "fantom",
  "avax",
  "moonbeam",
  "fuse",
  "cronos",
  "milkomeda",
  "boba",
  "evmos",
  "harmony",
  // "okexchain",
  // "metis",
  // "heco",
  // "aurora",
];
module.exports = chainExports(chainTvl, Array.from(chains));
