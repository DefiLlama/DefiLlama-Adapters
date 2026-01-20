const { sumTokensExport } = require('../helper/unwrapLPs');

// avax addresses below.
const GDL_USD_POOL = '0x3CE2B891071054ee10d4b5eD5a9446f9016F90d8';
const USDT = '0xde3a24028580884448a5397872046a019649b084';

const GDL_DAI_POOL = '0x9D43f28C5Fce24D0c8B653E5c5859E0421Af7783';
const DAI = '0xba7deebbfc5fa1100fb055a87773e1e99cd3507a';

const GDL_ETH_POOL = '0xed986f982269e0319F710EC270875dE2b2A443d2';
const ETH = '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15';

const GDL_POOL = '0x34C8712Cc527a8E6834787Bd9e3AD4F2537B0f50';
const GDL = '0xd606199557c8ab6f4cc70bd03facc96ca576f142';

module.exports = {
  avax:{
    tvl: sumTokensExport({ tokensAndOwners: [
      [USDT, GDL_USD_POOL],
      [DAI, GDL_DAI_POOL],
      [ETH, GDL_ETH_POOL],
      [GDL, GDL_POOL],
    ]}),
  },
};
