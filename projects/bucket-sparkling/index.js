const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const SPARKLING_SBUCK_FLASK_ID =
  "0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8";

async function tvl(api) {
  const object = await sui.getObject(SPARKLING_SBUCK_FLASK_ID);
  const reserve = object.fields.reserves;
  api.add(ADDRESSES.sui.BUCK, reserve);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
  },
};
