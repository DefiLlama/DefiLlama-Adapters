const sdk = require("@defillama/sdk");
const getTokenPrice = require("./get-token-price");
const borkLpAbi = require("./bork-lp-abi.json");
const BORK_FINANCE = "0x2a0cf46ecaaead92487577e9b737ec63b0208a33";
const WDOGE_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC_ADDRESS = "0x11bbb41b3e8baf7f75773db7428d5acee25fec75";

const calculateLpTokenPrice = async (lp_token_address, borkPrice) => {
  const token0Out = (
    await sdk.api.abi.call({
      abi: borkLpAbi.token0,
      chain: "ethpow",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const token0 = token0Out.toLowerCase();

  const token1Out = (
    await sdk.api.abi.call({
      abi: borkLpAbi.token1,
      chain: "ethpow",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const token1 = token1Out.toLowerCase();

  const totalSupplyRes = (
    await sdk.api.abi.call({
      abi: borkLpAbi.totalSupply,
      chain: "ethpow",
      target: lp_token_address,
      params: [],
    })
  ).output;
  const totalSupply = Number(totalSupplyRes);

  const reserves = (
    await sdk.api.abi.call({
      abi: borkLpAbi.getReserves,
      chain: "ethpow",
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
  } else if (BORK_FINANCE === token0 || BORK_FINANCE === token1) {
    let stablecoinreserve;
    if (BORK_FINANCE === token0) {
      stablecoinreserve = totalReserve[0] / 1e18;
    } else {
      stablecoinreserve = totalReserve[1] / 1e18;
    }
    const rewardTokenPrice = borkPrice;
    lpTokenPrice =
      (stablecoinreserve * 2 * rewardTokenPrice) / (Number(totalSupply) / 1e18);
  } else {
    let rewardTokenPrice = 0;
    let stablecoinreserve;
    // Token Price
    if (token0 === BORK_FINANCE || token1 === BORK_FINANCE) {
      rewardTokenPrice = borkPrice;
      const reserve =
        token0 === BORK_FINANCE ? totalReserve[0] : totalReserve[1];
      stablecoinreserve = reserve / 1e18;
    } else if (
      token0 === WDOGE_ADDRESS.toLowerCase() ||
      token1 === WDOGE_ADDRESS.toLowerCase()
    ) {
      const value = await getTokenPrice("WETH");
      rewardTokenPrice = value.price;
      const reserve =
        token0 === WDOGE_ADDRESS ? totalReserve[0] : totalReserve[1];
      stablecoinreserve = reserve / 1e18;
    }
    lpTokenPrice =
      (stablecoinreserve * 2 * rewardTokenPrice) / (Number(totalSupply) / 1e18);
  }

  return lpTokenPrice ? lpTokenPrice : 0;
};

module.exports = calculateLpTokenPrice;
