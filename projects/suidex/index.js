const sui = require("../helper/chain/sui");

const FACTORY_ID =
  "0x81c286135713b4bf2e78c548f5643766b5913dcd27a8e76469f146ab811e922d";

// Locked Token Vault — holds VICTORY tokens locked by users in the Token Locker
const LOCKED_TOKEN_VAULT_ID =
  "0x3632b8acce355fc8237998d44f1a68e58baac95f199714cdef5736d580dc6bf1";

// VICTORY token type
const VICTORY_TOKEN_TYPE =
  "0xbfac5e1c6bf6ef29b12f7723857695fd2f4da9a11a7d88162c15e9124c243a4a::victory_token::VICTORY_TOKEN";

async function tvl(api) {
  // Read Factory object to get all pair IDs from the all_pairs array
  const factory = await sui.getObject(FACTORY_ID);
  const pairIds = factory.fields.all_pairs;

  // Batch-fetch all pair objects
  const pools = await sui.getObjects(pairIds);

  // Sum reserves from each pair
  // Note: Farm staked LP tokens are NOT additive — the actual token reserves
  // remain in the Pair objects, LP tokens are just receipts staked in the farm.
  pools.forEach(({ type, fields }) => {
    // Pair type: 0xPKG::pair::Pair<Token0Type, Token1Type>
    const [token0, token1] = type.replace(">", "").split("<")[1].split(", ");
    api.add(token0, fields.reserve0 ?? fields.reserve_0);
    api.add(token1, fields.reserve1 ?? fields.reserve_1);
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
    "TVL is the sum of token reserves across all SuiDex AMM liquidity pools. Staking includes VICTORY tokens locked in the Token Locker contract.",
  sui: {
    tvl,
    staking,
  },
};
