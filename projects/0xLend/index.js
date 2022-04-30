const { default: BigNumber } = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");

async function data(timestamp, block, chainBlocks) {
  const [markets, , prices] = (
    await sdk.api.abi.call({
      abi: {
        constant: false,
        inputs: [
          {
            internalType: "contract ComptrollerLensInterface",
            name: "comptroller",
            type: "address",
          },
        ],
        name: "getAllMarketsData",
        outputs: [
          {
            components: [
              {
                internalType: "address",
                name: "cToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "cTokenDecimals",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "cTokenSymbol",
                type: "string",
              },
              {
                internalType: "string",
                name: "cTokenName",
                type: "string",
              },
              {
                internalType: "address",
                name: "underlyingAssetAddress",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "underlyingDecimals",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "underlyingSymbol",
                type: "string",
              },
              {
                internalType: "string",
                name: "underlyingName",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "exchangeRateCurrent",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "supplyRatePerBlock",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowRatePerBlock",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "reserveFactorMantissa",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "collateralFactorMantissa",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalBorrows",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalReserves",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalSupply",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalCash",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isListed",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "borrowCap",
                type: "uint256",
              },
            ],
            internalType: "struct CompoundLens.CTokenMetadata[]",
            name: "",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "cToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "compSupplySpeed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "compBorrowSpeed",
                type: "uint256",
              },
            ],
            internalType: "struct CompoundLens.CompSpeeds[]",
            name: "",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "cToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "underlyingPrice",
                type: "uint256",
              },
            ],
            internalType: "struct CompoundLens.CTokenUnderlyingPrice[]",
            name: "",
            type: "tuple[]",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      chain: "kcc",
      target: "0xCA4D163Eeb21eeF70bF8Cbeb34E1e20D4C65d528",
      params: ["0x337d8719f70D514367aBe780F7c1eAd1c0113Bc7"],
      block: chainBlocks["kcc"],
    })
  ).output;

  return { markets, prices };
}

async function tvl(timestamp, block, chainBlocks) {
  const { markets, prices } = await data(timestamp, block, chainBlocks);

  let totalCash = new BigNumber(0);

  markets.forEach((market) => {
    const underlyingPrice = prices.find(
      (p) => p.cToken === market.cToken
    ).underlyingPrice;

    const price = new BigNumber(underlyingPrice).div(
      new BigNumber(10).pow(new BigNumber(18))
    );

    totalCash = totalCash.plus(
      new BigNumber(market.totalCash)
        .plus(market.totalBorrows)
        .div(new BigNumber(10).pow(new BigNumber(market.underlyingDecimals)))
        .times(price)
    );
  });

  return toUSDTBalances(totalCash.toNumber());
}

async function borrowed(timestamp, block, chainBlocks) {
  const { markets, prices } = await data(timestamp, block, chainBlocks);

  let borrowed = new BigNumber(0);

  markets.forEach((market) => {
    const underlyingPrice = prices.find(
      (p) => p.cToken === market.cToken
    ).underlyingPrice;

    const price = new BigNumber(underlyingPrice).div(
      new BigNumber(10).pow(new BigNumber(18))
    );

    borrowed = borrowed.plus(
      new BigNumber(market.totalBorrows)
        .div(new BigNumber(10).pow(new BigNumber(market.underlyingDecimals)))
        .times(price)
    );
  });

  return toUSDTBalances(borrowed.toNumber());
}