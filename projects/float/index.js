const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const multiplier_pool_single = [
  "0x52eadaFf8E3d816CE205691D1D703e08d369F576",
  "0x432573cf5b10eb9A160624ca2725199DC1b56e3e",
];

// adding some old phases, which still hold certain % of tvl
const multiplier_pool_slp = [
  // BANK/ETH sLP
  "0x726FF99C3f2aa0B0debadE809D2Ac75C5DfA3736",
  // FLOAT/ETH sLP
  "0xE73cf1bBC792c796826f9E57263483fd3DD38d50",
  // BANK-ETH sLPPhase2Pool
  "0xd04F4759A2cc28A5AE33287534CAA4dfcE90B9C3",
  // BANK-ETH sLPPhase4Pool
  "0x08D7e47Beb0470fc683bbdE7d836c5dcd48754F2",
  // FLOAT-ETH sLPPhase4Pool
  "0xCD817491872bdB33e0D21589bd92DbfF43387CA4",
];

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  for (let i = 0; i < multiplier_pool_single.length; i++) {
    const stake_token = (
      await sdk.api.abi.call({
        abi: abi.stakeToken,
        target: multiplier_pool_single[i],
        ethBlock,
      })
    ).output;

    const balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: stake_token,
        params: multiplier_pool_single[i],
        ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stake_token, balance);
  }

  const lpPositions = [];

  for (let i = 0; i < multiplier_pool_slp.length; i++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.stakeToken,
        target: multiplier_pool_slp[i],
        ethBlock,
      })
    ).output;

    const balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: multiplier_pool_slp[i],
        ethBlock,
      })
    ).output;

    lpPositions.push({
      balance,
      token,
    });
  }

  await unwrapUniswapLPs(balances, lpPositions, ethBlock);

  return balances;
};

module.exports = {
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
