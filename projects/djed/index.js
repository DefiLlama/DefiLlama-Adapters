const { sumTokensExport } = require("../helper/chain/cardano");

module.exports = {
  timetravel: false,
  cardano: {
    tvl: sumTokensExport({ owner: 'addr1z9s3v9vyyctzr4xagvrayw87yvzre6qcq7qw2uvqfznf92qm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0q2jjlf4', tokens: ['lovelace']}),
  },
};
