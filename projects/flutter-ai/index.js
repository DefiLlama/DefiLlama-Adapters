
const FLUTTER = "0x22accab42ca2ae6ba110a0aa9ac7abc768266072";

const tvl = async (api) => {
    const stFILSupply = await api.call({ target: FLUTTER, abi: 'erc20:totalSupply' })
    api.add(FLUTTER, stFILSupply)
};

module.exports = {
  methodology: `Flutter AI is Industry-specific AI systems powered by the world's most advanced agents.`,
  ethereum: {
    tvl,
  },
};
