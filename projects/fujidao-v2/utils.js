const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const ADDRESSES = require('../helper/coreAssets.json');

const DEBUG = false;

/// NOTE: all addresses must be in their ethereum mainnet address representation
const WETH = ADDRESSES.ethereum.WETH;
const USDC = ADDRESSES.ethereum.USDC;
const DAI = ADDRESSES.ethereum.DAI;
const USDT = ADDRESSES.ethereum.USDT;
const MATICX = "0xf03A7Eb46d01d9EcAA104558C732Cf82f6B6B645"; //ethereum mainnet representation of maticX

const marketSupply = async (contracts, block, chain) => {
  if(DEBUG) {
    console.debug(
      "debug-marketSupply", block, chain
    );
  }
  const supply = await sdk.api.abi.multiCall(
      {
          abi: abi.totalAssets,
          calls: (contracts).map( vault => ({
              target: vault,
              params: []
          })),
          block,
          chain
      }
  );
  if(DEBUG) {
    console.debug(
      "debug-supply:", supply.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0)
    )
  }
  return supply.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0);
}

const marketDebt = async (contracts, block, chain) => {
  if(DEBUG) {
    console.debug(
      "debug-marketDebt", block, chain
    );
  }
  const debt = await sdk.api.abi.multiCall(
      {
          abi: abi.totalDebt,
          calls: (contracts).map( vault => ({
              target: vault,
              params: []
          })),
          block,
          chain
      }
  );
  if(DEBUG) {
    console.debug(
      "debug-debt:", debt.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0)
    )
  }
  return debt.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0);
}

module.exports = {
  marketSupply,
  marketDebt,
  WETH,
  MATICX,
  USDC,
  DAI
};