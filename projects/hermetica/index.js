const { get } = require('../helper/http')

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks and Bitcoin (Runes).',
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      const { totalSupplyOnRunes } = await get('https://app.hermetica.fi/api/v1/usdh/supply?break_down=true');
      const cleanUsdhSupplyOnRunes = Math.round(Number(totalSupplyOnRunes.replace(/[^\d.]/g, '')));
      return { usdh: cleanUsdhSupplyOnRunes }
    }
  },
  stacks: {
    tvl: async () => {
      const { totalSupplyOnStacks } = await get('https://app.hermetica.fi/api/v1/usdh/supply?break_down=true');
      const cleanUsdhSupplyOnStacks = Number(totalSupplyOnStacks.replace(/[^\d.]/g, ''));
      return { usdh: cleanUsdhSupplyOnStacks }
    }
  }
}