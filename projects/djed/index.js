const { getAdaInAddress } = require("../helper/chain/cardano");

async function tvl() {
  const adaTvl = await getAdaInAddress("addr1z8297ay4dlcdngmat86080adn8f8jlvveammehrunpx60aqm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0qnm8ly0")
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
