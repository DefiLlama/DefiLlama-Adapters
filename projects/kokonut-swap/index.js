const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL } = require("../helper/unknownTokens");

const registry_addr = "0xBd21dD5BCFE28475D26154935894d4F515A7b1C0";
const helper_addr = "0x1A09643f4D70B9Aa9da5737568C1935ED37423aa";
const chain = 'klaytn';

async function klaytn_tvl(timestamp, _, { klaytn: block }) {
  const balances = {};

  const poolList = (await sdk.api.abi.call({
    target: registry_addr,
    abi: abi.getPoolList,
    block, chain
  })).output;

  const info = await sdk.api.abi.multiCall({
    calls: poolList.map(p => ({
      target: helper_addr,
      params: p
    })),
    abi: abi.getPoolPriceInfo,
    block, chain,
    permitFailure: true,
  });

  const gasToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
  const tokenSet = new Set()

  for (const data of info.output) {
    const { output: poolInfo, input: { params } } = data
    if (!poolInfo) {
      sdk.log('pool info missing for ', params)
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
    for (let j = 0; j < poolInfo.tokens.length; j++) {
      const token = poolInfo.tokens[j].toLowerCase()
      const decimal = token === gasToken ? 18 : tokenMapping[token]
      const balance = poolInfo.prices[j] / 1e18 * poolInfo.balances[j] / 10 ** (decimal);
      sdk.util.sumSingleBalance(balances, 'usd-coin', balance);
    }
  }

  return balances;
}

async function polygon_zkevm_tvl(api) {
  const ownerTokens = [];
  const poolList = (await sdk.api.abi.call({
    target: "0x677bBBAd41D784a4731d902c613f8af43AAb4feb",
    abi: abi.getRegisteredPools,
    chain: 'polygon_zkevm'
  })).output;
  for (const pool of poolList) {
    ownerTokens.push([pool.liquidity.map(t => t.addr), pool.addr]);
  }
  return sumTokens2({ api, ownerTokens });
}

const uniV2TVL = getUniTVL({ factory: '0x4Cf1284dcf30345232D5BfD8a8AAd6734b6941c4', useDefaultCoreAssets: true});

async function base_tvl(api) {
  const ownerTokens = [];
  const poolList = (await sdk.api.abi.call({
    target: "0x03173F638B3046e463Ab6966107534f56E82E1F3",
    abi: abi.getRegisteredPools,
    chain: 'base'
  })).output;
  for (const pool of poolList) {
    ownerTokens.push([pool.liquidity.map(t => t.addr), pool.addr]);
  }
  return sumTokens2({ api, ownerTokens });
}

async function staking(timestamp, _, { klaytn: block }) {
  const info = (await sdk.api.abi.call({
    target: helper_addr,
    abi: abi.getStakedEyePriceInfo,
    block, chain
  })).output;

  return { 'usd-coin': info.price * info.balance / 10 ** 36 };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  klaytn: {
    staking,
    tvl: klaytn_tvl
  },
  polygon_zkevm: {
    tvl: polygon_zkevm_tvl
  },
  base: {
    tvl: sdk.util.sumChainTvls([base_tvl, uniV2TVL])
  },
  methodology:
    "tvl is calculated using the total value of protocol's liquidity pool. Staked tokens include staked EYE values. Pool2 includes staked lp tokens eligible for KOKOS emissions"
};