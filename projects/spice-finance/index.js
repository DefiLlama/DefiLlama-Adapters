const VAULT = "0x6110d61DD1133b0f845f1025d6678Cd22A11a2fe";

async function tvl(_1, _2, chainBlocks, { api }) {
  return {
    "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": await api.call({ target: VAULT, abi: 'uint256:totalAssets'}),
  };
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts WETH deposited to earn yield via NFT lending.`,
  ethereum: {
    tvl,
  },
};
