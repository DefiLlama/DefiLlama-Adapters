const alephium = require("../helper/chain/alephium");

const ALPH_ID = "0000000000000000000000000000000000000000000000000000000000000000";
const XALPH_ID = "6dc961b59aae53c768fe6f608e6bea30f6747041af3fd800c8c6533766e54f00";
const XALPH_ADDRESS = alephium.addressFromContractId(XALPH_ID);
const GET_XALPH_BACKING = 13;

async function tvl(api) {
  const [xAlphBacking] = await alephium.contractMultiCall([
    { group: 0, address: XALPH_ADDRESS, methodIndex: GET_XALPH_BACKING },
  ]);
  api.add(ALPH_ID, xAlphBacking.returns[0].value);
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology: "TVL is the ALPH locked in the xALPH contract and backing issued xALPH.",
  alephium: { tvl },
};
