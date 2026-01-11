const { function_view } = require("../helper/chain/aptos");

const strategyModuleList = ['aries_strategy', 'aries_strategy_fa', 'cellana_strategy', 'cellana_strategy_fa', 'lsd_strategy']
const strategyAddress = '0xf52c075a823612700387d175f466f4e9b8016ed55191c52539ab78dc6698ca7f'
async function getTVL() {
  const responses = await Promise.all(
    strategyModuleList.map(moduleName => function_view({ functionStr: `${strategyAddress}::${moduleName}::get_strategy_data` }))
  );
  const total = responses.reduce((sum, res) => sum + Number(res.tvl), 0);
  return total;
}

module.exports = {
  aptos: {
    tvl: async (api) => {
      const data = await getTVL();
      api.add('0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec::abtc::ABTC', data);
    }
  },
};
