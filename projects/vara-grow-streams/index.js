const { blake2b } = require("@noble/hashes/blake2b");
const { postURL } = require("../helper/utils");

const VARA_RPC = "https://rpc.vara.network";
// VARA has 12 decimals (1 VARA = 10^12 plancks); CoinGecko ID is "vara-network".
const VARA_DECIMALS = 1e12;
// Existential deposit on Vara Mainnet (1 VARA = 10^12 plancks).
const EXISTENTIAL_DEPOSIT = 10n ** 12n;

// System.Account storage prefix: twox128("System") ++ twox128("Account")
const SYSTEM_ACCOUNT_PREFIX = "0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9";

// GrowStreams V2 & V3 Vara Mainnet program IDs from `deploy-state.json` in https://github.com/Satyam-10124/growstreams-v3
// 1. TokenVault V3 (`token-vault`): native VARA & VFT collateral custody vault
const TOKEN_VAULT_V3 = "0x657cf9c4f929aeac97092037826c1117f9e6cd0e3c4edc44e49decc17b840aa9";
// 2. TokenVault V2: legacy VARA collateral vault from PR #20665
const TOKEN_VAULT_V2 = "0x4e4ddc62c3dc4fa9fbdd21dbcd7bfef4cead2e2d8d59b1d452da9fa67c6ea388";
// 3. wVARA (`wvara`): 1:1 wrapped VARA VFT contract
const WVARA_TOKEN = "0xf5e9cb1d1e46b0cda6578dd1684b30f281a45dfaa390e4945b7bfc8ab3e27f3d";
// 4. gVARA V3 (`gvara-token`): 1:1 VARA-backed streaming SuperToken
const GVARA_TOKEN_V3 = "0x04314af41b7dbac322e3e66920211d2f799719e1cdc3122a99752f72b6ae84ee";
// 5. gVARA V2: legacy streaming SuperToken from PR #20665
const GVARA_TOKEN_V2 = "0xab6c3ca8cf241d4e3d217ca5b2ca5a4b4f0cf9e2e20e4a1f621b60a70f6f8368";
// 6. StreamCore V3 (`stream-core`): real-time per-second money streaming engine
const STREAM_CORE = "0x8298c2eea5c6bbe55a9cfe72283b5399098fd6a54d9a2a14c2bedba8eea50659";
// 7. SplitsRouter V3 (`splits-router`): autonomous 60/15/15/10 agent squad revenue router
const SPLITS_ROUTER = "0x68b9fd8f53f6557db2c26b5b9a7c63061bb7f36d379dc843b8a53e78f5692f45";
// 8. BountyAdapter V3 (`bounty-adapter`): AI-verified streaming bounties & StonkBase desk settlements
const BOUNTY_ADAPTER = "0x7697bb2e8655e6cd7294389a0289355f48fd5459914d2a735c9966dad548bd4f";
// 9. PermissionManager V3 (`permission-manager`): autonomous agent execution delegation registry
const PERMISSION_MANAGER = "0x52f4299e964dab5e97c91cdd10e2d6e635b19696ab8389889aabceba3de9e581";
// 10. IdentityRegistry V3 (`identity-registry`): GitHub/X/Agent identity bindings
const IDENTITY_REGISTRY = "0x6f413156308663798a77507cf0ea6e79bdbf53add3579ccd4317fc320acf7f29";
// 11. DistributionPool V3 (`distribution-pool`): proportional reward distribution pool
const DISTRIBUTION_POOL = "0x7aaa5fa39237ad7f63a78d5acd8a0ff080bd034b8e78de5d4756d6fe4fb25b70";
// 12. LiquidationManager V3 (`liquidation-manager`): stream solvency sentinel & liquidation keeper
const LIQUIDATION_MANAGER = "0x411c62d126b3131ace5e94b618b8cbbdbffb5b9cfdd656f2f6da0786f60cb2c3";
// 13. SuperToken gGROW (`super-token`): GROW-backed streaming SuperToken
const SUPER_TOKEN_GGROW = "0x4a9718de4055470963104a4c08e5154ad0c2c48a699996b59e861de9393bf347";
// 14. GROW Token (`grow-token`): GrowStreams governance & campaign token
const GROW_TOKEN = "0x728d04df91561c66938053a4f5178f749da004ebd219ca05f7c090609a6f7163";
// 15. QuestSeeds (`quest-seeds`): campaign & referral reward contract
const QUEST_SEEDS = "0xefbe2c4a66e05cbde419196c1196ff6e790a59b7c0fd601ebc035c3c8dd7466d";

