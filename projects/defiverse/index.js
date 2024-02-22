const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const VAULT_CONTRACT = "0x2FA699664752B34E90A414A42D62D7A8b2702B85";
const TOKENS = [
  {
    symbol: "USDC",
    address: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
    coingeckoId: "usd-coin",
  },
  {
    symbol: "WBTC",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    coingeckoId: "bitcoin",
  },
  {
    symbol: "WETH",
    address: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea",
    coingeckoId: "ethereum",
  },
  {
    symbol: "WOAS",
    address: "0x5a89E11Cb554E00c2f51C4bb7F05bc7Ab0Fa6351",
    coingeckoId: "oasys",
  },
];

async function tvl(_, _b, _cb, { api }) {
  const tokenAddesses = TOKENS.map((x) => x.address);

  const tokenBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: tokenAddesses.map((i) => ({ target: i, params: VAULT_CONTRACT })),
  });
  const singleBalance = {};
  for (let i = 0; i < TOKENS.length; i++) {
    sdk.util.sumSingleBalance(
      singleBalance,
      TOKENS[i].coingeckoId,
      new BigNumber(tokenBalances[i]).div(1e18).toNumber()
    );
  }
  console.log("balances :>> ", singleBalance);

  return singleBalance;
}

module.exports = {
  defiverse: {
    tvl,
  },
};
