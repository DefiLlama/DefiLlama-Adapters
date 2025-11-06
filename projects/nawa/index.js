const { sumTokens2 } = require('../helper/unwrapLPs');

// Bitflux Pool (Saddle Finance fork)
const BITFLUX_POOL = '0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C'; // The holder/pool address
const BITFLUX_LP_TOKEN = '0xBDBb25FB6a76546E640D82BdDce73c721465d24E'; // LP token to blacklist
const NAWA_SOLV_VAULT_V2 = '0x0b8647d875Eac9fA00Bf8796313abD960C71eE1A'

async function tvl(api) {

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

module.exports = {
  methodology: 'TVL is calculated by: 1) Unwrapping Bitflux LP tokens held by Nawa Solv Vault V2 to their underlying asset values (SolvBTC.CORE, WBTC, SolvBTC.b) - the LP token balance is fetched dynamically and converted to underlying assets based on pool reserves and total supply, and 2) Tracking dualCore token holdings in the vault address. This captures both the LP position value and additional vault assets.',
  core: {
    tvl,
  },
}; 
