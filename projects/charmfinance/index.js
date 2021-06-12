const sdk = require("@defillama/sdk");

const vaultAbi = require("./vaultAbi.json");
const cubePoolAbi = require("./cubePoolAbi.json");

const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const ETH = "0x0000000000000000000000000000000000000000";

const VAULT = "0x55535C4C56F6Bf373E06C43E44C0356aaFD0d21A";
const CUBE_POOL = "0x23F6A2D8d691294c3A1144EeD14F5632e8bc1B67";
const OPTIONS_CONTRACTS = [
  // ETH 29 Jan 2021
  "0x28cA0aa0F71bD7478aeB25b62C1ef26dCF78697F",
  "0xfC12A7F6Dd190FA83bC4e672CdbA245651BB4D2e",
  // ETH 5 Feb 2021
  "0xD92D9217d01E6D62F2318558B97306E3610E3a19",
  "0xd8f006FA42dab8386689f033285E54ac211859c6",
  //ETH 26 Feb 2021
  "0xA08189389A7683eC65cB998f1E96e5ae10fF4B2D",
  "0xB997E16fA6808a73492EA5a8D6385120ED5e0727",
  // WBTC 26 Feb 2021
  "0x4Bd9224975bddd257a9d1b171d7c36ffF308a88F",
  "0x95A6Ced453abCedb1c41f5c8850c55dC4d250259",
  // ETH 25 June 2021
  "0xdb51426172aE739651fc8a62461F4Ac10D9B55A1",
  "0x8Dd6231992E75CA2D160D8fA2e0b506783B50D7f",
  //WBTC 25 June 2021
  "0x652e3AABc272c84FaCc6e5FeC337Ea616ddc11BC",
  "0x18C51322A23230cA4aEb36C2b917aB6cf9b91de5",
];

const ethTvl = async (timestamp, ethBlock) => {
  let balances = {};

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
