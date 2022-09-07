const sdk = require("@defillama/sdk");

// polyo Asset Address
const Asset_P01_BUSD = "0xC72e6f8041183EaD6f85839bD463F7aD0f14A40D";
const Asset_P01_DAI = "0x6A3b82C362f4837c3A788f909197d4D461316684";
const Asset_P01_USDC = "0x17B308e859FD8ccC3D27EC290Fe5220c01188E52";
const Asset_P01_USDT = "0x2d7FA7402569e061A2218dc4e7Ac79281a8C4fB5";

// underlyingToken Address
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

async function balanceOf(owner, target, block) {
  const chain = "bsc";
  let decimals = (await sdk.api.erc20.decimals(target, chain)).output;
  let balance = (
    await sdk.api.erc20.balanceOf({
      owner,
      target,
      block,
      chain,
    })
  ).output;
  return Number(balance) / 10 ** decimals;
}

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks["bsc"];
  let balances = {};
  balances["binance-usd"] = await balanceOf(Asset_P01_BUSD, BUSD, block);
  balances["dai"] = await balanceOf(Asset_P01_DAI, DAI, block);
  balances["usd-coin"] = await balanceOf(Asset_P01_USDC, USDC, block);
  balances["tether"] = await balanceOf(Asset_P01_USDT, USDT, block);
  return balances;
}

module.exports = {
  bsc: {
    tvl,
  },
};
