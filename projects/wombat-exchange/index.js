const sdk = require("@defillama/sdk");

// Wombat Asset Address
const Asset_P01_BUSD = "0xF319947eCe3823b790dd87b0A509396fE325745a";
const Asset_P01_DAI = "0x9d0a463d5dcb82008e86bf506eb048708a15dd84";
const Asset_P01_USDC = "0xb43ee2863370a56d3b7743edcd8407259100b8e2";
const Asset_P01_USDT = "0x4f95fe57bea74b7f642cf9c097311959b9b988f7";

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
