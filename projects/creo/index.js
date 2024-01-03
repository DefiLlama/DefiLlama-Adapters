const STAKING = "0x077bd3104413c555Aa985a585CE9D2174349ddc3";

const VESTING = "0xeaEd594B5926A7D5FBBC61985390BaAf936a6b8d";

const TOKEN = "0x9521728bF66a867BC65A93Ece4a543D817871Eb7";

async function vesting(time, ethBlock, _b, { api }) {
  return api.sumTokens({ tokens: [TOKEN], owner: VESTING });
}

async function staking(time, ethBlock, _b, { api }) {
  return api.sumTokens({ tokens: [TOKEN], owner: STAKING });
}

module.exports = {
  methodology: "TVL counted from staking and vesting contracts",
  bsc: {
    tvl: () => ({}),
    staking,
    vesting,
  },
};
