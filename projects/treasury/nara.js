const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require('../helper/treasury')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Canonical NARA Protocol V5 Treasury & Protocol-Owned Liquidity (POL) on Base (8453).
// Unissued emission reserves in NARAEmissionReserveV5 (0xf932178F24b0813C82093985F0Af6Db27Ae25930)
// and user-escrowed balances in PrincipalLedgerV5 / RewardLedgerV5 / CryptoSLIP vaults are excluded.
const NARA_TOKEN = '0x91FB78A9F46B67f54BbD4489941d19666b2fAe0f'
const BASE_USDC = ADDRESSES.base.USDC
const BASE_WETH = ADDRESSES.base.WETH
const BASE_CBBTC = ADDRESSES.base.cbBTC
const BASE_AERO = ADDRESSES.base.AERO

const TREASURY_SAFE = '0xe320C281c86079eA85f2Bc67864E873A61D551E3'
const ACTIVE_RANGE_MANAGER_V5 = '0x221c625d2BC416460C397035C1286C1f4A4D3A7C'
const LEGACY_RANGE_MANAGER_V5 = '0xa72557fcBE56B3eC739dF3aF7b6b893B6Db4D288'
const NARA_FEE_VAULT_V5 = '0xF1f361F803895BF5cf67eC6C506dbFEf2f6E88Cf'
const NARA_CAPITAL_BUDGET_V5 = '0x6f5f586Bd4F14e47F432264D88Fe9A6A6A80552B'
const NARA_POL_POSITION_V5 = '0x01EF9de9f4e9197F2A3944b5B34A90eA2f558b64'

const UNIV4_POSITION_MANAGER = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const SAFE_SEED_V4_TOKEN_ID = '3209802'

const TREASURY_OWNERS = [
  TREASURY_SAFE,
  ACTIVE_RANGE_MANAGER_V5,
  LEGACY_RANGE_MANAGER_V5,
  NARA_FEE_VAULT_V5,
  NARA_CAPITAL_BUDGET_V5,
  NARA_POL_POSITION_V5,
]
const RANGE_MANAGERS = [ACTIVE_RANGE_MANAGER_V5, LEGACY_RANGE_MANAGER_V5]

const FEE_VAULT_INVENTORY_ABI =
  'function inventory(uint8 asset) view returns ((uint256 holderClaims, uint256 polClaims, uint256 holderRaw, uint256 polRaw, uint256 hookFees, uint256 lpFees, uint256 claimsRedeemed, uint256 holdersForwarded, uint256 polDonations, uint256 polReturned, uint256 polSpent) booked, uint256 rawBalance, uint256 claimBalance, uint256 rawSurplus, uint256 claimSurplus, bool solvent)'
const GET_ACTIVE_ORDER_IDS_ABI =
  'function getActiveOrderIds(uint256 offset, uint256 limit) view returns (uint256[] orderIds, uint256 nextOffset)'
const GET_ORDER_ABI =
  'function getOrder(uint256 orderId) view returns ((uint256 tokenId, uint256 inputAmount, uint256 minimumOutputAmount, bytes32 strategyHash, uint160 terminalSqrtPriceX96, uint128 liquidity, int24 tickLower, int24 tickUpper, uint64 createdBlock, uint64 expiresAt, uint64 terminalBlock, uint8 side, uint8 status) order)'
const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'
const POL_TOKEN_ID_ABI = 'function positionTokenId() view returns (uint256)'

