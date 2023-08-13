const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const stETHTreasury = "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0";
const stETH = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";

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
  sdk.util.sumSingleBalance(balances, stETH, totalSupply);
  return balances;
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
