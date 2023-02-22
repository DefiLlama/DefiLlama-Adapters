const sdk = require("@defillama/sdk");
const PERC = "0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268";

async function tvl(_1, _2, chainBlocks) {
  const totalAssets = (
    await sdk.api.abi.call({
      target: PERC,
      abi: "function balanceOf(address account) view returns (uint256 balance)",
      block: chainBlocks.ethereum,
      chain: "ethereum",
      params: ["0xf64F48A4E27bBC299273532B26c83662ef776b7e"]
    })
  ).output;
  return {
    [PERC]: totalAssets,
  };
}

module.exports = {
  methodology: `Counts staked PERC.`,
  ethereum: {
    tvl,
  },
};