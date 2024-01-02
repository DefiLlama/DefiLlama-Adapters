const { queryContract, getDenomBalance } = require("../helper/chain/cosmos");

const config = {
  sei: {
    coingeckoId: "sei-network",
    hub: "sei1swe2fy3t49j2c2xl8l64ldjaqyr6khmaya60pl5kr4em2v2jp0ysa3xjum",
    seilorLps: [
      {
        name: "SEILOR-USEI-LP",
        lp: "sei1cw59j944v9uvseq3jz67tft7p92yhnff0l52eek3d5qnxj908wpqz4vrr8",
        pair: "sei13pzdhenzugwa02tm975g2y5kllj26rf4x4ykpqtrfw2h4mcezmmqz06dfr",
        staking: "sei17na3tj5mjnz0f4s3gqa3eqykzp4qk5qz4uvmz7hzak2zwyh5ym7s7ljcay"
      }
    ]
  }
};

module.exports = {
  timetravel: false
};

Object.keys(config).forEach(chain => {
  const { coingeckoId, hub, seilorLps } = config[chain];
  
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      // Logic for calculating TVL excluding staked LP tokens
      const { total_bond_stsei_amount } = await queryContract({ contract: hub, chain, data: { state: {} } });
      api.add(coingeckoId, total_bond_stsei_amount / 10 ** 6, { skipChain: true });
      return api.getBalances();
    },
    pool2: async (_, _b, _cb, { api }) => {
      // Logic for calculating the value of staked LP tokens
      for (const { lp, pair, staking } of seilorLps) {
        const lpUseiBalance = await getDenomBalance({ denom: "usei", owner: pair, chain });
        const lpTokenInfo = await queryContract({ contract: lp, chain, data: { token_info: {} } });
        const stakingState = await queryContract({ contract: staking, chain, data: { query_staking_state: {} } });

        const lpTotalValue = 2 * lpUseiBalance / 10 ** 6;
        const staked = stakingState.total_supply / lpTokenInfo.total_supply * lpTotalValue;
        api.add(coingeckoId, staked, { skipChain: true });
      }
      return api.getBalances();
    }
  };
});
