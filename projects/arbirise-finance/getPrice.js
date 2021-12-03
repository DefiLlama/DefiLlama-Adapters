const sdk = require("@defillama/sdk");
const getPair = require("./abis/getPair.json");
const getReserves = require("./abis/getReserves.json");
const token0 = require("./abis/token0.json");
const contracts = require("./contracts.json");
const { default: BigNumber } = require("bignumber.js");

const getETHPrice = async (block) => {
  const reserves = (
    await sdk.api.abi.call({
      target: contracts["usdcWethPair"],
      abi: getReserves,
      block: block,
      chain: "arbitrum",
    })
  ).output;

  const _token0 = (
    await sdk.api.abi.call({
      target: contracts["usdcWethPair"],
      abi: token0,
      block: block,
      chain: "arbitrum",
    })
  ).output;

  const WETHReserve = new BigNumber(
    _token0.toLowerCase() === contracts["weth"].toLowerCase()
      ? reserves._reserve0
      : reserves._reserve1
  ).div(1e18);
  const USDCReserve = new BigNumber(
    _token0.toLowerCase() === contracts["usdc"].toLowerCase()
      ? reserves._reserve0
      : reserves._reserve1
  ).div(1e6);

  return new BigNumber(USDCReserve).div(new BigNumber(WETHReserve));
};

const getPrice = async (tokenAddress, block) => {
  try {
    const ETHPrice = await getETHPrice(block);

    if (tokenAddress.toLowerCase() === contracts["weth"].toLowerCase()) {
      return { price: ETHPrice, decimals: 18 };
    }

    const pairAddress =
      tokenAddress.toLowerCase() === contracts["lp"].toLowerCase() ||
      tokenAddress.toLowerCase() === contracts["arf"].toLowerCase()
        ? contracts["lp"]
        : (
            await sdk.api.abi.call({
              target: contracts["sushiFactoryAddress"],
              abi: getPair,
              params: [tokenAddress, contracts["weth"]],
              block: block,
              chain: "arbitrum",
            })
          ).output;

    const reserves = (
      await sdk.api.abi.call({
        target: pairAddress,
        abi: getReserves,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const _token0 = (
      await sdk.api.abi.call({
        target: pairAddress,
        abi: token0,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const decimals = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:decimals",
        chain: "arbitrum",
      })
    ).output;

    const WETHReserve = new BigNumber(
      _token0.toLowerCase() === contracts["weth"].toLowerCase()
        ? reserves._reserve0
        : reserves._reserve1
    ).div(1e18);
    const tokenReserve = new BigNumber(
      _token0.toLowerCase() === tokenAddress.toLowerCase()
        ? reserves._reserve0
        : reserves._reserve1
    ).div(`1e${decimals}`);

    if (tokenAddress.toLowerCase() === contracts["lp"].toLowerCase()) {
      const totalSupply = (
        await sdk.api.abi.call({
          target: tokenAddress,
          abi: "erc20:totalSupply",
          chain: "arbitrum",
        })
      ).output;

      return {
        price: new BigNumber(WETHReserve)
          .times(ETHPrice)
          .times(2)
          .div(new BigNumber(totalSupply).div(`1e${decimals}`)),
        decimals,
      };
    }

    const priceInETH = new BigNumber(tokenReserve).div(
      new BigNumber(WETHReserve)
    );

    return {
      price: ETHPrice.div(priceInETH),
      decimals,
    };
  } catch (e) {
    return {
      price: new BigNumber(0),
      decimals: 0,
    };
  }
};

module.exports = {
  getPrice,
};
