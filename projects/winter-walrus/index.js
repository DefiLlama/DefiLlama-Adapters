const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const PACKAGE_ID = '0x29ba7f7bc53e776f27a6d1289555ded2f407b4b1a799224f06b26addbcd1c33d';

const WAL_TYPE = ADDRESSES.sui.WAL;

const tvl = async (api) => {
  const states = await sui.getObjectsByType(`${PACKAGE_ID}::blizzard_inner_protocol::BlizzardStateV1`);

  states.forEach(state => {
  api.add(WAL_TYPE, state.fields.total_wal_value);   
  });

}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
}