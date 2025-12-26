const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { sumTokens2 } = require("../helper/unwrapLPs");

const treasury = "0x556ecbb0311d350491ba0ec7e019c354d7723ce0"
const treasury2 = "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae"
const treasury3 = "0xe7af7c5982e073ac6525a34821fe1b3e8e432099"
const treasury4 = "0x8e03609ed680B237C7b6f8020472CA0687308b24"
const API = "0x0b38210ea11411557c13457d4da7dc6ea731b88a"

// Uni v4 NFT tokenId
const UNI_V4_POSITION_IDS = ["112856"]

const base = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.USDC,
      "0xb3f4d94a209045ef35661e657db9adac584141f1", // api3coreUSDC
      "0x68aea7b82df6ccdf76235d46445ed83f85f845a3", // oevUSDC
      "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d", // PNK
    ],
    owners: [treasury, treasury2, treasury3, treasury4],
    ownTokens: [API],
    resolveLP: true,
    resolveUniV3: true,
    fetchCoValentTokens: false,
  },
})

const baseTvl = base.ethereum.tvl

base.ethereum.tvl = async (api) => {
  // Run existing treasury logic (ERC20 + ownTokens + LP + UniV3)
  await baseTvl(api)

  // Add Uni v4 position explicitly
  await sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: UNI_V4_POSITION_IDS,
    },
  })

  return api.getBalances()
}

module.exports = base
