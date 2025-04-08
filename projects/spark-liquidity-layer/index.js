const ADDRESSES = require('../helper/coreAssets.json')
const mainnetAllocatorToTokens = {
  '0xAfA2DD8a0594B2B24B59de405Da9338C4Ce23437': [
    '0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B', // spDai
  ],
  '0x9C259F14E5d9F35A0434cD3C4abbbcaA2f1f7f7E': [
    '0x73e65dbd630f90604062f6e02fab9138e713edd9' // morpho spDAI
  ],
  '0xbf674d0cD6841C1d7f9b8E809B967B3C5E867653': [
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
  ],
  '0x1601843c5E9bC251A3272907010AFa41Fa18347E': [
    '0x377C3bd93f2a2984E1E7bE6A5C22c525eD4A4815', // spUSDC
    '0x09AA30b182488f769a9824F15E6Ce58591Da4781', // aEthLidoUSDS
    '0xC02aB1A5eaA8d1B114EF786D9bde108cD4364359', // spUSDS
    ADDRESSES.ethereum.sUSDe, // sUSDe
    '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
    '0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259', // aEthUSDS
    ADDRESSES.ethereum.USDe, // USDe
    '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041', // BUIDL-I
    '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e', // USTB
    '0x8c213ee79581Ff4984583C6a801e5263418C4b86', // JTSRY
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC
  ]
}

const baseAllocatorToTokens = {
  '0x2917956eFF0B5eaF030abDB4EF4296DF775009cA': [
    '0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A', // morpho sparkUSDC
    '0xf62e339f21d8018940f188F6987Bcdf02A849619', // fsUSDS
    '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // aBasUSDC
  ],
  '0x1601843c5E9bC251A3272907010AFa41Fa18347E': [
    ADDRESSES.base.USDC, // USDC
  ]
}

const arbitrumAllocatorToTokens = {
  '0x2B05F8e1cACC6974fD79A673a341Fe1f58d27266': [
    ADDRESSES.arbitrum.USDC_CIRCLE // USDC
  ]
}

const CONFIG = {
  ethereum: mainnetAllocatorToTokens,
  base: baseAllocatorToTokens,
  arbitrum: arbitrumAllocatorToTokens,
}

async function tvl(api) {
  const tokenRecords = CONFIG[api.chain]
  const balanceCalls = Object.entries(tokenRecords).flatMap(([allocator, tokens]) => {
    return tokens.map((token) => ({ target: token, params: allocator }))
  })
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCalls })

  const allTokens = Object.values(tokenRecords).flat()
  api.add(allTokens, balances)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
