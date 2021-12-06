const { getBlock } = require("../helper/getBlock");
const { chainExports } = require("../helper/exports");
const sdk = require("@defillama/sdk");
const { getChainData } = require("@connext/nxtp-utils");
const { getChainTransform } = require("../helper/portedTokens");
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
  const record = contractDeployments[String(chainId)]
    ? contractDeployments[String(chainId)]
    : {};
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
        let balance;
        if (assetId === "0x0000000000000000000000000000000000000000") {
          balance = await sdk.api.eth.getBalance({
            chain,
            block,
            target: contractAddress,
          });
        } else {
          balance = await sdk.api.erc20.balanceOf({
            chain,
            block,
            target: assetId,
            owner: contractAddress,
          });
        }
        const chainTransform = await getChainTransform(chain);
        let transformedAssetId;
        if (chain == "arbitrum") {
          transformedAssetId =
            assetId == "0x0000000000000000000000000000000000000000"
              ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
              : `arbitrum:${assetId}`;
        } else if (chain == "polygon") {
          transformedAssetId =
            assetId == "0x0000000000000000000000000000000000000000"
              ? "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
              : `polygon:${assetId}`;
        } else {
          transformedAssetId = await chainTransform(assetId);
        }

        sdk.util.sumSingleBalance(balances, transformedAssetId, balance.output);
      })
    );
    return balances;
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
  /*
  "okexchain",
  "metis",
  "harmony",
  "fuse",
  "cronos",
  "heco",
  "aurora",
  "boba",
  */
];

module.exports = chainExports(chainTvl, Array.from(chains));