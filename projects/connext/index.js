const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache')

// Taken from @connext/nxtp-contracts
async function getContracts() {
  return getConfig('connect/contracts', 'https://raw.githubusercontent.com/connext/monorepo/main/packages/deployments/contracts/deployments.json')
}

async function getDeployedContractAddress(chainId) {
  const allContracts = await getContracts()
  const record = allContracts[chainId + ''] ?? []
  const contracts = (record ?? [])[0]?.contracts ?? {}

  const result = [
    contracts.Connext?.address,
    contracts.Connext_DiamondProxy?.address,
  ].filter(i => i);

  return result;
}

// ezETH xERC20 lockbox on L1, counted only while Connext can still mint/burn xezETH. Its limits were set to 0 on
// 2025-01-13, since then the lockbox is bridged over Hyperlane (projects/hyperlane). bridges() is a mapping getter, so the
// call only fails at blocks before xezETH was deployed, when the lockbox did not exist either.
const EZETH_LOCKBOX = "0xC8140dA31E6bCa19b287cC35531c2212763C2059"
const XEZETH = "0x2416092f143378750bb29b79eD961ab195CcEea5"
const CONNEXT_DIAMOND = "0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6"
const bridgesAbi = 'function bridges(address) view returns ((uint256 timestamp, uint256 ratePerSecond, uint256 maxLimit, uint256 currentLimit) minterParams, (uint256 timestamp, uint256 ratePerSecond, uint256 maxLimit, uint256 currentLimit) burnerParams)'

let getAssetsPromise
// Taken from @connext/nxtp-utils
async function getAssetIds(chainId) {
  const url = "https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json"
  if (!getAssetsPromise)
    getAssetsPromise = getConfig('connect/assets/' + chainId, url)
  const data = await getAssetsPromise
  const chainData = data.find(item => item.chainId === chainId) || {}
  const result = Object.entries(chainData.assetId || {}).filter(i => i[0].length && !i[1].symbol.startsWith('next')).map(i => i[0])
  // crossChain.json returns the xERC20 representation of ezETH instead of canonical addresses on L1. Manually add these below until a better JSON is available.
  if (chainId === 1) {
    result.push(ADDRESSES.linea.rzETH); // ezETH
  }
  return result;
}


async function tvl(api) {
  const chainId = api.chainId
  const owners = await getDeployedContractAddress(chainId)
  if (chainId === 1) {
    const limits = await api.call({ target: XEZETH, abi: bridgesAbi, params: [CONNEXT_DIAMOND], permitFailure: true })
    if (limits && (+limits.minterParams.maxLimit > 0 || +limits.burnerParams.maxLimit > 0)) owners.push(EZETH_LOCKBOX)
  }
  if (!owners.length)
    return {}
  const tokens = await getAssetIds(chainId)
  return sumTokens2({ owners, tokens, api, })
}

const chains = [
  "ethereum",
  "bsc",
  "polygon",
  "xdai",
  "optimism",
  "arbitrum",
  "mode",
  "metis",
  "base",
  "linea",

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

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})