const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');

const markets = [
  {
    underlying: '0xef63d4e178b3180beec9b0e143e0f37f4c93f4c2',
    symbol: 'ETH',
    decimals: 18,
    cToken: '0x4d321e34ec16a3e5a323f9bc647f190fc597c4da', // tETH Market
  },
  {
    underlying: '0x9827431e8b77e87c9894bd50b055d6be56be0030',
    symbol: 'USDC',
    decimals: 6,
    cToken: '0x57fdc0ceda6e76f48ec2e1f55961f02147eacd52', // tUSDC Market
  },
  {
    underlying: '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2',
    symbol: 'USDT',
    decimals: 6,
    cToken: '0x955e5270958f55cedc00a08b589cb156c10d0bfa', // tUSDT Market
  },
  {
    underlying: '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
    symbol: 'WBTC',
    decimals: 18,
    cToken: '0x5794ef19d853dbfaa4b0f2cc9d9883dad18e8812', // tWBTC Market
  },
];

const transformAdress = (i) => `btr:${i}`;

// ask comptroller for all markets array
async function getAllCTokens(block, api = sdk.api.abi) {
  const res = await api.call({
    block,
    target: '0xF2EBc006a55ADFb3f50A521E5Db848942e7Dbb1F',
    params: [],
    abi: abi['getAllMarkets'],
  });
  return res;
}

async function getAllUnderlying(calls, block, api = sdk.api.abi) {
  const res = await api.multiCall({
    abi: abi['underlying'],
    calls,
    block,
  });
  return res;
}

async function getv2Locked(calls, block, api = sdk.api.abi, borrowed) {
  const res = await api.multiCall({
    abi: borrowed ? abi.totalBorrows : abi['getCash'],
    calls,
    block,
  });
  return res;
}

async function getMarkets(block, api = sdk.api.abi) {
  const markets = [];

  const allCTokens = await getAllCTokens(block, api);
  const calls = allCTokens.map((i) => ({ target: i }));
  const output = await getAllUnderlying(calls, block, api);
  output.forEach((underlying, index) =>
    markets.push({ cToken: allCTokens[index], underlying })
  );
  return markets;
}

async function v2Tvl(block, borrowed, api = sdk.api.abi) {
  let balances = {};
  let markets = await getMarkets(block, api);

  // Get V2 tokens locked
  const calls = markets.map((market) => ({
    target: market.cToken,
  }));
  const v2Locked = await getv2Locked(calls, block, api, borrowed);

  markets.forEach((market, index) => {
    const _underlying = transformAdress(market.underlying);
    balances[_underlying] = BigNumber(balances[_underlying] || 0)
      .plus(v2Locked[index])
      .toFixed();
  });
  return balances;
}

async function borrowed(timestamp, block, chainBlocks, { api }) {
  const balances = await v2Tvl(block, true, api);
  return balances;
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = await v2Tvl(block, false, api);
  return balances;
}

module.exports = {
  btr: {
    tvl,
    borrowed,
  },
};
