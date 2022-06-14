const { get } = require("../helper/http");
const { getBlock } = require("../helper/getBlock");
const { chainExports } = require("../helper/exports");
const sdk = require("@defillama/sdk");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { sumTokens } = require("../helper/unwrapLPs");

// Includes some chains that are not yet live
const chainNameToChainId = {
  ethereum: 1,
  bsc: 56,
  boba: 288,
  polygon: 137,
  xdai: 100,
  fantom: 250,
  arbitrum: 42161,
  avax: 43114,
  optimism: 10,
  fuse: 122,
  moonbeam: 1284,
  moonriver: 1285,
  milkomeda: 2001,
  celo: 42220,
  aurora: 1313161554,
  harmony: 1666600000,
  cronos: 25,
  evmos: 9001,
  heco: 128,
};

let getContractsPromise

// Taken from @connext/nxtp-contracts
async function getContracts() {
  if (!getContractsPromise)
    getContractsPromise = get('https://raw.githubusercontent.com/connext/nxtp/v0.1.36/packages/contracts/deployments.json')
  return getContractsPromise
}

async function getDeployedContractAddress(chainId) {
  const contracts = await getContracts()
  const record = contracts[String(chainId)] || {}
  const name = Object.keys(record)[0];
  if (!name) {
    return undefined;
  }
  const contract = record[name]?.contracts?.TransactionManager;
  return contract ? contract.address : undefined;
}

let getAssetsPromise
// Taken from @connext/nxtp-utils
async function getAssetIds(chainId) {
  const url = "https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json"
  if (!getAssetsPromise)
    getAssetsPromise = get(url)
  const data = await getAssetsPromise
  const chainData = data.find(item => item.chainId === chainId)
  return Object.keys(chainData.assetId).map(id => id.toLowerCase())
}

const nullAddress = '0x0000000000000000000000000000000000000000'

function chainTvl(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const chainId = chainNameToChainId[chain]
    const contractAddress = await getDeployedContractAddress(chainId);
    if (!contractAddress)
      return {}
    const block = await getBlock(time, chain, chainBlocks, true);
    const chainTransform = await getChainTransform(chain);
    const fixBalances = await getFixBalances(chain);
    const balances = {};

    let assetIds = await getAssetIds(chainId)
    if (assetIds.includes(nullAddress)) {
      const balance = await sdk.api.eth.getBalance({ chain, block, target: contractAddress, })
      sdk.util.sumSingleBalance(balances, chainTransform(nullAddress), balance.output)
    }
    const tokensAndOwners = assetIds
      .filter(id => id !== nullAddress)
      .map(id => [id, contractAddress])
    await sumTokens(balances, tokensAndOwners, block, chain, chainTransform)
    fixBalances(balances)
    return balances
  };
}

const chains = [
  "ethereum",
  "bsc",
  "polygon",
  "moonriver",
  "fantom",
  "xdai",
  "avax",
  "optimism",
  "arbitrum",
  "moonbeam",
  "fuse",
  "cronos",
  "milkomeda",
  "boba",
  "evmos",
  "harmony",
  /*
  "okexchain",
  "metis",
  "heco",
  "aurora",
  */
];
module.exports = chainExports(chainTvl, Array.from(chains));
