const STAKING = "0x077bd3104413c555Aa985a585CE9D2174349ddc3";

const TOKEN = "0x9521728bF66a867BC65A93Ece4a543D817871Eb7";

async function staking(api) {
  return api.sumTokens({ tokens: [TOKEN], owner: STAKING });
}

module.exports = {
  methodology: "TVL counted from the staking contract",
  bsc: {
    tvl: () => ({}),
    staking,
  },
};
