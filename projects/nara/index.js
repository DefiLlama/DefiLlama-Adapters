const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapV4NFTs, nullAddress } = require('../helper/unwrapLPs')

// Canonical NARA Protocol V5 & CryptoSLIP V3.2 Base Mainnet (Chain ID 8453) contracts
const NARA_TOKEN = '0x91FB78A9F46B67f54BbD4489941d19666b2fAe0f'
const BASE_USDC = ADDRESSES.base.USDC
const BASE_WETH = ADDRESSES.base.WETH
const BASE_CBBTC = ADDRESSES.base.cbBTC

// User principal & sealed slip custody (Staking when asset == NARA; TVL when asset == ETH/USDC/WETH/cbBTC)
const NARA_PRINCIPAL_LEDGER_V5 = '0x7F866a9fbe41D54F0d9C35b6892fcf27Ea766DB2'
const CRYPTOSLIP_VAULT_V33 = '0x3f80aa68Fb4834d6E119EE1cf932C14419Cf63EB'
const CRYPTOSLIP_VAULT_V32 = '0x38BF0321FA7489576978353a6a8da4A3e85C2F18'

// Non-NARA protocol fee, reward, sale escrow & range liquidity custody
const NARA_REWARD_LEDGER_V5 = '0xC72671D9438388638547444524F6542b650C9264'
const NARA_REWARD_INGRESS_V5 = '0x44130CC47b886D8488041F5eaE271477D1aFA909'
const NARA_FEE_VAULT_V5 = '0xF1f361F803895BF5cf67eC6C506dbFEf2f6E88Cf'
const NARA_POSITION_SALE_V5 = '0x04Ac83045d26259D46400Ce6beb9bBd0641df225'
const ACTIVE_RANGE_MANAGER_V5 = '0x221c625d2BC416460C397035C1286C1f4A4D3A7C'
const LEGACY_RANGE_MANAGER_V5 = '0xa72557fcBE56B3eC739dF3aF7b6b893B6Db4D288'

// Protocol-owned / Treasury Safe concentrated DEX liquidity (Uniswap V4 + Uniswap V3)
const TREASURY_SAFE = '0xe320C281c86079eA85f2Bc67864E873A61D551E3'
const UNIV4_POSITION_MANAGER = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const SAFE_SEED_V4_TOKEN_ID = '3209802'
const RANGE_MANAGERS = [ACTIVE_RANGE_MANAGER_V5, LEGACY_RANGE_MANAGER_V5]

const FEE_VAULT_INVENTORY_ABI =
  'function inventory(uint8 asset) view returns ((uint256 holderClaims, uint256 polClaims, uint256 holderRaw, uint256 polRaw, uint256 hookFees, uint256 lpFees, uint256 claimsRedeemed, uint256 holdersForwarded, uint256 polDonations, uint256 polReturned, uint256 polSpent) booked, uint256 rawBalance, uint256 claimBalance, uint256 rawSurplus, uint256 claimSurplus, bool solvent)'
const GET_ACTIVE_ORDER_IDS_ABI =
  'function getActiveOrderIds(uint256 offset, uint256 limit) view returns (uint256[] orderIds, uint256 nextOffset)'
const GET_ORDER_ABI =
  'function getOrder(uint256 orderId) view returns ((uint256 tokenId, uint256 inputAmount, uint256 minimumOutputAmount, bytes32 strategyHash, uint160 terminalSqrtPriceX96, uint128 liquidity, int24 tickLower, int24 tickUpper, uint64 createdBlock, uint64 expiresAt, uint64 terminalBlock, uint8 side, uint8 status) order)'
const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

