const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock')
const { ADDRESSES } = require("./constants");
const { getChainTransform } = require('../helper/portedTokens')
const yearnVaultABI = require("./abi/yearnVaultABI.json")
const curveMetapoolABI = require("./abi/curveMetapoolABI.json")
const { ethers } = require("ethers")

async function addButterV2TVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const block = await getBlock(timestamp, chain, chainBlocks)
  const WAD = ethers.constants.WeiPerEther;
  const butterTokens = [
    ADDRESSES.ethereum.ycrvAlusd, ADDRESSES.ethereum.ycrvFRAX,
    ADDRESSES.ethereum.ycrvRai, ADDRESSES.ethereum.ycrvMusd
  ];
  const butterUnderlyingTokens = [
    ADDRESSES.ethereum.crvAlusdMetapool, ADDRESSES.ethereum.crvFRAXMetapool,
    ADDRESSES.ethereum.crvRaiMetapool, ADDRESSES.ethereum.crvMusdMetapool
  ];
  const butterV2 = ADDRESSES.ethereum.butterV2;

  const butterComponentTokenBalances = (await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: butterTokens.map(token => ({
      target: token,
      params: [butterV2]
    })),
    block,
    chain
  }))
  const pricePerShare = (await sdk.api.abi.multiCall({
    abi: yearnVaultABI,
    calls: butterTokens.map(token => ({
      target: token,
      params: []
    })),
    block,
    chain
  }))
  const virtualPrices = (await sdk.api.abi.multiCall({
    abi: curveMetapoolABI,
    calls: butterUnderlyingTokens.map(token => ({
      target: token,
      params: []
    })),
    block,
    chain
  }))

  butterComponentTokenBalances.output.forEach((tokenBalance, index) => {
    const balanceToken = ethers.BigNumber.from(tokenBalance.output)
    const pricePerShareToken = ethers.BigNumber.from(pricePerShare.output[index]?.output)
    const virtualPriceToken = ethers.BigNumber.from(virtualPrices.output[index]?.output)
    const tokenTvl = ((balanceToken.mul(pricePerShareToken).mul(virtualPriceToken)).div(WAD).div(WAD));
    sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.dai, tokenTvl)
  })
}

async function addButterTVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const block = await getBlock(timestamp, chain, chainBlocks)

  const butter = ADDRESSES.ethereum.butter;
  const setBasicIssuanceModule = ADDRESSES.ethereum.setBasicIssuanceModule
  const butterBatch = ADDRESSES.ethereum.butterBatch

  // get butter circulating supply
  const butterSupply = (await sdk.api.abi.call({
    abi: "erc20:totalSupply",
    target: butter,
    params: [],
    block,
    chain
  })).output
  // multiply with value.
  const [tokenAddresses, quantities] = (await sdk.api.abi.call({
    abi: basicSetIssuanceModule,
    target: setBasicIssuanceModule,
    params: [butter, "1000000000000000000"],
    block,
    chain
  })).output
  const butterPrice = (await sdk.api.abi.call({
    abi: butterBatchABI,
    target: butterBatch,
    params: [tokenAddresses, quantities],
    block,
    chain
  })).output

  const tvl = (ethers.BigNumber.from(butterPrice).div(ethers.constants.WeiPerEther)).mul(ethers.BigNumber.from(butterSupply))
  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.dai, tvl)
}

module.exports = {
  addButterTVL,
  addButterV2TVL
}