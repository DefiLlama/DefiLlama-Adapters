const { getCuratorExport } = require("../helper/curators");
const sdk = require('@defillama/sdk');
const { mergeExports } = require("../helper/utils");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by MaxShot.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ]
    },
    base: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ],
    },
  }
}

// Vault addresses
const VAULTS = {
  USDC: '0xCe0F05f19845CdE36058CcFb53C755Ab8739b880',
  USDT: '0xd507d9D4F356B84e3EEEc33eeDef85BB57f59CfB',
}

// ABI for epoch functions
const epochAbi = {
  currentEpoch: "function currentEpoch() external view returns (tuple(tuple(uint256 epochId, uint256 snapshotTimestamp, uint256 startTimestamp, uint256 endTimestamp, uint256 totalAssets, uint256 totalShares, uint256 totalFeeShares, uint8 status, tuple(uint256 chainId, uint256 blockNumber, int256 totalShares, int256 totalAssets)[] vaultData) epoch, uint256 feeChainId, bytes[] signatures))",
  latestEpoch: "function latestEpoch() external view returns (tuple(tuple(uint256 epochId, uint256 snapshotTimestamp, uint256 startTimestamp, uint256 endTimestamp, uint256 totalAssets, uint256 totalShares, uint256 totalFeeShares, uint8 status, tuple(uint256 chainId, uint256 blockNumber, int256 totalShares, int256 totalAssets)[] vaultData) epoch, uint256 feeChainId, bytes[] signatures))",
}

/**
 * Get the exchange rate for a vault
 * @param {Object} api - The API object
 * @param {string} rateSourceAddress - The contract to read currentEpoch/latestEpoch from
 * @returns {Promise<bigint>} The exchange rate (multiplied by 1e18)
 */
async function getExchangeRate(baseApi, rateSourceAddress) {
  const ONE = 10n ** 18n;
  const calcRateFromEpochView = (epochView) => {
    const totalShares = BigInt(epochView?.epoch?.totalShares || 0);
    if (totalShares === 0n) return ONE;
    const totalAssets = BigInt(epochView?.epoch?.totalAssets || 0);
    return (totalAssets * ONE) / totalShares;
  };

  // Ledger contracts are on base network, so we need to use sdk.api2.abi.call with chain: 'base'
  const currentEpochView = await baseApi.call({ target: rateSourceAddress, abi: epochAbi.currentEpoch });
  if ((currentEpochView?.signatures?.length ?? 0) === 0) {
    const latestEpochView = await baseApi.call({ target: rateSourceAddress, abi: epochAbi.latestEpoch });
    return calcRateFromEpochView(latestEpochView);
  }

  return calcRateFromEpochView(currentEpochView);
}

async function getVaultTvl(rateSourceAddress, totalSupply, baseApi) {
  const rate = await getExchangeRate(baseApi, rateSourceAddress);
  const tvl = (BigInt(totalSupply) * rate) / BigInt(1e18);
  return tvl;
}

const curatorExport = getCuratorExport(configs);

const vaultConfigs = {
  ethereum: ['USDC', 'USDT'],
  arbitrum: ['USDC', 'USDT'],
  optimism: ['USDC'],
  base: ['USDC'],
  plasma: ['USDT'],
}

const customVaultTvlExports = {}

Object.keys(vaultConfigs).forEach(chain => {
  const vaultTypes = vaultConfigs[chain]
  const vaults = vaultTypes.map(vaultType => VAULTS[vaultType])
  customVaultTvlExports[chain] = {
    tvl: async (api) => {
      const baseApi = api.chain === 'base' ? api : new sdk.ChainApi({ chain: 'base', timestamp: api.timestamp })
      const tokens = await api.multiCall({ calls: vaults, abi: 'address:asset' })
      const ledgers = await api.multiCall({ calls: vaults, abi: 'address:ledger' })
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
      const tvls = await Promise.all(vaults.map((_, i) => getVaultTvl(ledgers[i], supplies[i], baseApi,)))
      api.add(tokens, tvls)
      return api.getBalances()
    }
  }
})

module.exports = mergeExports([curatorExport, customVaultTvlExports])