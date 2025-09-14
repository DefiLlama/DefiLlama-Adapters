const { get } = require("../helper/http");
const ADDRESSES = require("../helper/coreAssets.json");

async function tvl(api) {
  const data = await get("https://syntropia.ai/api/balances/aum");
  const tvl = data.aum;

  api.add(ADDRESSES.ethereum.USDC, tvl);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `
The methodology for calculating TVL includes value of all assets in Syntropia strategies expressed in USDC
  `.trim(),
  ethereum: {
    tvl,
  },
};
