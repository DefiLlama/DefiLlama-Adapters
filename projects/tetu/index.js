const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const POLY_BOOKKEEPER = "0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F";
const POLY_CONTRACT_READER = "0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da";
const POLY_USDC = "polygon:0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const FTM_BOOKKEEPER = "0x00379dD90b2A337C4652E286e4FBceadef940a21";
const FTM_CONTRACT_READER = "0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC";
const FTM_USDC = "fantom:0x04068da6c83afcfa0e13ba15a6696662335d5b75";

const EXCLUDED_PLATFORMS = {
  "12": true, // TETU_SWAP
  "29": true // TETU_SF
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

const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["fantom"];
  let balances = {};

  const vaultLength = (
      await sdk.api.abi.call({
        abi: abi.vaultsLength,
        target: FTM_BOOKKEEPER,
        block,
        chain: "fantom",
      })
  ).output;

  for (let i = 0; i < vaultLength; i++) {
    const vaultAddress = (
        await sdk.api.abi.call({
          block,
          target: FTM_BOOKKEEPER,
          params: i,
          abi: abi.vaults,
          chain: "fantom",
        })
    ).output;

    const strategy = (
        await sdk.api.abi.call({
          block,
          target: vaultAddress,
          abi: abi.strategy,
          chain: "fantom",
        })
    ).output;

    const platform = (
        await sdk.api.abi.call({
          block,
          target: strategy,
          abi: abi.platform,
          chain: "fantom",
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
          target: FTM_CONTRACT_READER,
          params: vaultAddress,
          abi: abi.vaultTvlUsdc,
          chain: "fantom",
        })
    ).output;
    // vaultTvlUsdc returns 18 decimals but USDC has 6
    sdk.util.sumSingleBalance(balances, FTM_USDC,
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
  fantom: {
    tvl: fantomTvl,
  },
};
