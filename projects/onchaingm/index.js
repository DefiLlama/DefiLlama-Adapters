// GM Contract addresses by DefiLlama chain name
const GM_CONTRACTS = {
  '0g': "0x363cC75a89aE5673b427a1Fa98AFc48FfDE7Ba43",
  'op_bnb': "0xaB58759588A9E34c283528703Dff8E1001b84169",
  'plasma': "0xC9F0ea5DD7D83Fb1A7fcD96F21FB0BdCe59d25D6",
  'mezo': "0x8715c0B428B506c82492d8b7AEAd77199D0dC415",
  'somnia': "0x8Afd2C9E65bcb9fFDa4988eaF95976742a5213E5",
  'conflux': "0x178a6e68Ca1829A334E28FeE71FCf9aE855287FE",
  'camp': "0xfE913fBa0E32824E6aaE46a3D4b83f7D0B963BfE",
  'btnx': "0x363cC75a89aE5673b427a1Fa98AFc48FfDE7Ba43",
  'xdc': "0x178f55FaA0845Ae2e6348d53B9Ff3E869916b939",
  'klaytn': "0xF81Ceb493a593eF5c8961eFdE6354bf65cE0c984",
  'cronos': "0x84A2dc4fd3EFBbAcCc2f2edfC65F1067545275c8",
  'aurora': "0xA0692f67ffcEd633f9c5CfAefd83FC4F21973D01",
  'moonriver': "0xa89E3e260C85d19c0b940245FDdb1e845C93dED8",
  'moonbeam': "0xa89E3e260C85d19c0b940245FDdb1e845C93dED8",
  'fuse': "0xe9eB648D84293e1Bb927421a4B6D982bC8C1F67E",
  'ronin': "0xF81Ceb493a593eF5c8961eFdE6354bf65cE0c984",
  'katana': "0x3A266Daf9BC318cAdc2a5cDE1c4D700d710634e5",
  'plume_mainnet': "0x8Afd2C9E65bcb9fFDa4988eaF95976742a5213E5",
  'arbitrum_nova': "0x8715c0B428B506c82492d8b7AEAd77199D0dC415",
  'abstract': "0xd7D9964e433019e626cd7BB8803a89Ab50Fb08EF",
  'lens': "0xb31F8Ee512C59F216aF0e723f0594d1683d1f760",
  'zero_network': "0x46Fd6738f0129c968bceA6B22cA28f9051de5318",
  'degen': "0xd7D9964e433019e626cd7BB8803a89Ab50Fb08EF",
  'metis': "0xB5eC04f944942d949156f2F75cdCA96C31532953",
  'sei': "0x8715c0B428B506c82492d8b7AEAd77199D0dC415",
  'manta': "0xd7D9964e433019e626cd7BB8803a89Ab50Fb08EF",
  'bsc': "0xB4d915FeB8b0757792435C8229D4d6AA6ab7e88d",
  'mantle': "0xA710521c78e9876fb651E273AbDb6cABBc9d4855",
  'vana': "0x7fbc940561892EB797B78Bf9AAd9511Ab4328fC0",
  'polygon': "0x193BD80c4Ab0E8261Db61fC3243f7D9643c05e36",
  'celo': "0xeAbc990398DdF9F7cC44c9167Ff95B7CeE2C88f4",
  'ethereum': "0xcD21a60fB9f981dc1274F15ECaa250941edabd4E",
  'scroll': "0xcE8c1FcDD440b4Fd6e6c236568C74e6022767c97",
  'hyperliquid': "0x011DF91136609a4Dc0b1a329124D7DDB11816612",
  'avax': "0xBeDb1d315510Cba53d5E6822632783D7e6fBCf43",
  'era': "0x648F32bdda298335009732ba16705f887f108e49",
  'polynomial': "0x8070Cb690720A90B5d543483e7B6548a29954982",
  'sseed': "0xcc90b8E53f59708a429322adEC90376823AC3b17",
  'ancient8': "0x7fbc940561892EB797B78Bf9AAd9511Ab4328fC0",
  'arbitrum': "0x3e41E099Ebb943E0aDaCf63e5523b7cD9e36C510",
  'base': "0x8b8693CE3fb893426C70bF52858Ae58FdfbDC085",
  'soneium': "0x8ADA1808cc5ed8493836e6A79080ea0ea2f008eC",
  'mint': "0x355DADBa7232EFABD33624FF1E0Cc4DcF15032B3",
  'optimism': "0x7a6cBf1C52F1EA604971AcC941A76Ea8a641B0AB",
  'lisk': "0xAB4fD1467faB1a7591882D5DFC3dE530897C93B8",
  'mode': "0x5dAB1E5e8B7cbB7Dfc875A33C839c7cfd3331392",
  'zora': "0xC15D368aCaB9C611d423FD4b97C5720cF9709CCB",
  'linea': "0x153477989A631b2b28232891D08BC89840ABeA21",
  'unichain': "0x99ab62B16Fd4d91e31724eE753A71D9253b941D3",
  'ink': "0xA052A8Fb70Cf657a4712f8FF1D2F32d2c9B36A9a",
  'bob': "0xDe947b85661bb89Ba4381C69FBa2Cb3933bB9C33",
  'shape': "0x8070Cb690720A90B5d543483e7B6548a29954982",
  'taiko': "0xB087883444cF86DB0249CDeD5562fD6a1F3CFE99",
  'rari': "0x19109695083354d763B2FCcde54d0665B54f1D44",
  'redstone': "0x2d76f71eDa2B790750a7Cf0cE174Fd66029009c5",
  'blast': "0x2538dBc104f78Fc37929284f791Cf2719A8aeCaC",
  'swellchain': "0xBBcbef909ef102F7B7Bc76c2582CA973F394035C",
  'zircuit': "0x2d76f71eDa2B790750a7Cf0cE174Fd66029009c5",
  'berachain': "0x82f4909cDAd5888b946e05881d975073C53ee778",
  'zeta': "0xB8cCfe18bb8eC7E67168A48b17348Eac5637bedd",
  'hemi': "0xb98339582Fb06e517adC21E6496067A94fA7f4A3",
  'flare': "0x65bd329081E23938D4d9Cea7e3B6Bd3035ec8b77",
  'gravity': "0x2513b164d713079E262f8fC69EF73eb5DBFd3125",
  'fraxtal': "0xb05925AE342A993c5B4BE087Fd1542445DcEe2E0",
  'sonic': "0xBBcbef909ef102F7B7Bc76c2582CA973F394035C",
  'corn': "0x52486f4462923EBE6Aa507d776b8a808CA990cf2",
  'apechain': "0x7fbc940561892EB797B78Bf9AAd9511Ab4328fC0",
  'morph': "0x7a8Ed5FB3E9B310c9c9DE78E605c2DaB35Ad2ccc",
  'xlayer': "0xFf768644b77058Aa8ed0c7E774686C1403aaaeeB",
  'xrplevm': "0x7fbc940561892EB797B78Bf9AAd9511Ab4328fC0",
}

const sdk = require("@defillama/sdk")
const ADDRESSES = require('../helper/coreAssets.json')

const abi = {
  feeRecipient: "address:feeRecipient",
}

async function tvl(api) {
  const contractAddress = GM_CONTRACTS[api.chain]
  
  if (!contractAddress) {
    throw new Error(`No GM contract found for chain ${api.chain}`)
  }

  // Get fee recipient address
  const feeRecipient = await api.call({
    target: contractAddress,
    abi: abi.feeRecipient,
  })

  // Get native token balance of fee recipient
  const { output: balance } = await sdk.api.eth.getBalance({
    target: feeRecipient,
    chain: api.chain,
    block: api.block,
  })

  // Add native token balance as TVL
  api.addGasToken(balance)
}

// Create exports for each supported chain
const chainExports = {}

Object.keys(GM_CONTRACTS).forEach(chainName => {
  chainExports[chainName] = {
    tvl,
  }
})

module.exports = {
  ...chainExports,
  methodology: 'TVL is calculated as the native token balance of the feeRecipient address, which accumulates fees from GM transactions.',
}
