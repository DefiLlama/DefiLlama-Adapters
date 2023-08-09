/* *** Common config *** */

const { sliceIntoChunks } = require("@defillama/sdk/build/util");

const DHEDGE_FACTORY_PROXIES = {
  ethereum: "0x03D20ef9bdc19736F5e8Baf92D02C8661a5941F7",
  polygon: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
  optimism: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
};

/* *** dHEDGE V1 *** */

const DHEDGE_V1_VAULTS_QUANTITY_ABI =
  "function deployedFundsLength() view returns (uint256)";
const DHEDGE_V1_VAULTS_ABI =
  "function deployedFunds(uint256) view returns (address)";
const DHEDGE_V1_TVL_ABI = "function totalFundValue() view returns (uint256)";

const getV1TotalValueLocked = async (_, __, ___, { api, chain }) => {
  const target = DHEDGE_FACTORY_PROXIES[chain];
  const vaults = await api.fetchList({ lengthAbi: DHEDGE_V1_VAULTS_QUANTITY_ABI, itemAbi: DHEDGE_V1_VAULTS_ABI, target, });
  const vaultsValues = await api.multiCall({ abi: DHEDGE_V1_TVL_ABI, calls: vaults, permitFailure: true, });
  const totalValueLocked = vaultsValues.reduce((acc, value) => acc + +(value ?? 0), 0);
  return {
    tether: totalValueLocked / 1e18,
  };
};

/* *** dHEDGE V2 *** */

const DHEDGE_V2_VAULTS_ABI =
  "function getDeployedFunds() view returns (address[])";
const DHEDGE_V2_VAULT_SUMMARY_ABI =
  "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))";

const tvl = async (_, __, ___, { api, chain }) => {
  const target = DHEDGE_FACTORY_PROXIES[chain];
  const vaults = await api.call({ abi: DHEDGE_V2_VAULTS_ABI, target, })
  let chunkSize = chain === 'optimism' ? 42 : 51 // Optimism has a lower gas limit
  const vaultChunks = sliceIntoChunks(vaults, chunkSize);
  const summaries = [];
  for (const chunk of vaultChunks) {
    summaries.push(...await api.multiCall({ abi: DHEDGE_V2_VAULT_SUMMARY_ABI, calls: chunk, permitFailure: true,  }))
  }
  const totalValueLocked = summaries.reduce((acc, vault) => acc + +(vault?.totalFundValue ?? 0), 0);
  return {
    tether: totalValueLocked / 1e18,
  };
};

/* *** DHT Staking V1 *** */

const DHT_STAKING_V1_PROXY = "0xEe1B6b93733eE8BA77f558F8a87480349bD81F7f";
const DHT_ON_MAINNET = "0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84";

const getV1StakingTotalAmount = async (_, __, ___, { api }) => ({
  [DHT_ON_MAINNET]: await api.call({
    abi: "erc20:balanceOf",
    target: DHT_ON_MAINNET,
    params: [DHT_STAKING_V1_PROXY],
  }),
});

/* *** DHT Staking V2 *** */

const DHT_STAKED_ABI = "function dhtStaked() view returns (uint256)";
const DHT_STAKING_V2_PROXY = "0xf165ca3d75120d817b7428eef8c39ea5cb33b612";
const DHT_ON_OPTIMISM = "optimism:0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151";

const getV2StakingTotalAmount = async (_, __, ___, { api }) => ({
  [DHT_ON_OPTIMISM]: await api.call({
    abi: DHT_STAKED_ABI,
    target: DHT_STAKING_V2_PROXY,
  }),
});

/* *** Exports *** */

module.exports = {
  ethereum: {
    tvl: getV1TotalValueLocked,
    staking: getV1StakingTotalAmount,
  },
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
    staking: getV2StakingTotalAmount,
  },
  misrepresentedTokens: true,
  methodology: "Aggregates total value of each dHEDGE vault ever created",
  hallmarks: [
    [1627693200, "dHEDGE V2 Launch"],
    [1639616400, "Optimism Launch"],
    [1674003600, "Optimism Incentives Start"],
    [1679965200, "DHT Staking V2 Release"],
  ],
};
