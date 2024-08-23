const { get } = require("../helper/http");
const { get_account_tvl } = require("../helper/chain/eos");
const { sumTokens2 } = require("../helper/solana");
const { sumTokensExport } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const ADDRESSES = require("../helper/coreAssets.json");

const chintaiSymbolToCoinGeckoIds = {
  CHEX: "chex-token",
  BTC: "bitcoin",
  ETH: "ethereum",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",
};


async function eosTvl() {
  const tokens = [
    ["chexchexchex", "CHEX", "chex-token"],
  ];
  return await get_account_tvl(["bridge.chex"], tokens);
}

const scaleValue = (value, times = 1) =>
  BigNumber(value).times(times).toFixed(0);

async function toBalances(symbol, value) {
  const address = ADDRESSES.ethereum[symbol];
  if (!address) {
    console.error("Could not find address for:", symbol);
    return null;
  }

  const decimals = (
    await sdk.api.abi.call({
      target: address,
      abi: "erc20:decimals",
      chain: "ethereum",
    })
  ).output;

  return {
    [address]: scaleValue(value, 10 ** decimals),
  };
}

async function chintaiTvl() {
  const stats = await get("https://sg.app.chintai.io/api/stats");

  const balances = {};
  for (const [symbol, supply] of Object.entries(stats.tokenBalances)) {
    const balance = await toBalances(symbol, supply);
    if (balance) {
      Object.assign(balances, balance);
    } else {
      const coinGeckoId = chintaiSymbolToCoinGeckoIds[symbol];
      if (!coinGeckoId) {
        console.error("Could not find CoinGecko ID for:", symbol);
        continue;
      }
      await sdk.util.sumSingleBalance(balances, coinGeckoId, supply, "");
    }
  }

  return balances;
}

module.exports = {
  methodology:
    "Chintai TVL is achieved by querying the USD value of all the asset issued and staked on the Chintai platform.",

  eos: {
    tvl: eosTvl,
  },
  chintai: {
    tvl: chintaiTvl,
  },
};
