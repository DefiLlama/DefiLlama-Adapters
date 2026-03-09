const ADDRESSES = require('../helper/coreAssets.json')
const { unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

const CONFIG = {
  optimism: {
    m2ms: [
      '0x9Af655c4DBe940962F776b685d6700F538B90fcf', // USD+
      '0x8416d215b71a5C91b04E326140bbbDcDa82C01da', // DAI+
    ],
    assets: [
      ADDRESSES.optimism.USDC,
      ADDRESSES.optimism.DAI
    ]
  },
  arbitrum: {
    m2ms: [
      '0x9Af655c4DBe940962F776b685d6700F538B90fcf', // USD+
      '0xF04124F4226389d1Bf3ad7AcB54da05fF4078c8b', // DAI+
      '0xf3607bB88738c3388b543d390a90B6ABF4046E3b', // USDT+
      '0x672F0f9ECF78406E4E31cd531b0CefE32f0A84B5', // ETH+
    ],
    assets: [
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.DAI,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.null
    ]
  },
  era: {
    m2ms: [
      '0x240aad990FFc5F04F11593fF4dCF1fF714d6fc80', // USD+
      '0x560f43D548694517101c0EbE37cf022BB6c1ffc9', // USDT+
    ],
    assets: [
      ADDRESSES.era.USDC,
      ADDRESSES.era.USDT,
    ]
  },
  linea: {
    m2ms: [
      '0x1F4947Cd5A5c058DD5EA6Fd1CCd5c311aDa9E6Fb', // USD+
      '0x3d67655A49Adb0F44530233Cbf8375D33FfAde41', // USDT+
    ],
    assets: [
      ADDRESSES.linea.USDC,
      ADDRESSES.linea.USDT,
    ]
  },
  base: {
    m2ms: [
      '0x1F4947Cd5A5c058DD5EA6Fd1CCd5c311aDa9E6Fb', // USD+
      '0x7a62315519A39d562c1E49EB35b300d2E6742f86', // DAI+
      '0x96aa0bBe4D0dea7C4AF4739c53dBFA0300262253', // USDC+
    ],
    assets: [
      ADDRESSES.base.USDC,
      ADDRESSES.base.DAI,
      ADDRESSES.base.USDC,
    ]
  },
  bsc: {
    m2ms: [
      '0x9Af655c4DBe940962F776b685d6700F538B90fcf', // USD+
      '0xF3434f6a11AA950150AF3e4962E39E6281496EF9', // USDT+
    ],
    assets: [
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ]
  },
  blast: {
    m2ms: [
      '0x93dD104528B35E82c061BB0D521096dCF11628FA', // USD+
      '0x1d48DD3094EbB4B9a2c5Ab96dF4ef05bFF562F26', // USDC+
    ],
    assets: [
      ADDRESSES.blast.USDB,
      ADDRESSES.blast.USDB,
    ]
  },
  polygon: {
    m2ms: [
      '0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72', // USD+
    ],
    assets: [
      ADDRESSES.polygon.USDC,
    ]
  },
  sonic: {
    m2ms: [
      '0x1b5949147D2BB411b1f99a61cC25068A86C42519', // USD+
    ],
    assets: [
      ADDRESSES.sonic.USDC_e,
    ]
  },
}

const abi = {
  strategyAssets: "function strategyAssets() view returns ((address strategy, uint256 netAssetValue, uint256 liquidationValue)[])"
}

const tvl = async (api) => {
  const { m2ms, assets } = CONFIG[api.chain]
  const strategyAssetss = await api.multiCall({ calls: m2ms, abi: abi.strategyAssets })

  m2ms.forEach((_, i) => {
    const strategyAssets = strategyAssetss[i]
    strategyAssets.forEach(({ strategy, netAssetValue }) => {
      // we exclude the aerodrome position which is 99% USDC+
      if (api.chain === 'base' && m2ms[i] === '0x96aa0bBe4D0dea7C4AF4739c53dBFA0300262253')
        if (strategy.toLowerCase() !== '0x744a222750A0681FB2f7167bDD00E2Ba611F89A9'.toLowerCase()) return;
      api.add(assets[i], netAssetValue)
    })
  })

 /*  if (api.chain === 'base') {
    // unwrap aerodrome positions
    const strategy = '0xcc9c1edae4D3b8d151Ebc56e749aD08b09f50248'
    const CLGauge = '0xd030df11fa453a222782f6458cc71954a48ea104'
    const positionIds = await api.call({ target: CLGauge, abi: 'function stakedValues(address) view returns (uint256[])', params: strategy })
    const nftAddress = await api.call({  abi: 'address:nft', target: CLGauge})

    await unwrapSlipstreamNFT({ api, positionIds, nftAddress, })
    api.removeTokenBalance('0x85483696Cc9970Ad9EdD786b2C5ef735F38D156f')
  } */
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
