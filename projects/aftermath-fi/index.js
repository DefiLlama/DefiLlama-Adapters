const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x0625dc2cd40aee3998a1d6620de8892964c15066e0a285d8b573910ed4c75d50";

async function tvl(api) {
  const pools = await sui.queryEvents({ eventType: '0xefe170ec0be4d762196bedecd7a065816576198a6527c99282a2551aaa7da38c::events::CreatedPoolEvent', transform: i => i.pool_id})
  const poolData = await sui.getObjects(pools)

  for (const { fields: { type_names: tokens, normalized_balances: bals, decimal_scalars } } of poolData) {
    bals.forEach((v, i) => {
      if (/af_lp::AF_LP/.test(tokens[i])) return;
      api.add('0x' + tokens[i], v / decimal_scalars[i])
    })
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
