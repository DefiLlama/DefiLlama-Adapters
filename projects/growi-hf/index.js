const { get, post } = require("../helper/http");
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_ADDRESS = "0x1e37a337ed460039d1b15bd3bc489de789768d5e";
const HIBACHI_VAULT_ID = 2;

async function hyperliquid_tvl(api) {
  const data = await post("https://api.hyperliquid.xyz/info", {
    type: "vaultDetails",
    vaultAddress: VAULT_ADDRESS,
  });

  const allTime = data.portfolio.find(([p]) => p === "allTime")[1];
  const tvlUsd = Number(allTime.accountValueHistory.at(-1)[1]);

  api.add('arbitrum:' + ADDRESSES.arbitrum.USDC_CIRCLE, tvlUsd * 1e6, { skipChain: true });
}

async function hibachi_tvl(api) {
  const data = await get(`https://data-api.hibachi.xyz/vault/performance?vaultId=${HIBACHI_VAULT_ID}&timeRange=All`);
  const tvlUsd = Number(data.vaultPerformanceIntervals[data.vaultPerformanceIntervals.length - 1].totalValueLocked);

  api.add('arbitrum:' + ADDRESSES.arbitrum.USDT, tvlUsd * 1e6, { skipChain: true });
}

module.exports = {
    methodology: "TVL is the sum of the GrowiHF vault on Hyperliquid (from Hyperliquid API) and the Growi Alpha Vault (GAV) on Hibachi (latest totalValueLocked from Hibachi data API).",
    timetravel: false,
    hyperliquid: { tvl: hyperliquid_tvl },
    hibachi: { tvl: hibachi_tvl },
    misrepresentedTokens: true
};