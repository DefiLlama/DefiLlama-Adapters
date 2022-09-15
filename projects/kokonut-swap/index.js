const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { requery } = require('../helper/requery.js');

const registry_addr = "0xBd21dD5BCFE28475D26154935894d4F515A7b1C0";
const helper_addr = "0x1A09643f4D70B9Aa9da5737568C1935ED37423aa";
const chain = 'klaytn';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  block = chainBlocks[chain]

  const poolList = (await sdk.api.abi.call({
    target: registry_addr,
    abi: abi.getPoolList,
    block,
    chain
  })).output;

  const info = await sdk.api.abi.multiCall({
    calls: poolList.map(p => ({
      target: helper_addr,
      params: p
    })),
    abi: abi.getPoolPriceInfo,
    block,
    chain
  });

  await requery(info, chain, chainBlocks[chain], abi.getPoolPriceInfo);
  const gasToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
  const tokenSet = new Set()

  for (const data of info.output) {
    const { output: poolInfo, input: { params } } = data
    if (!poolInfo)  {
      console.log('pool info missing for ', params)
      continue;
    }
    for (let token of poolInfo.tokens) {
      token = token.toLowerCase()
      if (token !== gasToken) tokenSet.add(token)
    }
  }

  const { output: tokenResponse } = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    calls: [...tokenSet].map(i => ({ target: i })),
    chain, block,
  })

  const tokenMapping = {}
  tokenResponse.forEach(i => tokenMapping[i.input.target] = i.output)


  for (const { output: poolInfo } of info.output) {
    if (!poolInfo) continue;
    for (let j = 0; j < poolInfo.tokens.length;j++) {
      const token = poolInfo.tokens[j].toLowerCase()
      const decimal = token === gasToken ? 18 : tokenMapping[token]
      const balance = poolInfo.prices[j] / 1e18 * poolInfo.balances[j] / 10 ** (decimal);
      sdk.util.sumSingleBalance(balances, 'usd-coin', balance);
    }
  }

  return balances;
};

async function staking(timestamp, block, chainBlocks) {
  const info = (await sdk.api.abi.call({
    target: helper_addr,
    abi: abi.getStakedEyePriceInfo,
    block,
    chain
  })).output;

  return { 'usd-coin': info.price * info.balance / 10 ** 36 };
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  klaytn: {
    staking,
    tvl
  },
  methodology:
    "tvl is calculated using the total value of protocol's liquidity pool. Staked tokens include staked EYE values. Pool2 includes staked lp tokens eligible for KOKOS emissions"
};