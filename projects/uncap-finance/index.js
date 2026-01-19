const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/starknet');
const abi = require('./abi.json');

const WBTC_CONTRACT = ADDRESSES.starknet.WBTC;
const WRAPPED_WBTC_CONTRACT = '0x75d9e518f46a9ca0404fb0a7d386ce056dadf57fd9a0e8659772cb517be4a18'; // The collateral is a wrapped WBTC, for decimals reasons

const TBTC = {
  collateral: '0x04daa17763b286d1e59b97c283C0b8C949994C361e426A28F743c67bDfE9a32f',
  activePool: '0x309c8d0aca584a5e671e46fab0cb966c3abd1d7fe73162af81b2a6c774db615',
  collSurplusPool: '0x3f0abfe56ea84373c9e3e2c283e7f8ba194b3fb4500b1beacff87e2bafa6ab6',
  stabilityPool: '0xa36230f3d17cba0acb9635810209fe430c26ae585cbfd61e39cac0a9af6fc',
};

const SOLVBTC = {
  collateral: '0x0593e034DdA23eea82d2bA9a30960ED42CF4A01502Cc2351Dc9B9881F9931a68',
  activePool: '0x2dcc38433d9df7470f00eddbb7ddb28a141b5d2af0d87404bbc0887ac3ae89c',
  collSurplusPool: '0x4977a286f51770728091c547c2e87d639d168c0f17f7b8c6523b18ca695ad5e',
  stabilityPool: '0x154d14c879ce7dfe559628ed1abff2df38974efd27abf10d9236d05c6aa4741',
};

async function getCollateralBalance(collateralToken, pools) {
  const balances = await Promise.all(
    pools.map(pool => call({
      abi: abi[0],
      target: collateralToken,
      params: [pool],
    }))
  );
  return balances.reduce((sum, bal) => sum + BigInt(bal), 0n).toString();
}

async function tvl(api) {
  const wrapperBalance = await call({
    abi: abi[0],
    target: WBTC_CONTRACT,
    params: [WRAPPED_WBTC_CONTRACT],
  });

  const tbtcBalance = await getCollateralBalance(
    TBTC.collateral,
    [TBTC.activePool, TBTC.collSurplusPool, TBTC.stabilityPool]
  );

  const solvbtcBalance = await getCollateralBalance(
    SOLVBTC.collateral,
    [SOLVBTC.activePool, SOLVBTC.collSurplusPool, SOLVBTC.stabilityPool]
  );

  api.addTokens(
    [WBTC_CONTRACT, TBTC.collateral, SOLVBTC.collateral],
    [wrapperBalance, tbtcBalance, solvbtcBalance]
  );
}

module.exports = {
  methodology: 'counts the collateral tokens (TBTC, SOLVBTC) in the Active Pool, Collateral Surplus Pool, and Stability Pool contracts. For WBTC, uses the supply of WWBTC.',
  start: 2762980,
  starknet: {
    tvl,
  }
}; 
