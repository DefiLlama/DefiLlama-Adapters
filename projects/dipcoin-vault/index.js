const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");

const http = require("../helper/http");

async function suiTvl(api) {
  const vaults = (
    await http.get(
      "https://gray-api.dipcoin.io/api/perp-vault-api/public/vaults"
    )
  )?.data;
  vaults.forEach((i) => {
    api.add(ADDRESSES.sui.USDC, BigNumber(i.tvl).div(1e12).toNumber());
  });
}

module.exports = {
  sui: {
    tvl: suiTvl,
  },
  hallmarks: [["2026-01-13", "Launched the Vault Mainnet (v1.0)."]],
};
