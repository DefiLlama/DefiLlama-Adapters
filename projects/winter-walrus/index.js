const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const PACKAGE_ID = '0x29ba7f7bc53e776f27a6d1289555ded2f407b4b1a799224f06b26addbcd1c33d';

const WAL_TYPE = ADDRESSES.sui.WAL;

const tvl = async (api) => {
  const newLSTEvents = await sui.queryEvents({
    eventType: `${PACKAGE_ID}::blizzard_event_wrapper::BlizzardEvent<${PACKAGE_ID}::blizzard_events::NewLST>`
  });

   const statesIds = newLSTEvents.map(
    (event) => event.pos0.inner_state
  );
  
   
  const states = await sui.getObjects(statesIds);

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