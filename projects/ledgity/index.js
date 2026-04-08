// Ledgity Finance TVL Adapter
//
// Three token categories:
//
// 1. lTokens (V1, legacy) — ERC20 rebasing wrappers that are 1:1 with their underlying
//    (LUSDC, LEURC). realTotalSupply() gives the actual minted supply in the same decimals
//    as the underlying asset, so it directly represents the amount of underlying locked.
//    Note: totalSupply() is NOT used because the LToken contract overrides it to include
//    not-yet-minted amounts (queued withdrawal requests + unclaimed fees), which would
//    inflate the supply above the sum of all realBalanceOf() values and break the exclusion
//    arithmetic. realBalanceOf() is used for the same reason on individual addresses.
//    Two addresses are excluded from lToken TVL:
//    - Owner (multisig): protocol-owned balance, not user capital.
//    - Liquidity manager: holds lTokens surrendered by users who migrated to V2 lyToken
//      vault shares. Those lTokens are not burned — they are retained by the LM as a
//      safety backup during the V1→V2 transition. Excluding the LM balance prevents
//      double-counting with lyToken TVL (the migrated users are already counted there).
//
// 2. lyTokens (V2, ERC4626 vaults) — lyUSD, lyEUR. totalAssets() returns the total
//    underlying (USDC / EURC) currently managed by the vault. This pool is entirely
//    separate from the V1 lToken pool; no lToken underlying is deposited into lyToken vaults.
//
// 3. Staking — LDY tokens locked in either the legacy V1 staking contract or the
//    V2 StakingPositions contract, measured as LDY.balanceOf(stakingContract).

// ─── Exclusions ──────────────────────────────────────────────────────────────

// Protocol-owned wallets whose lToken balances must be excluded from lToken TVL
// (owner multisig + per-currency liquidity managers).
const OWNER = "0x972c17D0adA071db4a0395505dD3Ad0a80809053";
const LM_USD = "0xE7616e98d2506E571E8f6E38e7Bfd0b55642ACac";
const LM_EUR = "0xF25a516CAF56895032b3f3eE842b45462Ff491c3";

// ─── lTokens ─────────────────────────────────────────────────────────────────

