const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const WHUSDCE_VAULT_ID =
  "0x7a2f75a3e50fd5f72dfc2f8c9910da5eaa3a1486e4eb1e54a825c09d82214526";
const WHUSDCE_TYPE_ARG = ADDRESSES.sui.USDC

async function tvl(_, _1, _2, { api }) {
  const res = await sui.getObject(WHUSDCE_VAULT_ID)

  let tvl = BigInt(res.fields.free_balance)
  for (const strategy of res.fields.strategies.fields.contents) {
    tvl += BigInt(strategy.fields.value.fields.borrowed)
  }
  tvl += BigInt(res.fields.free_balance)

  api.add(WHUSDCE_TYPE_ARG, Number(tvl))
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};

