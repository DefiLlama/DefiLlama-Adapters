const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const OWNER = "0x972c17D0adA071db4a0395505dD3Ad0a80809053"
const LM_USD = "0xE7616e98d2506E571E8f6E38e7Bfd0b55642ACac"
const LM_EUR = "0xF25a516CAF56895032b3f3eE842b45462Ff491c3"

// V1 lTokens: rebasing wrappers 1:1 with underlying. Protocol-owned balances
// (owner multisig + liquidity manager) are excluded to avoid double-counting with vaults (lm holds lTokens migrated to v2).
const LTOKENS = {
  sonic: [
    { token: "0xD7cCABfBEfE332C9784FF3debeBdDbc787E75e69", underlying: ADDRESSES.sonic.USDC_e, lm: LM_USD }, // LUSDC
    { token: "0x88dC8674339731A12a08624f455Fd41Fe2d6DC82", underlying: "0xe715cbA7B5cCb33790ceBFF1436809d36cb17E57", lm: LM_EUR }, // LEURC
  ],
  arbitrum: [
    { token: "0xd54d564606611A3502FE8909bBD3075dbeb77813", underlying: ADDRESSES.arbitrum.USDC_CIRCLE, lm: LM_USD },
  ],
  base: [
    { token: "0x3C769d0e8D21d380228dFB7918c6933bb6ecB6D4", underlying: ADDRESSES.base.USDC, lm: LM_USD },
    { token: "0x77ce973744745310359B0d1a3415A34FF983708F", underlying: "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42", lm: LM_EUR },
  ],
  linea: [
    { token: "0x4AF215DbE27fc030F37f73109B85F421FAB45B7a", underlying: ADDRESSES.linea.USDC, lm: LM_USD },
  ],
}

// V2 lyTokens: ERC4626 vaults
const VAULTS = {
  ethereum: ["0x3C769d0e8D21d380228dFB7918c6933bb6ecB6D4", "0x20968165B7d2cDF33aF632aAB3e0539848d44BC8"],
  sonic: ["0x65f75c675Cc76474662DfBF7B6e8683764223001"],
  arbitrum: ["0x283F35b6406a0e19a786ed119869eF2c0fE157Ee"],
  base: ["0x916f179D5D9B7d8Ad815AC2f8570aabF0C6a6e38", "0xFaA1e3720e6Ef8cC76A800DB7B3dF8944833b134"],
  linea: ["0x43b3c64dbc95F9eD83795E051fc00014059e698F"],
}

// LDY staking: v1 (LDYStaking) + v2 (StakingPositions)
const STAKING = {
  ethereum: { ldy: "0x482dF7483a52496F4C65AB499966dfcdf4DDFDbc", contracts: ["0x2AeDFB927Aa2aE87c220b9071c0A1209786b5C5e", "0x902982C0C405091894FF82b3b51F180f99f75144"] },
  sonic:    { ldy: "0x9cFBf905a444B5c871f0B447e137e8Ce7EeD0BCE", contracts: ["0x51231EB81D7c63C39Ca1C4Fc5801ed7DEF9E05EA", "0x613904B9a1Af4450FD34655d123EEb0944888b21"] },
  arbitrum: { ldy: "0x999FAF0AF2fF109938eeFE6A7BF91CA56f0D07e1", contracts: ["0x98002b5c06b44c8769dA3DAe97CA498aB6F97137", "0x6E83612c73f124127d49eA642c392FF4d9eAFd5b"] },
  base:     { ldy: "0x055d20a70eFd45aB839Ae1A39603D0cFDBDd8a13", contracts: ["0x891611398B53BBAaA3db04c158218c319c87d554", "0x0fCfdF9B6572116FA662A5CF8a074B51EB2D6d88"] },
}

const allChains = [...new Set([...Object.keys(LTOKENS), ...Object.keys(VAULTS), ...Object.keys(STAKING)])]

module.exports = {
  doublecounted: true,
  methodology: "TVL is the total underlying assets (USDC/EURC) in Ledgity's V1 lToken rebasing wrappers (LUSDC, LEURC) and V2 lyToken ERC4626 vaults (lyUSD, lyEUR). These are separate pools: no lToken underlying is deposited into lyToken vaults. Owner and liquidity-manager lToken balances are excluded — the LM holds lTokens surrendered by users who migrated to V2 vault shares (not burned, kept as a safety backup), so excluding it prevents double-counting with lyToken TVL. Staking TVL is the total LDY locked across V1 (LDYStaking) and V2 (StakingPositions) contracts.",
}

allChains.forEach(chain => {
  const exp = {}
  const lTokens = LTOKENS[chain]
  const vaults = VAULTS[chain]
  const staking = STAKING[chain]

  if (lTokens || vaults) {
    exp.tvl = async (api) => {
      // lTokens: realTotalSupply minus owner + liquidity manager balances
      if (lTokens) {
        const supplies = await api.multiCall({ abi: 'uint256:realTotalSupply', calls: lTokens.map(t => t.token) })
        const excluded = await api.multiCall({
          abi: 'function realBalanceOf(address) view returns (uint256)',
          calls: lTokens.flatMap(t => [{ target: t.token, params: [OWNER] }, { target: t.token, params: [t.lm] }]),
        })
        lTokens.forEach((t, i) => {
          api.add(t.underlying, BigInt(supplies[i]) - BigInt(excluded[i * 2]) - BigInt(excluded[i * 2 + 1]))
        })
      }

      // lyTokens: standard ERC4626
      if (vaults) await api.erc4626Sum2({ calls: vaults })
    }
  }

  if (staking) {
    exp.staking = async (api) => {
      await sumTokens2({ api, tokensAndOwners: staking.contracts.map(c => [staking.ldy, c]) })
    }
  }

  if (Object.keys(exp).length) module.exports[chain] = exp
})
