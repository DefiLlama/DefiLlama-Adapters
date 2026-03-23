const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");

const VAULT_CONFIG_ID =
  "0x69bae0c198f83acf12656a247dfe85467819139560968669f14b4df0abe8efd7";

async function suiTvl(api) {
  const vaultConfig = await sui.getObject(VAULT_CONFIG_ID);
  const vaultIds = vaultConfig?.fields?.registry?.fields?.ids?.fields?.contents || [];
  for (const vaultId of vaultIds) {
    const vault = await sui.getObject(vaultId);
    const lastSharePrice = BigNumber(vault?.fields?.last_share_price || 0);
    const totalShares = BigNumber(vault?.fields?.total_shares || 0);
    const tvl = lastSharePrice.multipliedBy(totalShares).div(1e12);

    api.add(ADDRESSES.sui.USDC, tvl.toNumber());
  }
}

module.exports = {
  sui: {
    tvl: suiTvl,
  },
  hallmarks: [["2026-01-13", "Launched the Vault Mainnet (v1.0)."]],
};
