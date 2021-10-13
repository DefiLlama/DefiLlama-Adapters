const sdk = require("@defillama/sdk");
const abi = require("./abi");
const { default: BigNumber } = require("bignumber.js");
const {getCompoundV2Tvl} = require('../helper/compound')
const {pool2} = require('../helper/pool2')
//const {getCompoundV2Tvl} = require('../helper/compound')

const earnETHPoolFundControllerAddressesIncludingLegacy = [
  '0xD9F223A36C2e398B0886F945a7e556B41EF91A3C',
  '0xa422890cbBE5EAa8f1c88590fBab7F319D7e24B6',
  '0x3f4931a8e9d4cdf8f56e7e8a8cfe3bede0e43657',
]
const earnDAIPoolControllerAddressesIncludingLegacy = [
  '0x7C332FeA58056D1EF6aB2B2016ce4900773DC399',
  '0x3F579F097F2CE8696Ae8C417582CfAFdE9Ec9966'
]
const earnStablePoolAddressesIncludingLegacy = [
  '0x4a785fa6fcd2e0845a24847beb7bddd26f996d4d',
  '0x27C4E34163b5FD2122cE43a40e3eaa4d58eEbeaF',
  '0x318cfd99b60a63d265d2291a4ab982073fbf245d',
  '0xb6b79D857858004BF475e4A57D4A446DA4884866',
  '0xD4be7E211680e12c08bbE9054F0dA0D646c45228',
  '0xB202cAd3965997f2F5E67B349B2C5df036b9792e',
  '0xe4deE94233dd4d7c2504744eE6d34f3875b3B439'
]
const fusePoolLensAddress = '0x8dA38681826f4ABBe089643D2B3fE4C6e4730493'
const fusePoolDirectoryAddress = '0x835482FE0532f169024d5E9410199369aAD5C77E'
const rariGovernanceTokenUniswapDistributorAddress = '0x1FA69a416bCF8572577d3949b742fBB0a9CD98c7'
const sushiETHRGTPairAddress = '0x18a797c7c70c1bf22fdee1c09062aba709cacf04'
const WETHTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const RGTTokenAddress = '0xD291E7a03283640FDc51b121aC401383A46cC623'
const RGTETHSushiLPTokenAddress = '0x18a797c7c70c1bf22fdee1c09062aba709cacf04'
const ETHAddress = '0x0000000000000000000000000000000000000000'
const bigNumZero = BigNumber('0')

const tokenMapWithKeysAsSymbol = {
  'DAI':'0x6b175474e89094c44da98b954eedeac495271d0f',
  'USDC':'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  'USDT':'0xdac17f958d2ee523a2206206994597c13d831ec7',
  'TUSD':'0x0000000000085d4780b73119b644ae5ecd22b376',
  'BUSD':'0x4fabb145d64652a948d72533023f6e7a623c7c53',
  'SUSD':'0x57ab1ec28d129707052df4df418d58a2d46d5f51',
  'MUSD':'0xe2f2a5c287993345a840db3b0845fbc70f5935a5'
}


async function tvl(timestamp, block) {
  const balances = {}

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
      if (earnPoolData[j] && earnPoolData[j]['0'] && earnPoolData[j]['0'].length > 0) {
        for (let i = 0; i < earnPoolData[j]['0'].length; i++) {
          const tokenSymbol = earnPoolData[j]['0'][i].toUpperCase()
          const tokenContractAddress = tokenMapWithKeysAsSymbol[tokenSymbol]
          if(tokenContractAddress){
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
    const fusePools = (await sdk.api.abi.call({
      target: fusePoolDirectoryAddress,
      block,
      abi: abi['getPublicPools']
    })).output['1']
    //console.log(fusePools.map((poolInfo) => (poolInfo[2])))

    const poolSummaries = (await sdk.api.abi.multiCall({
      target: fusePoolLensAddress,
      abi: abi['getPoolSummary'],
      block,
      calls: fusePools.map((poolInfo) => ({
        params: [poolInfo[2]]
      }))
    })).output
    //console.log("summaries", poolSummaries.map(t=>t[0]))

  for (let summaryResult of poolSummaries) {
    if (summaryResult.success) {
      const summary = summaryResult.output
      // https://docs.rari.capital/fuse/#get-pools-by-account-with-data
      const collateral = BigNumber(summary['0']).minus(summary['1'])
      if (collateral.isGreaterThan(bigNumZero)) {
        updateBalance(ETHAddress, collateral)
      }
    } else {
      const newBalances = await getCompoundV2Tvl(summaryResult.input.params[0], 'ethereum', id=>id)(timestamp, block, {})
      Object.entries(newBalances).forEach(entry=>sdk.util.sumSingleBalance(balances, entry[0], entry[1]))
    }
  }

  return balances
}

module.exports = {
  misrepresentedTokens: true,
  start: 1596236058,        // July 14, 2020
  tvl,
  pool2:{
    tvl: pool2(rariGovernanceTokenUniswapDistributorAddress, RGTETHSushiLPTokenAddress)
  }
}
