const SMART_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c'
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  start: 14005585,
  methodology: "We count of smart contract balance in coins",
  csc: {
    tvl: sumTokensExport({ chain: 'csc', owner: SMART_CONTRACT, tokens: [nullAddress]}),
  },
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: SMART_CONTRACT, tokens: [nullAddress] }),
  }
}; 