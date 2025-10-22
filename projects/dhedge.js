/* *** Common config *** */

const { sliceIntoChunks } = require("@defillama/sdk/build/util");
const { CONFIG_DATA } = require("./toros/config");

const DHEDGE_FACTORY_PROXIES = {
  ethereum: "0x96d33bcf84dde326014248e2896f79bbb9c13d6d",
  polygon: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
  optimism: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
  arbitrum: "0xffFb5fB14606EB3a548C113026355020dDF27535",
  base: "0x49Afe3abCf66CF09Fab86cb1139D8811C8afe56F",
};

/* *** dHEDGE V1 *** */

const DHEDGE_V1_VAULTS_QUANTITY_ABI =
  "function deployedFundsLength() view returns (uint256)";
const DHEDGE_V1_VAULTS_ABI =
  "function deployedFunds(uint256) view returns (address)";
const DHEDGE_V1_TVL_ABI = "function totalFundValue() view returns (uint256)";

const getV1TotalValueLocked = async (api) => {
  const { chain } = api
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
const DHEDGE_V2_FACTORY_ABI =
  "function getManagedPools(address manager) view returns (address[] managedPools)";

const tvl = async (api) => {
  const { chain } = api
  const target = DHEDGE_FACTORY_PROXIES[chain];
  const allVaults = await api.call({ abi: DHEDGE_V2_VAULTS_ABI, target, })
  const torosVaults = await getTorosVaultsAddresses(api);
  const dhedgeVaults = allVaults.filter(v => !torosVaults.includes(v));

  let chunkSize = chain === 'optimism' ? 42 : 51 // Optimism has a lower gas limit
  const vaultChunks = sliceIntoChunks(dhedgeVaults, chunkSize);
  const summaries = [];
  for (const chunk of vaultChunks) {
    summaries.push(...await api.multiCall({ abi: DHEDGE_V2_VAULT_SUMMARY_ABI, calls: chunk, permitFailure: true,  }))
  }
  const totalValueLocked = summaries.reduce((acc, vault) => acc + +(vault?.totalFundValue ?? 0), 0);
  return {
    tether: totalValueLocked / 1e18,
  };
};

const getTorosVaultsAddresses = async (api) =>{
  const { chain } = api
  const { dhedgeFactory, torosMultisigManager } = CONFIG_DATA[chain];
  return await api.call({
    abi: DHEDGE_V2_FACTORY_ABI,
    target: dhedgeFactory,
    params: [torosMultisigManager],
  });
}

/* *** DHT Staking V1 *** */

const DHT_STAKING_V1_PROXY = "0xEe1B6b93733eE8BA77f558F8a87480349bD81F7f";
const DHT_ON_MAINNET = "0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84";

const getV1StakingTotalAmount = async (api) => ({
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

const getV2StakingTotalAmount = async (api) => ({
  [DHT_ON_OPTIMISM]: await api.call({
    abi: DHT_STAKED_ABI,
    target: DHT_STAKING_V2_PROXY,
  }),
});

/* *** Exports *** */

module.exports = {
  ethereum: {
    tvl,
    staking: getV1StakingTotalAmount,
  },
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
    staking: getV2StakingTotalAmount,
  },
  arbitrum: {
    tvl,
  },
  base: {
    tvl,
  },
  misrepresentedTokens: true,
  methodology: "Aggregates total value of each dHEDGE vault ever created",
  hallmarks: [
    [1627693200, "dHEDGE V2 Launch"],
    [1639616400, "Optimism Launch"],
    [1674003600, "Optimism Incentives Start"],
    [1679965200, "DHT Staking V2 Release"],
    [1701468842, "Arbitrum Launch"],
    [1706569200, "Base Launch"],
  ],
};
