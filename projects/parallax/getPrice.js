const get_virtual_price = "function get_virtual_price() view returns (uint256)";
const getRate = "function getRate() view returns (uint256)";
const latestRoundData =
  "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)";
const getPrice = "function getPrice() view returns (uint256 sushi,uint256 gmx)";

const { default: BigNumber } = require("bignumber.js");
const { ethers } = require("ethers");

const getPriceMIM = async (tokenAddress, api) => {
  const priceLpWei = await api.call({
    target: tokenAddress,
    abi: get_virtual_price,
  });

  const decimals = await api.call({
    target: tokenAddress,
    abi: "erc20:decimals",
  });

  const tokenPrice = new BigNumber(priceLpWei).div(`1e${decimals}`);

  return {
    price: tokenPrice,
    decimals,
  };
};

const getPriceAura = async (tokenAddress, feedAddress, api) => {
  const decimals = await api.call({
    target: tokenAddress,
    abi: "erc20:decimals",
  });

  const rate = await api.call({
    target: tokenAddress,
    abi: getRate,
  });

  const getLatestRoundData = await api.call({
    target: feedAddress,
    abi: latestRoundData,
  });

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
  });

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

const getPriceZkSync = async (tokenAddress, zkss_weth, abi, provider) => {
  const pool = new ethers.Contract(tokenAddress, abi, provider);

  const reserve0 = await pool.reserve0();
  const reserve1 = await pool.reserve1();
  const totalSupply = await pool.totalSupply();

  const expectedToken0Amount = calculatePoolTokens(
    ethers.utils.parseEther("1"),
    reserve0,
    totalSupply
  );
  const expectedToken1Amount = calculatePoolTokens(
    ethers.utils.parseEther("1"),
    reserve1,
    totalSupply
  );

  let lpPrice =
    expectedToken0Amount
      .add(
        await pool.getAmountOut(zkss_weth, expectedToken1Amount, tokenAddress)
      )
      .toNumber() / 1e6;

  lpPrice = Number(lpPrice.toFixed(0)) * 1.5188061452513966;

  const tokenPrice = new BigNumber(lpPrice).div(`1e6`);

  return tokenPrice;
};

function calculatePoolTokens(liquidity, balance, totalSupply) {
  return liquidity.mul(balance).div(totalSupply);
}

module.exports = {
  getPriceMIM,
  getPriceAura,
  getPriceSushi,
  getPriceZkSync,
};
