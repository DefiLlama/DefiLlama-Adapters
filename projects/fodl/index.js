const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");  
const BigNumber = require("bignumber.js")
const abi = require('./abi.json')

const position_nft = '0xB410075E1E13c182475b2D0Ece9445f2710AB197'
const lens_contract = '0x080155C42b0854C3A718B610cC5183e963851Afb'

async function tvl(timestamp, ethBlock, chainBlocks) {
  // Get number of positions opened by users by querying the supply of ERC721 tokens
  const erc721_supply = (await sdk.api.abi.call({ target: position_nft, abi: 'erc20:totalSupply', block: ethBlock, chain: 'ethereum' })).output;
  console.log(`${erc721_supply} position ownership ERC 721 existing`)

  // Get all positions contracts addresses
  const positionsCalls = [...Array(parseInt(erc721_supply)).keys()].map(t => ({target: position_nft, params: t}))
  const positionsAddresses = (
    await sdk.api.abi.multiCall({
      calls: positionsCalls,
      abi: abi['tokenByIndex'],
      block: ethBlock,
      chain: 'ethereum'
    })
  ).output

  // Get all positions paramters using the lens contract
  const usersPositions = (
    await sdk.api.abi.call({
      target: lens_contract, 
      params: [positionsAddresses.map(t => t.output)],
      abi: abi['getPositionsMetadata'],
      block: ethBlock,
      chain: 'ethereum'
    })
  ).output
  // console.log('first position example', usersPositions[0])
  
  // FODL uses flashloans to leverage the user provided collateral. TVL should count only what the user brought in, which is supplyAmount of supplyTokenAddress 
  // const usersSuppliedBalances = usersPositions.map(t => ({[t.supplyTokenAddress]: t.supplyAmount}))
  const balances = {}
  usersPositions.forEach(t => {
    const token = t.supplyTokenAddress
    // const collatAmount = t.positionValue // principalValue or supplyAmount or positionValue 
    balances[token] = (new BigNumber(balances[token] || "0").plus(new BigNumber(t.principalValue)) ).toString(10)
  })
  return balances
}

/* position lens contract getPositionsMetadata returns a struct like this:
  uint256 supplyAmount;
  uint256 borrowAmount;
  uint256 collateralUsageFactor;
  uint256 principalValue;
  uint256 positionValue;
  address positionAddress;
  address platformAddress;
  address supplyTokenAddress;
  address borrowTokenAddress;
*/


const sushiLps = [
  "0xa5c475167f03b1556c054e0da78192cd2779087f", // FODL USDC
  "0xce7e98d4da6ebda6af474ea618c6b175729cd366", // FODL-WETH
];

async function ethPool2(timestamp, block) {
  let balances = {};

  let { output: totalSupply } = await sdk.api.abi.multiCall({
    calls: sushiLps.map(address => ({
      target: address
    })),
    abi: "erc20:totalSupply",
    block
  });

  let lpPos = totalSupply.map(result => ({
    balance: result.output,
    token: result.input.target
  }));

  await unwrapUniswapLPs(balances, lpPos, block);

  return balances;  
}

module.exports = {
  methodology: "FODL leverages users positions on Aave and Compound. The fodl lens contract is used to get the positions metadata, especially supplyAmount and supplyTokenAddress, which counts as the TVL of the position of the user. Pool2 TVL are the tokens locked in the SUSHI pools",
  ethereum: {
    tvl: tvl,
    pool2: ethPool2,
  },
  tvl
};
