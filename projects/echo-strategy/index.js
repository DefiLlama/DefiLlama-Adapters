const { function_view } = require("../helper/chain/aptos");

const strategyModuleList = ['aries_strategy', 'cellana_strategy', 'lsd_strategy']
const strategyAddress = '0xf52c075a823612700387d175f466f4e9b8016ed55191c52539ab78dc6698ca7f'
async function getTVL() {
  try {
    const responses = await Promise.all(
      strategyModuleList.map(moduleName => function_view({ functionStr: `${strategyAddress}::${moduleName}::get_strategy_data` }))
    );
    const total = responses.reduce((sum, res) => sum + Number(res.tvl), 0);
    return {
      aptos: total / 1e10
    }
  } catch (err) {
    console.error('error:', err);
  }
}

module.exports = {
  aptos: {
    tvl: getTVL
  },
};
