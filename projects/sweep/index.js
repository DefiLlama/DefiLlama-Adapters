const { ethers } = require("ethers");
const ADDRESSES = require('../helper/coreAssets.json');
const SWEEP_ADDRESS = '0xB88a5Ac00917a02d82c7cd6CEBd73E2852d43574';
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {},
  arbitrum: {},
  optimism: {},
  base: {},
  avax: {},
  polygon: {},
  bsc: {}
};

async function tvl(api) {
  const { TOKEN, DECIMALS } = api.chain === "bsc" ? { TOKEN: "USDT", DECIMALS: 12 } : { TOKEN: "USDC", DECIMALS: 0 };
  const TOKEN_ADDRESS = ADDRESSES[api.chain][TOKEN];

  const [minters] = await api.multiCall({ abi: 'address[]:getMinters', calls: [SWEEP_ADDRESS] })
  // await sumTokens2({ api, owners: minters, tokens: [USDC_ADDRESS]})
  const names = await api.multiCall({ abi: 'string:name', calls: minters })
  const uniswapMinters = minters.filter((_, i) => /uniswap/i.test(names[i]))
  const otherMinters = minters.filter((_, i) => !/uniswap/i.test(names[i]))

  if(uniswapMinters.length > 0)
    await sumTokens2({ api, owners: uniswapMinters, resolveUniV3: true, blacklistedTokens: [SWEEP_ADDRESS], tokens: [TOKEN_ADDRESS], })

  const bals = (await api.multiCall({ abi: 'uint256:assetValue', calls: otherMinters, permitFailure: true })).filter(i => i)
  bals.forEach(bal => api.add(TOKEN_ADDRESS, Number(bal) * 10 ** DECIMALS))
  return api.getBalances()
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.misrepresentedTokens = true