const space = "0x353af195c0d82820c59427BFbD318A49971AAe1a";
const stakingV1 = "0x910F038C9E74dF8baEd886a22f75C69FaE8a6792";
const stakingV2 = "0x073d3F4Ed6cb32Bd7f6F7B6da4C25672ee76c95B";

async function staking(api) {
  return api.sumTokens({ tokens: [space], owners: [stakingV1, stakingV2, ] })
}

module.exports = {
  deadFrom: "04-06-2023",
  avax:{
    tvl: () => ({}),
    staking,
  },
};
