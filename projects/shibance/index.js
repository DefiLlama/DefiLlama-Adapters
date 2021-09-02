const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");
const Web3 = require('web3');
const { getBalanceNumber, getFullDisplayBalance, getDecimalAmount } = require('./format');

require("dotenv").config();

const cakeVaultAbi = require('./abi.json');

function getWeb3(chain) {
  let envName = chain.toUpperCase() + '_RPC';
  let web3RpcUrl = process.env[envName].split(',')[0];
  return new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
}

const woofVaultContractAddres = {
  kcc: '0x5cE1e2F6c99aFcfbB6E640354837C263ec3a5664',
  bsc: '0x09fE45A62502E7a0b226a99f18043F3eC32F78E8'
}


// const farms = [
//   {
//     pid: 0,
//     lpSymbol: 'KWOOF',
//     lpAddresses: {
//       321: '0x192F72eFD1009D90B0e6F82Ff27a0a2389F803e5',
//     },
//     token: tokens.syrup,
//     quoteToken: tokens.wbnb,
//   },
//   {
//     pid: 10,
//     lpSymbol: 'KAFE-KWOOF LP',
//     lpAddresses: {
//       321: '0x016b2ec91d6eebf65827c16b612a35187e0db6f9',
//     },
//     token: tokens.kafe,
//     quoteToken: tokens.kwoof,
//   },
//   {
//     pid: 11,
//     lpSymbol: 'KAFE-USDT LP',
//     lpAddresses: {
//       321: '0x473666ca99a69c3d445386c0c4d1b524c9e8fd35',
//     },
//     token: tokens.kafe,
//     quoteToken: tokens.busd,
//   },
//   {
//     pid: 1,
//     lpSymbol: 'KWOOF-KCS LP',
//     lpAddresses: {
//       321: '0x463e451d05f84da345d641fbaa3129693ce13816',
//     },
//     token: tokens.kwoof,
//     quoteToken: tokens.wbnb,
//   },
//   {
//     pid: 3,
//     lpSymbol: 'KWOOF-USDT LP',
//     lpAddresses: {
//       321: '0x5ea4ee58945c7e94c6efdce53d0b46d3dfbcf7db',
//     },
//     token: tokens.kwoof,
//     quoteToken: tokens.busd,
//   },
//   {
//     pid: 4,
//     lpSymbol: 'KWOOF-USDC LP',
//     lpAddresses: {
//       321: '0xd05be4d487beffb4eb9dbec9f16158d7c9e60a7c',
//     },
//     token: tokens.kwoof,
//     quoteToken: tokens.usdc,
//   },
//   {
//     pid: 2,
//     lpSymbol: 'USDT-KCS LP',
//     lpAddresses: {
//       321: '0x5a4b75cec96b99bc7dda80c42914636a5a46dfb1',
//     },
//     token: tokens.busd,
//     quoteToken: tokens.wbnb,
//   },
//   {
//     pid: 5,
//     lpSymbol: 'USDC-KCS LP',
//     lpAddresses: {
//       321: '0x3705eef160335a9aaa375ce31f858ba0a64aade0',
//     },
//     token: tokens.usdc,
//     quoteToken: tokens.wbnb,
//   },
//   {
//     pid: 6,
//     lpSymbol: 'USDC-USDT LP',
//     lpAddresses: {
//       321: '0x7060d8bfe77df123c8992d6ebf36b66163124c33',
//     },
//     token: tokens.usdc,
//     quoteToken: tokens.busd,
//   },
//   {
//     pid: 7,
//     lpSymbol: 'GHOST-KWOOF LP',
//     lpAddresses: {
//       321: '0x35540268609fbfbbed512bc917d75668e5f5d11d',
//     },
//     token: tokens.ghost,
//     quoteToken: tokens.kwoof,
//   },
//   {
//     pid: 8,
//     lpSymbol: 'KUST-KWOOF LP',
//     lpAddresses: {
//       321: '0x4eda6784ed216a30d89da18a73c05dff810c69e2',
//     },
//     token: tokens.kust,
//     quoteToken: tokens.kwoof,
//   },
// ]


const convertSharesToWoof = (
  shares,
  cakePerFullShare,
  decimals = 18,
  decimalsToRound = 3,
) => {
  const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals)
  const amountInCake = new BigNumber(shares.multipliedBy(sharePriceNumber))
  const cakeAsNumberBalance = getBalanceNumber(amountInCake, decimals)
  const cakeAsBigNumber = getDecimalAmount(new BigNumber(cakeAsNumberBalance), decimals)
  const cakeAsDisplayBalance = getFullDisplayBalance(amountInCake, decimals, decimalsToRound)
  return { cakeAsNumberBalance, cakeAsBigNumber, cakeAsDisplayBalance }
}

