const ADDRESSES = require('../helper/coreAssets.json')
const { BigNumber } = require('bignumber.js');
const { call, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');

const PEMBROCK_CONTRACT = "v1.pembrock.near";
const REF_FINANCE_CONTRACT = "v2.ref-finance.near";
const REF_BOOST_CONTRACT = "boostfarm.ref-labs.near";

async function addFarmBalances(farms, seeds, balances) {
  return Promise.all(Object.values(farms).map(async farm => {
    const [pool, nonStakedShares] = await Promise.all([
      call(REF_FINANCE_CONTRACT, "get_pool", {"pool_id": farm.ref_pool_id}),
      call(REF_FINANCE_CONTRACT, "mft_balance_of", {token_id:  `:${farm.ref_pool_id}`, account_id: PEMBROCK_CONTRACT})
    ]);
    const seed = seeds[`${REF_FINANCE_CONTRACT}@${farm.ref_pool_id}`];

    if (!seed) return;
    const shares = BigNumber(nonStakedShares).plus(seed.free_amount).plus(seed.locked_amount);

    const firstTokenAmount = shares.multipliedBy(pool.amounts[0]).dividedBy(pool.shares_total_supply);
    const secondTokenAmount = shares.multipliedBy(pool.amounts[1]).dividedBy(pool.shares_total_supply);

    sumSingleBalance(balances, pool.token_account_ids[0], firstTokenAmount);
    sumSingleBalance(balances, pool.token_account_ids[1], secondTokenAmount);
  }));
}

async function tvl() {
  const [tokens, farms, seeds] = await Promise.all([
    call(PEMBROCK_CONTRACT, "get_tokens", {account_id: PEMBROCK_CONTRACT}),
    call(PEMBROCK_CONTRACT, "get_farms",  {}),
    call(REF_BOOST_CONTRACT, "list_farmer_seeds", {farmer_id: PEMBROCK_CONTRACT})
  ]);

  const balances = {};
  const tokenAddresses = Object.keys(tokens).filter(address => typeof address === 'string' && address.length > 0 && address.includes('.'));
  await Promise.all([
    addTokenBalances(tokenAddresses, PEMBROCK_CONTRACT, balances),
    addFarmBalances(farms, seeds, balances)
  ]);
  return balances;
}

async function staking() {
  const balances = {};
  sumSingleBalance(balances, ADDRESSES.near.PEMBROCK, await call('staking.v1.pembrock.near', "get_total_staked", {}))
  return balances;
}

module.exports = {
  near: { tvl, staking },
  hallmarks: [
    [1666648800,"DCB withdrawn liquidity from Ref Finance's "]
  ],
}
