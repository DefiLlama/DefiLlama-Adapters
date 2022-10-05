const sdk = require("@defillama/sdk");

// ztp swap address
const SWAP_ADDR = "0xCdD4396527b6681775173839002E6af201885CB8";

// stable coin address
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
  balances["binance-usd"] = await balanceOf(SWAP_ADDR, BUSD, block);
  balances["dai"] = await balanceOf(SWAP_ADDR, DAI, block);
  balances["usd-coin"] = await balanceOf(SWAP_ADDR, USDC, block);
  balances["tether"] = await balanceOf(SWAP_ADDR, USDT, block);
  return balances;
}

module.exports = {
  bsc: {
    tvl,
  },
};
