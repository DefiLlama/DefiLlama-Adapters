const { cachedGraphQuery } = require('../helper/cache')

const vaultsGraphs = {
  ethereum:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-mainnet/latest/gn",
  avax:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-avalanche/latest/gn",
  base:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-base/latest/gn",
  bsc:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-bnb/latest/gn",
  arbitrum:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-arbitrum/latest/gn",
  plasma:
    "https://api.subgraph.ormilabs.com/api/public/05e9a4e2-103b-4163-a81e-3b1b038d0055/subgraphs/term-finance-vaults-plasma/latest/gn",
}

const termVaultStrategiesQuery = `
query termVaultStrategiesQuery($lastId: ID, $block: Int) {
  termVaultStrategies(
    where: {
      id_gt: $lastId,
    },
    first: 1000,
    block: {
      number: $block
    }
  ) {
    id
    asset {
      id
    }
  }
}`

const termVaultStrategiesQueryHeadBlock = `
query termVaultStrategiesQuery($lastId: ID) {
  termVaultStrategies(
    where: {
      id_gt: $lastId,
    },
    first: 1000
  ) {
    id
    asset {
      id
    }
  }
}`

const vaultsGraphStartBlock = {
  ethereum: 21433264,
  avax: 54438973,
  base: 30797402,
  bsc: 54505207,
  arbitrum: 359134348,
  plasma: 1390659,
}

module.exports = {
  methodology: `Counts the liquid balance of Term Strategy Vaults: idle assets plus reserves parked in third party ERC4626 vaults. Capital deployed into Term repo tokens is left out here to avoid double counting, it is tracked by the term-finance adapter as locked purchase tokens and borrowed.`,
  // hallmarks: [['2020-05-04', "TermFinance Launch"]],
};

const vaultsMap = {
  base: [],
  avax: [
    '0x8fc260cd0a00cac30eb1f444b8f1511d71420af9',
    '0xe12520297046109d30b48476eecb214743fbece4'
  ], bsc: [
    '0x91b3ba993ba7699a0ec818a745c180706a4036c1',
    '0xddb74af74b9774f76186b186d08ff705f4c9c01b'
  ], arbitrum: [
    '0xb523f96a36ee5a2ac66cb89bcc6ad3454be07e44',
    '0xe4531a95840733a5f0cb94fb0db01bac6186ef39'
  ], plasma: [
    '0x539b2ee4f3a04f33d53c0813f77e65148963f72b',
    '0xa00faf8962f077f0719a4cbdef80b1db7fd7d3bd',
    '0xaf293898269ac7f366d0e05052b5fdfee8c8052c',
    '0xbd1cc507050d7f4dd9066646d83cda71f782295b',
    '0xfbdcf38c1f26806ed5811242037cef0fe00c6245'
  ], ethereum: [
    '0x000ecfd73e2e523767e161a99690e6ef8c1b8029',
    '0x047cfddd06018f53f54262fe64f2744ecd463fea',
    '0x1b1177276cd9b630ec53c912eb6a8cf5a29ae6eb',
    '0x2be901715468c3c5393efa841525a713c583a8ec',
    '0x2cdaeebe9607ee7579bbd69af44f44553fda764f',
    '0x32a338b07de8a9529ea640ba8a5806334d4b0931',
    '0x330732581d30076137a1159b3ae8780158d902be',
    '0x369d94320d06492de265c025bfaa4cf513a1845f',
    '0x4b10deba312d6ff12fda13535009816660fc4463',
    '0x533bcb3abe63c0b876d97b34184765b186a22e10',
    '0x59d675f75f973835b94d02b6d27b8539757dc65f',
    '0x6e7d87a64c78593781452a014dc989100b24a4af',
    '0x6f576e5192a14f259f7fe7347ecf63b255d7f7d1',
    '0x76dd96710a73675d9cf9523a046f1587ca9031d4',
    '0x839bf0cf6a34a74a6d3c79dce45635d8b904fe54',
    '0x901d94b9b6cf8b0eb84888b8bf7e978b16ec7bff',
    '0x9f1c3173581ced1204136cbc628d2fb2407d7ac4',
    '0xa10c40f9e318b0ed67ecc3499d702d8db9437228',
    '0xa9ca4909700505585b1ad2a1579da3b670ffa9c4',
    '0xae38b93d73040d3d3774df67b9de9d653b9cbb80',
    '0xb4e41e6eef1a77e700b46abacdf6d426fd256791',
    '0xb962fd1abd9a365140493bd499acf1ec0acff040',
    '0xcd30de9af40724742c8e3030ea7a84a668187c90',
    '0xd5e617420b9ea0be28751435b647328d63b10368',
    '0xe5ebb5ca8680e2ade07622ccb11e61e6f9e66e83',
    '0xe852db931ac6f02490a32695f09ee79a31f53821',
    '0xeeb6c834a56bc0f9fcaeba98c0b3681ff05dcea4',
    '0xfc36c2edb18829308fa9ee9500e8be6520a47caf'
  ]
}


Object.keys(vaultsGraphs).forEach(chain => {
  const vaultsHost = vaultsGraphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let vaultsData;
      try {

        if (!api.block) {
          vaultsData = await cachedGraphQuery(`term-finance-vaults-${chain}-head`, vaultsHost, termVaultStrategiesQueryHeadBlock, { fetchById: true, useBlock: false })
        } else if (api.block >= vaultsGraphStartBlock[chain]) {
          vaultsData = await cachedGraphQuery(`term-finance-vaults-${chain}`, vaultsHost, termVaultStrategiesQuery, { fetchById: true, useBlock: true, variables: { block: api.block } })
        } else {
          vaultsData = []
        }
        vaultsData = vaultsData.map(i => i.id)
      } catch (e) {
        vaultsData = vaultsMap[chain]
      }
      const strategyBalances = await api.multiCall({ abi: 'uint256:totalLiquidBalance', calls: vaultsData, })
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaultsData, })
      api.add(tokens, strategyBalances)
    },
  }
})