async function tvl(api) {
  // 1. Account for Uniswap v4 PoolManager ERC-6909 USDC claim tokens held by NARAFeeVaultV5 (RewardAsset.USDC = 2)
  const usdcInventory = await api.call({
    target: NARA_FEE_VAULT_V5,
    params: [2],
    abi: FEE_VAULT_INVENTORY_ABI,
    permitFailure: true,
  })
  if (usdcInventory && usdcInventory.claimBalance) {
    api.add(BASE_USDC, usdcInventory.claimBalance)
  }

  // 2. Sum direct non-NARA balances (ETH, USDC, WETH, cbBTC) across V5 & CryptoSLIP V3.2 custody contracts
  return sumTokens2({
    api,
    owners: [
      NARA_REWARD_LEDGER_V5,
      NARA_REWARD_INGRESS_V5,
      NARA_FEE_VAULT_V5,
      NARA_POSITION_SALE_V5,
      ACTIVE_RANGE_MANAGER_V5,
      LEGACY_RANGE_MANAGER_V5,
      CRYPTOSLIP_VAULT_V33,
      CRYPTOSLIP_VAULT_V32,
    ],
    tokens: [nullAddress, BASE_USDC, BASE_WETH, BASE_CBBTC],
    blacklistedTokens: [NARA_TOKEN],
  })
}

async function staking(api) {
  // User-committed NARA in NARAPrincipalLedgerV5 (1d-365d Position NFTs) and sealed NARA slips in CryptoSlipVaultV32/V33.
  // Unissued emission reserves in NARAEmissionReserveV5 (0xf932178F24b0813C82093985F0Af6Db27Ae25930) are excluded.
  return sumTokens2({
    api,
    owners: [NARA_PRINCIPAL_LEDGER_V5, CRYPTOSLIP_VAULT_V33, CRYPTOSLIP_VAULT_V32],
    tokens: [NARA_TOKEN],
  })
}

async function getActiveV4PositionIds(api) {
  const positionIdSet = new Set()

  const seedOwner = await api.call({
    target: UNIV4_POSITION_MANAGER,
    params: [SAFE_SEED_V4_TOKEN_ID],
    abi: OWNER_OF_ABI,
    permitFailure: true,
  })
  if (seedOwner && seedOwner.toLowerCase() === TREASURY_SAFE.toLowerCase()) {
    positionIdSet.add(SAFE_SEED_V4_TOKEN_ID)
  }

  const PAGE_SIZE = 100
  for (const manager of RANGE_MANAGERS) {
    let offset = 0
    while (true) {
      const page = await api.call({
        target: manager,
        params: [offset, PAGE_SIZE],
        abi: GET_ACTIVE_ORDER_IDS_ABI,
        permitFailure: true,
      })
      const orderIds = page?.orderIds ?? []
      if (!orderIds.length) break

      const orders = await api.multiCall({
        target: manager,
        calls: orderIds,
        abi: GET_ORDER_ABI,
        permitFailure: true,
      })
      orders.forEach((order) => {
        if (order?.tokenId) positionIdSet.add(String(order.tokenId))
      })

      if (orderIds.length < PAGE_SIZE) break
      offset = Number(page.nextOffset)
    }
  }

  return [...positionIdSet]
}

async function pool2(api) {
  const positionIds = await getActiveV4PositionIds(api)
  if (positionIds.length) {
    await unwrapUniswapV4NFTs({
      api,
      balances: api.getBalances(),
      uniV4ExtraConfig: { positionIds },
    })
  }

  return sumTokens2({
    api,
    owner: TREASURY_SAFE,
    resolveUniV3: true,
  })
}

module.exports = {
  methodology:
    'TVL counts non-NARA assets (USDC, ETH, WETH, cbBTC) held across NARARewardLedgerV5, NARARewardIngressV5, NARAFeeVaultV5 (including Uniswap v4 PoolManager ERC-6909 USDC claims), NARAPositionSaleV5 escrow, NARATreasuryRangeManagerV5, and CryptoSlipVaultV32. Staking counts user-committed NARA principal in NARAPrincipalLedgerV5 and sealed NARA slips in CryptoSlipVaultV32, excluding unissued protocol emission reserves. Pool2 unwraps active NARA/USDC concentrated liquidity positions across Uniswap v4 (Treasury Safe seed position and NARATreasuryRangeManagerV5 active range orders) and Uniswap v3 (Treasury Safe LP positions).',
  base: {
    tvl,
    staking,
    pool2,
  },
}
