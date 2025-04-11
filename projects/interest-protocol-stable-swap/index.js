const sui = require("../helper/chain/sui")

const PACKAGE_ID = '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719';

const POW_9 = 1_000_000_000n;

function normalizeAddress(
  value,
  forceAdd0x = true,
) {
  let address = value.toLowerCase();
  if (!forceAdd0x && address.startsWith('0x')) {
    address = address.slice(2);
  }
  return `0x${address.padStart(32 * 2, '0')}`;
}

const tvl = async (api) => {
  const newPoolEvents = await sui.queryEvents({
    eventType: `${PACKAGE_ID}::event_wrapper::InterestStableSwapEvent<${PACKAGE_ID}::events::NewPool>`
  });

   const statesIds = newPoolEvents.map(
    (event) => event.pos0.state
  );
   
  const states = await sui.getObjects(statesIds);

  states.forEach((state) => {
   state.fields.coins.forEach((typeName, index) => {
    const [package, module, otw] = typeName.fields.name.split('::')
    api.add(`${normalizeAddress(package)}::${module}::${otw}`, BigInt(state.fields.balances[index]) / POW_9);
   });
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
}