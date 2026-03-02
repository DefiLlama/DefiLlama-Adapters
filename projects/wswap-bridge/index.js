const BigNumber = require("bignumber.js");
const { fixBalancesTokens } = require("../helper/tokenMapping");

const WCHAIN_BRIDGED_ADDRESSES = [
  "0x4560d5eb0c32a05fa59acd2e8d639f84a15a2414",
  "0x6cdfda79787caa4ad1a95456095bedc95abd2d75",
  "0xd4f93cacd6d607789c8ecf1dddeba8b0c4d915a8",
  "0x9b4805dc867c279a96f3ed0745c8bc15153a22e6",
  "0x0ab978880d3bf13e448f4f773acd817e83bddb0e",
  "0x40cb2cccf80ed2192b53fb09720405f6fe349743",
  "0x643ec74ed2b79098a37dc45dcc7f1abfe2ade6d8",
];

const WCHAIN_BRIDGED_TOKENS = WCHAIN_BRIDGED_ADDRESSES.map((address) => ({
  address,
  ...(fixBalancesTokens.wchain[address] || {}),
})).filter(({ coingeckoId, decimals }) => coingeckoId && decimals !== undefined);

async function wchainTvl(_, _b, _cb, { api }) {
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: WCHAIN_BRIDGED_TOKENS.map(({ address }) => ({ target: address })),
  });

  const balances = {};
  WCHAIN_BRIDGED_TOKENS.forEach(({ coingeckoId, decimals }, index) => {
    const supply = supplies[index];
    if (!supply || supply === "0") return;

    const key = `coingecko:${coingeckoId}`;
    const amount = new BigNumber(supply).div(new BigNumber(10).pow(decimals)).toNumber();
    balances[key] = (balances[key] || 0) + amount;
  });

  return balances;
}

module.exports = {
  methodology:
    "Bridge TVL counts totalSupply of WChain bridged tokens, mapped to coingecko IDs for pricing",
  misrepresentedTokens: true,
  wchain: {
    tvl: wchainTvl,
  },
};
