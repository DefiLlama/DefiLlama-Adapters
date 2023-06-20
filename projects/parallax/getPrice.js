const sdk = require("@defillama/sdk");
const get_virtual_price = "function get_virtual_price() view returns (uint256)";
const getRate = "function getRate() view returns (uint256)";
const latestRoundData =
  "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)";
const getPrice = "function getPrice() view returns (uint256 sushi,uint256 gmx)";
const { ZERO } = require("../helper/ankr/utils");
const { default: BigNumber } = require("bignumber.js");

const getPriceMIM = async (tokenAddress, block) => {
  try {
    const priceLpWei = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: get_virtual_price,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const decimals = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:decimals",
        chain: "arbitrum",
        block,
      })
    ).output;

    const tokenPrice = new BigNumber(priceLpWei).div(`1e${decimals}`);

    return {
      price: tokenPrice,
      decimals,
    };
  } catch (e) {
    return {
      price: ZERO,
      decimals: 0,
    };
  }
};

const getPriceAura = async (
  tokenAddress,
  feedAddress,
  chain = "ethereum",
  block
) => {
  try {
    const decimals = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:decimals",
        chain: chain,
        block,
      })
    ).output;

    const rate = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: getRate,
        block: block,
        chain: chain,
      })
    ).output;

    const getLatestRoundData = (
      await sdk.api.abi.call({
        target: feedAddress,
        abi: latestRoundData,
        block: block,
        chain: chain,
      })
    ).output;

    const ethPriceInUSD = parseInt(getLatestRoundData.answer) / 10 ** 8;
    const priceETH = new BigNumber(rate).div(`1e${decimals}`);

    const tokenPrice = new BigNumber(priceETH * ethPriceInUSD).div(
      `1e${decimals}`
    );

    return {
      price: tokenPrice,
      decimals,
    };
  } catch (e) {
    return {
      price: ZERO,
      decimals: 0,
    };
  }
};

const getPriceSushi = async (backendAddress, chain = "arbitrum", block) => {
  try {
    const sushiDecimals = 14,
      gmxDecimals = 8;

    const sushiGmxPrice = (
      await sdk.api.abi.call({
        target: backendAddress,
        abi: getPrice,
        block: block,
        chain: chain,
      })
    ).output;

    const sushiPrice = new BigNumber(sushiGmxPrice.sushi).div(
      `1e${sushiDecimals}`
    );
    const gmxPrice = new BigNumber(sushiGmxPrice.gmx).div(`1e${gmxDecimals}`);

    return {
      sushiPrice: sushiPrice,
      gmxPrice: gmxPrice,
      sushiDecimals,
      gmxDecimals,
    };
  } catch (e) {
    return {
      sushiPrice: ZERO,
      gmxPrice: ZERO,
      sushiDecimals: 14,
      gmxDecimals: 8,
    };
  }
};

module.exports = {
  getPriceMIM,
  getPriceAura,
  getPriceSushi,
};
