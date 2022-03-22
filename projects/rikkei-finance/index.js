const _ = require("underscore");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const markets = [
  {
    underlying: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    symbol: "BUSD",
    decimals: 8,
    rToken: "0x6db6A55E57AC8c90477bBF00ce874B988666553A",
  },
  {
    underlying: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    symbol: "USDC",
    decimals: 8,
    rToken: "0x916e87d16B2F3E097B9A6375DC7393cf3B5C11f5",
  },
  {
    underlying: "0x55d398326f99059ff775485246999027b3197955",
    symbol: "USDT",
    decimals: 8,
    rToken: "0x383598668C025Be0798E90E7c5485Ff18D311063",
  },
  {
    underlying: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    symbol: "BTC",
    decimals: 18,
    rToken: "0x53aBF990bF7A37FaA783A75FDD75bbcF8bdF11eB",
  },
  {
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    symbol: "DAI",
    decimals: 8,
    rToken: "0x9B9006cb01B1F664Ac25137D3a3a20b37d8bC078",
  },
];

// ask Cointroller for all markets array
async function getAllRTokens(block) {
  return (
    await sdk.api.abi.call({
      chain: "bsc",
      block,
      target: "0x4f3e801Bd57dC3D641E72f2774280b21d31F64e4",
      params: [],
      abi: abi["getAllMarkets"],
    })
  ).output;
}

async function getUnderlying(block, rToken) {
  return (
    await sdk.api.abi.call({
      chain: "bsc",
      block,
      target: rToken,
      abi: abi["underlying"],
    })
  ).output;
}

// returns {[underlying]: {rToken, decimals, symbol}}
async function getMarkets(block) {
  if (block < 10271924) {
    // the allMarkets getter was only added in this block.
    return markets;
  } else {
    let allRTokens = await getAllRTokens(block);

    await Promise.all(
      allRTokens.map(async (rToken) => {
        let foundMarket = false;
        for (let market of markets) {
          if (market.rToken.toLowerCase() === rToken.toLowerCase()) {
            foundMarket = true;
          }
        }
        if (!foundMarket) {
          let underlying = await getUnderlying(block, rToken);
          markets.push({ underlying, rToken });
        }
      })
    );

    return markets;
  }
}

async function tvl(balances, block, borrowed) {
  let markets = await getMarkets(block);

  let locked = await sdk.api.abi.multiCall({
    chain: "bsc",
    block,
    calls: _.map(markets, (market) => ({
      target: market.rToken,
    })),
    abi: borrowed ? abi.totalBorrows : abi["getCash"],
  });

  _.each(markets, (market) => {
    let getCash = _.find(
      locked.output,
      (result) => result.input.target === market.rToken
    );

    balances["bsc:" + market.underlying] = BigNumber(
      balances[market.underlying] || 0
    )
      .plus(getCash.output)
      .toFixed();
  });

  return balances;
}

async function borrowed(timestamp, block) {
  const balances = {};
  await tvl(balances, block, true);
  return balances;
}

module.exports = {
  timetravel: true,
  bsc: {
    tvl,
    borrowed,
  },
  methodology: `TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses`,
};
