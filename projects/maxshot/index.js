const { getCuratorExport } = require("../helper/curators");
const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');

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

// Where to read currentEpoch/latestEpoch (ledger contracts)
// NOTE: Ledgers live on base, but are used for all chains.
const LEDGERS = {
  USDC: '0xA7654FcbDe81999fB215Ec4b007b3746257D513c',
  USDT: '0x3663f023FE98DA4dF2f6A4925A050d7edDF49722',
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
async function getExchangeRate(api, rateSourceAddress) {
  try {
    const ONE = 10n ** 18n;
    const calcRateFromEpochView = (epochView) => {
      const totalShares = BigInt(epochView?.epoch?.totalShares || 0);
      if (totalShares === 0n) return ONE;
      const totalAssets = BigInt(epochView?.epoch?.totalAssets || 0);
      return (totalAssets * ONE) / totalShares;
    };

    // Ledger contracts are on base network, so we need to use sdk.api2.abi.call with chain: 'base'
    const currentEpochView = await sdk.api2.abi.call({ 
      chain: 'base',
      target: rateSourceAddress, 
      abi: epochAbi.currentEpoch 
    });
    if ((currentEpochView?.signatures?.length ?? 0) === 0) {
      const latestEpochView = await sdk.api2.abi.call({ 
        chain: 'base',
        target: rateSourceAddress, 
        abi: epochAbi.latestEpoch 
      });
      return calcRateFromEpochView(latestEpochView);
    }

    return calcRateFromEpochView(currentEpochView);
  } catch (error) {
    // If error occurs, default to 1e18
    console.error(`Error getting exchange rate for ${rateSourceAddress}:`, error);
    return BigInt(1e18);
  }
}

/**
 * Get TVL for a specific vault
 * @param {Object} api - The API object
 * @param {string} vaultAddress - The vault address
 * @param {string} rateSourceAddress - The contract to read currentEpoch/latestEpoch from
 * @returns {Promise<bigint>} The TVL in underlying token units
 */
async function getVaultTvl(api, vaultAddress, rateSourceAddress) {
  const totalSupply = await api.call({
    target: vaultAddress,
    abi: 'erc20:totalSupply',
  });

  const rate = await getExchangeRate(api, rateSourceAddress);
  const tvl = (BigInt(totalSupply) * rate) / BigInt(1e18);
  return tvl;
}

const curatorExport = getCuratorExport(configs);

/**
 * Create TVL function for a chain with vaults
 * @param {Array<string>} vaultTypes - Array of vault types (e.g., ['USDC', 'USDT'])
 * @returns {Function} TVL function
 */
function createTvlFunction(vaultTypes) {
  return async (api) => {
    const curatorTvl = curatorExport[api.chain]?.tvl
      ? await curatorExport[api.chain].tvl(api)
      : {};

    const result = { ...curatorTvl };

    for (const vaultType of vaultTypes) {
      const vaultAddress = VAULTS[vaultType];
      const rateSourceAddress = LEDGERS[vaultType];
      let tokenAddress;

      // Get token address based on chain and vault type
      if (vaultType === 'USDC') {
        if (api.chain === 'ethereum') {
          tokenAddress = ADDRESSES.ethereum.USDC;
        } else if (api.chain === 'arbitrum') {
          tokenAddress = ADDRESSES.arbitrum.USDC_CIRCLE;
        } else if (api.chain === 'optimism') {
          tokenAddress = ADDRESSES.optimism.USDC_CIRCLE;
        } else if (api.chain === 'base') {
          tokenAddress = ADDRESSES.base.USDC;
        }
      } else if (vaultType === 'USDT') {
        if (api.chain === 'ethereum') {
          tokenAddress = ADDRESSES.ethereum.USDT;
        } else if (api.chain === 'arbitrum') {
          tokenAddress = ADDRESSES.arbitrum.USDT;
        } else if (api.chain === 'plasma') {
          tokenAddress = ADDRESSES.plasma.USDT0
        }
      }

      if (tokenAddress) {
        const tvl = await getVaultTvl(api, vaultAddress, rateSourceAddress);
        sdk.util.sumSingleBalance(result, tokenAddress, tvl, api.chain);
      }
    }

    return result;
  };
}

module.exports = {
  ...curatorExport,
  ethereum: {
    ...curatorExport.ethereum,
    tvl: createTvlFunction(['USDC', 'USDT']),
  },
  arbitrum: {
    ...curatorExport.arbitrum,
    tvl: createTvlFunction(['USDC', 'USDT']),
  },
  optimism: {
    tvl: createTvlFunction(['USDC']),
  },
  base: {
    ...curatorExport.base,
    tvl: createTvlFunction(['USDC']),
  },
  plasma: {
    tvl: createTvlFunction(['USDT']),
  },
};
