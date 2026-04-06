const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { call } = require('../helper/chain/stacks-api')

const USDhContract = ADDRESSES.stacks.USDh;

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks and Bitcoin (Runes).',
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      const [supply, uUSDhSupplyStacks] = await Promise.all([
        get('https://app.hermetica.fi/api/v1/usdh/supply'),
        call({ target: USDhContract, abi: 'get-total-supply' })
      ]);

      const cleanUsdhSupply = supply.result.replace(/[^\d.]/g, '');
      const totaluUSDhSupply = Number(cleanUsdhSupply) * (10 ** 8);
      const sUSDhSupplyRunes = totaluUSDhSupply - Number(uUSDhSupplyStacks.value);

      return { 'hermetica-usdh': sUSDhSupplyRunes / (10 ** 8) }
    }
  },
  stacks: {
    tvl: async () => {
      const supplyOnStacksuUsdh = await call({ target: USDhContract, abi: 'get-total-supply' });

      return { 'hermetica-usdh': Number(supplyOnStacksuUsdh.value) / (10 ** 8) }
    }
  },
  misrepresentedTokens: true
}
