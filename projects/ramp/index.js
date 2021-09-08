const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const axios = require("axios");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function getConfig(network) {
  return await axios.get('https://appv2.rampdefi.com/config/appv2').then(response => response.data[network]);
}

async function ethereumTVL(timestamp, block) {
  let balances = {};
  let lpPositions = []
  const config = await getConfig('eth')
  const tokens = config.tokens;

  for (const [tokenName, token] of Object.entries(tokens)) {
    if (token?.strategy?.type === undefined) continue

    const tokenAddress = token.address.toLowerCase();

    const tokenTVL = await sdk.api.erc20.balanceOf({
      target: tokenAddress,
      owner: token.strategy.address,
      block
    })

    balances[tokenAddress] = tokenTVL.output

    if (tokenName.includes('UNIV2')) {
      lpPositions.push({
        token: tokenAddress,
        balance: balances[tokenAddress]
      })
      delete balances[tokenAddress]
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block)
  return balances
}

async function bscTVL(timestamp, block) {
  let balances = {};
  let lpPositions = []
  const config = await getConfig('bsc');
  const tokens = config.tokens;

  for (const [tokenName, token] of Object.entries(tokens)) {
    if (token?.strategy?.type === undefined) continue

    let tokenTVL = 0
    const tokenAddress = token.address.toLowerCase();

    if (tokenName === "CAKE" || token.strategy.type === 1) {
      tokenTVL = await sdk.api.abi.call({
        abi: abi.getPoolAmount,
        target: token.strategy.address,
        params: tokenAddress,
        chain: 'bsc',
        block,
      })
    } else if (token.strategy.type === 2 || token.strategy.type === 0) {
      tokenTVL = await sdk.api.abi.call({
        abi: abi.getPoolBalance,
        target: config.contracts.Vault.address,
        params: tokenAddress,
        chain: 'bsc',
        block,
      })
    }

    const prefixedTokenAddress = "bsc:" + tokenAddress;
    balances[prefixedTokenAddress] = tokenTVL.output

    if (tokenName.includes('CAKELP') || tokenName.includes('UNIV2')) {
      lpPositions.push({
        token: tokenAddress,
        balance: balances[prefixedTokenAddress]
      })
      delete balances[prefixedTokenAddress]
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, 'bsc', (address) => 'bsc:' + address)
  return balances
}

async function polygonTVL(timestamp, block) {
  let balances = {};
  let lpPositions = []
  const config = await getConfig('polygon');
  const tokens = config.tokens;

  for (const [tokenName, token] of Object.entries(tokens)) {
    if (token?.strategy?.type === undefined) continue
    let tokenTVL = 0
    const tokenAddress = token.address.toLowerCase();

    tokenTVL = await sdk.api.abi.call({
      abi: abi.getPoolAmount,
      target: token.strategy.address,
      params: tokenAddress,
      chain: 'polygon',
      block,
    })

    const prefixedTokenAddress = "polygon:" + tokenAddress
    balances[prefixedTokenAddress] = tokenTVL.output

    if (tokenName.includes('UNIV2')) {
      lpPositions.push({
        token: tokenAddress,
        balance: balances[prefixedTokenAddress]
      })
      delete balances[prefixedTokenAddress]
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, 'polygon', (address) => 'polygon:' + address)
  return balances
}


module.exports = {
  ethereum: {
    tvl: ethereumTVL
  },
  bsc: {
    tvl: bscTVL
  },
  polygon: {
    tvl: polygonTVL
  },
  tvl: sdk.util.sumChainTvls([ethereumTVL, bscTVL, polygonTVL])
}
