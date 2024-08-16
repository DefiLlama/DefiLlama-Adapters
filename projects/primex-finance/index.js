const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { abi } = require('./abi')

const config = {
  polygon: {
    bucketsFactory: '0x7E6915D307F434E4171cCee90e180f5021c60089',
    positionManager: '0x02bcaA4633E466d151b34112608f60A82a4F6035',
    traderBalanceVault: '0x0801896C67CF024606BcC92bd788d6Eb077CC74F',
    defaultTokens: {
      MATIC: ADDRESSES.polygon.WMATIC_1,
      WMATIC: ADDRESSES.polygon.WMATIC_2,
      WETH: ADDRESSES.polygon.WETH_1,
      WBTC: ADDRESSES.polygon.WBTC,
      USDC: ADDRESSES.polygon.USDC,
      USDT: ADDRESSES.polygon.USDT,
      AAVE: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
      DAI: ADDRESSES.polygon.DAI,
      LINK: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      GNS: "0xE5417Af564e4bFDA1c483642db72007871397896",
      EPMX: "0xDc6D1bd104E1efa4A1bf0BBCf6E0BD093614E31A",
      OM: "0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea",
      SAND: "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
      QUICK: ADDRESSES.polygon.QUICK,
      UNI: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
      MANA: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
      BAL: "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
      GRT: "0x5fe2b58c013d7601147dcdd68c143a77499f5531",
      SNX: "0x50b728d8d964fd00c2d0aad81718b71311fef68a",
      GHST: "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7",
      AVAX: "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b",
      CRV: "0x172370d5cd63279efa6d502dab29171933a610af",
      SUSHI: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a"
    },
    aaveTokens: {
      [ADDRESSES.polygon.WETH_1]: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
      [ADDRESSES.polygon.WBTC]: "0x078f358208685046a11C85e8ad32895DED33A249",
      [ADDRESSES.polygon.WMATIC_2]: "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97",
      [ADDRESSES.polygon.USDC]: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      [ADDRESSES.polygon.USDT]: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
    },
  },
  arbitrum: {
    bucketsFactory: '0x4e6f7372bCE4083c779c17B240A94dc2EA57AE67',
    positionManager: '0x86890E30cE9E1e13Db5560BbEb435c55567Af1cd',
    traderBalanceVault: '0xc08FFBBA8c5f42beb7e6dd29142cC61855a3076B',
    defaultTokens: {
      USDCe: ADDRESSES.arbitrum.USDC,
      USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
      USDT: ADDRESSES.arbitrum.USDT,
      WETH: ADDRESSES.arbitrum.WETH,
      ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      WBTC: ADDRESSES.arbitrum.WBTC,
      ARB: ADDRESSES.arbitrum.ARB,
      DAI: ADDRESSES.arbitrum.DAI,
      LINK: ADDRESSES.arbitrum.LINK,
      PENDLE: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
      GMX: ADDRESSES.arbitrum.GMX,
      GNS: "0x18c11FD286C5EC11c3b683Caa813B77f5163A122",
      RDNT: "0x3082CC23568eA640225c2467653dB90e9250AaA0",
      MAGIC: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
      JOE: "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
      STG: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6",
      EPMX: "0xA533f744B179F2431f5395978e391107DC76e103",
      LDO: "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
      UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      PEPE: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
      GRT: "0x9623063377AD1B27544C965cCd7342f7EA7e88C7",
      CRV: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
      KNC: "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB",
      XAI: "0x4cb9a7ae498cedcbb5eae9f25736ae7d428c9d66",
      FXS: "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7",
      TIA: "0xD56734d7f9979dD94FAE3d67C7e928234e71cD4C",
      RPL: "0xB766039cc6DB368759C1E56B79AFfE831d0Cc507",
    },
    aaveTokens: {
      [ADDRESSES.arbitrum.DAI]: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
      [ADDRESSES.arbitrum.USDC]: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      [ADDRESSES.arbitrum.USDT]: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
      [ADDRESSES.arbitrum.LINK]: "0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530",
      [ADDRESSES.arbitrum.WBTC]: "0x078f358208685046a11C85e8ad32895DED33A249",
      [ADDRESSES.arbitrum.WETH]: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    },
  },
  ethereum: {
    bucketsFactory: '0x7dE8607157124c894Ba9F18dd6138B5E8AAd5890',
    positionManager: '0x99d63fEA4b3Ef6ca77941df3C5740dAd1586f0B8',
    traderBalanceVault: '0x156e2fC8e1906507412BEeEB6640Bf999a1Ea76b',
    defaultTokens: {
      WETH: ADDRESSES.ethereum.WETH,
      ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      WBTC: ADDRESSES.ethereum.WBTC,
      USDC: ADDRESSES.ethereum.USDC,
      USDT: ADDRESSES.ethereum.USDT,
      DAI: ADDRESSES.ethereum.DAI,
      MATIC: ADDRESSES.ethereum.MATIC,
      LINK: ADDRESSES.ethereum.LINK,
      UNI: ADDRESSES.ethereum.UNI,
      SOL: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
      MKR: ADDRESSES.ethereum.MKR,
      SNX: ADDRESSES.ethereum.SNX,
      AAVE: ADDRESSES.ethereum.AAVE,
      COMP: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      CRV: ADDRESSES.ethereum.CRV,
      ['1INCH']: '0x111111111117dC0aa78b770fA6A738034120C302',
      EPMX: "0xA533f744B179F2431f5395978e391107DC76e103"
    },
    aaveTokens: {
      [ADDRESSES.ethereum.WETH]: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8",
      [ADDRESSES.ethereum.WSTETH]: "0x0B925eD163218f6662a35e0f0371Ac234f9E9371",
      [ADDRESSES.ethereum.WBTC]: "0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8",
      [ADDRESSES.ethereum.USDC]: "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c",
      [ADDRESSES.ethereum.DAI]: "0x018008bfb33d285247A21d44E50697654f754e63",
      [ADDRESSES.ethereum.LINK]: "0x5E8C8A7243651DB1384C0dDfDbE39761E8e7E51a",
      [ADDRESSES.ethereum.AAVE]: "0xA700b4eB416Be35b2911fd5Dee80678ff64fF6C9",
    },
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { bucketsFactory, positionManager, traderBalanceVault, defaultTokens, aaveTokens } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      const buckets = await api.call({ target: bucketsFactory, abi: abi.allBuckets })
      const borrowedTokensAddresses = await api.multiCall({ abi: abi.borrowedAsset, calls: buckets })

      const tokensAndOwnersBuckets = buckets.map((b, i) => [borrowedTokensAddresses[i], b])
      const aTokensAndOwnersBuckets = buckets.map((b, i) => [aaveTokens[borrowedTokensAddresses[i].toLowerCase()], b]).filter((p) => p[0])
      const tokensAndOwnersPM = Object.values(defaultTokens).map(t => [t, positionManager])
      const tokensAndOwnersTBV = Object.values(defaultTokens).map(t => [t, traderBalanceVault])

      const tokensAndOwners = tokensAndOwnersBuckets.concat(aTokensAndOwnersBuckets, tokensAndOwnersPM, tokensAndOwnersTBV)

      return sumTokens2({ api, tokensAndOwners })
    }
  }
})
