const { get } = require('../helper/http')
const { stacks } = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/stacks-api')

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks and Bitcoin (Runes).',
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      const usdhSupply = await get('https://app.hermetica.fi/api/v1/usdh/supply');
      const cleanUsdhSupply = usdhSupply.replace(/[^\d.]/g, '');
      const totalUsdhSupply = Number(cleanUsdhSupply);
      const totaluUSDhSupply = totalUsdhSupply * (10 ** 8);
      const contract = stacks.USDh.split('::')[0];
      const stacksBalance = await call({ target: contract, abi: 'get-total-supply' })
      const uUSDhSupplyStacks = Number(stacksBalance.value);
      const sUSDhSupplyRunes = totaluUSDhSupply -  uUSDhSupplyStacks;
      return { usdh: sUSDhSupplyRunes / (10 ** 8) }
    }
  },
  stacks: {
    tvl: async() => {
      const contract = stacks.USDh.split('::')[0];
      const stacksBalance = await call({ target: contract, abi: 'get-total-supply' })
      const uUSDhSupplyStacks = Number(stacksBalance.value);
      return { usdh: uUSDhSupplyStacks / (10 ** 8) }
    }
  }
}