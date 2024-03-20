const { aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

module.exports = {
  methodology: methodologies.lendingMarket,
  scroll: aaveExports('scroll', "0xE58Ebf93885c8Ea0368fCe84aF79EC983b80c8D5", undefined, ['0xeB3C203418f0cb55b351C3E45A5C4f47bE5DA77A'], { v3: true }),
}