// { chain -> [{ token, underlying, lm }] }
const LTOKENS = {
  sonic: [
    { token: "0xD7cCABfBEfE332C9784FF3debeBdDbc787E75e69", underlying: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", lm: LM_USD }, // LUSDC → USDC
    { token: "0x88dC8674339731A12a08624f455Fd41Fe2d6DC82", underlying: "0xe715cbA7B5cCb33790ceBFF1436809d36cb17E57", lm: LM_EUR }, // LEURC → EURC
  ],
  arbitrum: [
    { token: "0xd54d564606611A3502FE8909bBD3075dbeb77813", underlying: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", lm: LM_USD }, // LUSDC → USDC
  ],
  base: [
    { token: "0x3C769d0e8D21d380228dFB7918c6933bb6ecB6D4", underlying: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", lm: LM_USD }, // LUSDC → USDC
    { token: "0x77ce973744745310359B0d1a3415A34FF983708F", underlying: "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42", lm: LM_EUR }, // LEURC → EURC
  ],
  linea: [
    { token: "0x4AF215DbE27fc030F37f73109B85F421FAB45B7a", underlying: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", lm: LM_USD }, // LUSDC → USDC
  ],
};

// ─── lyTokens (ERC4626 vaults) ───────────────────────────────────────────────

// { chain -> [{ token, underlying }] }
const VAULT_TOKENS = {
  ethereum: [
    { token: "0x3C769d0e8D21d380228dFB7918c6933bb6ecB6D4", underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }, // lyUSD → USDC
    { token: "0x20968165B7d2cDF33aF632aAB3e0539848d44BC8", underlying: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c" }, // lyEUR → EURC
  ],
  sonic: [
    { token: "0x65f75c675Cc76474662DfBF7B6e8683764223001", underlying: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894" }, // lyUSD → USDC
  ],
  arbitrum: [
    { token: "0x283F35b6406a0e19a786ed119869eF2c0fE157Ee", underlying: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" }, // lyUSD → USDC
  ],
  base: [
    { token: "0x916f179D5D9B7d8Ad815AC2f8570aabF0C6a6e38", underlying: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" }, // lyUSD → USDC
    { token: "0xFaA1e3720e6Ef8cC76A800DB7B3dF8944833b134", underlying: "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42" }, // lyEUR → EURC
  ],
  linea: [
    { token: "0x43b3c64dbc95F9eD83795E051fc00014059e698F", underlying: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff" }, // lyUSD → USDC
  ],
};

// ─── Staking ─────────────────────────────────────────────────────────────────

// { chain -> { ldy, v1 (LDYStaking legacy), v2 (StakingPositions) } }
const STAKING = {
  ethereum: {
    ldy: "0x482dF7483a52496F4C65AB499966dfcdf4DDFDbc",
    v1:  "0x2AeDFB927Aa2aE87c220b9071c0A1209786b5C5e",
    v2:  "0x902982C0C405091894FF82b3b51F180f99f75144",
  },
  sonic: {
    ldy: "0x9cFBf905a444B5c871f0B447e137e8Ce7EeD0BCE",
    v1:  "0x51231EB81D7c63C39Ca1C4Fc5801ed7DEF9E05EA",
    v2:  "0x613904B9a1Af4450FD34655d123EEb0944888b21",
  },
  arbitrum: {
    ldy: "0x999FAF0AF2fF109938eeFE6A7BF91CA56f0D07e1",
    v1:  "0x98002b5c06b44c8769dA3DAe97CA498aB6F97137",
    v2:  "0x6E83612c73f124127d49eA642c392FF4d9eAFd5b",
  },
  base: {
    ldy: "0x055d20a70eFd45aB839Ae1A39603D0cFDBDd8a13",
    v1:  "0x891611398B53BBAaA3db04c158218c319c87d554",
    v2:  "0x0fCfdF9B6572116FA662A5CF8a074B51EB2D6d88",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const realBalanceOfAbi = "function realBalanceOf(address) view returns (uint256)";

function buildChainTvl(chain) {
  return async (api) => {
    const lTokens = LTOKENS[chain] || [];
    const vaultTokens = VAULT_TOKENS[chain] || [];

    // lToken TVL: realTotalSupply minus protocol-owned balances (owner + liquidity manager).
    // realTotalSupply/realBalanceOf are used instead of totalSupply/balanceOf because the
    // LToken contract inflates those with not-yet-minted queued withdrawals and unclaimed
    // fees, making the subtraction inconsistent (totalSupply > sum of all balanceOf values).
    if (lTokens.length) {
      const supplies = await api.multiCall({
        abi: "uint256:realTotalSupply",
        calls: lTokens.map((t) => t.token),
      });

      // Two realBalanceOf calls per lToken: owner multisig and liquidity manager
      const excluded = await api.multiCall({
        abi: realBalanceOfAbi,
        calls: lTokens.flatMap((t) => [
          { target: t.token, params: [OWNER] },
          { target: t.token, params: [t.lm] },
        ]),
      });

      lTokens.forEach((t, i) => {
        const supply = BigInt(String(supplies[i]));
        const ownerBal = BigInt(String(excluded[i * 2]));
        const lmBal = BigInt(String(excluded[i * 2 + 1]));
        const userSupply = supply - ownerBal - lmBal;
        if (userSupply < 0n) {
          throw new Error(`[ledgity] net lToken supply < 0 for ${chain}:${t.token} (supply=${supply}, owner=${ownerBal}, lm=${lmBal}) — check exclusion addresses`);
        }
        api.add(t.underlying, userSupply.toString());
      });
    }

    // Vault TVL: totalAssets() gives the correct user-deposited underlying directly.
    if (vaultTokens.length) {
      const assets = await api.multiCall({
        abi: "uint256:totalAssets",
        calls: vaultTokens.map((t) => t.token),
      });
      vaultTokens.forEach((t, i) => api.add(t.underlying, assets[i]));
    }
  };
}

function buildChainStaking(chain) {
  return async (api) => {
    const { ldy, v1, v2 } = STAKING[chain];
    const [v1Bal, v2Bal] = await api.multiCall({
      abi: "function balanceOf(address) view returns (uint256)",
      calls: [
        { target: ldy, params: [v1] },
        { target: ldy, params: [v2] },
      ],
    });
    api.add(ldy, v1Bal);
    api.add(ldy, v2Bal);
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

const chains = [...new Set([
  ...Object.keys(LTOKENS),
  ...Object.keys(VAULT_TOKENS),
  ...Object.keys(STAKING),
])];

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total underlying assets (USDC/EURC) in Ledgity's V1 lToken rebasing wrappers (LUSDC, LEURC) and V2 lyToken ERC4626 vaults (lyUSD, lyEUR). These are separate pools: no lToken underlying is deposited into lyToken vaults. Owner and liquidity-manager lToken balances are excluded — the LM holds lTokens surrendered by users who migrated to V2 vault shares (not burned, kept as a safety backup), so excluding it prevents double-counting with lyToken TVL. Staking TVL is the total LDY locked across V1 (LDYStaking) and V2 (StakingPositions) contracts.",
};

chains.forEach((chain) => {
  const entry = {};
  if (LTOKENS[chain] || VAULT_TOKENS[chain]) entry.tvl = buildChainTvl(chain);
  if (STAKING[chain]) entry.staking = buildChainStaking(chain);
  if (Object.keys(entry).length) module.exports[chain] = entry;
});
