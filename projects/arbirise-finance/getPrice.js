const sdk = require("@defillama/sdk");
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)';
const token0 = "address:token0";
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

    const symbol = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:symbol",
        chain: "arbitrum",
        block
      })
    ).output;

    const isLp = symbol === "SLP";

    if (tokenAddress.toLowerCase() === contracts["weth"].toLowerCase()) {
      return { price: ETHPrice, decimals: 18 };
    }

    const pairAddress = isLp
      ? tokenAddress
      : (
          await sdk.api.abi.call({
            target: contracts["sushiFactoryAddress"],
            abi: 'function getPair(address, address) view returns (address)',
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
        block
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

    if (isLp) {
      const totalSupply = (
        await sdk.api.abi.call({
          target: tokenAddress,
          abi: "erc20:totalSupply",
          chain: "arbitrum",
          block
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
