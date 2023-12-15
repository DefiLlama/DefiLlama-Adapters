const get_virtual_price = "function get_virtual_price() view returns (uint256)";
const getRate = "function getRate() view returns (uint256)";
const latestRoundData =
  "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)";
const getPrice = "function getPrice() view returns (uint256 sushi,uint256 gmx)";
const { default: BigNumber } = require("bignumber.js");

const getPriceMIM = async (tokenAddress, api) => {
  const priceLpWei = await api.call({
    target: tokenAddress,
    abi: get_virtual_price,
  })

  const decimals = await api.call({
    target: tokenAddress,
    abi: "erc20:decimals",
  })

  const tokenPrice = new BigNumber(priceLpWei).div(`1e${decimals}`);

  return {
    price: tokenPrice,
    decimals,
  };
};

const getPriceAura = async (
  tokenAddress,
  feedAddress,
  api
) => {
  const decimals =
    await api.call({
      target: tokenAddress,
      abi: "erc20:decimals",
    })

  const rate =
    await api.call({
      target: tokenAddress,
      abi: getRate,
    })

  const getLatestRoundData =
    await api.call({
      target: feedAddress,
      abi: latestRoundData,
    })

  const ethPriceInUSD = parseInt(getLatestRoundData.answer) / 10 ** 8;
  const priceETH = new BigNumber(rate).div(`1e${decimals}`);

  const tokenPrice = new BigNumber(priceETH * ethPriceInUSD).div(
    `1e${decimals}`
  );

  return {
    price: tokenPrice,
    decimals,
  };
};

const getPriceSushi = async (backendAddress, api) => {
  const sushiDecimals = 14,
    gmxDecimals = 8;

  const sushiGmxPrice = await api.call({
    target: backendAddress,
    abi: getPrice,
  })

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
};

module.exports = {
  getPriceMIM,
  getPriceAura,
  getPriceSushi,
};
