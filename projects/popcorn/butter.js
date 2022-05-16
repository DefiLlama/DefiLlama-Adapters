const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock')
const { ADDRESSES } = require("./constants");
const { getChainTransform } = require('../helper/portedTokens')

async function addButterV2TVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const butterTokens = [ADDRESSES.ethereum.ycrvAlusd, ADDRESSES.ethereum.ycrvFRAX, ADDRESSES.ethereum.ycrvRai, ADDRESSES.ethereum.ycrvMusd];
  const butterV2 = ADDRESSES.ethereum.butterV2;
  const block = await getBlock(timestamp, chain, chainBlocks)
  const chainAddressTransformer = await getChainTransform(chain)
  const butterTokenBalances = (await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: butterTokens.map(token => ({
      target: token,
      params: [butterV2]
    })),
    block,
    chain
  }))
  sdk.util.sumMultiBalanceOf(balances, butterTokenBalances, true)
  // map addressess
  Object.keys(balances).forEach(tokenAddress => {
    const transformedAddress = chainAddressTransformer(tokenAddress);
    if (transformedAddress !== tokenAddress) {
      balances[transformedAddress] = balances[tokenAddress]
      delete balances[tokenAddress];
    }
  })
  return balances
}


async function addButterTVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const butterTokens = [ADDRESSES.ethereum.ycrvMim, ADDRESSES.ethereum.ycrvFRAX];
  const butter = ADDRESSES.ethereum.butter;
  const block = await getBlock(timestamp, chain, chainBlocks)
  const chainAddressTransformer = await getChainTransform(chain)
  const butterTokenBalances = (await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: butterTokens.map(token => ({
      target: token,
      params: [butter]
    })),
    block,
    chain
  }))
  sdk.util.sumMultiBalanceOf(balances, butterTokenBalances, true)
  // map addressess
  Object.keys(balances).forEach(tokenAddress => {
    const transformedAddress = chainAddressTransformer(tokenAddress);
    if (transformedAddress !== tokenAddress) {
      balances[transformedAddress] = balances[tokenAddress]
      delete balances[tokenAddress];
    }
  })
  return balances
}


module.exports = {
  addButterTVL,
  addButterV2TVL
}