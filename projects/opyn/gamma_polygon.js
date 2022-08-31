const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require("../helper/portedTokens");

const marginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

module.exports.tvl = async function tvl(timestamp, block, chainBlocks) {
  let balances = {};


  const balanceCalls = []
  // WMATIC, PoS USDC, PoS WBTC are the collateral assets 
  const collateralAssets = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'];

  collateralAssets.forEach(collateralAsset => {
    balanceCalls.push({
      target: collateralAsset,
      params: marginPool
    })
  });

  const transform = await transformPolygonAddress();
  const balanceOfs = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: balanceCalls,
    chain: 'polygon',
    block: chainBlocks.polygon
  })

  sdk.util.sumMultiBalanceOf(balances, balanceOfs, false, transform)

  // Calculate TVL of Locked WETH on margin pool
  const wethBalance = (
    await sdk.api.abi.call({
      target: WETH,
      params: marginPool,
      abi: 'erc20:balanceOf',
      block: chainBlocks.polygon,
      chain: 'polygon',
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `polygon:${WETH}`, wethBalance);

  return balances;
}