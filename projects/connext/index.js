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
      // console.log("Returning early, no contract for chain");
      return balances;
    }
    const chainData = await getChainData();
    const _chain = chainData.get(chainNameToChainId[chain].toString());
    await Promise.all(
      Object.keys(_chain.assetId).map(async (assetId) => {
        try {
          if (assetId === "0x0000000000000000000000000000000000000000") {
            return;
            // TODO: figure out how to handle native assets
          }
          const balance = await sdk.api.erc20.balanceOf({
            chain,
            block,
            target: assetId,
            owner: contractAddress,
          });
          // console.log(`Balance of contract ${contractAddress} for asset ${assetId} on chain ${chain}, ${balance.toString()}`);
          sdk.util.sumSingleBalance(balances, assetId, balance.output);
        } catch (e) {
          // console.log(`Error on chain ${chain}, asset ${assetId}`);
        }
      })
    );
    return balances;
  };
}

const chains = [
  "ethereum",
  "bsc",
  "polygon",
  "heco",
  "fantom",
  "xdai",
  "avax",
  "harmony",
  "okexchain",
  "optimism",
  "arbitrum",
  "fuse",
  "aurora",
  "boba",
  "cronos",
  "metis",
];

module.exports = chainExports(chainTvl, Array.from(chains));
