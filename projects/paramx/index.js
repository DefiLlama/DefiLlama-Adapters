const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

// ParamX Exchange<USDC> object on Sui mainnet (created in tx BNuLE1p5Tydq1ohFeacypkJ81Ho9SuPjefqUoZ5uXRfD).
// All collateral lives inside this single object as Balance<USDC> values, not as coin objects
// or address balances, so sui.sumTokens can't see it.
const EXCHANGE =
  "0x82e575a0b596f2f253a4fea02de6e6070e75f0bf90a2cc4c477122359e44ec09";

// Circle native USDC on Sui (6 decimals). Matches the Exchange's type argument.
const USDC =
  ADDRESSES.sui.USDC_CIRCLE;

async function tvl(api) {
  const exchange = await sui.getObject(EXCHANGE);
  // Accrued protocol fees (Exchange.fees) are admin-withdrawable revenue and are not counted.
  const { accounts, contracts } = exchange.fields;

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
    "TVL is the USDC held by the ParamX Exchange object on Sui: users' deposited account balances and collateral locked in minted grid contracts. Accrued protocol fees are excluded.",
  sui: { tvl },
};
