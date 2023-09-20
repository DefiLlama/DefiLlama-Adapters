const sdk = require("@defillama/sdk");
const { nullAddress } = require('../helper/unwrapLPs');
const chain = 'klaytn'

const SCNR = {
  GCKLAY: '0x999999999939ba65abb254339eec0b2a0dac80e9'
}

module.exports = {
  klaytn: {
    tvl: async (_, _b, {klaytn:block}) => {
      const gcklayBal = await sdk.api2.abi.call({
        target: SCNR.GCKLAY,
        abi: 'erc20:totalSupply',
        chain, block,
      })

      const balances = {}
      sdk.util.sumSingleBalance(balances, nullAddress, gcklayBal, chain)
      return balances;
    }
  },
  timetravel: false,
}
