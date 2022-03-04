
const { default: BigNumber } = require('bignumber.js');
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const chain = 'polygon'

async function getTVLv2(ret, troves, collaterals, chainBlocks) {
  const block = chainBlocks[chain];

  const tvls = await Promise.all(
    troves.map((trove) => sdk.api.abi.call({
        target: trove,
        abi: getEntireSystemCollAbi,
        block,
        chain
      })
    )
  );

  collaterals.forEach((collateral, index) => {
    let key = chain+':'+collateral;
    let val = tvls[index].output;

    if (ret[key] == undefined) ret[key] = BigNumber(0);
    ret[key] = ret[key].plus(BigNumber(val));
  });

  return ret;
}


async function getTVLv1(ret, pools, collaterals, chainBlocks) {
  const block = chainBlocks[chain];

  const tvls = await Promise.all(
    pools.map((pool, index) => sdk.api.abi.call({
        target: collaterals[index],
        params: pool,
        abi: 'erc20:balanceOf',
        block,
        chain
      })
    )
  );

  collaterals.forEach((collateral, index) => {
    let key = chain+':'+collateral;
    let val = tvls[index].output;

    if (ret[key] == undefined) ret[key] = BigNumber(0);
    ret[key] = ret[key].plus(BigNumber(val));
  });

  return ret;
}


function polygonTVL() {
  return async (_, ethBlock, chainBlocks) => {
    const ret = {};

    await getTVLv2(ret, [
      // troves
      "0x5344950d34E8959c7fb6645C839A7cA89BE18216", // weth
      "0x7df27F6B3C8A2b6219352A434872DcDd8f5a50E4", // dai
      "0x8C021C5a2910D1812542D5495E4Fbf6a6c33Cb4f", // wmatic
    ], [
      // trove collaterals
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // weth
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // dai
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
    ], chainBlocks)

    await getTVLv1(ret, [
      // pool
      '0xa25687a15332Dcbc1319521FEc31FCDc5A33c5EC', // pool usdc
      '0xb40125f17f9517bc6396a7ed030ee6d6f41f3692', // pool wbtc
      '0xe8dc1c33724ff26b474846c05a69dfd8ca3873c9', // pool usdt
      '0x7b8f513da3ffb1e37fc5e44d3bfc3313094ae8cf', // pool weth
      '0xa9f1d7841b059c98c973ec90502cbf3fc2db287c', // pool wmatic
    ], [
      // collaterals
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // pool usdc
      '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // pool wbtc
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // pool usdt
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // pool weth
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' // pool wmatic
    ], chainBlocks)

    return ret;
  };
}



module.exports = {
  staking: staking(
    "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // mahax contract
    "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // maha
    "polygon"
  ),
  pool2: pool2s([
    // staking contracts
    '0xD585bfCF37db3C2507e2D44562F0Dbe2E4ec37Bc', // arth/usdc lp staking
    '0xc82c95666be4e89aed8ae10bab4b714cae6655d5', // arth/maha lp staking
  ], [
    '0x34aAfA58894aFf03E137b63275aff64cA3552a3E', // arth/usdc lp
    '0x95de8efD01dc92ab2372596B3682dA76a79f24c3', // arth/maha lp
  ], "polygon"),
  tvl: polygonTVL()
}
