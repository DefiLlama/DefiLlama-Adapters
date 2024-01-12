const { getChainTransform } = require('../helper/portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');
const { get } = require('../helper/http');
const { nullAddress } = require('../helper/tokenMapping');

function point2PoolPriceUndecimalSqrt(point) {
  return (1.0001 ** point) ** 0.5;
}

function _getAmountX(liquidity, leftPt, rightPt, sqrtPriceR, sqrtRate, upper) {
  const sqrtPricePrPc = Math.pow(sqrtRate, rightPt - leftPt + 1);
  const sqrtPricePrPd = Math.pow(sqrtRate, rightPt + 1);

  const numerator = sqrtPricePrPc - sqrtRate;
  const denominator = sqrtPricePrPd - sqrtPriceR;

  if (!upper) {
    const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
    return amount;
  } else {
    const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
    return amount;
  }
}

function _getAmountY(liquidity, sqrtPriceL, sqrtPriceR, sqrtRate, upper) {
  const numerator = sqrtPriceR - sqrtPriceL;
  const denominator = sqrtRate - 1;
  if (!upper) {
    const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
    return amount;
  } else {
    const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
    return amount;
  }
}

function _liquidity2AmountXAtPoint(liquidity, sqrtPrice, upper) {
  const amountX = liquidity.div(sqrtPrice);
  if (!upper) {
    return new BigNumber(amountX.toFixed(0, 3));
  } else {
    return new BigNumber(amountX.toFixed(0, 2));
  }
}

function _liquidity2AmountYAtPoint(liquidity, sqrtPrice, upper) {
  const amountY = liquidity.times(sqrtPrice);
  if (!upper) {
    return new BigNumber(amountY.toFixed(0, 3));
  } else {
    return new BigNumber(amountY.toFixed(0, 2));
  }
}

async function addiZiPositionBalances(params, balances, chain, transformAddress) {
  const tokenX = params.miningInfo.tokenX_
  const tokenY = params.miningInfo.tokenY_
  const rangeLen = Number(params.miningInfo.rewardUpperTick_) - Number(params.miningInfo.rewardLowerTick_)

  const liquidity = new BigNumber(params.miningInfo.totalVLiquidity_).div(rangeLen).div(rangeLen).times(1e6)

  const currentPoint = Number(params.state.currentPoint)
  const currentLiqudity = Number(params.state.curliquidity)
  const currentLiqudityX = Number(params.state.curliquidityX)

  let amountX = new BigNumber(0)
  let amountY = new BigNumber(0)

  const sqrtRate = Math.sqrt(1.0001);
  const leftPtNum = Number(params.miningInfo.rewardLowerTick_);
  const rightPtNum = Number(params.miningInfo.rewardUpperTick_);
  // compute amountY without currentPt
  if (leftPtNum < currentPoint) {
    const rightPt = Math.min(currentPoint, rightPtNum);
    const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
    const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
    amountY = _getAmountY(new BigNumber(liquidity), sqrtPriceL, sqrtPriceR, sqrtRate, false);
  }

  // compute amountX without currentPt
  if (rightPtNum > currentPoint + 1) {
    const leftPt = Math.max(currentPoint + 1, leftPtNum);
    const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
    amountX = _getAmountX(new BigNumber(liquidity), leftPt, rightPtNum, sqrtPriceR, sqrtRate, false);
  }

  // compute amountX and amountY on currentPt
  if (leftPtNum <= currentPoint && rightPtNum > currentPoint) {
    const liquidityValue = new BigNumber(liquidity);
    const maxLiquidityYAtCurrentPt = new BigNumber(currentLiqudity).minus(currentLiqudityX);
    const liquidityYAtCurrentPt = liquidityValue.gt(maxLiquidityYAtCurrentPt) ? maxLiquidityYAtCurrentPt : liquidityValue;
    const liquidityXAtCurrentPt = liquidityValue.minus(liquidityYAtCurrentPt);
    const currentSqrtPrice = point2PoolPriceUndecimalSqrt(currentPoint);
    amountX = amountX.plus(_liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false));
    amountY = amountY.plus(_liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false));
  }
  const tokenIZI = params.miningInfo.iziTokenAddr_.toLowerCase()
  sdk.util.sumSingleBalance(balances, transformAddress(tokenIZI), new BigNumber(params.totalNIZI).toFixed(0))
  sdk.util.sumSingleBalance(balances, transformAddress(tokenX), new BigNumber(amountX).toFixed(0))
  sdk.util.sumSingleBalance(balances, transformAddress(tokenY), new BigNumber(amountY).toFixed(0))
}

