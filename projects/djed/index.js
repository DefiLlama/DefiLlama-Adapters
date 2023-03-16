const { getAdaInAddress } = require("../helper/chain/cardano");

async function tvl() {
  const adaTvl = await getAdaInAddress("addr1z9s3v9vyyctzr4xagvrayw87yvzre6qcq7qw2uvqfznf92qm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0q2jjlf4")
  return {
    cardano: adaTvl,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
