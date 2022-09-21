const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

// Wombat Asset Address
// Main Pool
const Asset_P01_BUSD = "0xF319947eCe3823b790dd87b0A509396fE325745a";
const Asset_P01_DAI = "0x9d0a463d5dcb82008e86bf506eb048708a15dd84";
const Asset_P01_USDC = "0xb43ee2863370a56d3b7743edcd8407259100b8e2";
const Asset_P01_USDT = "0x4f95fe57bea74b7f642cf9c097311959b9b988f7";

// BNB Pool
const Asset_P02_WBNB = "0x74f019a5c4ed2c2950ce16fad7af838549092c5b";
const Asset_P02_BNBx = "0x10f7c62f47f19e3ce08fef38f74e3c0bb31fc24f";
const Asset_P02_aBNBc = "0x9d2dead9547eb65aa78e239647a0c783f296406b";
const Asset_P02_stkBNB = "0xc496f42ea6fc72af434f48469b847a469fe0d17f";

// Side Pool
const Asset_P03_BUSD = "0xa649be04619a8f3b3475498e1ac15c90c9661c1a";
const Asset_P03_HAY = "0x1fa71df4b344ffa5755726ea7a9a56fbbee0d38b";

// underlyingToken Address
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
const aBNBc = "0xe85afccdafbe7f2b096f268e31cce3da8da2990a";
const stkBNB = "0xc2e9d07f66a89c44062459a47a0d2dc038e4fb16";
const HAY = "0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5";

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
  balances["binance-usd"] =
    (await balanceOf(Asset_P01_BUSD, BUSD, block)) +
    (await balanceOf(Asset_P03_BUSD, BUSD, block));
  balances["dai"] = await balanceOf(Asset_P01_DAI, DAI, block);
  balances["usd-coin"] = await balanceOf(Asset_P01_USDC, USDC, block);
  balances["tether"] = await balanceOf(Asset_P01_USDT, USDT, block);
  balances["wbnb"] = await balanceOf(Asset_P02_WBNB, WBNB, block);
  balances["stader-bnbx"] = await balanceOf(Asset_P02_BNBx, BNBx, block);
  balances["ankr-reward-bearing-stake"] = await balanceOf(
    Asset_P02_aBNBc,
    aBNBc,
    block
  );
  balances["pstake-staked-bnb"] = await balanceOf(
    Asset_P02_stkBNB,
    stkBNB,
    block
  );
  balances["helio-protocol-hay"] = await balanceOf(Asset_P03_HAY, HAY, block);
  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(
      "0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc",
      "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1",
      "bsc"
    ),
  },
  hallmarks: [
    [1662417125, "Liquidity Mining Start"],
    [1663120800, "Staking Pool Start"],
    [1663725600, "Side Pool Start"],
  ],
};
