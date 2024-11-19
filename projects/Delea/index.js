const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  methodology: 'Counts Delea smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: ["EQB6rkS8xt3Ey4XugdVqQDe1vt4KJDh813_k2ceoONTCBnyD", "EQCwIIRKpuV9fQpQxdTMhLAO30MNHa6GOYd00TsySOOYtA9n", "EQA2OzCuP8-d_lN2MYxLv5WCNfpLH1NUuugppOZBZgNYn-aa", "EQCgGUMB_u1Gkrskw2o407Ig8ymQmfkxWuPW2d4INuQoPFJO"], tokens: [ADDRESSES.null]}),
  }
}
