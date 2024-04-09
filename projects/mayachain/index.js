const ADDRESSES = require('../helper/coreAssets.json')
const { getCache, get } = require("../helper/http");
const sdk = require("@defillama/sdk");
const { nullAddress } = require("../helper/tokenMapping");

const chainMapping = {
  ETH: "ethereum",
  KUJI: "kujira",
  BTC: "bitcoin",
  THOR: "thorchain",
  DASH: "dash",
};

const tokenGeckoMapping = {
  "ETH.USDT": "tether",
  "ETH.WSTETH": "wrapped-steth",
  "ETH.ETH": "ethereum",
  "ETH.USDC": "usd-coin",
  "KUJI.USK": "usk",
  "KUJI.KUJI": "kujira",
  "THOR.RUNE": "thorchain",
  "DASH.DASH": "dash",
  "BTC.BTC": "bitcoin",
};

const tokenToDecimalMapping = {
  "ETH.USDT": 6,
  "ETH.WSTETH": 18,
  "ETH.ETH": 18,
  "ETH.USDC": 6,
  "KUJI.USK": 8,
  "KUJI.KUJI": 8,
  "THOR.RUNE": 8,
  "DASH.DASH": 8,
};

async function tvl(api) {
  const pools = await getCache("https://midgard.mayachain.info/v2/pools");
  const aChain = api.chain;

  const balances = {};
  await Promise.all(pools.map(addPool));
  return balances;

  async function addPool({ asset: pool, assetDepth, runeDepth }) {
    if (aChain === "mayachain") {
      sdk.util.sumSingleBalance(balances, "cacao", runeDepth / 1e10);
      return;
    }

    if (+assetDepth < 1) return;

    let [chainStr, token] = pool.split(".");
    let chain = chainMapping[chainStr];
    if (chain !== aChain) return;

    let [baseToken, address] = token.split("-");
    if (chain === "ethereum") {
      assetDepth =
        assetDepth *
        10 ** (+tokenToDecimalMapping[chainStr + "." + baseToken] - 8);

      // e.g. ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48
      address = address && address.includes('-') ? address.split("-")[1] : address
      if (address && address.startsWith("0X")) {
        address = address.toLowerCase();
        sdk.util.sumSingleBalance(balances, address, assetDepth, chain);

        // eg ETH.ETH
      } else if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, nullAddress, assetDepth, chain);
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(
          balances,
          tokenGeckoMapping[pool],
          assetDepth / 1e8
        );
      } else {
        sdk.log("skipped", pool, Number(assetDepth).toFixed(2));
      }
    } else {
      // e.g KUJI.KUJI
      if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, chain, assetDepth / 1e8);
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(
          balances,
          tokenGeckoMapping[pool],
          assetDepth / 1e8
        );
      } else {
        sdk.log("skipped", pool, assetDepth);
      }
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts assets locked in Asgard vaults on other chains + CACAO in LPs on Mayachain",
  mayachain: {
    tvl,
  },
};

Object.values(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
