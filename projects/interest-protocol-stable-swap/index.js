const sui = require("../helper/chain/sui")

const SUI_PACKAGE_ID = '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719';

const POW_18 = 1_000_000_000_000_000_000n;

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
    eventType: `${SUI_PACKAGE_ID}::event_wrapper::InterestStableSwapEvent<${SUI_PACKAGE_ID}::events::NewPool>`
  });

   const statesIds = newPoolEvents.map(
    (event) => event.pos0.state
  );
   
  const states = await sui.getObjects(statesIds);

  const decimalsMap = {};

  states.forEach((state) => {
    state.fields.metadata_map.fields.contents.forEach(content => {
      const [pkg, module, otw] = content.fields.key.fields.name.split('::');
      decimalsMap[`${normalizeAddress(pkg)}::${module}::${otw}`] = BigInt(content.fields.value.fields.scalar);
    });
  });

  states.forEach((state) => {
   state.fields.coins.forEach((typeName, index) => {
    const [pkg, module, otw] = typeName.fields.name.split('::');

    const key = `${normalizeAddress(pkg)}::${module}::${otw}`
    api.add(key, BigInt(state.fields.balances[index]) * decimalsMap[key] / POW_18);
   });
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
}