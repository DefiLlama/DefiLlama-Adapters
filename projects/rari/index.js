const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { requery } = require("../helper/requery");
const abi = require("./abi");
const { default: BigNumber } = require("bignumber.js");
const { getCompoundV2Tvl } = require('../helper/compound')
const { pool2 } = require('../helper/pool2');
const { getBlock } = require("../helper/http");
const { sliceIntoChunks } = require("../helper/utils");
const { sumTokens2 } = require("../helper/unwrapLPs");

const earnETHPoolFundControllerAddressesIncludingLegacy = [
  '0xD9F223A36C2e398B0886F945a7e556B41EF91A3C',
  '0xa422890cbBE5EAa8f1c88590fBab7F319D7e24B6',
  '0x3f4931a8e9d4cdf8f56e7e8a8cfe3bede0e43657',
]
const earnDAIPoolControllerAddressesIncludingLegacy = [
  '0x7C332FeA58056D1EF6aB2B2016ce4900773DC399',
  // '0x3F579F097F2CE8696Ae8C417582CfAFdE9Ec9966'
]
const earnStablePoolAddressesIncludingLegacy = [
  '0x4a785fa6fcd2e0845a24847beb7bddd26f996d4d',
  // '0x27C4E34163b5FD2122cE43a40e3eaa4d58eEbeaF',
  // '0x318cfd99b60a63d265d2291a4ab982073fbf245d',
  // '0xb6b79D857858004BF475e4A57D4A446DA4884866',
  // '0xD4be7E211680e12c08bbE9054F0dA0D646c45228',
  // '0xB202cAd3965997f2F5E67B349B2C5df036b9792e',
  // '0xe4deE94233dd4d7c2504744eE6d34f3875b3B439'
]
const fusePoolLensAddress = '0x8dA38681826f4ABBe089643D2B3fE4C6e4730493'
const fusePoolDirectoryAddress = '0x835482FE0532f169024d5E9410199369aAD5C77E'
const rariGovernanceTokenUniswapDistributorAddress = '0x1FA69a416bCF8572577d3949b742fBB0a9CD98c7'
const RGTETHSushiLPTokenAddress = '0x18a797c7c70c1bf22fdee1c09062aba709cacf04'
const ETHAddress = ADDRESSES.null
const bigNumZero = BigNumber('0')

const tokenMapWithKeysAsSymbol = {
  'DAI': ADDRESSES.ethereum.DAI,
  'USDC': ADDRESSES.ethereum.USDC,
  'USDT': ADDRESSES.ethereum.USDT,
  'TUSD': ADDRESSES.ethereum.TUSD,
  'BUSD': ADDRESSES.ethereum.BUSD,
  'SUSD': ADDRESSES.ethereum.sUSD,
  'MUSD': '0xe2f2a5c287993345a840db3b0845fbc70f5935a5'
}

const fusePoolData = {}

async function getFusePoolData(pools, block) {
  console.log({
    target: fusePoolLensAddress,
    abi: abi['getPoolSummary'],
    block,
    calls: pools.map(i => i.comptroller)
  })
  const data = { output: [] }
  const chunks = sliceIntoChunks(pools.map(i => ({ params: i.comptroller })), 25)
  for (const chunk of chunks) {
    const items = await sdk.api2.abi.multiCall({
      target: fusePoolLensAddress,
      abi: abi['getPoolSummary'],
      block,
      calls: chunk
    })
    console.log(items)
    data.output.push(...items.output)
  }
  return data
}

async function getFusePools(timestamp, block, balances, borrowed) {
  const fusePoolsAll = (await sdk.api.abi.call({
    target: fusePoolDirectoryAddress,
    block,
    abi: abi['getPublicPools']
  }))

  const fusePools = fusePoolsAll.output['1']

  if (!fusePoolData[block])
    fusePoolData[block] = getFusePoolData(fusePools, block)

  const poolSummaries = await fusePoolData[block]
  console.log(poolSummaries)

  for (let summaryResult of poolSummaries.output) {
    if (summaryResult.success) {
      const summary = summaryResult.output
      // https://docs.rari.capital/fuse/#get-pools-by-account-with-data
      let amount;
      if (borrowed) {
        amount = BigNumber(summary['1'])
      } else {
        amount = BigNumber(summary['0']).minus(summary['1'])
      }
      sdk.util.sumSingleBalance(balances, ETHAddress, amount.toFixed(0))
    } else {
      const newBalances = await getCompoundV2Tvl(summaryResult.input.params[0], 'ethereum', id => id, undefined, undefined, borrowed)(timestamp, block, { ethereum: block })
      Object.entries(newBalances).forEach(entry => sdk.util.sumSingleBalance(balances, entry[0], entry[1]))
    }
  }
}

async function borrowed(timestamp, block) {
  if (block > 14684686) {
    return {} // after fei hack
  }
  const balances = {}
  await getFusePools(timestamp, block, balances, true)
  return balances
}