async function unwrapiZiswapV3NFTs({ balances = {}, nftsAndOwners = [], block, chain = 'bsc', transformAddress, owner, nftAddress, owners }) {
  if (!nftsAndOwners.length) {
    if (!nftAddress)
      switch (chain) {
        case 'bsc': nftAddress = '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581'; break;
        default: throw new Error('missing default uniswap nft address')
      }

    if (!owners && owner)
      owners = [owner]

    if (!owners) {
      return balances
    }


    for (let i = 0; i < Object.keys(owners).length; i++) {
      let type = Object.keys(owners)[i]
      if (!owners[type] || owners[type].length == 0) {
        continue
      }
      else if (type == 'fixRange') {
        let ownersUni = getUniqueAddresses(owners[type])
        let nftsAndOwners = ownersUni.map(o => [nftAddress, o])
        await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapiZiswapFixNFT({ balances, owner, nftAddress, block, chain, transformAddress })))
      }
      else if (type == 'dynamicRange') {
        let ownersUni = getUniqueAddresses(owners[type])
        let nftsAndOwners = ownersUni.map(o => [nftAddress, o])
        await Promise.all(nftsAndOwners.map(([nftAddress, owner]) => unwrapiZiswapDynamicNFT({ balances, owner, nftAddress, block, chain, transformAddress })))
      }
    }
  }
  return balances

  function getUniqueAddresses(addresses) {
    const set = new Set()
    addresses.forEach(i => set.add(i.toLowerCase()))
    return [...set]
  }
}

async function unwrapiZiswapFixNFT({ balances, owner, nftAddress, block, chain = 'bsc', transformAddress }) {
  if (!transformAddress) {
    transformAddress = await getChainTransform(chain)
  }
  const miningInfo = (await sdk.api.abi.call({ target: owner, abi: abi.fixRangeMiningInfo, block, chain })).output
  const totalNIZI = (await sdk.api.abi.call({ target: owner, abi: abi.totalNIZI, block, chain })).output
  const factory = (await sdk.api.abi.call({ target: nftAddress, abi: abi.factory, block, chain })).output
  const poolInfo = (await sdk.api.abi.call({
    target: factory, abi: abi.pool, block, chain, params: [miningInfo.tokenX_, miningInfo.tokenY_, miningInfo.fee_]
  })).output
  if (poolInfo == nullAddress) return balances
  const state = (await sdk.api.abi.call({ target: poolInfo, abi: abi.state, block, chain })).output

  let params = {
    miningInfo: miningInfo,
    state: state,
    totalNIZI: totalNIZI,
  }
  await addiZiPositionBalances(params, balances, chain, transformAddress)

  return balances
}

async function unwrapiZiswapDynamicNFT({ balances, owner, nftAddress, block, chain = 'bsc', transformAddress }) {
  if (!transformAddress) {
    transformAddress = await getChainTransform(chain)
  }
  const miningContractInfo = (await sdk.api.abi.call({ target: owner, abi: abi.DynamicRangeMiningInfo, block, chain })).output
  const tokenA = miningContractInfo.tokenX_
  const tokenB = miningContractInfo.tokenY_
  const tokenIZI = miningContractInfo.iziTokenAddr_.toLowerCase()
  const tokenAAmount = new BigNumber(miningContractInfo.totalTokenX_);
  const tokenBAmount = new BigNumber(miningContractInfo.totalTokenY_);
  const totalNIZI = Number(miningContractInfo.totalNIZI_ ?? 0);
  sdk.util.sumSingleBalance(balances, transformAddress(tokenIZI), new BigNumber(totalNIZI).toFixed(0))
  sdk.util.sumSingleBalance(balances, transformAddress(tokenA), new BigNumber(tokenAAmount).toFixed(0))
  sdk.util.sumSingleBalance(balances, transformAddress(tokenB), new BigNumber(tokenBAmount).toFixed(0))

  return balances
}

async function checkAndFixToken(balances, chain, fixTokens) {
  if (fixTokens.length) {
    for (let token of fixTokens) {
      if (`${chain}:${token.address.toLowerCase()}` in balances || token.address.toLowerCase() in balances) {
        const [data, { output: decimals }] = await Promise.all([
          get(`https://izumi.finance/api/v1/token_info/price_info/${token.symbol}/`),
          sdk.api.erc20.decimals(token.address, chain)
        ]);
        let amount = balances[token.address.toLowerCase()] ? balances[token.address.toLowerCase()] : balances[`${chain}:${token.address.toLowerCase()}`]
        if (!amount) {
          return;
        }
        sdk.util.sumSingleBalance(
          balances,
          "usd-coin",
          amount * data.data / 10 ** decimals
        );
        delete balances[token.address.toLowerCase()];
        delete balances[`${chain}:${token.address.toLowerCase()}`];
      }
    }
  }
  return;
}

async function unwrapNFTs({ balances = {}, nftsAndOwners = [], block, chain = 'bsc', transformAddress, owner, nftAddress, config, fixTokens }) {
  const uniContracts = config.uniContracts
  const iZiContracts = config.iZiContracts
  if (iZiContracts) await unwrapiZiswapV3NFTs({ balances, chain, block, nftAddress, owners: iZiContracts, })
  if (uniContracts) await sumTokens2({ balances, chain, block, owners: uniContracts, resolveUniV3: true, })
  // to fix balances of token addresses which are not on CoinGecko
  // await checkAndFixToken(balances, chain, fixTokens)
  return balances
}

module.exports = {
  unwrapiZiswapV3NFTs,
  unwrapNFTs
}
