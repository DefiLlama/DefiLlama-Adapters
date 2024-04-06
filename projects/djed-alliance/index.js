const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { sumTokensExport } = require("../helper/chain/cardano");




module.exports = {
  methodology: 'The TVL of each Djed deployment is the reserve belonging to the deployment. The TVL within a given blockchain is the sum of the TVLs of all known Djed deployments within that blockchain. The total TVL is the sum of the Djed TVLs on all blockchains.',
  
  cardano: {
    tvl: sumTokensExport({ owner: 'addr1zxem3j9xw7gyqnry0mfdhku7grrzu0707dc9fs68zwkln5sm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0qul0eqc', tokens: ['lovelace']}),
  },
};