async function tvl(timestamp, block) {
  const balances = {}
  block = await getBlock(timestamp, 'ethereum', { ethereum: block })

  const getEarnYieldProxyAddressAsArray = (block) => {
    if (block <= 11306334) {
      return ['0x35DDEFa2a30474E64314aAA7370abE14c042C6e8']
    } else if (block > 11306334 && block <= 11252873) {
      return ['0x6dd8e1Df9F366e6494c2601e515813e0f9219A88']
    } else {
      return ['0x35DDEFa2a30474E64314aAA7370abE14c042C6e8']
    }
  }

  const updateBalance = (token, amount) => {
    token = token.toLowerCase()
    sdk.util.sumSingleBalance(balances, token, amount.toFixed(0))
  }
  const getBalancesFromEarnPool = async (addresses) => {
    const earnPoolData = (await sdk.api.abi.multiCall({
      calls: addresses.map((address) => ({
        target: address
      })),
      block,
      abi: abi['getRawFundBalancesAndPrices']
    })).output.map((resp) => resp.output)
    for (let j = 0; j < earnPoolData.length; j++) {
      const poolData = earnPoolData[j] && earnPoolData[j]['0']
      for (let i = 0; poolData && i < poolData.length; i++) {
        const tokenSymbol = poolData[i].toUpperCase()
        const tokenContractAddress = tokenMapWithKeysAsSymbol[tokenSymbol]
        if (tokenContractAddress) {
          const tokenAmount = BigNumber(earnPoolData[j]['1'][i])
          if (tokenAmount.isGreaterThan(bigNumZero)) {
            updateBalance(tokenContractAddress, tokenAmount)
          }
          const pools = earnPoolData[j]['2'][i]
          const poolBalances = earnPoolData[j]['3'][i]
          if (pools && poolBalances && pools.length === poolBalances.length) {
            for (let k = 0; k < pools.length; k++) {
              const poolBalance = BigNumber(poolBalances[k])
              if (poolBalance.isGreaterThan(bigNumZero)) {
                updateBalance(tokenContractAddress, poolBalance)
              }
            }
          }
        }
      }
    }
  }

  // Earn yield pool
  const earnYieldProxyAddress = getEarnYieldProxyAddressAsArray(block)
  await getBalancesFromEarnPool(earnYieldProxyAddress)

  //Earn ETH pool
  const ethPoolData = (await sdk.api.abi.multiCall({
    block,
    abi: abi['getRawFundBalances'],
    calls: earnETHPoolFundControllerAddressesIncludingLegacy.map((address) => ({
      target: address
    }))
  })).output.map((resp) => resp.output).flat()
  for (let i = 0; i < ethPoolData.length; i++) {
    const ethAmount = BigNumber(ethPoolData[i]['0'])
    if (ethAmount.isGreaterThan(bigNumZero)) {
      updateBalance(ETHAddress, ethAmount)
    }
  }

  // Earn DAI pool
  await getBalancesFromEarnPool(earnDAIPoolControllerAddressesIncludingLegacy)

  // Earn stable pool
  await getBalancesFromEarnPool(earnStablePoolAddressesIncludingLegacy)

  // Fuse
  // await getFusePools(timestamp, block, balances, false)

  return balances
}

async function fuseTvl(__, _b, _cb, { api, }) {

  const [_, pools] = (await api.call({ target: fusePoolDirectoryAddress, abi: abi['getPublicPools'] }))
  const markets = (await api.multiCall({ abi: 'address[]:getAllMarkets', calls: pools.map(i => i.comptroller) })).flat()
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: markets })
  return sumTokens2({api , tokensAndOwners2: [tokens, markets]})
}
async function fuseBorrowed(__, _b, _cb, { api, }) {

  const [_, pools] = (await api.call({ target: fusePoolDirectoryAddress, abi: abi['getPublicPools'] }))
  const markets = (await api.multiCall({ abi: 'address[]:getAllMarkets', calls: pools.map(i => i.comptroller) })).flat()
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: markets })
  const bals = await api.multiCall({ abi: 'uint256:totalBorrows', calls: markets })
  api.addTokens(tokens, bals)
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  start: 1596236058,        // July 14, 2020
  ethereum: {
    tvl: sdk.util.sumChainTvls([tvl, fuseTvl]),
    pool2: pool2(rariGovernanceTokenUniswapDistributorAddress, RGTETHSushiLPTokenAddress),
    borrowed,
  },
  arbitrum: {
    // Borrowing is disabled, and Tetranode's locker is the only pool with significant tvl, so counting only that
    tvl: getCompoundV2Tvl('0xC7D021BD813F3b4BB801A4361Fbcf3703ed61716', 'arbitrum', undefined, undefined, undefined, false),
    borrowed: getCompoundV2Tvl('0xC7D021BD813F3b4BB801A4361Fbcf3703ed61716', 'arbitrum', undefined, undefined, undefined, true),
  },
  hallmarks: [
    [1651276800, "FEI hack"],
    [1649548800, "ICHI sell-off"],
    [1620432000, "First Rari hack"],
    [1654905600, "Bhavnani's announcement"]
  ]
}
