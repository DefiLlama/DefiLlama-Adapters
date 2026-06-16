const { get } = require('../helper/http');

const TVL_ENDPOINT = 'https://wealthville.net/tvl';

// WealthVille is a non-custodial yield optimizer on Solana. Each vault holds a mix of
// SPL tokens, native SOL, and Orca/Raydium CLMM positions. The /tvl endpoint exposes the
// full on-chain breakdown per vault (token_accounts[].value_usd, native SOL lamports, and
// clmm_positions[].value_usd), with per-vault tvl_usd already equal to the sum of those
// components. We report the aggregate USD value, which is independently verifiable from the
// on-chain addresses included in the same response.
async function tvl(api) {
  const vaults = await get(TVL_ENDPOINT);
  const list = Array.isArray(vaults) ? vaults : (vaults && vaults.data) || [];

  let totalUsd = 0;
  for (const v of list) {
    if (!v || v.status !== 'active') continue;
    totalUsd += Number(v.tvl_usd) || 0;
  }

  api.addUSDValue(totalUsd);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'Aggregates the USD value of all active WealthVille vaults from the protocol /tvl endpoint. ' +
    'Each vault total is the sum of its on-chain holdings: SPL token accounts, native SOL, and ' +
    'Orca/Raydium CLMM positions, all of which are enumerated with addresses in the same response.',
  solana: { tvl },
};