const PROTOCOL_CONTRACTS = [
  TOKEN_VAULT_V3,
  TOKEN_VAULT_V2,
  WVARA_TOKEN,
  GVARA_TOKEN_V3,
  GVARA_TOKEN_V2,
  STREAM_CORE,
  SPLITS_ROUTER,
  BOUNTY_ADAPTER,
  PERMISSION_MANAGER,
  IDENTITY_REGISTRY,
  DISTRIBUTION_POOL,
  LIQUIDATION_MANAGER,
  SUPER_TOKEN_GGROW,
  GROW_TOKEN,
  QUEST_SEEDS,
];

/**
 * Computes the Substrate `System.Account` Blake2_128Concat storage key for a 32-byte ActorId.
 */
function systemAccountKey(actorIdHex) {
  const clean = actorIdHex.startsWith("0x") ? actorIdHex.slice(2) : actorIdHex;
  const accountBytes = Buffer.from(clean, "hex");
  const hash = Buffer.from(blake2b(accountBytes, { dkLen: 16 })).toString("hex");
  return `${SYSTEM_ACCOUNT_PREFIX}${hash}${clean}`;
}

/**
 * Decodes an unsigned 128-bit little-endian integer from a Buffer at `offset`.
 */
function readU128LE(buf, offset) {
  let value = 0n;
  for (let i = 15; i >= 0; i--) {
    value = (value << 8n) | BigInt(buf[offset + i]);
  }
  return value;
}

/**
 * Queries the spendable native VARA balance (free minus 1 VARA existential deposit) of a contract on Vara Mainnet.
 */
async function getSpendableFreeBalance(actorIdHex) {
  const { data } = await postURL(VARA_RPC, {
    jsonrpc: "2.0",
    id: 1,
    method: "state_getStorage",
    params: [systemAccountKey(actorIdHex)],
  });
  if (!data.result) return 0n;
  const raw = Buffer.from(data.result.slice(2), "hex");
  // AccountInfo: nonce (u32, 4B) + consumers (u32, 4B) + providers (u32, 4B) + sufficients (u32, 4B) + data.free (u128, 16B)
  const free = readU128LE(raw, 16);
  return free > EXISTENTIAL_DEPOSIT ? free - EXISTENTIAL_DEPOSIT : 0n;
}

/**
 * Sums native VARA locked across all deployed GrowStreams V2 & V3 contracts on Vara Mainnet.
 */
async function tvl(api) {
  const balances = await Promise.all(PROTOCOL_CONTRACTS.map(getSpendableFreeBalance));
  const totalPlanck = balances.reduce((acc, b) => acc + b, 0n);
  api.addCGToken("vara-network", Number(totalPlanck) / VARA_DECIMALS);
}

module.exports = {
  timetravel: false,
  methodology:
    "Queries Vara Mainnet directly via JSON-RPC (state_getStorage on System.Account) to sum the native VARA locked across GrowStreams V2 & V3 contracts (TokenVault, wVARA, gVARA, StreamCore, SplitsRouter, BountyAdapter, PermissionManager, IdentityRegistry, DistributionPool, LiquidationManager, gGROW, GROW, and QuestSeeds), backing active token streams, StonkBase synthetic equity margin, and autonomous AI agent escrows.",
  vara: {
    tvl,
  },
};
