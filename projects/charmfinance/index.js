const sdk = require("@defillama/sdk");
const axios = require("axios");
const yaml = require('js-yaml');

const vaultAbi = require("./vaultAbi.json");
const cubePoolAbi = require("./cubePoolAbi.json");

const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const ETH = "0x0000000000000000000000000000000000000000";

const VAULT = "0x55535C4C56F6Bf373E06C43E44C0356aaFD0d21A";
const CUBE_POOL = "0x23F6A2D8d691294c3A1144EeD14F5632e8bc1B67";

const ethTvl = async (timestamp, ethBlock) => {
  let balances = {};

  const optionsContracts = (await axios.get(
    'https://raw.githubusercontent.com/charmfinance/options-protocol/main/markets.yaml'
  )).data;

  const OPTIONS_CONTRACTS = yaml.load(optionsContracts);

  const vaultAmts = (
    await sdk.api.abi.call({
      abi: vaultAbi.getTotalAmounts,
      target: VAULT,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, WETH, vaultAmts.total0);
  sdk.util.sumSingleBalance(balances, USDT, vaultAmts.total1);

  const poolBalance = (
    await sdk.api.abi.call({
      abi: cubePoolAbi.poolBalance,
      target: CUBE_POOL,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, poolBalance);

  // --- Run a check in all options contracts holdings (ETH, USDC, WBTC) ---
  const erc20_holdings = [USDC, WBTC];

  for (let i = 0; i < OPTIONS_CONTRACTS.length; i++) {
    for (let j = 0; j < erc20_holdings.length; j++) {
      let erc20Bal = await sdk.api.erc20.balanceOf({
        target: erc20_holdings[j],
        owner: OPTIONS_CONTRACTS[i],
        block: ethBlock,
      });

      sdk.util.sumSingleBalance(balances, erc20_holdings[j], erc20Bal.output);
    }

    let ethBal = await sdk.api.eth.getBalance({
      target: OPTIONS_CONTRACTS[i],
      block: ethBlock,
    });

    sdk.util.sumSingleBalance(balances, ETH, ethBal.output);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
