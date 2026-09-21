const { getUniTVL, sumUnknownTokens, staking } = require('../helper/unknownTokens')

// EticaHub on Etica mainnet (chainId 61803). Addresses:
// https://github.com/iamdexx/etica-hub/blob/main/packages/shared/src/addresses.ts
const ETI = '0x34c61EA91bAcdA647269d4e310A86b875c09946f' // Etica protocol token (coingecko: etica)
const ETX = '0xa5A1Bc6307b0b87989B8456D4b35F88a68650044' // EticaHub token
const WEGAZ = '0x232fb2B87CAce92B2438054A7eB79B4081E3E11a' // wrapped Etica gas
const SWAP_FACTORY = '0xfc8dE5A5087c8825AA54E2C57B3FFe0e23784bc3' // EticaSwap V2 factory
const STAKED_ETX = '0x75d81d03a98CD9195593b8963aF17E13fAa70334' // stETX ERC-4626 vault
const STABLE_SWAP = '0xbbf5814C1EA0531Cb07541b80c547ee7878C036E' // ETX/stETX stableswap
const ETI_ETX_PAIR = '0x88f179117BE4402a71ca3e9094E7942D03Db84b3'

// ETI is the only Etica asset with a reliable external price (coingecko: etica),
// so ETX (and every pool paired against it) is priced through the ETI/ETX pool.
// WEGAZ is excluded: the coins service prices it as ETI (~10x its market price),
// so the WEGAZ/ETX pool is counted by its ETX side only.
const coreAssets = [ETI]

const uniTvl = getUniTVL({ factory: SWAP_FACTORY, coreAssets, blacklistedTokens: [WEGAZ] })

async function tvl(api) {
  api.addBalances(await uniTvl(api))
  api.addBalances(await sumUnknownTokens({
    api,
    balances: {},
    owner: STABLE_SWAP,
    tokens: [ETX],
    lps: [ETI_ETX_PAIR],
    coreAssets,
  }))
}

module.exports = {
  methodology:
    'TVL is the value of tokens held in EticaSwap V2 pools plus the ETX side of the ETX/stETX stableswap. ' +
    'Staking is the ETX deposited in the stETX ERC-4626 vault. ETX is priced through the ETI/ETX EticaSwap ' +
    'pool (ETI = coingecko:etica). stETX (in the stETX/ETX pool and the stableswap) is excluded because its ' +
    'underlying ETX is already counted under staking; WEGAZ has no reliable price and is excluded.',
  etica: {
    tvl,
    staking: staking({
      owner: STAKED_ETX,
      tokens: [ETX],
      lps: [ETI_ETX_PAIR],
      coreAssets,
    }),
  },
}
