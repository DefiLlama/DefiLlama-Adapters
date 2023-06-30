const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const contracts = require("./contracts.json");

// ABIs
const priceCalculatorABI = {
  priceOf: "function priceOf ( address ) external view returns ( uint )",
  pricesOf: "function pricesOf ( address[] memory ) external view returns ( uint[] memory )"
};
const stableSwapHelperABI = {
  calcWithdraw: "function calcWithdraw(address pool, uint amount) external view returns (uint[] memory)",
  calcWithdrawUnderlying: "function calcWithdrawUnderlying(address pool, uint amount) external view returns (uint[] memory amounts)"
};

const getTokenPrices = async (tokens, chain) => {
  const prices = {};
  const res = await sdk.api.abi.call({
    target: contracts[chain]["priceCalculator"],
    params: [tokens],
    chain: chain,
    abi: priceCalculatorABI.pricesOf
  });

  tokens.forEach((token, i) => {
    prices[token] = res.output[i];
  });

  return prices;
};

const getUnderlyingBalance = async (pool, chain) => {
  const balances = {};
  const poolInfo = contracts[chain]["pools"][pool];

  const totalSupply = await sdk.api.abi.call({
    target: poolInfo["poolToken"],
    chain: chain,
    abi: "erc20:totalSupply"
  });

  const underlyingBalances = await sdk.api.abi.call({
    target: contracts[chain]["stableSwapHelper"],
    chain: chain,
    params: [pool, totalSupply.output],
    abi: poolInfo.isMetaPool ? stableSwapHelperABI.calcWithdrawUnderlying : stableSwapHelperABI.calcWithdraw
  });

  poolInfo.underlyingTokens.forEach((token, i) => {
    balances[token] = underlyingBalances.output[i];
  });

  return balances;
};

const tvl = async (chain) => {
  const balances = {};
  const tokenInfos = contracts[chain]["tokens"];
  const tokenPrices = await getTokenPrices(Object.keys(tokenInfos), chain);

  for (let pool of Object.keys(contracts[chain]["pools"])) {
    const poolBalance = await getUnderlyingBalance(pool, chain);
    Object.keys(poolBalance).forEach((key) => {
      sdk.util.sumSingleBalance(balances, key, poolBalance[key]);
    });
  }

  let tvl = new BigNumber(0);
  Object.keys(balances).forEach((token) => {
    const balance = new BigNumber(balances[token]);
    const price = new BigNumber(tokenPrices[token]);
    tvl = tvl.plus(balance.multipliedBy(price).dividedBy(new BigNumber(10).pow(18 + tokenInfos[token].decimals)));
  });

  return {
    "usd": tvl.toNumber()
  };
};

const tvlWemix = async () => {
  return await tvl("wemix");
};

module.exports = {
  timetravel: true,
  doublecounted: true,
  methodology:
    "Total value of CDP collaterals, deposited stablecoins in pegging module(PSM), and WCD staked in our vault",
  wemix: {
    tvl: tvlWemix
  }
};
