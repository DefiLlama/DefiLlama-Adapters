const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

const TOKEN_ABI = {
  decimals: "uint8:decimals",
  totalSupply: "function totalSupply() view returns (uint256)",
}

async function fetchBeefyTVL(api) {
  const VAULTS = Object.values({
    'aerodrome-weth-klima': '0x1e96a15afb820d5EF58782fDf0f5A5DF027b3e38',
    'aerodrome-usdc-klima': '0x177ec2e92ed22c1efa964c2b46645172b06f3fe5',
    'aerodrome-cbbtc-klima': '0xC304af1A9a50ED2f9E904e8B2e576c3a593b4F88'
  })

  const tokens = await api.multiCall({ abi: 'address:want', calls: VAULTS })
  const balances = await api.multiCall({ abi: 'uint256:balance', calls: VAULTS })
  api.add(tokens, balances)
  return sumTokens2({ api, resolveLP: true})
}

module.exports = {
  methodology: "TVL counts the TCO2 tokens within the BCT pool on Polygon. On Base chain, TVL consists of liquidity pool deposits in the protocol's Beefy-based autocompounding vaults. Data is pulled from Beefy's API.",
  polygon: {
    tvl: async (api) => {
      // If the current block is earlier than the date BCT was transferred to KlimaDAO, return 0
      if (api.timestamp < 1709828986) return {}
      const bctAddress = "0x2F800Db0fdb5223b3C3f354886d907A671414A7F"
      const supply = await api.call({ target: bctAddress, abi: TOKEN_ABI.totalSupply })
      api.add(bctAddress, supply)
    },
    staking: staking("0x25d28a24Ceb6F81015bB0b2007D795ACAc411b4d", "0x4e78011ce80ee02d2c3e649fb657e45898257815"),
  },
  base: {
    pool2: fetchBeefyTVL
  },
  hallmarks: [
    [1709828986, "BCT administrative control transferred to KlimaDAO"],
    [1732153403, "Autocompounder launched"],
  ]
};