const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');

const { unwrapUniswapLPs } = require("./unwrapLPs");

const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');

const getPairFactory = require('./abis/getPair.json') 



async function getTokensAndLPsTrackedValue(balances, lpTokens, contract, factory, trackedTokens, block, chain) {

  if (!Array.isArray(trackedTokens)) throw new Error("must pass an array of base tokens to trackedTokens")

  const [token0Addresses, token1Addresses, tokenBalances] = await Promise.all([
    sdk.api.abi
    .multiCall({
        abi: token0,
        chain,
        calls: lpTokens.map((lpToken) => ({
            target: lpToken,
        })),
        block,
    })
    .then(({ output }) => output),
    sdk.api.abi
    .multiCall({
        abi: token1,
        chain,
        calls: lpTokens.map((lpToken) => ({
            target: lpToken,
        })),
        block,
    }).then(({ output }) => output),
    sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      chain,
      calls: lpTokens.map(lpToken => ({
        target: lpToken,
        params: contract,
      })),
      block,
    }).then(({ output }) => output)
  ]);

  let lps = {}
  let filteredLps = {}
  let lpBalances = []


  tokenBalances.forEach((balance) => {
    if (balance.success) {
      const lpBalance = balance.output 
      const lpAddress = balance.input.target.toLowerCase()
      lps[lpAddress] = {
          balance: lpBalance,
      }
    }
  });

  token0Addresses.forEach((token0Address) => {
    if (token0Address.success) {
      const pairAddress = token0Address.input.target.toLowerCase();
        if (pairAddress && lps[pairAddress])
            lps[pairAddress].token0 = token0Address.output
    }
  });

  token1Addresses.forEach((token1Address) => {
    if (token1Address.success) {
    const pairAddress = token1Address.input.target.toLowerCase();
        if (pairAddress && lps[pairAddress])
            lps[pairAddress].token1 = token1Address.output
    }
  });

  Object.entries(lps).forEach(([key, value]) => {
    if (value.token0 && value.token1 && value.balance) {
      if (value.balance > 0) {
        filteredLps[key] = {balance: value.balance} 
        filteredLps[key].token0 = value.token0
        filteredLps[key].token1 = value.token1
      }
    }
  })

  // Check if token is actually a v2 pair
  {const checkedLPToken = (
    await sdk.api.abi.multiCall({
      abi: getPairFactory,
      calls: Object.values(filteredLps).map((value) => ({
        target: factory,
        params: [value.token0, value.token1],
      })),
      chain: chain,
      block: block,
    })
  ).output

  checkedLPToken.forEach(lp => {
    if (lp.success) {
      const lpToken = lp.output.toLowerCase()
      if (lp.success && Object.keys(filteredLps).includes(lpToken)) {
        // check if pair contains both base tokens
        let lpBalance =
        ((trackedTokens.includes(filteredLps[lpToken].token0)   && 
          trackedTokens.includes(filteredLps[lpToken].token1))) ? 
        filteredLps[lpToken].balance :
        BigNumber(filteredLps[lpToken].balance).times(BigNumber(2)).toFixed(0) 

        lpBalances.push({
          balance: lpBalance,
          token: lpToken
        })}
      }
    })
  }

  await unwrapUniswapLPs(balances, lpBalances, block, chain, (addr) => `${chain}:${addr}`);


  let formattedWhitelist = trackedTokens.map(address => `${chain}:${address}`)

  balances = Object.keys(balances)
  .filter(balance => formattedWhitelist.includes(balance))
  .reduce((obj, balance) => {
    obj[balance] = balances[balance];
    return obj;
  }, {});

  return balances;
}


module.exports = {
  getTokensAndLPsTrackedValue,
}

