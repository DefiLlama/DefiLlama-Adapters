const sui = require("../helper/chain/sui");

// ParamX Exchange<USDC> object on Sui mainnet (created in tx BNuLE1p5Tydq1ohFeacypkJ81Ho9SuPjefqUoZ5uXRfD).
// All collateral lives inside this single object as Balance<USDC> values, not as coin objects
// or address balances, so sui.sumTokens can't see it.
const EXCHANGE =
  "0x82e575a0b596f2f253a4fea02de6e6070e75f0bf90a2cc4c477122359e44ec09";

// Circle native USDC on Sui (6 decimals). Matches the Exchange's type argument.
const USDC =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

async function tvl(api) {
  const exchange = await sui.getObject(EXCHANGE);
  const { accounts, contracts, fees } = exchange.fields;

  // Accrued protocol fees (Balance<USDC>, serialized as a u64 string).
  api.add(USDC, fees);

  // Users' free collateral: Table<address, Account<USDC>>, Account.balance.
  const accountEntries = await sui.getDynamicFieldObjects({
    parent: accounts.fields.id.id,
    skipLayout: true,
  });
  for (const entry of accountEntries)
    api.add(USDC, entry.fields.value.fields.balance);

  // Collateral locked behind minted YES/NO share pairs: Table<u256, GridContract<USDC>>, GridContract.reward.
  const contractEntries = await sui.getDynamicFieldObjects({
    parent: contracts.fields.id.id,
    skipLayout: true,
  });
  for (const entry of contractEntries)
    api.add(USDC, entry.fields.value.fields.reward);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the USDC held by the ParamX Exchange object on Sui: users' deposited account balances, collateral locked in minted grid contracts, and accrued protocol fees.",
  sui: { tvl },
};
