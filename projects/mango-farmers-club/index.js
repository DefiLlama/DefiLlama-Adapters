const { fetchURL } = require("../helper/utils");

module.exports = {
  polygon_zkevm: {
    staking: async (api) => {
      const stakingBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: '0x1fa03edb1b8839a5319a7d2c1ae6aae492342bad',
        params: "0xdd38211f2973dc41cd6fC4DB681596Fd6118D894",
      });
      const { price : mangoPrice } = (await fetchURL('https://prod.clober-api.com/1101/markets/0x1FC38BA10E741F357b1c8B69DC08eA654c21Ae37/trades?limit=1')).data.trades[0]
      return {
        tether: mangoPrice * stakingBalance /1e18
      }
    },
    tvl: () => ({})
  }
};
