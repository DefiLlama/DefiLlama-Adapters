const sdk = require("@defillama/sdk");
const getTokenPrice = require("./get-token-price");
const uniwLpAbi = require("./uniw-lp-abi.json");
const UNIA_ADDRESS = "0xe547FaB4d5ceaFD29E2653CB19e6aE8ed9c8589b";
const WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC_ADDRESS = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

const calculateLpTokenPrice = async (lp_token_address, uniwPrice) => {
  const token0Out = (
    await sdk.api.abi.call({
      abi: uniwLpAbi.token0,
      chain: "arbitrum",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const token0 = token0Out.toLowerCase();

  const token1Out = (
    await sdk.api.abi.call({
      abi: uniwLpAbi.token1,
      chain: "arbitrum",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const token1 = token1Out.toLowerCase();

  const totalSupplyRes = (
    await sdk.api.abi.call({
      abi: uniwLpAbi.totalSupply,
      chain: "arbitrum",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const totalSupply = Number(totalSupplyRes);

  const reserves = (
    await sdk.api.abi.call({
      abi: uniwLpAbi.getReserves,
      chain: "arbitrum",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const totalReserve = [Number(reserves[0]), Number(reserves[1])];
  // Total Supply of LP Tokens in the Market
  let lpTokenPrice;
  if (USDC_ADDRESS === token0 || USDC_ADDRESS === token1) {
    let stablecoinreserve;
    if (USDC_ADDRESS === token0) {
      stablecoinreserve = totalReserve[0] / 1e6;
    } else {
      stablecoinreserve = totalReserve[1] / 1e6;
    }

    lpTokenPrice = (stablecoinreserve * 2) / (Number(totalSupply) / 1e18);
  } else if (UNIA_ADDRESS === token0 || UNIA_ADDRESS === token1) {
    let stablecoinreserve;
    if (UNIA_ADDRESS === token0) {
      stablecoinreserve = totalReserve[0] / 1e18;
    } else {
      stablecoinreserve = totalReserve[1] / 1e18;
    }
    const rewardTokenPrice = uniwPrice;
    lpTokenPrice =
      (stablecoinreserve * 2 * rewardTokenPrice) / (Number(totalSupply) / 1e18);
  } else {
    let rewardTokenPrice = 0;
    let stablecoinreserve;
    // Token Price
    if (token0 === UNIA_ADDRESS || token1 === UNIA_ADDRESS) {
      rewardTokenPrice = uniwPrice;
      const reserve =
        token0 === UNIA_ADDRESS ? totalReserve[0] : totalReserve[1];
      stablecoinreserve = reserve / 1e18;
    } else if (
      token0 === WETH_ADDRESS.toLowerCase() ||
      token1 === WETH_ADDRESS.toLowerCase()
    ) {
      const value = await getTokenPrice("WETH");
      rewardTokenPrice = value.price;
      const reserve =
        token0 === WETH_ADDRESS ? totalReserve[0] : totalReserve[1];
      stablecoinreserve = reserve / 1e18;
    }
    lpTokenPrice =
      (stablecoinreserve * 2 * rewardTokenPrice) / (Number(totalSupply) / 1e18);
  }

  return lpTokenPrice ? lpTokenPrice : 0;
};

module.exports = calculateLpTokenPrice;
