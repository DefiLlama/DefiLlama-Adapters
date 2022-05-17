const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock')
const { ADDRESSES } = require("./constants");
const { getChainTransform } = require('../helper/portedTokens')
const butterBatchABI = require("./abi/butterBatchProcessing.json")
const basicSetIssuanceModule = require("./abi/basicSetIssuanceModule.json")
const { ethers } = require("ethers")

async function addButterV2TVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const block = await getBlock(timestamp, chain, chainBlocks)

  const butterV2 = ADDRESSES.ethereum.butterV2;
  const setBasicIssuanceModule = ADDRESSES.ethereum.setBasicIssuanceModule
  const butterBatch = ADDRESSES.ethereum.butterBatch

  const chainAddressTransformer = await getChainTransform(chain)

  // get butter circulating supply
  const butterSupply = (await sdk.api.abi.call({
    abi: "erc20:totalSupply",
    target: butterV2,
    params: [],
    block,
    chain
  })).output
  // multiply with value.
  const [tokenAddresses, quantities] = (await sdk.api.abi.call({
    abi: basicSetIssuanceModule,
    target: setBasicIssuanceModule,
    params: [butterV2, "1000000000000000000"],
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