const { getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

// Reflect V2 core program (https://reflect.money). Yield-tokenisation protocol on Solana:
// users deposit an SPL (e.g. USDC, USDT) into a lending strategy and receive a receipt
// token; the deposited collateral is routed across external venues (Kamino, Jupiter Lend,
// MarginFi, Save, Loopscale). TVL is read entirely from on-chain account data and the
// accounts are deserialised manually (no IDL/anchor coder).
// V2 and V1 use different on-chain account schemas and are tracked as separate adapters
// (see ./v1.js) and separate DefiLlama dashboards.
const PROGRAM_ID = new PublicKey("RfLCtMS8AAqwDyK3RckKk5oarhZoNGx1rkz1BoozRq9");

// 8-byte account discriminators.
const MAIN_DISC = Buffer.from([103, 173, 93, 26, 84, 137, 56, 96]); // Anchor `Main`
const STRATEGY_CONTROLLER_DISC = Buffer.from([13, 167, 93, 202, 196, 161, 163, 0]);

// `Main` layout (Borsh): disc(8) + bump(1) + AccessControl(386) + spls_main: Vec<SplMain> ...
// AccessControl = AccessMap([ActionMapping;48] = 384 + mapping_count 1 = 385) + KillSwitch(1) = 386.
// Both are fixed-size, so the vec's u32 length prefix sits at a deterministic offset.
const SPLS_MAIN_OFFSET = 8 + 1 + 386; // 395

// `StrategyController` layout: disc(8) + Base + Rack registry + component data region.
// Base starts with bump(u8) index(u8) strategy_type(u8) mint([u8;32]) ...
const STRATEGY_INDEX_OFFSET = 9; // disc(8) + bump(1)
// Base is a fixed 1100 bytes (STRATEGY_SIZE), then the Rack registry, then component data.
const RACK_OFFSET = 8 + 1100; // 1108 - start of the 8-entry component registry
const RACK_REGISTRY_SIZE = 8 * 6; // 8 components * (type u8 + offset u16 + size u16 + version u8)
const COMPONENT_DATA_OFFSET = RACK_OFFSET + RACK_REGISTRY_SIZE; // 1156
const COMPONENT_TYPE_AUTOCOMPOUND = 1;

// Map each strategy index -> its underlying collateral mint, from Main's SPL registry.
// SplMain (Borsh): main_spl_index(u8) mint([u8;32]) fee(u64) precision(u8)
//                  strategy_indices: Vec<u8> deposits_suspended(bool)
function parseStrategyMints(data) {
  let o = SPLS_MAIN_OFFSET;
  const count = data.readUInt32LE(o);
  o += 4;
  const strategyToMint = {};
  for (let i = 0; i < count; i++) {
    o += 1; // main_spl_index
    const mint = new PublicKey(data.slice(o, o + 32)).toBase58();
    o += 32;
    o += 8; // fee
    o += 1; // precision (DefiLlama applies token decimals at pricing time)
    const indicesLen = data.readUInt32LE(o);
    o += 4;
    for (let j = 0; j < indicesLen; j++) {
      const strategyIndex = data[o + j];
      if (strategyToMint[strategyIndex] === undefined) strategyToMint[strategyIndex] = mint;
    }
    o += indicesLen;
    o += 1; // deposits_suspended
  }
  return strategyToMint;
}

// Walk the strategy controller's component registry and return the
// AutoCompound component's `deposited_vault_value` (first u64): the total
// collateral currently attributed to vault holders, in the underlying's base units.
function readDepositedVaultValue(data) {
  for (let i = 0; i < 8; i++) {
    const entry = RACK_OFFSET + i * 6;
    const componentType = data[entry];
    if (componentType === 0) break; // registry is contiguous; None marks the end
    if (componentType === COMPONENT_TYPE_AUTOCOMPOUND) {
      const componentOffset = data.readUInt16LE(entry + 1);
      return data.readBigUInt64LE(COMPONENT_DATA_OFFSET + componentOffset);
    }
  }
  return 0n;
}

async function tvl(api) {
  const connection = getProvider().connection;

  const mainAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(MAIN_DISC) } }],
  });
  if (!mainAccounts.length) throw new Error("Reflect: Main account not found");
  const strategyToMint = parseStrategyMints(mainAccounts[0].account.data);

  const controllers = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(STRATEGY_CONTROLLER_DISC) } }],
  });

  for (const { account: { data } } of controllers) {
    const strategyIndex = data[STRATEGY_INDEX_OFFSET];
    const mint = strategyToMint[strategyIndex];
    // Strategies with no SPL collateral registered (e.g. the bond basket strategy) are skipped.
    if (!mint) continue;
    const deposited = readDepositedVaultValue(data);
    if (deposited > 0n) api.add(mint, deposited.toString());
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the total collateral attributed to vault holders across Reflect's lending strategies. For each strategy controller account it is read on-chain from the AutoCompound component's deposited_vault_value field (the underlying collateral's base units) and valued in that strategy's underlying SPL (e.g. USDC, USDT), resolved from the Main account's SPL registry. Deposited collateral is routed into external venues (Kamino, Jupiter Lend, MarginFi, Save, Loopscale) that are listed separately on DefiLlama, so the TVL is marked doublecounted.",
  doublecounted: true,
  solana: { tvl },
};
