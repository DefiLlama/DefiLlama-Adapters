const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/stacks-api')

const USDhContract = ADDRESSES.stacks.USDh;

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const supplyResult = await call({ target: USDhContract, abi: 'get-total-supply' });
      const supply = Number(supplyResult.value) / 1e8;

      return { tether: supply }
    }
  },
}