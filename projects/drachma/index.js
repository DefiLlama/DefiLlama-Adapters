const sdk = require("@defillama/sdk");
const contracts = {
    "usdc": {
      "metis": "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21"
    },
    "metis": [
      {
        "address": "0xF3f03c110e01dE844fE8a608063bDC9b6c6cdC9f",
        "token": "0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC",
        "currency": "m.USDT"
      }
    ]
  };
const { sumTokens2 } = require('../helper/unwrapLPs')

const { compoundExports } = require("../helper/compound");
const comptroller = "0xB6ef08Ffbbb0691a3D9E6c41db4b1d2F97D8D49a";

//tvl for drachma farm
const { tvl: drachmaTvl, borrowed: drachmaBorrowed } = compoundExports(comptroller,);

//tvl for drachma app
function tvl(chain) {
  return async (api) => {
    const toa = []
    toa.push(...contracts[chain].map(c => ([c.token, c.address])))
    toa.push(...contracts[chain].map(c => ([contracts.usdc[chain], c.address])))
    return sumTokens2({ chain, tokensAndOwners: toa, api, resolveLP: true, })
  };
}

module.exports = {
  metis: {
    tvl: sdk.util.sumChainTvls([drachmaTvl, tvl("metis")]),
    borrowed: drachmaBorrowed,
  },
};


module.exports.metis = { tvl: tvl("metis") }