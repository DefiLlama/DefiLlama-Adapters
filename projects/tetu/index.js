const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const POLY_BOOKKEEPER = "0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F";
const POLY_CONTRACT_READER = "0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da";
const POLY_USDC = "polygon:0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const EXCLUDED_PLATFORMS = {
  "12": true
}

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["polygon"];
  let balances = {};

  const vaultLength = (
      await sdk.api.abi.call({
        abi: abi.vaultsLength,
        target: POLY_BOOKKEEPER,
        block,
        chain: "polygon",
      })
  ).output;

  for (let i = 0; i < vaultLength; i++) {
    const vaultAddress = (
        await sdk.api.abi.call({
          block,
          target: POLY_BOOKKEEPER,
          params: i,
          abi: abi.vaults,
          chain: "polygon",
        })
    ).output;

    const strategy = (
        await sdk.api.abi.call({
          block,
          target: vaultAddress,
          abi: abi.strategy,
          chain: "polygon",
        })
    ).output;

    const platform = (
        await sdk.api.abi.call({
          block,
          target: strategy,
          abi: abi.platform,
          chain: "polygon",
        })
    ).output;

    if (EXCLUDED_PLATFORMS[platform] === true) {
      continue;
    }

    // Tetu is using our own PriceCalculator for determination prices of each assets
    // ContractReader uses this solution for calculation vault TVL with USDC price
    const usdcBal = (
        await sdk.api.abi.call({
          block,
          target: POLY_CONTRACT_READER,
          params: vaultAddress,
          abi: abi.vaultTvlUsdc,
          chain: "polygon",
        })
    ).output;
    // vaultTvlUsdc returns 18 decimals but USDC has 6
    sdk.util.sumSingleBalance(balances, POLY_USDC,
        BigNumber(usdcBal).div(1e12).toFixed(0));
  }

  return balances;
};

module.exports = {
  start: 1628024400,  //Tue Aug 03 2021 21:00:00 GMT+0000
  misrepresentedTokens: true,
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};
