const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { sumTokensExport } = require("../helper/chain/cardano");




module.exports = {
  methodology: 'The TVL of Djed is the reserve belonging to the deployment. The TVL within a given blockchain is the sum of the TVLs of all known Djed deployments within that blockchain.',
  
  cardano: {
    tvl: sumTokensExport({ owner: 'addr1z8mcpc26j64fmhhd6sv5qj5mk9xqnfxgm6k8zmk7h2rlu4qm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0qhxg9gt', tokens: ['lovelace']}),
  },
};
