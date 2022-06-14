const abi = require("./abi.json");
const kip7 = require("./kip7.json");
const sdk = require("@defillama/sdk");
const { requery } = require('../helper/requery.js');

const registry_addr = "0xBd21dD5BCFE28475D26154935894d4F515A7b1C0";
const helper_addr = "0x1A09643f4D70B9Aa9da5737568C1935ED37423aa";
const chain = 'klaytn';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const poolList = (await sdk.api.abi.call({
    target: registry_addr,
    abi: abi.getPoolList,
    block: chainBlocks[chain],
    chain
  })).output;

  const info = await sdk.api.abi.multiCall({
    calls: poolList.map(p => ({
      target: helper_addr,
      params: p
    })),
    abi: abi.getPoolPriceInfo,
    block: chainBlocks[chain],
    chain
  });

  await requery(info, chain, chainBlocks[chain], abi.getPoolPriceInfo);

  const successes = info.output.filter(o => o.success == true)
  if (successes.length == 0) throw 'not a single call was successful'

  for (let i = 0; i < info.output.length; i++) {
    if (!info.output[i].success) continue;
    const poolInfo = info.output[i].output;
    for (let j = 0; j < poolInfo.tokens.length; j++) {
      const decimal = poolInfo.tokens[j]==`0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`?18:
        (await sdk.api.abi.call({
        target: poolInfo.tokens[j],
        abi: kip7.decimals,
        block: chainBlocks[chain],
        chain
      })).output;
      const balance = poolInfo.prices[j] / 10**(18) * poolInfo.balances[j] / 10**(decimal);
      sdk.util.sumSingleBalance(balances, 'usd-coin', balance);
    };
  };

  return balances;
};

async function staking(timestamp, block, chainBlocks) {
  const info = (await sdk.api.abi.call({
    target: helper_addr,
    abi: abi.getStakedEyePriceInfo,
    block: chainBlocks[chain],
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