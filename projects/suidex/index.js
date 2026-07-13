const sui = require("../helper/chain/sui");

// V2 AMM Factory
const FACTORY_ID =
  "0x81c286135713b4bf2e78c548f5643766b5913dcd27a8e76469f146ab811e922d";

// Locked Token Vault — holds VICTORY tokens locked by users in the Token Locker
const LOCKED_TOKEN_VAULT_ID =
  "0x3632b8acce355fc8237998d44f1a68e58baac95f199714cdef5736d580dc6bf1";

// VICTORY token type
const VICTORY_TOKEN_TYPE =
  "0xbfac5e1c6bf6ef29b12f7723857695fd2f4da9a11a7d88162c15e9124c243a4a::victory_token::VICTORY_TOKEN";

// V3 CLMM Pool IDs — concentrated liquidity pools
const V3_POOL_IDS = [
  "0xdf8ccfcc10f7daf14e31101c8ca6ac05eaa953afad14195fd2db3a41bad4b284", // SUI/SUITRUMP
  "0x04db19eb0d0b7518005cc63c0530954f494460de42074749e6b702c443ead952", // SUI/USDC
  "0x02c83820cc8412e103d6520424a380e207e43033cad040e72331a719335f0629", // SUI/VICTORY
  "0x39d5ba22e01e45bc4129ec28a0bef52e8fee8db5d07d337adf9540e3cb9074cf", // SUI/TREE
  "0xe27a85b339b41aea7d513c1373ef2f3babc88e468d9b650bb778265bfdc5f3b7", // USDC/USDSUI
  "0x51370981fc19b08c840ff39cca3f36c03f396d26a85f522f20f741f1cff014af", // SUI/USDC (0.01%)
];

async function tvl(api) {
  // V2: Read Factory object to get all pair IDs
  const factory = await sui.getObject(FACTORY_ID);
  const pairIds = factory.fields.all_pairs;
  const pools = await sui.getObjects(pairIds);

  pools.forEach(({ type, fields }) => {
    const [token0, token1] = type.replace(">", "").split("<")[1].split(", ");
    api.add(token0, fields.reserve0 ?? fields.reserve_0);
    api.add(token1, fields.reserve1 ?? fields.reserve_1);
  });

  // V3: Read CLMM pool objects directly
  const v3Pools = await sui.getObjects(V3_POOL_IDS);

  v3Pools.forEach(({ type, fields }) => {
    // Pool type: 0xPKG::pool::Pool<TokenX, TokenY>
    const [tokenX, tokenY] = type.replace(">", "").split("<")[1].split(", ");
    api.add(tokenX, fields.reserve_x);
    api.add(tokenY, fields.reserve_y);
  });
}

async function staking(api) {
  // Victory Token Locker: users lock VICTORY tokens for enhanced rewards.
  // The vault stores locked balance in a Balance<VICTORY> field, not as Coin objects.
  const vault = await sui.getObject(LOCKED_TOKEN_VAULT_ID);
  api.add(VICTORY_TOKEN_TYPE, vault.fields.locked_balance);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the sum of token reserves across all SuiDex V2 AMM and V3 CLMM liquidity pools. Staking includes VICTORY tokens locked in the Token Locker contract.",
  sui: {
    tvl,
    staking,
  },
};
