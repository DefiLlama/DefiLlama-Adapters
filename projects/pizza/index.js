const utils = require("../helper/utils");
const {lendingMarket} = require("../helper/methodologies")

async function eos() {
  const lend = await utils.fetchURL("https://pizza-api-v2.bitzhihu.com/v1/lendv2/overview")
  const tvl = lend.data.total_deposit;
  return tvl
}

async function fetch() {
  return await eos()
}

module.exports = {
  methodology: `${lendingMarket}. Pizza TVL is achieved by making a call to its Pizza API V2.`,
  eos: {
    tvl: () => 0,
  },
  hallmarks: [
    [Math.floor(new Date('2023-02-16')/1e3), 'Product is winding down'],
  ],
}
