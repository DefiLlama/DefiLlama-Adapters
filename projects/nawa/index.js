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

// Valdora Staker contract used as pricing oracle for stZIG → uZIG
const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';

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
 * Fetches the conversion rate from stZIG to uZIG using the redeem-side quote
 * from the Valdora Staker contract.
 *
 * 1. We send a probe amount of 1,000 ZIG (1e9 uZIG) via reverse_st_zig_price.
 * 2. Contract returns stzig_amount (how much stZIG is received for that probe uZIG).
 * 3. We compute: uzig_per_stzig = probe_uzig / stzig_amount, scaled by 1e6.
 *
 * Returns BigInt ratioScaled = uZIG per 1 stZIG * 1e6, or null if it fails.
 */
async function fetchUzigPerStzig() {
  const probeUzig = 1_000_000_000n; // 1,000 ZIG in uZIG (assuming 6 decimals)

  const { stzig_amount } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { reverse_st_zig_price: { amount: probeUzig.toString() } },
  });

  if (!stzig_amount || stzig_amount === '0') return null;

  // ratioScaled = (probeUzig * 1e6) / stzig_amount
  return (probeUzig * 1_000_000n) / BigInt(stzig_amount);
}

async function zigchainTvl(api) {
    const balances = api.getBalances();
  
    try {
      const [aumStzig, ratioScaled] = await Promise.all([
        fetchZigVaultTVL(),
        fetchUzigPerStzig(),
      ]);
  
      if (aumStzig && ratioScaled) {
        const uzigEq = (aumStzig * ratioScaled) / 1_000_000n;
        const key = 'zigchain:uzig';
        const current = balances[key] ? BigInt(balances[key]) : 0n;
        balances[key] = (current + uzigEq).toString();
      }
    } catch (e) {
      // If Zig part fails, we just skip it so Core TVL still works
    }
  
    return transformBalances('zigchain', balances);
  }
  

module.exports = {
  timetravel: false,            // ZigChain query is live-state only
  misrepresentedTokens: false,
  methodology:
    'Core: TVL is calculated by 1) unwrapping Bitflux LP tokens held by Nawa Solv Vault V2 to their underlying assets ' +
    '(e.g. SolvBTC.CORE, WBTC, SolvBTC.b) based on pool reserves and total supply, and 2) tracking dualCore token ' +
    'holdings in the Core vault address. ' +
    'ZigChain: TVL is the total AUM returned by the Nawa Zig vault (in stZIG) converted to uZIG equivalent via ' +
    'Valdora’s reverse_st_zig_price oracle, then reported as uZIG on ZigChain.',
  core: {
    tvl: coreTvl,
  },
  zigchain: {
    tvl: zigchainTvl,
  },
};
