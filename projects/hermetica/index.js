const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { makeReadOnlyContractCall } = require('./stacks-call')

const USDhContract = ADDRESSES.stacks.USDh;

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks and Bitcoin (Runes).',
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      const [supply, uUSDhSupplyStacks] = await Promise.all([
        get('https://app.hermetica.fi/api/v1/usdh/supply'),
        makeReadOnlyContractCall({ contract: USDhContract, function_name: 'get-total-supply' })
      ]);

      const cleanUsdhSupply = supply.result.replace(/[^\d.]/g, '');
      const totaluUSDhSupply = Number(cleanUsdhSupply) * (10 ** 8);
      const sUSDhSupplyRunes = totaluUSDhSupply - uUSDhSupplyStacks;

      return { 'hermetica-usdh': sUSDhSupplyRunes / (10 ** 8) }
    }
  },
  stacks: {
    tvl: async () => {
      const supplyOnStacksuUsdh = await makeReadOnlyContractCall({
        contract: USDhContract,
        function_name: 'get-total-supply'
      });

      return { 'hermetica-usdh': supplyOnStacksuUsdh / (10 ** 8) }
    }
  },
  misrepresentedTokens: true
}
