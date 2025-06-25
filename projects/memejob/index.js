
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const MEMEJOB_CONTRACT = "0x950230ea77Dc168df543609c2349C87dea57e876";

module.exports = {
  methodology: "TVL is represented by all HBAR held in active bonding curves within MemeJob.",
  hedera: {
    tvl: sumTokensExport({ owner: MEMEJOB_CONTRACT, tokens: [ADDRESSES.null] }),
  },
};