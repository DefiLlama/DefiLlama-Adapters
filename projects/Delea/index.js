const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const ownersList = [
  "EQB6rkS8xt3Ey4XugdVqQDe1vt4KJDh813_k2ceoONTCBnyD",
  "EQCwIIRKpuV9fQpQxdTMhLAO30MNHa6GOYd00TsySOOYtA9n",
  "EQA2OzCuP8-d_lN2MYxLv5WCNfpLH1NUuugppOZBZgNYn-aa",
  "EQCgGUMB_u1Gkrskw2o407Ig8ymQmfkxWuPW2d4INuQoPFJO",
  "EQA6Xba1d30QeSTVW7-cIAq-WHD9ZBFg90dQ7CB8mQ2Cxx25",
  "EQADnjMkZBCS7-zKAPGHwFXGdd8b85m3bRDm52AX__ORLey-"
];

module.exports = {
  methodology: 'Counts Delea smartcontract balance as TVL.',
  misrepresentedTokens: true,
  ton: {
    tvl: sumTokensExport({ owners: ownersList, tokens: [ADDRESSES.null]}),
  }
}
