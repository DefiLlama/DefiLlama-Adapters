const axios = require('axios');
const sdk = require('@defillama/sdk');
const { parseUnits } = require('ethers');

const HYPERLIQUID_MAINNET_RPC_URL = 'https://api.hyperliquid.xyz';
const STAKING_VAULT = '0x3F790D0080a5257a1AEfb257DDCDc19579a8998F';
const HYPERLIQUID_API_TIMEOUT_MS = 10_000;
const DECIMAL_STRING_RE = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function isValidDelegatorSummary(data) {
  return data
    && typeof data === 'object'
    && ['delegated', 'undelegated', 'totalPendingWithdrawal'].every((field) =>
      typeof data[field] === 'string' && DECIMAL_STRING_RE.test(data[field]));
}

async function getUserStakingSummary(user) {
  const { data } = await axios.post(
    `${HYPERLIQUID_MAINNET_RPC_URL}/info`,
    {
      type: 'delegatorSummary',
      user,
    },
    {
      timeout: HYPERLIQUID_API_TIMEOUT_MS,
    }
  );

  if (!isValidDelegatorSummary(data))
    throw new Error(`Hyperliquid delegatorSummary returned invalid data for ${user}`);

  return data;
}

function parseHypeAmount(value) {
  if (typeof value !== 'string' || !DECIMAL_STRING_RE.test(value))
    throw new Error(`Invalid HYPE amount: ${value}`);
  return parseUnits(value, 18);
}

async function tvl(api) {
  const [evmBalance, stakingSummary] = await Promise.all([
    sdk.api.eth.getBalance({
      target: STAKING_VAULT,
      chain: 'hyperliquid',
    }),
    getUserStakingSummary(STAKING_VAULT),
  ]);

  const { delegated, undelegated, totalPendingWithdrawal } = stakingSummary;

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