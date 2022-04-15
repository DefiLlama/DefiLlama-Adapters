const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

function fetch() {
  return async () => {
    let tvl = 0;
    const pools = await utils.fetchURL('https://comb-breakdown.herokuapp.com/pools');
    const vaults = await utils.fetchURL('https://comb-breakdown.herokuapp.com/vaults');


    pools.data.forEach(pool => tvl += pool.tvl);
    vaults.data.forEach(vault => tvl += vault.tvl);

    return toUSDTBalances(tvl);
  }
}

function staking() {
  return async () => {
    let tvl = 0;
    const zcomb = await utils.fetchURL('https://comb-breakdown.herokuapp.com/zcomb');
    tvl += zcomb.data.tvl;
    return toUSDTBalances(tvl);
  }
}

module.exports = {
  methodology: 'Fetches pools (masterchef), vaults, and zcomb data from external APIs and sums up the total locked values (TVL). The TVLs are calculated by taking the lp balances and its price of the strategies and adding them up. The zcomb tvl is calculated by taking the total locked comb and multiplying it by its market value.',
  fantom: {
    tvl: fetch(),
    staking: staking()
  }
}
