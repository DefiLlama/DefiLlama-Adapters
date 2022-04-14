const { getReserves, getStarlayTvl } = require("./starlay");
const BigNumber = require("bignumber.js");
const { getV2Borrowed } = require("../helper/aave");

const tokens = {
  // WASTR
  "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": "astar",
  // WETH
  "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c":
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  // wBTC
  "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA":
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  // SDN
  "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4": "shiden",
  // USDC
  "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // USDT
  "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // DAI
  "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // BUSD
  "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": "binance-usd",
  // LAY
  "0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd": "LAY",
};

function asKnownAs(underlying) {
  const idx = Object.keys(tokens).indexOf(underlying);
  return Object.values(tokens)[idx];
}

function astar(borrowed) {
  return async (timestamp, block) => {
    const balances = {};
    const [lTokens, reserveTokens, validProtocolDataHelpers] =
      await getReserves(block);
    const transferFromAddress = (id) => asKnownAs(id);
    const chain = "astar";

    if (borrowed) {
      await getV2Borrowed(
        balances,
        block,
        chain,
        reserveTokens,
        validProtocolDataHelpers,
        transferFromAddress
      );
    } else {
      await getStarlayTvl(
        balances,
        block,
        chain,
        lTokens,
        reserveTokens,
        transferFromAddress
      );
    }

    const res = Object.keys(balances).map((key, index) => {
      console.log("key", key);
      if (key.startsWith("0x")) return { symbol: key, balance: balances[key] };
      return {
        symbol: key,
        balance: BigNumber(balances[key])
          .div(10 ** 18)
          .toFixed(0),
      };
    });
    return Object.fromEntries(res.map((e) => [e.symbol, e.balance]));
  };
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.`,
  astar: {
    tvl: astar(false),
    borrowed: astar(true),
  },
};