const fetchPublicVaultData = async (chain) => {
  try {
    const web3 = getWeb3(chain);
    const woofVaultAddress = woofVaultContractAddres[chain];
    const woofVaultContract = new web3.eth.Contract(cakeVaultAbi, woofVaultAddress);
    
    const [sharePrice, shares, estimatedCakeBountyReward, totalPendingCakeHarvest] = await Promise.all([
      woofVaultContract.methods.getPricePerFullShare().call(),
      woofVaultContract.methods.totalShares().call(),
      woofVaultContract.methods.calculateHarvestCakeRewards().call(),
      woofVaultContract.methods.calculateTotalPendingCakeRewards().call(),
    ])
    const totalSharesAsBigNumber = new BigNumber(shares);
    const sharePriceAsBigNumber = new BigNumber(sharePrice);
    const totalCakeInVaultEstimate = convertSharesToWoof(totalSharesAsBigNumber, sharePriceAsBigNumber);
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: totalCakeInVaultEstimate.cakeAsBigNumber.toJSON(),
      estimatedCakeBountyReward: new BigNumber(estimatedCakeBountyReward).toJSON(),
      totalPendingCakeHarvest: new BigNumber(totalPendingCakeHarvest).toJSON(),
    }
  } catch (error) {
    console.log(error)
    return {
      totalShares: null,
      pricePerFullShare: null,
      totalCakeInVault: null,
      estimatedCakeBountyReward: null,
      totalPendingCakeHarvest: null,
    }
  }
}

const graphUrls = {
  kcc: 'https://info.shibance.com/subgraphs/name/shibance/exchange-kcc',
  bsc: 'https://api.thegraph.com/subgraphs/name/shibance/exchange-backup'
}
// const chainTvl = getChainTvl(graphUrls)
// async function bsc(_timestamp, _ethBlock, chainBlocks){
//   return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', '0x092EE062Baa0440B6df6BBb7Db7e66D8902bFdF7', 0, true);
// }

;(async () => {

  const chainData = await fetchPublicVaultData('kcc');

  const farmsLiquidity = useMemo(() => {
    if (woofPrice.gt(0)) {
      const liquidities = farmsLP.map((farm) => {
        if (farm.pid !== 0 && farm.multiplier !== '0X' && farm.lpTotalInQuoteToken && farm.quoteToken.busdPrice) {
          return new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
        }
        return null
      })

      return liquidities.filter((liquidity) => !!liquidity).reduce((a, b) => a.plus(b))
    }
    return null
  }, [woofPrice, farmsLP])

  // Currently assumes all pools use WOOF as staking token
  const poolsStaked = useMemo(() => {
    if (woofPrice.gt(0) && totalCakeInVault.gt(0)) {
      const staked = pools.map((pool) => {
        if (pool.sousId === 0) {
          return new BigNumber(pool.totalStaked).minus(totalCakeInVault).times(woofPrice)
        }
        return new BigNumber(pool.totalStaked).times(woofPrice)
      })

      return staked.reduce((a, b) => a.plus(b))
    }
    return null
  }, [woofPrice, pools, totalCakeInVault])

  const tvl =
    farmsLiquidity && totalCakeInVault && poolsStaked
      ? farmsLiquidity
          .plus(getBalanceNumber(totalCakeInVault.times(woofPrice).plus(poolsStaked), 18))
          .toNumber()
          .toLocaleString('en-US', { maximumFractionDigits: 0 })
      : null

  const woofPrice = new BigNumber();
  farmsLiquidity
          .plus(getBalanceNumber(totalCakeInVault.times(woofPrice).plus(poolsStaked), 18))
          .toNumber()

  farmsLiquidity + 
  totalCakeInVault + 
  poolsStaked
  console.log(chainData)
})();

// module.exports = {
//   misrepresentedTokens: true,
//   methodology: "We count liquidity on the dexes, pulling data from subgraphs",
//   kcc: {
//     tvl: chainTvl('kcc'),
//   },
//   bsc:{
//     tvl: bsc
//   },
//   tvl: sdk.util.sumChainTvls([chainTvl('kcc'), bsc])
// }