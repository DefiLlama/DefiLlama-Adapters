const sdk = require('@defillama/sdk');
const { ADDRESSES } = require("./constants");
const yearnVaultABI = "uint256:pricePerShare"
const curveMetapoolABI = "uint256:get_virtual_price"
const { ethers } = require("ethers")

async function addButterV2TVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const block = chainBlocks[chain]
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

async function addThreeXTVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const block = chainBlocks[chain]
  const WAD = ethers.constants.WeiPerEther;
  const threeXTokens = [
    ADDRESSES.ethereum.yCrv3Eur, ADDRESSES.ethereum.yCrvSUSD,
  ];
  const threeXUnderlyingTokens = [
    ADDRESSES.ethereum.crv3EurMetapool, ADDRESSES.ethereum.crvSUSDMetapool,
  ];
  const threeX = ADDRESSES.ethereum.threeX;

  const threeXComponentTokenBalances = (await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: threeXTokens.map(token => ({
      target: token,
      params: [threeX]
    })),
    block,
    chain
  }))
  const pricePerShare = (await sdk.api.abi.multiCall({
    abi: yearnVaultABI,
    calls: threeXTokens.map(token => ({
      target: token,
      params: []
    })),
    block,
    chain
  }))
  const virtualPrices = (await sdk.api.abi.multiCall({
    abi: curveMetapoolABI,
    calls: threeXUnderlyingTokens.map(token => ({
      target: token,
      params: []
    })),
    block,
    chain
  }))

  threeXComponentTokenBalances.output.forEach((tokenBalance, index) => {
    const balanceToken = ethers.BigNumber.from(tokenBalance.output)
    const pricePerShareToken = ethers.BigNumber.from(pricePerShare.output[index]?.output)
    const virtualPriceToken = ethers.BigNumber.from(virtualPrices.output[index]?.output)
    const tokenTvl = ((balanceToken.mul(pricePerShareToken).mul(virtualPriceToken)).div(WAD).div(WAD));
    sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.dai, tokenTvl)
  })
}


module.exports = {
  addThreeXTVL,
  addButterV2TVL
}