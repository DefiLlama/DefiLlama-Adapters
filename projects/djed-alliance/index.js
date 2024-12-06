const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { sumTokensExport } = require("../helper/chain/cardano");




module.exports = {
  methodology: 'The TVL of Djed is the reserve belonging to the deployment. The TVL within a given blockchain is the sum of the TVLs of all known Djed deployments within that blockchain.',
  
  cardano: {
    tvl: sumTokensExport({ owner: 'addr1zx82ru5f7p8ewhhdvahueg2s4gxs3gxl66fkygdekkjs74sm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0q4vpw0l', tokens: ['lovelace']}),
  },
};
