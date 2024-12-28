const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi");
const { compoundExports2 } = require('../helper/compound')
const { pool2 } = require('../helper/pool2');
const { sumTokens2 } = require("../helper/unwrapLPs");

const earnETHPoolFundControllerAddressesIncludingLegacy = [
  '0xD9F223A36C2e398B0886F945a7e556B41EF91A3C',
  '0xa422890cbBE5EAa8f1c88590fBab7F319D7e24B6',
  '0x3f4931a8e9d4cdf8f56e7e8a8cfe3bede0e43657',
]
const earnDAIPoolControllerAddressesIncludingLegacy = [
  '0x7C332FeA58056D1EF6aB2B2016ce4900773DC399',
]
const earnStablePoolAddressesIncludingLegacy = [
  '0x4a785fa6fcd2e0845a24847beb7bddd26f996d4d',
]
const fusePoolDirectoryAddress = '0x835482FE0532f169024d5E9410199369aAD5C77E'
const rariGovernanceTokenUniswapDistributorAddress = '0x1FA69a416bCF8572577d3949b742fBB0a9CD98c7'
const RGTETHSushiLPTokenAddress = '0x18a797c7c70c1bf22fdee1c09062aba709cacf04'

const tokenMapWithKeysAsSymbol = {
  'DAI': ADDRESSES.ethereum.DAI,
  'USDC': ADDRESSES.ethereum.USDC,
  'USDT': ADDRESSES.ethereum.USDT,
  'TUSD': ADDRESSES.ethereum.TUSD,
  'BUSD': ADDRESSES.ethereum.BUSD,
  'SUSD': ADDRESSES.ethereum.sUSD,
  'MUSD': '0xe2f2a5c287993345a840db3b0845fbc70f5935a5'
}


async function tvl(api) {

  const getBalancesFromEarnPool = async (addresses) => {
    const earnPoolData = (await api.multiCall({ calls: addresses, abi: abi['getRawFundBalancesAndPrices'], permitFailure: true, }))
    earnPoolData.filter(i => i).forEach(([tokens, bals] = []) => {
      tokens.forEach((token, i) => {
        const mapped = tokenMapWithKeysAsSymbol[token.toUpperCase()]
        if (mapped) api.add(mapped, bals[i])
        else console.log('unmapped', token, bals[i])
      })
    })
  }

  // Earn yield pool
  const earnYieldProxyAddress = ['0x35DDEFa2a30474E64314aAA7370abE14c042C6e8'].concat(earnETHPoolFundControllerAddressesIncludingLegacy).concat(earnDAIPoolControllerAddressesIncludingLegacy).concat(earnStablePoolAddressesIncludingLegacy)
  await getBalancesFromEarnPool(earnYieldProxyAddress)

  await fuseTvl(api)
}

async function fuseTvl(api) {

  const [_, pools] = (await api.call({ target: fusePoolDirectoryAddress, abi: abi['getPublicPools'] }))
  const markets = (await api.multiCall({ abi: 'address[]:getAllMarkets', calls: pools.map(i => i.comptroller) })).flat()
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: markets })
  return sumTokens2({api , tokensAndOwners2: [tokens, markets]})
}

module.exports = {
  doublecounted: true,
  start: '2020-08-01',        // July 14, 2020
  ethereum: {
    tvl,
    pool2: pool2(rariGovernanceTokenUniswapDistributorAddress, RGTETHSushiLPTokenAddress),
  },
  arbitrum: compoundExports2({ comptroller: '0xC7D021BD813F3b4BB801A4361Fbcf3703ed61716' }),
  hallmarks: [
    [1651276800, "FEI hack"],
    [1649548800, "ICHI sell-off"],
    [1620432000, "First Rari hack"],
    [1654905600, "Bhavnani's announcement"]
  ]
}

module.exports.arbitrum.borrowed = () => ({})
module.exports.ethereum.borrowed = () => ({})
