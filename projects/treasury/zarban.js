const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/sumTokens");

const abi = {
  "sin": "function sin(address) view returns (uint256)",
  "zar": "function zar(address) view returns (uint256)",
}
const vatAddress = "0x975Eb113D580c44aa5676370E2CdF8f56bf3F99F" // Scs vat contract
const vowAddress = "0xC56bbE915bCc665e6b3A293700caFf8296526061" // Scs vow contract
const ZAR = "0xd946188A614A0d9d0685a60F541bba1e8CC421ae" // ZAR token address

const tvlConfig = {
  permitFailure: true,
  tokens: [
    ADDRESSES.arbitrum.ARB, // ARB
    ZAR, // ZAR
    '0x1b0aB2827C4d25B3387C1D1bc9c076Fe0c7EdFb9', // zZar
    ADDRESSES.arbitrum.DAI, // DAI
    '0xbb027125E073ad4D500a89889bC0C93abb63B710', // zDai
    ADDRESSES.arbitrum.WBTC, // WBTC
    '0x76806eA64f2609C7B2B2C638dA1fa66237fB1073', // zWbtc
    ADDRESSES.arbitrum.WETH, // WETH
    '0xd22c4E46a3E10eF6f1CD0cDABf68e292966229f7', // zWETH
  ],
  owners: ["0xed42d47538f6bf191533a9943ceedc13b261809d"], // liquidity market's collector,
}

async function treasuryTvl(api) {

  // liquidity market treasury
  await sumTokens({  api, ...tvlConfig })

  // stablecoin system treasury
  const zarBalance = await api.call({ abi: abi.zar, params: [vowAddress], target: vatAddress })
  const sinBalance = await api.call({ abi: abi.sin, params: [vowAddress], target: vatAddress })
  api.add(ZAR, (zarBalance - sinBalance) / 1e27)
}

module.exports = {
  arbitrum: { tvl: treasuryTvl }
}
