const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const stETHTreasury = "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0";
const stETH = ADDRESSES.ethereum.STETH;
const fxUSD_wstETHTreasury = "0xED803540037B0ae069c93420F89Cd653B6e3Df1f";
const fxUSD_sfrxETHTreasury = "0xcfEEfF214b256063110d3236ea12Db49d2dF2359";
const wstETH = ADDRESSES.ethereum.WSTETH;
const sfrxETH = ADDRESSES.ethereum.sfrxETH;

async function tvl(timestamp, block, _, { api }) {
  let balances = {};
  const totalSupply = (
    await sdk.api.abi.call({
      target: stETH,
      block,
      abi: "erc20:balanceOf",
      chain: "ethereum",
      params: stETHTreasury,
    })
  ).output;
  const fxUSDWstETHtotalSupply = (
    await sdk.api.abi.call({
      target: fxUSD_wstETHTreasury,
      block,
      abi: "uint256:totalBaseToken",
      chain: "ethereum",
    })
  ).output;
  const fxUSDSfrxETHtotalSupply = (
    await sdk.api.abi.call({
      target: fxUSD_sfrxETHTreasury,
      block,
      abi: "uint256:totalBaseToken",
      chain: "ethereum",
    })
  ).output;
  sdk.util.sumSingleBalance(balances, stETH, totalSupply);
  sdk.util.sumSingleBalance(balances, wstETH, fxUSDWstETHtotalSupply);
  sdk.util.sumSingleBalance(balances, sfrxETH, fxUSDSfrxETHtotalSupply);
  return balances;
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
