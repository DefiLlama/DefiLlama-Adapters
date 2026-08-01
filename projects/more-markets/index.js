const { aaveExports } = require('../helper/aave');
const { mergeExports } = require("../helper/utils");

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the MORE Markets contracts`,
};

const config = {
  flow: {
    moreAaveForkMarkets: ["0x79e71e3c0EDF2B88b0aB38E9A1eF0F6a230e56bf", "0xF580F6F3A2223Db22294c2241c7e0Cc401d20659"],
  },
};

Object.keys(config).forEach((chain) => {
  const { moreAaveForkMarkets = [] } = config[chain];

  const chainObjects = []
  moreAaveForkMarkets.forEach((i) => {
    chainObjects.push(aaveExports(chain, '', undefined, [i], { v3: true }))
  })

  module.exports[chain] = mergeExports(chainObjects.map(i => ({ [chain]: i })))[chain]
})