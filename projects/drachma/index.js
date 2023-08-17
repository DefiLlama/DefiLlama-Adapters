const sdk = require("@defillama/sdk");
const contracts = require('./contracts.json');
const { sumTokens2 } = require('../helper/unwrapLPs')

const { compoundExports } = require("../helper/compound");
const comptroller = "0xB6ef08Ffbbb0691a3D9E6c41db4b1d2F97D8D49a";

//tvl for drachma farm
const { tvl: drachmaTvl, borrowed: drachmaBorrowed } = compoundExports(
  comptroller,
  "metis"
);

//tvl for drachma app
function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
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