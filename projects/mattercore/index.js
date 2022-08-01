const BigNumber = require("bignumber.js");
const { get } = require('../helper/http');
const { RPC_ENDPOINT } = require('../helper/tezos');
const { PromisePool } = require('@supercharge/promise-pool');
const { getTokenBalances } = require('../helper/tezos');

const axios = require('axios');
const dataUrl = 'https://spicya.sdaotools.xyz/api/rest/PoolListAll';
const MATTER_CONTRACT = 'KT1K4jn23GonEmZot3pMGth7unnzZ6EaMVjY';

async function grabTokenBalances() {
  const sslp = await getTokenBalances(MATTER_CONTRACT);
  return Object.entries(sslp).filter(token => token[1] = new BigNumber(token[1]));
}

async function getSpicyPools(tokenBalances) {
  const pools = await axios(dataUrl);
  const poolData = pools.data.pair_info;
  const matterPools = [];

  const grabSupply = async (contract) => {
    const res = await get(`${RPC_ENDPOINT}/v1/contracts/${contract}/bigmaps/token_total_supply/keys?limit=1`);
    return new BigNumber(res[0].value);
  }
  
  const res = poolData.map(token => ({ contract: token.contract, reservextz: token.reservextz }));

  res.forEach(token => {
    if(tokenBalances.find(balances => balances[0] == token.contract)) {
      token.matterBalance = tokenBalances[tokenBalances.findIndex(i => i[0] === token.contract)][1];
      matterPools.push(token);
    }
  });

  for(let pool of matterPools) {
    pool.totalBalance = await grabSupply(pool.contract);;
  }

  return matterPools;
}

async function fetchFarmsTvl(farms) {
  const { results, errors } = await PromisePool.withConcurrency(10)
    .for(farms)
    .process(async ({reservextz, matterBalance, totalBalance}) => lpToTez(reservextz, matterBalance, totalBalance))

  if (errors && errors.length) {
    throw errors[0]
  }

  return results.reduce((previous, current) => previous.plus(current))
}

async function lpToTez(reservextz, matterBalance, totalBalance) {
  const reserveXtz = new BigNumber(reservextz);
  const tezPerLp = reserveXtz.dividedBy(totalBalance.shiftedBy(-18));

  return tezPerLp.multipliedBy(matterBalance.shiftedBy(-18));
}

async function tvl() {
  const tokenBalances = await grabTokenBalances();
  const spicyPools = await getSpicyPools(tokenBalances);
  const farmsTvl = await fetchFarmsTvl(spicyPools);

  return {
      tezos: farmsTvl.toFixed(0)
  };
}

module.exports = {
    methodology: `TVL counts the liquidity of Matter Core farms..`,
    misrepresentedTokens: true,
    tezos: {
      tvl
    }
}
