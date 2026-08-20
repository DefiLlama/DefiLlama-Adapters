const ADDRESSES = require('../helper/coreAssets.json')

const commonVaults = [
  '0xf0bb20865277aBd641a307eCe5Ee04E79073416C', // liquidETH
  '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C', // liquidUSD
  '0x5f46d540b6eD704C3c8789105F30E075AA900726', // liquidBTC
  ADDRESSES.ethereum.EBTC,
  ADDRESSES.ethereum.EUSD,
]

const vaults = {
  optimism: [
    ...commonVaults,
    '0x86B5780b606940Eb59A062aA85a07959518c0161', // sETHFI
    '0xca5921DF65E2e1b0B98Ae91c0187BA80D4124898', // liquidRESERVE
    '0xcC476B1a49bcDf5192561e87b6Fb8ea78aa28C13', // weEUR
    '0x17bC8Ffd82b8a36e737Ca1141C025089589B915e', // liquidRWA
  ],
  scroll: [
    ...commonVaults,
    '0x86B5780b606940Eb59A062aA85a07959518c0161', // sETHFI
    '0xb7Fb3768CAAC98354EaDF514b48f28F2fE822bF0', // liquidRESERVE
  ],
}

async function tvl(api) {
  const chainVaults = vaults[api.chain]
  const totalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: chainVaults,
    permitFailure: true,
  })

  totalSupplies.forEach((totalSupply, index) => {
    if (totalSupply != null) api.add(chainVaults[index], totalSupply)
  })
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  optimism: {
    tvl,
  },
  scroll: {
    tvl,
  },
}
