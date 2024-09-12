const { getTableRows, getCurrencyBalance, getAllOracleData, getTokenPriceUsd } = require("../helper/chain/proton");
const { toUSDTBalances } = require('../helper/balances');

const LENDING_CONTRACT = 'lending.loan';
const LOAN_TOKEN_CONTRACT = 'loan.token';
const STAKING_CONTRACT = 'lock.token';

async function getAllMarkets(lower_bound) {
  try {
    let { rows, more, next_key } = await getTableRows({
      code: LENDING_CONTRACT,
      scope: LENDING_CONTRACT,
      table: 'markets',
      limit: -1,
      lower_bound: lower_bound,
    });

    if (more) {
      rows = rows.concat(await getAllMarkets(next_key));
    }

    return rows;
  } catch (e) {
    return [];
  }
}

function getLendingTvl(returnBorrowed = false) {
  return async () => {
    const oracles = await getAllOracleData();
    const markets = await getAllMarkets();
  
    let available = 0;
    let borrowed = 0;
    let tvl = 0;
  
    for (const market of markets) {
      // Find oracle
      const oracle = oracles.find(
        (oracle) => oracle.feed_index === market.oracle_feed_index
      );
      if (!oracle || !oracle.aggregate.d_double) continue;
  
      // Determine pool amount
      const [, symbol] = market.underlying_symbol.sym.split(',');
      const [cash] = await getCurrencyBalance(
        market.underlying_symbol.contract,
        LENDING_CONTRACT,
        symbol
      );
      const [cashAmount] = cash.split(' ');
      const [borrowAmount] = market.total_variable_borrows.quantity.split(' ');
      const total = +cashAmount + +borrowAmount;
  
      available += +cashAmount * oracle.aggregate.d_double;
      borrowed += +borrowAmount * oracle.aggregate.d_double;
      tvl += total * oracle.aggregate.d_double;
    }
  
    if (returnBorrowed) {
      return toUSDTBalances(borrowed)
    } else {
      return toUSDTBalances(tvl - borrowed)
    }
  }
}

async function getTotalStaking() {
  const loanPrice = await getTokenPriceUsd('LOAN', LOAN_TOKEN_CONTRACT)
  const [staked] = await getCurrencyBalance(LOAN_TOKEN_CONTRACT, STAKING_CONTRACT, 'LOAN')
  const [stakedAmount] = staked.split(' ');
  let stakingTvl = toUSDTBalances(stakedAmount * loanPrice)
  return stakingTvl
}

module.exports = {
  deadFrom: '2024-09-09',
  misrepresentedTokens: true,
  methodology: `Proton Loan TVL is the sum of all lending deposits in the Proton Loan smart contract and single-side staked LOAN.`,
  proton: {
    tvl: getLendingTvl(false),
    borrowed: () => ({}), // bad debt getLendingTvl(true),
    staking: getTotalStaking
  }, 
}

