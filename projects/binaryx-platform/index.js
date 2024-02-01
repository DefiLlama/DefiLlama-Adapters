const sdk = require('@defillama/sdk');
const ADDRESSES = require("../helper/coreAssets.json");
const { toUSDT } = require("../helper/balances");

const propertyFactoryAddress = '0x5d618C67674945081824e7473821A79E4ec0970F';
const priceOracleAddress = '0x551C261eFcf109378D101de9A2741FB8078Abf45';
const polygonUsdt = 'polygon:' + ADDRESSES.polygon.USDT;
const chain = 'polygon'

// not relevant assets
const excludedTokens = ['0xC478d5C1E7F19D035Ad330bE09cb84eB9582D7F1','0xd2198dBB407f5405284d0A00eA6624D087b7098b','0x228ce2B019B5a54C545E61490E5ba66E40915868']

const abis = {
  erc20: {
    totalSupply: 'function totalSupply() view returns (uint256)',
  },
  propertyFactory: {
    getAssets: 'function getAssets() view returns (address[])',
  },
  priceOracle: {
    latestPrice: 'function latestPrice(address asset) view returns (uint256)',
  },
};


async function tvl(timestamp, block, chainBlocks) {
  const currentBlock = chainBlocks['polygon'];

  const assets = (await sdk.api.abi.call({
    target: propertyFactoryAddress,
    abi: abis.propertyFactory.getAssets,
    block: currentBlock,
    chain: chain
  })).output.filter(address => !excludedTokens.includes(address));

  const totalSupplyCalls = assets.map(asset => ({
    target: asset,
    abi: abis.erc20.totalSupply
  }));
  const priceCalls = assets.map(asset => ({
    target: priceOracleAddress,
    params: [asset],
    abi: abis.priceOracle.latestPrice
  }));

  const totalSuppliesResponse = await sdk.api.abi.multiCall({
    calls: totalSupplyCalls,
    block: currentBlock,
    abi: abis.erc20.totalSupply,
    chain: chain
  });

  const pricesResponse = await sdk.api.abi.multiCall({
    calls: priceCalls,
    block: currentBlock,
    abi: abis.priceOracle.latestPrice,
    chain: chain
  });

  const tvl = totalSuppliesResponse.output.reduce((acc, supply, index) => {
    const price = pricesResponse.output[index].output;
    const valueInUSD = (supply.output / 1e18) * price / 1e6;
    return acc + valueInUSD;
  }, 0);

  return {
    [polygonUsdt]: toUSDT(tvl)
  };
}

module.exports = {
  polygon: {
    tvl,
  },
  methodology: "TVL for the Binaryx Platform is calculated by summing the values of all assets, with each asset's value determined by multiplying its token supply by its token price, where the token price is obtained from the priceOracle."
};
