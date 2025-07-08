const {lendingMarket} = require("../helper/methodologies")

module.exports = {
  methodology: `${lendingMarket}. Pizza TVL is achieved by making a call to its Pizza API V2.`,
  eos: {
    tvl: () => 0,
  },
  hallmarks: [
    ['2023-02-16', 'Product is winding down'],
  ],
  deadFrom: '2023-02-16',
}
