const axios = require('axios');
const sdk = require('@defillama/sdk');
const { parseUnits } = require('ethers');

const HYPERLIQUID_MAINNET_RPC_URL = 'https://api.hyperliquid.xyz';
const STAKING_VAULT = '0x3F790D0080a5257a1AEfb257DDCDc19579a8998F';

async function getUserStakingSummary(user) {
  const response = await axios.post(`${HYPERLIQUID_MAINNET_RPC_URL}/info`, {
    type: 'delegatorSummary',
    user,
  });
  return response.data;
}

function parseHypeAmount(value = '0') {
  return parseUnits(String(value), 18);
}

async function tvl(api) {
  const [evmBalance, stakingSummary] = await Promise.all([
    sdk.api.eth.getBalance({
      target: STAKING_VAULT,
      chain: 'hyperliquid',
    }),
    getUserStakingSummary(STAKING_VAULT),
  ]);

  const {
    delegated = '0',
    undelegated = '0',
    totalPendingWithdrawal = '0',
  } = stakingSummary || {};

  const hypercoreManagedHype =
    parseHypeAmount(delegated) + parseHypeAmount(undelegated) - parseHypeAmount(totalPendingWithdrawal);

  api.addGasToken(BigInt(evmBalance.output) + hypercoreManagedHype);
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the underlying HYPE controlled by Stratium's StakingVault: HYPE held by the vault on HyperEVM plus HYPE delegated or undelegated on HyperCore for the vault address. Excludes future HIP-3 market fees, volume, revenue, and any non-staking protocol activity.",
  hyperliquid: {
    tvl,
  },
};