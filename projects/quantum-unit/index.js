const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')
const QUANTUM_UNIT_CONTRACT = "0x81889aec6fdc400ec9786516c3adc14d59fc361e";

module.exports = {
  methodology: 'count all contract balance',
  bsc: {
    tvl: sumTokensExport({ owner: QUANTUM_UNIT_CONTRACT, tokens: [ADDRESSES.null] }),
  }
};
