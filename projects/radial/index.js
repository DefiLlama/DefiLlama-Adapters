const {
  standardPoolInfoAbi,
} = require("../helper/masterchef");
const { sumTokens2 } = require("../helper/unwrapLPs");

const masterChef = "0x6f536B36d02F362CfF4278190f922582d59E7e08";
const stakingToken = "0xf04d7f53933becbf51ddf1f637fe7ecaf3d4ff94";

async function tvl(api) {
  const info = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: standardPoolInfoAbi, target: masterChef })
  return sumTokens2({ api, owner: masterChef, tokens: info.map(i => i.lpToken), blacklistedTokens: [stakingToken] })
}

module.exports = {
  fantom: {
    tvl,
  },
}