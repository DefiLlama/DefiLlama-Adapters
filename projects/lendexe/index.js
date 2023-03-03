const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { lendingMarket } = require("../helper/methodologies");

// ask comptroller for all markets array
async function getAllXTokens(block) {
  return (
    await sdk.api.abi.call({
      block,
      target: "0x2c7b7A776b5c3517B77D05B9313f4699Fb38a8d3",
      params: [],
      abi: abi["getAllMarkets"],
    })
  ).output;
}

// set correct decimals for non 18 decimals tokens
const marketsToDecimals = [
  {
    underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    xToken: "0x9AfB0453C3A502f92eA5d77bd9cc41f9E4fAC2Fb",
  },
  {
    underlying: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
    xToken: "0xb76c6A28a8b45CbfEA97E117157c878b2935126f",
  },
  {
    underlying: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    decimals: 8,
    xToken: "0xCD302d89D0eB060A59D528c20D53242E988212Fe",
  },
];

// returns {[underlying]: {xToken, decimals, symbol}}
async function getMarkets(block) {
  const markets = [
    {
      underlying: "0x0000000000000000000000000000000000000000", // ETH
      symbol: "ETH",
      decimals: 18,
      xToken: "0x36e66547E27a5953F6Ca3d46cc2663d9d6bDC59e",
    },
  ];
  const allXTokens = await getAllXTokens(block);
  const calls = allXTokens
    .filter((i) => i !== "0x36e8674d99a527e30fb33A6476fEBe6298990b57") // Deprecated BNB market
    .map((i) => ({ target: i }));
  const { output } = await sdk.api.abi.multiCall({
    abi: abi["underlying"],
    calls,
    block,
  });
  const decimals = [];
  marketsToDecimals.forEach((i) => (decimals[i.underlying] = i.decimals));
  output.forEach(({ input: { target: xToken }, output: underlying }) =>
    markets.push({ xToken, underlying, decimals: decimals[underlying] || 18 })
  );
  console.log(markets);
  return markets;
}

async function getTvl(balances, block, borrowed) {
  let markets = await getMarkets(block);
  let locked = await sdk.api.abi.multiCall({
    block,
    calls: markets.map((market) => ({
      target: market.xToken,
    })),
    abi: borrowed ? abi.totalBorrows : abi["getCash"],
  });
  markets.forEach((market) => {
    let getCash = locked.output.find(
      (result) => result.input.target === market.xToken
    );
    balances[market.underlying] = BigNumber(balances[market.underlying] || 0)
      .plus(getCash.output)
      .div(10 ** (18 - market.decimals))
      .toFixed();
  });
  return balances;
}

async function borrowed(timestamp, block) {
  const balances = {};
  await getTvl(balances, block, true);
  return balances;
}
async function tvl(timestamp, block) {
  let balances = {};
  await getTvl(balances, block, false);
  return balances;
}

module.exports = {
  timetravel: true,
  hallmarks: [[1677538800, "Live on Ethereum mainnet"]],
  ethereum: {
    tvl,
    borrowed,
  },
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
