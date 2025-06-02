const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/unwrapLPs");

const FlareUSDCe=ADDRESSES.rari.USDC_e;
const FlareSFLR="0x12e605bc104e93B45e1aD99F9e555f659051c2BB";
const FlareUSDT0="0xe7cd86e13AC4309349F30B3435a9d337750fC82D"

async function FlareTvl(api) {
  const tokens = [nullAddress, FlareUSDCe, FlareSFLR, FlareUSDT0];
  const owners = ["0xF59b51cB430736E0F344b0101b23981DEaE10968"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  flare: {
    tvl: FlareTvl,
  },
};
