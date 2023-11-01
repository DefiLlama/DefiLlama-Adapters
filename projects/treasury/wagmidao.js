const sdk = require("@defillama/sdk");
const abi = require("../wagmidao/abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const bondContracts = [
  //Bond 1USDC
  "0xe443F63564216f60625520465F1324043fcC47b9",
  //Bond GMI-1USDC
  "0x8c4300a7A71efF73b24DCd8f849f82A8B36b5D8a",
  //Bond WONE
  "0xa31a22d9dec269f512cf62b83039190fbe67f7d2",
  //Bond 1ETH
  "0x08d44C114e3C0102ace43e9656f478DD4a71cD1D",
  //Bond FAM
  "0xEfb7DDE5261100a32657C9606507a130257D93c6",
];

const Treasury = async (timesamp, ethBlock, chainBlocks) => {
  const balances = {};

  const tokenAddresses = (
    await sdk.api.abi.multiCall({
      abi: abi.principal,
      calls: bondContracts.map((bond) => ({
        target: bond,
      })),
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output.map((t) => t.output);

  const tokenBalances = (
    await sdk.api.abi.multiCall({
      abi: abi.totalPrincipalReceived,
      calls: bondContracts.map((bond) => ({
        target: bond,
      })),
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output.map((b) => b.output);

  const lpPositions = [];
  tokenAddresses.forEach((token, idx) => {
    if (token == "0x73919726cC9d988cEa1a378772e5f775dF33C049") {
      lpPositions.push({ token, balance: tokenBalances[idx] });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `harmony:${token}`,
        tokenBalances[idx]
      );
    }
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["harmony"],
    "harmony",
  );

  return balances;
};

module.exports = {
  harmony: {
    tvl: Treasury,
  },
  methodology: "Counts liquidity on the Farms through Factory Contract, and counts Treasury as it is determined by bonding of assets. Staking refers to the staked GMI tokens",
};
