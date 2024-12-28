const ADDRESSES = require("../helper/coreAssets.json");

const propertyFactoryAddress = '0x5d618C67674945081824e7473821A79E4ec0970F';
const priceOracleAddress = '0x551C261eFcf109378D101de9A2741FB8078Abf45';

// not relevant assets
const excludedTokens = ['0xC478d5C1E7F19D035Ad330bE09cb84eB9582D7F1', '0xd2198dBB407f5405284d0A00eA6624D087b7098b', '0x228ce2B019B5a54C545E61490E5ba66E40915868'].map(i => i.toLowerCase())


async function tvl(api) {
  const assets = (await api.call({ target: propertyFactoryAddress, abi: 'address[]:getAssets', })).filter(address => !excludedTokens.includes(address.toLowerCase()));
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: assets })
  const prices = await api.multiCall({ abi: 'function latestPrice(address asset) view returns (uint256)', calls: assets, target: priceOracleAddress, })

  supplies.forEach((v, i) => api.add(ADDRESSES.polygon.USDT, v * prices[i] / 1e18))
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl,
  },
  methodology: "TVL for the Binaryx Platform is calculated by summing the values of all assets, with each asset's value determined by multiplying its token supply by its token price, where the token price is obtained from the priceOracle."
};
