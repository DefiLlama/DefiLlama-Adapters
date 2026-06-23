const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryContract } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');

// ---------- CORE BLOCKCHAIN ----------

// Bitflux Pool (Saddle Finance fork)
const BITFLUX_POOL = '0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C'; // The holder/pool address
const BITFLUX_LP_TOKEN = '0xBDBb25FB6a76546E640D82BdDce73c721465d24E'; // LP token to blacklist
const NAWA_SOLV_VAULT_V2 = '0x0b8647d875Eac9fA00Bf8796313abD960C71eE1A';

async function coreTvl(api) {

  const tokens = await api.call({
    abi: 'function getTokens() view returns (address[])',
    target: BITFLUX_POOL
  });

  if (tokens.length > 0) {
    // Get balances for each token
    const balances = await api.multiCall({
      abi: 'function getTokenBalance(uint8) view returns (uint256)',
      target: BITFLUX_POOL,
      calls: tokens.map((_, i) => ({ params: [i] }))
    });

    // Get LP token total supply
    const lpTotalSupply = await api.call({
      abi: 'function totalSupply() view returns (uint256)',
      target: BITFLUX_LP_TOKEN
    });

    const userLPBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: BITFLUX_LP_TOKEN,
      params: [NAWA_SOLV_VAULT_V2]
    });

    // Calculate user's share of each underlying token
    tokens.forEach((token, index) => {
      const tokenBalance = balances[index];
      const userShare = BigInt(userLPBalance) * BigInt(tokenBalance) / BigInt(lpTotalSupply);
      api.add(token, userShare.toString());
    });
  }

  // Get token balances for all strategy and vault tokens
  const balances = await sumTokens2({
    api,
    tokens: ['0xc5555ea27e63cd89f8b227dece2a3916800c0f4f'],  // dualCoreToken
    owners: ['0x3be69cA2fE0F5B0670923336aC42b4Dd7bee3DfF'] // vaultAddress
  });

  return balances;
}

// ---------- ZIGCHAIN ----------

// Nawa Zig vault contract (CosmWasm)
const NAWA_ZIG_VAULT = 'zig1fqxfjv54zavyr9464vj6n2jgw9fxgdnxucf866spedunntw0skcsq9gz33';

// stZIG denom — priced server-side via Valdora oracle.
const STZIG_DENOM = 'coin.zig109f7g2rzl2aqee7z6gffn8kfe9cpqx0mjkk7ethmx8m2hq4xpe9snmaam2.stzig';

// Nawa USDC vault. Funds deposited here are forwarded off-chain to Zignaly
// and bridged to ETH/BSC for a private credit strategy, so the only on-chain
// handle on TVL is the vault's oracle-reported AUM (in USDC base units, 6 dp).
const NAWA_USDC_VAULT = 'zig1fn4rrr5knlg93nf3wyme9fzmgve3fftxu5l7wv90llp77mwg7ctq2lfwtd';

/**
 * Fetch TVL (AUM) from the Nawa Zig vault using:
 *   QueryMsg::TotalAum {}
 * which maps to JSON:
 *   { "total_aum": "123456789" } // amount in stZIG base units
 */
async function fetchZigVaultTVL() {
  const res = await queryContract({
    contract: NAWA_ZIG_VAULT,
    chain: 'zigchain',
    data: { total_aum: {} },
  });

  const amount = res.total_aum;

  if (!amount || amount === '0') return null;
  return BigInt(amount); // amount in stZIG (smallest unit)
}

/**
 * Fetch AUM (in USDC base units, 6 decimals) from the Nawa USDC vault using:
 *   QueryMsg::Aum {} -> { "aum": "<uint256>" }
 */
async function fetchUsdcVaultAum() {
  const res = await queryContract({
    contract: NAWA_USDC_VAULT,
    chain: 'zigchain',
    data: { aum: {} },
  });

  const amount = res.aum;
  if (!amount || amount === '0') return null;
  return BigInt(amount);
}

async function zigchainTvl(api) {
  const aumStzig = await fetchZigVaultTVL()
  if (aumStzig) api.add(STZIG_DENOM, aumStzig.toString())

  const aumUsdc = await fetchUsdcVaultAum()
  if (aumUsdc) {
    const usdValue = Number(aumUsdc) / 1e6
    if (Number.isFinite(usdValue) && usdValue > 0) {
      api.addCGToken('usd-coin', usdValue)
    }
  }
}

module.exports = {
  timetravel: false,            // ZigChain query is live-state only
  misrepresentedTokens: false,
  methodology:
    'ZigChain: TVL is the sum of (1) the Nawa Zig vault AUM reported as stZIG, ' +
    'and (2) the Nawa USDC vault AUM ' +
    '(oracle-reported USD value of capital deployed off-chain via Zignaly into a ' +
    'cross-chain private credit position), reported as USDC. ' +
    'Core: TVL is calculated by 1) unwrapping Bitflux LP tokens held by Nawa Solv Vault V2 to their underlying assets ' +
    '(e.g. SolvBTC.CORE, WBTC, SolvBTC.b) based on pool reserves and total supply, and 2) tracking dualCore token ' +
    'holdings in the Core vault address.',
  core: {
    tvl: coreTvl,
  },
  zigchain: {
    tvl: zigchainTvl,
  },
};
