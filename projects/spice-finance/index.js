const sdk = require("@defillama/sdk");

const VAULT = "0x6110d61DD1133b0f845f1025d6678Cd22A11a2fe";

async function tvl(_1, _2, chainBlocks) {
  const totalAssets = (
    await sdk.api.abi.call({
      target: VAULT,
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      block: chainBlocks.ethereum,
      chain: "ethereum",
    })
  ).output;
  const balances = {
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]: totalAssets,
  };
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts WETH deposited to earn yield via NFT lending.`,
  ethereum: {
    tvl,
  },
};
