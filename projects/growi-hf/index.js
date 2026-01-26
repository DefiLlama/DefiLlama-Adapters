const { get } = require("../helper/http");
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_ADDRESS = "0x1e37a337ed460039d1b15bd3bc489de789768d5e";

async function tvl(api) {
  const data = await get("https://stats-data.hyperliquid.xyz/Mainnet/vaults");
  const growiVault = data.find((d) => d.summary?.vaultAddress?.toLowerCase() === VAULT_ADDRESS);
  api.add(ADDRESSES.ethereum.USDC,+growiVault.summary.tvl * 1e6, { skipChain: true });
}
module.exports = {
    methodology: "TVL is calculated directly from Hyperliquid API by getting GrowiHF Vault TVL.",
    timetravel: false,
    hyperliquid: { tvl },
    misrepresentedTokens: true
};