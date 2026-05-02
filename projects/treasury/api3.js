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
]

const OWNERS = [
  "0x556ecbb0311d350491ba0ec7e019c354d7723ce0",
  "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae",
  "0xe7af7c5982e073ac6525a34821fe1b3e8e432099",
  "0xbbe0de9757f93e3306adbfebe906ab285edd13da",
  "0x8e03609ed680b237c7b6f8020472ca0687308b24"
];

const base = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.USDC,
      "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d", // PNK
    ],
    owners: OWNERS,
    ownTokens: [API3],
    resolveLP: true,
    resolveUniV3: true,
    fetchCoValentTokens: false,
  },
})

const baseTvl = base.ethereum.tvl
const baseOwnTokens = base.ethereum.ownTokens

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
  // Step A: Get balances of vault tokens across all owners
  const calls = []
  OWNERS.forEach(owner => {
    USDC_VAULTS.forEach(token => {
      calls.push({ target: token, params: owner })
    })
  })
  const vaultBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls })

  // Step B: Filter for non-zero balances to query convertToAssets
  const activeVaultCalls = []
  vaultBalances.forEach((bal, i) => {
    if (bal > 0) {
      activeVaultCalls.push({ 
        target: calls[i].target, 
        params: bal // convertToAssets takes the share amount as input
      })
    }
  })

  // Step C: Convert shares to assets (USDC)
  if (activeVaultCalls.length > 0) {
    const underlyingAssets = await api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: activeVaultCalls
    })
    underlyingAssets.forEach(amount => api.add(ADDRESSES.ethereum.USDC, amount))
  }

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
    blacklistedTokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.STETH]
  })

  return api.getBalances()
}

module.exports = base
