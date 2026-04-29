const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/stacks-api')

const USDhContract = ADDRESSES.stacks.USDh;

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const supplyOnStacksuUsdh = await call({ target: USDhContract, abi: 'get-total-supply' });

      return { 'hermetica-usdh': Number(supplyOnStacksuUsdh.value) / (10 ** 8) }
    }
  },
  misrepresentedTokens: true
}