async function getActiveV4PolPositionIds(api) {
  const positionIdSet = new Set()

  const [seedOwner, polTokenId] = await Promise.all([
    api.call({
      target: UNIV4_POSITION_MANAGER,
      params: [SAFE_SEED_V4_TOKEN_ID],
      abi: OWNER_OF_ABI,
      permitFailure: true,
    }),
    api.call({
      target: NARA_POL_POSITION_V5,
      abi: POL_TOKEN_ID_ABI,
    }),
  ])

  if (seedOwner && seedOwner.toLowerCase() === TREASURY_SAFE.toLowerCase()) {
    positionIdSet.add(SAFE_SEED_V4_TOKEN_ID)
  }
  if (polTokenId && String(polTokenId) !== '0') {
    positionIdSet.add(String(polTokenId))
  }

  const PAGE_SIZE = 100
  for (const manager of RANGE_MANAGERS) {
    let offset = 0
    while (true) {
      const page = await api.call({
        target: manager,
        params: [offset, PAGE_SIZE],
        abi: GET_ACTIVE_ORDER_IDS_ABI,
      })
      const orderIds = page.orderIds
      if (!orderIds.length) break

      const orders = await api.multiCall({
        target: manager,
        calls: orderIds,
        abi: GET_ORDER_ABI,
      })
      orders.forEach((order) => {
        if (order?.tokenId && String(order.tokenId) !== '0') {
          positionIdSet.add(String(order.tokenId))
        }
      })

      if (orderIds.length < PAGE_SIZE) break
      offset = Number(page.nextOffset)
    }
  }

  return [...positionIdSet]
}

const treasury = treasuryExports({
  base: {
    tokens: [nullAddress, BASE_USDC, BASE_WETH, BASE_CBBTC, BASE_AERO],
    owners: TREASURY_OWNERS,
    ownTokens: [NARA_TOKEN],
    resolveUniV3: true,
    resolveSlipstream: true,
    fetchCoValentTokens: false,
  },
})

const baseTvl = treasury.base.tvl
const baseOwnTokens = treasury.base.ownTokens

treasury.base.tvl = async (api) => {
  await baseTvl(api)

  // Add Uniswap v4 PoolManager ERC-6909 POL claims held by NARAFeeVaultV5 (1 = ETH, 2 = USDC)
  const [ethInv, usdcInv] = await api.multiCall({ target: NARA_FEE_VAULT_V5, abi: FEE_VAULT_INVENTORY_ABI, calls: [1, 2] })
  api.add(nullAddress, ethInv.booked.polClaims)
  api.add(BASE_USDC, usdcInv.booked.polClaims)

  // Unwrap non-NARA side of active Uniswap v4 POL positions (Treasury Safe seed + RangeManager orders)
  const positionIds = await getActiveV4PolPositionIds(api)
  if (positionIds.length) {
    await sumTokens2({
      api,
      resolveUniV4: true,
      uniV4ExtraConfig: {
        positionIds,
        whitelistedTokens: [nullAddress, BASE_USDC, BASE_WETH, BASE_CBBTC, BASE_AERO],
      },
      blacklistedTokens: [NARA_TOKEN],
    })
  }

  return api.getBalances()
}

treasury.base.ownTokens = async (api) => {
  await baseOwnTokens(api)

  // Add Uniswap v4 PoolManager ERC-6909 POL NARA claims held by NARAFeeVaultV5 (0 = NARA)
  const naraInv = await api.call({
    target: NARA_FEE_VAULT_V5,
    params: [0],
    abi: FEE_VAULT_INVENTORY_ABI,
  })
  api.add(NARA_TOKEN, naraInv.booked.polClaims)

  // Unwrap NARA side of active Uniswap v4 POL positions
  const positionIds = await getActiveV4PolPositionIds(api)
  if (positionIds.length) {
    await sumTokens2({
      api,
      resolveUniV4: true,
      uniV4ExtraConfig: {
        positionIds,
        whitelistedTokens: [NARA_TOKEN],
      },
      blacklistedTokens: [nullAddress, BASE_USDC, BASE_WETH, BASE_CBBTC, BASE_AERO],
    })
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'Treasury TVL counts non-NARA reserves (ETH, USDC, WETH, cbBTC, AERO) held in the NARA Treasury Safe, NARATreasuryRangeManagerV5, NARAFeeVaultV5 (including Uniswap v4 ERC-6909 POL claims), NARACapitalBudgetV5, and Protocol-Owned Liquidity (POL) across Uniswap v4, Uniswap v3, and Aerodrome Slipstream. Protocol NARA held in those contracts and LP positions is reported separately under ownTokens, excluding unissued NARAEmissionReserveV5 reserves.',
  ...treasury,
}
