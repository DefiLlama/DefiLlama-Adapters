const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { sumTokens2 } = require("../helper/unwrapLPs");

const API3 = "0x0b38210ea11411557c13457d4da7dc6ea731b88a"

// Uni v4 NFT tokenId
const UNI_V4_POSITION_IDS = ["112856"]

// Vaults that need to be priced via convertToAssets (pegged to USDC)
const USDC_VAULTS = [
  "0x68aea7b82df6ccdf76235d46445ed83f85f845a3", // oevUSDC
  "0xb3f4d94a209045ef35661e657db9adac584141f1", // Api3CoreUSDC v1 vault
  "0xe2221aa07ec3266da87763e2b1e28d07a8a4e53b", // Api3CoreUSDC v2 vault
  "0x62067831c193810f3b044cc42249632b5d08bc6b", // KabuUSDC v1 vault
  "0x54210d3f1a066413891af9e17210e787d5c6e3f4", // KabuUSDC v2 vault
  "0x36cfe1568461e499391ef0a555300f1ae2da2439", // Api3 dCOMP USDC vault
  "0xc92a37fd0250f4eecf092960a2f70a1334217528", // Purinta USDC vault
]

// Vaults on Robinhood chain that need to be priced via convertToAssets (pegged to USDG)
const USDG_VAULTS_ROBINHOOD = [
  "0x37788ff0c1d4e45a7fe06bc7e71e0cc00121d0a8", // Purinta USDG vault
]

// API3 tokens lent out to market makers (held in MM custody, not visible in DAO wallets)
// See https://api3dao.github.io/api3-dao-tracker/treasury
const MM_LOANS_API3 = [
  2_499_990, // Market maker loan #1, expiry 2028-04-10
  2_624_713, // Market maker loan #2, expiry 2026-11-17
]

const OWNERS = [
  "0x556ecbb0311d350491ba0ec7e019c354d7723ce0", // Secondary treasury (DAO agent)
  "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae", // Primary treasury (DAO agent)
  "0xe7af7c5982e073ac6525a34821fe1b3e8e432099",
  "0xbbe0de9757f93e3306adbfebe906ab285edd13da", // Agent multisig
  "0x8e03609ed680b237c7b6f8020472ca0687308b24", // Vault multisig
  "0x2df880c697b65b52a79fa3322ee8a2bbff21f0ef", // Emergency liquidation fund
  "0x98f66287682f2e332125e2364526c334aafa8643", // Gas fund
  "0x5a9aa3219dd1cbef6a18fd221464e071df2677c2", // MERKL rewards multisig
];

const ROBINHOOD_OWNERS = [
  "0x82b4a86c796d9508350d129ba150b5d625ec98a4", // Agent on Robinhood
  "0xa45314481e2a64f2c8169584bca4ea27ceccfd9e", // MERKL on Robinhood
];

// Convert ERC-4626 vault shares held by owners into their underlying asset
async function addVaultAssets(api, { vaults, owners, underlying }) {
  const calls = []
  owners.forEach(owner => {
    vaults.forEach(token => {
      calls.push({ target: token, params: owner })
    })
  })
  const vaultBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls })

  const activeVaultCalls = []
  vaultBalances.forEach((bal, i) => {
    if (bal > 0) {
      activeVaultCalls.push({
        target: calls[i].target,
        params: bal // convertToAssets takes the share amount as input
      })
    }
  })

  if (activeVaultCalls.length > 0) {
    const underlyingAssets = await api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: activeVaultCalls
    })
    underlyingAssets.forEach(amount => api.add(underlying, amount))
  }
}

const base = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.USDC,
      "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d", // PNK
    ],
    owners: OWNERS,
    ownTokens: [API3],
    resolveLP: true,
    resolveUniV3: true,
    fetchCoValentTokens: false,
  },
  robinhood: {
    tokens: [
      nullAddress,
      ADDRESSES.robinhood.USDG,
    ],
    owners: ROBINHOOD_OWNERS,
    fetchCoValentTokens: false,
  },
})

const baseTvl = base.ethereum.tvl
const baseOwnTokens = base.ethereum.ownTokens
const baseRobinhoodTvl = base.robinhood.tvl

base.ethereum.tvl = async (api) => {
  // 1. Run existing treasury logic (standard ERC20 + LPs + UniV3)
  await baseTvl(api)

  // 2. Add Uni v4 position explicitly
  // We blacklist API3 here so it doesn't get counted in TVL (it belongs in ownTokens)
  await sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
    },
    blacklistedTokens: [API3]
  })

  // 3. Handle unpriced vaults (Morpho/ERC4626)
  await addVaultAssets(api, { vaults: USDC_VAULTS, owners: OWNERS, underlying: ADDRESSES.ethereum.USDC })

  return api.getBalances()
}

base.robinhood.tvl = async (api) => {
  await baseRobinhoodTvl(api)
  await addVaultAssets(api, { vaults: USDG_VAULTS_ROBINHOOD, owners: ROBINHOOD_OWNERS, underlying: ADDRESSES.robinhood.USDG })
  return api.getBalances()
}

base.ethereum.ownTokens = async (api) => {
  // Run existing treasury logic
  await baseOwnTokens(api)

  // Add Uni v4 position explicitly (for own tokens). We include API3 here.
  await sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
    },
    // We blacklist standard tokens here so we don't accidentally count USDC held in the V4 LP as "own tokens"
    blacklistedTokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.WSTETH]
  })

  // Add API3 lent out to market makers (fixed loan amounts, returned at expiry)
  const API3_DECIMALS = 1e18
  MM_LOANS_API3.forEach(amount => api.add(API3, BigInt(amount) * BigInt(API3_DECIMALS)))

  return api.getBalances()
}

module.exports = base
