const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  moonriver: [
    {
      ADDRESS: "0xc24D43093b44b7A9657571DDB79FEdf014eaef7d",
      UNDERLYING: ADDRESSES.moonriver.USDC,
    },
  ],
  fantom: [
    {
      ADDRESS: "0x3938411fd77A5458721aF6B080b51008394568ef",
      UNDERLYING: ADDRESSES.fantom.USDC_L0,
    },
  ],
};
