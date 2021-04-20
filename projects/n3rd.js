const web3 = require('./config/web3.js');
const abis = require('./config/n3rd/abis.js');
const BN = require("bignumber.js");

let zeroAddress = '0x0000000000000000000000000000000000000000';

function tvl(poolState, price) {
  var ret = new BN("0");
  for (const pool of Object.values(poolState)) {
    if (pool.liquidityInfo && pool.liquidityInfo.totalNerdAmount) {
      ret = ret.plus(new BN(pool.liquidityInfo.totalNerdAmount));
      let lockedIn0x = new BN(pool.lockedIn0x)
        .multipliedBy(new BN(pool.liquidityInfo.totalNerdAmount))
        .dividedBy(new BN(pool.liquidityInfo.totalLockedLP))
        .toFixed(0);
      ret = ret.plus(new BN(lockedIn0x));
    }
  }
  let priceNerd = new BN(price).dividedBy(new BN("1e6"));
  return ret
    .dividedBy(new BN("1e18"))
    .multipliedBy(new BN(priceNerd))
    .multipliedBy(2)
    .toFixed(0);
}

async function fetch() {
  let nerdVaultAddress = '0x47cE2237d7235Ff865E1C74bF3C6d9AF88d1bbfF';
  let nerd = "0x32C868F6318D6334B2250F323D914Bc2239E4EeE";
  let price = '0';
  {
    let routerAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    let usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    let weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    let path = [nerd, weth, usdc];
    let router = await new web3.eth.Contract(abis.minRouter, routerAddr);
    let amountsOut = await router.methods.getAmountsOut(new BN('1e18').toFixed(0), path).call();
    price = amountsOut[2];
  }
  let nerdToken = await new web3.eth.Contract(abis.minERC20, nerd);
  let nerdVault = await new web3.eth.Contract(abis.minVault, nerdVaultAddress);
  let poolLength = new BN(await nerdVault.methods.poolLength().call()).toNumber();
  let poolState = {};
  for (var i = 0; i < poolLength; i++) {
    let poolInfo = await nerdVault.methods.poolInfo(i).call();
    let lpAddress = poolInfo.token;
    let lp = await new web3.eth.Contract(abis.minERC20, lpAddress);
    poolState[i] = {};
    poolState[i].lockedIn0x = await lp.methods.balanceOf(zeroAddress).call();
    poolState[i].liquidityInfo = await nerdVault.methods.getLiquidityInfo(i).call();
  }
  let vaultTvl = tvl(poolState, price);

  let stakingPool = "0x357ADa6E0da1BB40668BDDd3E3aF64F472Cbd9ff";
  let nerdLockedInPool = await nerdToken.methods.balanceOf(stakingPool).call();
  let priceNerd = new BN(price).dividedBy(new BN("1e6"));
  let poolTvl = new BN(nerdLockedInPool)
    .dividedBy(new BN("1e18"))
    .multipliedBy(new BN(priceNerd))
    .toFixed(0);
  ret = new BN(vaultTvl).plus(new BN(poolTvl)).toFixed(0);
  return ret;
}

module.exports = {
  fetch
}
