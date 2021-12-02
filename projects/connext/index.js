const { getBlock } = require("../helper/getBlock");
const { chainExports } = require("../helper/exports");
const sdk = require("@defillama/sdk");
const { getChainData } = require("@connext/nxtp-utils");
const contractDeployments = require("@connext/nxtp-contracts/deployments.json");

// Includes some chains that are not yet live
const chainNameToChainId = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  xdai: 100,
  fantom: 250,
  arbitrum: 42161,
  avax: 43114,
  optimism: 10,
  fuse: 122,
  moonbeam: 1284,
  moonriver: 1285,
  celo: 42220,
  aurora: 1313161554,
  harmony: 1666600000,
};

async function getDeployedContractAddress(chainId) {
  const record = contractDeployments[String(chainId)] ?? {};
  const name = Object.keys(record)[0];
  if (!name) {
    return undefined;
  }
  const contract = record[name]?.contracts?.TransactionManager;
  return contract ? contract.address : undefined;
}

function chainTvl(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = await getBlock(time, chain, chainBlocks, true);
    const balances = {};
    const contractAddress = await getDeployedContractAddress(
      chainNameToChainId[chain]
    );
    if (!contractAddress) {
      return balances;
    }
    const chainData = await getChainData();
    const _chain = chainData.get(chainNameToChainId[chain].toString());
    await Promise.all(
      Object.keys(_chain.assetId).map(async (assetId) => {
        const balance = await sdk.api.erc20.balanceOf({
          chain,
          block,
          target: assetId,
          owner: contractAddress,
        });
        sdk.util.sumSingleBalance(balances, assetId, balance.output);
      })
    );
    return balances;
  };
}

const chains = tokens.reduce((allChains, token) => {
  Object.keys(token).forEach((chain) => allChains.add(chain));
  return allChains;
}, new Set());

module.exports = chainExports(chainTvl, Array.from(chains));
