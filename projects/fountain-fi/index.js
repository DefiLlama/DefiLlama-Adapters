const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const SBUCK_FOUNTAIN_ID =
  "0xbdf91f558c2b61662e5839db600198eda66d502e4c10c4fc5c683f9caca13359";
const SPARKLING_SBUCK_FLASK_ID =
  "0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8";

async function tvl(api) {
  const object = await sui.getObject(SBUCK_FOUNTAIN_ID);
  const staked = object.fields.staked;

  // calculate sBUCK price
  const flask = await sui.getObject(SPARKLING_SBUCK_FLASK_ID);
  const buck_reserve = flask.fields.reserves;
  const sbuck_supply = flask.fields.sbuck_supply.fields.value;
  const sbuck_to_buck_price = Number(buck_reserve) / Number(sbuck_supply);

  const exchangd_buck = sbuck_to_buck_price * staked;

  api.add(ADDRESSES.sui.BUCK, exchangd_buck);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: () => ({}),
    staking: tvl,
  },
};