const BigNumber = require("bignumber.js");
const { RPC_ENDPOINT } = require('../helper/chain/tezos');
const { PromisePool } = require('@supercharge/promise-pool');
const { get } = require('../helper/http')

const SPICY_URL = 'https://spicya.sdaotools.xyz/api/rest';
const MATTER_CORE = 'KT1K4jn23GonEmZot3pMGth7unnzZ6EaMVjY';
const MATTER_LIVE = 'KT1FYct7DUK1mUkk9BPJEg7AeH7Fq3hQ9ah3';

async function fetchTokenBalances(account) {
  return (await get(`${RPC_ENDPOINT}/v1/tokens/balances?account=${account}&limit=100&select=balance,token.id%20as%20id,token.contract%20as%20contract,token.standard%20as%20standard,token.tokenId%20as%20token_id`));
}

async function fetchSupply (contract, id) {
  const req = id ? `/v1/tokens/?contract=${contract}&tokenId=${id}` : `/v1/tokens/?contract=${contract}`;
  const supply = (await get(`${RPC_ENDPOINT}${req}`));

  return new BigNumber(supply[0].totalSupply);
}

let _spicePools, _spiceTokens

async function fetchSpicyPools() {
  if (!_spicePools) _spicePools = get(`${SPICY_URL}/PoolListAll/`)
  const spicyPools = (await _spicePools).pair_info;

  return spicyPools.map(token => ({ contract: token.contract, reservextz: token.reservextz }));
}

async function fetchSpicyTokens() {
  if (!_spiceTokens) _spiceTokens = get(`${SPICY_URL}/TokenList`)
  return (await _spiceTokens).tokens;
}

async function lpToTez(farm) {
  if(!farm.totalBalance) {
    return farm.reserveXtz.multipliedBy(farm.balance);
  } else {
    const tezPerLp = farm.reserveXtz.dividedBy(farm.totalBalance.shiftedBy(-18));

    return tezPerLp.multipliedBy(farm.balance.shiftedBy(-18));
  }
}

async function matchToMatter (token, pools, tokens) {
  const match = pools.find(pool => pool.contract == token.contract.address)

  if(match) {
    token.totalBalance = await fetchSupply(token.contract.address);
    token.reserveXtz =  new BigNumber(match.reservextz);
    token.balance = new BigNumber(token.balance);
    
    return token;
  } else {
    const tokenData = tokens.find(t => t.tag == `${token.contract.address}:${token.token_id}`);

    if(tokenData) {
      token.reserveXtz = new BigNumber(tokenData.derivedxtz);
      token.balance = new BigNumber(token.balance).shiftedBy(-tokenData.decimals);

      return token;
    }
  }
}

async function fetchSpicyPoolsAndMatch (spicyPools, spicyTokens, match) {
  const { results, errors } = await PromisePool.withConcurrency(10)
    .for(match)
    .process(async (token) => matchToMatter(token, spicyPools, spicyTokens))

  if (errors && errors.length) {
    throw errors[0];
  }

  return results.filter(result => result);
}

async function fetchCoreFarmsTvl(farms) {
  const { results, errors } = await PromisePool.withConcurrency(10)
    .for(farms)
    .process(async (farm) => lpToTez(farm))

  if (errors && errors.length) {
    throw errors[0]
  }

  return results.reduce((previous, current) => previous.plus(current))
}

const MATTER_TOKEN = 'KT1K4jn23GonEmZot3pMGth7unnzZ6EaMVjY'

async function tvl() {
  //fetch initial matter data
  const spicyPools = await fetchSpicyPools();
  const spicyTokens = await fetchSpicyTokens();
  const matterCoreBalances = await fetchTokenBalances(MATTER_CORE);
  const matterLiveBalances = await fetchTokenBalances(MATTER_LIVE);

  //fetch farm info
  const coreToMatter = await fetchSpicyPoolsAndMatch(spicyPools, spicyTokens, matterCoreBalances.filter(i => i.contract.address !== MATTER_TOKEN));
  const liveToMatter = await fetchSpicyPoolsAndMatch(spicyPools, spicyTokens, matterLiveBalances.filter(i => i.contract.address !== MATTER_TOKEN));

  //calculate TVL
  const coreFarmsTvl = await fetchCoreFarmsTvl(coreToMatter);
  const liveFarmsTvl = await fetchCoreFarmsTvl(liveToMatter);
  
  return {
      tezos: coreFarmsTvl.plus(liveFarmsTvl).toFixed(0)
  };
}

async function staking() {
  //fetch initial matter data
  const spicyPools = await fetchSpicyPools();
  const spicyTokens = await fetchSpicyTokens();
  const matterCoreBalances = await fetchTokenBalances(MATTER_CORE);
  const matterLiveBalances = await fetchTokenBalances(MATTER_LIVE);

  //fetch farm info
  const coreToMatter = await fetchSpicyPoolsAndMatch(spicyPools, spicyTokens, matterCoreBalances.filter(i => i.contract.address === MATTER_TOKEN));
  const liveToMatter = await fetchSpicyPoolsAndMatch(spicyPools, spicyTokens, matterLiveBalances.filter(i => i.contract.address === MATTER_TOKEN));

  //calculate TVL
  const coreFarmsTvl = await fetchCoreFarmsTvl(coreToMatter);
  const liveFarmsTvl = await fetchCoreFarmsTvl(liveToMatter);
  
  return {
      tezos: coreFarmsTvl.plus(liveFarmsTvl).toFixed(0)
  };
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: `
    TVL counts the liquidity of both Matter Core & Matter Live farms.
    Tokens held in Matter's contract are pulled from TZKT API & relevant pool data is retrieved using SpicySwap API: ${SPICY_URL}. 
    `,
    tezos: {
      tvl,
      staking,
    }
}
