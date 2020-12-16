var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
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
  price = new BN(price).dividedBy(new BN("1e6"));
  return ret
    .dividedBy(new BN("1e18"))
    .multipliedBy(new BN(price))
    .multipliedBy(2)
    .toFixed(0);
}

async function fetch() {
  let nerdVaultAddress = '0x47cE2237d7235Ff865E1C74bF3C6d9AF88d1bbfF';
  let price = '0';
  {
    let routerAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    let nerd = "0x32C868F6318D6334B2250F323D914Bc2239E4EeE";
    let usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    let weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    let path = [nerd, weth, usdc];
    let router = await new web3.eth.Contract(abis.minRouter, routerAddr);
    let amountsOut = await router.methods.getAmountsOut(new BN('1e18').toFixed(0), path).call();
    price = amountsOut[2];
  }
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
  return tvl(poolState, price);
}
module.exports = {
  fetch
}
