const xaiAddress = "0x35e78b3982e87ecfd5b3f3265b601c046cdbe232";
const svxaiAddress = "0x3808708e761b988d23ae011ed0e12674fb66bd62";

async function tvl(api) {
  const supply = await api.call({  abi:'erc20:totalSupply' , target: svxaiAddress })
  api.add(xaiAddress, supply)
}

module.exports = {
  methodology: "Sum of XAI tokens held by stakers",
  ethereum: {
    tvl: () => ({}),
    staking: tvl,
  },
};
