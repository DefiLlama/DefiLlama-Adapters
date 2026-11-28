const xaiAddress = "0x35e78b3982e87ecfd5b3f3265b601c046cdbe232";
const svxaiAddress = "0x3808708e761b988d23ae011ed0e12674fb66bd62";

// svXAI is an ERC4626 vault over XAI, so its share supply understates the XAI it holds
async function staking(api) {
  return api.sumTokens({ owner: svxaiAddress, tokens: [xaiAddress] })
}

module.exports = {
  methodology: "Sum of XAI tokens held by the svXAI staking vault",
  ethereum: {
    tvl: () => ({}),
    staking,
  },
};
