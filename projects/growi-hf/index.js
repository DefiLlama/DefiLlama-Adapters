const { get } = require("../helper/http");
const ADDRESSES = require('../helper/coreAssets.json')
const { ChainApi } = require('@defillama/sdk');

const VAULT_ADDRESS = "0x1e37a337ed460039d1b15bd3bc489de789768d5e";

async function tvl(api) {
  const data = await get("https://stats-data.hyperliquid.xyz/Mainnet/vaults");
  const growiVault = data.find((d) => d.summary?.vaultAddress?.toLowerCase() === VAULT_ADDRESS);
  api.add(ADDRESSES.ethereum.USDC,+growiVault.summary.tvl * 1e6, { skipChain: true });
}

// we use their api since Hibachi is a privacy oriented chain, output is verified against arbitrum bridge balance
async function hibachiTvl(api) {
  const data = await get("https://data-api.hibachi.xyz/vault/performance?vaultId=2&timeRange=All");
  const latest = data.vaultPerformanceIntervals[data.vaultPerformanceIntervals.length - 1];
  const tvlUsd = Number(latest.totalValueLocked);
  if (!Number.isFinite(tvlUsd)) throw new Error("Invalid Hibachi TVL");

  const ONE_DAY_SECONDS = 24 * 3600;
  if (Date.now() / 1000 - Number(latest.timestamp) > ONE_DAY_SECONDS) throw new Error("Hibachi data stale");

  const arbApi = new ChainApi({chain: 'arbitrum'});
  const bridgeBal = await arbApi.call({target: ADDRESSES.arbitrum.USDT, abi: 'erc20:balanceOf', params: ['0x0E9C1a3AA696299E38b00a8144Bf6dc16C1F5400']})
  if (bridgeBal < tvlUsd * 1e6) throw new Error("Vault tvl is higher than hibachi bridge balance")

  api.add('arbitrum:' + ADDRESSES.arbitrum.USDT, tvlUsd * 1e6, { skipChain: true });
}

module.exports = {
    methodology: "TVL is calculated directly from Hyperliquid API by getting GrowiHF Vault TVL and the Growi Alpha Vault (GAV) on Hibachi (latest totalValueLocked from Hibachi data API).",
    timetravel: false,
    hyperliquid: { tvl },
    hibachi: { tvl: hibachiTvl },
    misrepresentedTokens: true
};