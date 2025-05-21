const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of stables locked in Owna protocol contracts',
};

config.chains.forEach(async chainInfo => {
  const {name: chain, tokens, lendingContract, nftContract} = chainInfo

  module.exports.deadFrom='2023-11-16',
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokens, owners: [lendingContract] }),
    borrowed: () => ({}) // bad debt totalBorrowed,
    //offers: totalOffers,
  }
})



