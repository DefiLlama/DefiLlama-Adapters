const { BigNumber } = require('bignumber.js');
const { call, addTokenBalances, sumSingleBalance } = require('../helper/near');

const PEMBROCK_CONTRACT = "v1.pembrock.near";
const REF_FINANCE_CONTRACT = "v2.ref-finance.near";
const REF_BOOST_CONTRACT = "boostfarm.ref-labs.near";
const STAKING_CONTRACT = "staking.v1.pembrock.near";

async function addFarmBalances(farms, seeds, balances) {
  return Promise.all(Object.values(farms).map(async farm => {
    const [pool, nonStakedShares] = await Promise.all([
      call(REF_FINANCE_CONTRACT, "get_pool", {"pool_id": farm.ref_pool_id}),
      call(REF_FINANCE_CONTRACT, "mft_balance_of", {token_id:  `:${farm.ref_pool_id}`, account_id: PEMBROCK_CONTRACT})
    ]);
    const seed = seeds[`${REF_FINANCE_CONTRACT}@${farm.ref_pool_id}`];

    const shares = BigNumber(nonStakedShares).plus(seed.free_amount).plus(seed.locked_amount);

    const firstTokenAmount = shares.multipliedBy(pool.amounts[0]).dividedBy(pool.shares_total_supply);
    const secondTokenAmount = shares.multipliedBy(pool.amounts[1]).dividedBy(pool.shares_total_supply);

    sumSingleBalance(balances, pool.token_account_ids[0], firstTokenAmount);
    sumSingleBalance(balances, pool.token_account_ids[1], secondTokenAmount);
  }));
}

async function tvl() {
  const [tokens, farms, seeds, totalStaked] = await Promise.all([
    call(PEMBROCK_CONTRACT, "get_tokens", {account_id: PEMBROCK_CONTRACT}),
    call(PEMBROCK_CONTRACT, "get_farms",  {}),
    call(REF_BOOST_CONTRACT, "list_farmer_seeds", {farmer_id: PEMBROCK_CONTRACT}),
    call(STAKING_CONTRACT, "get_total_staked", {}),
  ]);
  const balances = {};
  await Promise.all([
    addTokenBalances(Object.keys(tokens), PEMBROCK_CONTRACT, balances),
    addFarmBalances(farms, seeds, balances)
  ]);
  // add total staked PEMs
  sumSingleBalance(balances, "token.pembrock.near", totalStaked);
  return balances;
}

module.exports = {
  near: {
    tvl
  },
  hallmarks: [
    [1666648800,"DCB withdrawn liquidity from Ref Finance's "]
  ],
}
