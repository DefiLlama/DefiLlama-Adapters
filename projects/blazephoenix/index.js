const BZPX_TOKEN = "0x23113e72165a034265Ab8Bf2277CCB7a85Cb7483";
const STAKING_CONTRACT = "0x3f60000000000000000000000000000000000c77";

async function staking(api) {
  return api.sumTokens({
    owner: STAKING_CONTRACT,
    tokens: [BZPX_TOKEN],
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  base: {
    tvl: () => ({}),
    staking,
  },
};
