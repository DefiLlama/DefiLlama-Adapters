const { sumTokens2 } = require('../helper/unwrapLPs')

const dpiToken = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'
const dpiEthToken = '0x4d5ef58aAc27d99935E5b6B4A6778ff292059991'
const bDPISLP = '0x8d782C5806607E9AAFB2AC38c1DA3838Edf8BD03'
const bDPIToken = '0x0309c98B1bffA350bcb3F9fB9780970CA32a5060'
const masterChef = '0xDB9daa0a50B33e4fe9d0ac16a1Df1d335F96595e'
const continuousMigrator = '0x3f436dE9ef3f07b770c4DB45F60f9f1d323Bbf36'

const bmiToken = "0x0aC00355F80E289f53BF368C9Bdb70f5c114C44B";

async function tvl(api) {
  const ownerTokens = [
    [[dpiToken, dpiEthToken, bDPISLP], masterChef],
    [[dpiToken], continuousMigrator],
  ]
  const [bmiData, bdpiData] = await api.multiCall({
    calls: [bmiToken, bDPIToken],
    abi: 'function getAssetsAndBalances() view returns (address[] assets, uint256[] balances)',
  })
  ownerTokens.push([bmiData.assets, bmiToken])
  ownerTokens.push([bdpiData.assets, bDPIToken])
  return sumTokens2({
    api,
    resolveLP: true,
    ownerTokens,
  })
}

module.exports = {
  ethereum: { tvl },
}
