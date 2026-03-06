const ADDRESSES = require('../helper/coreAssets.json');
const poolABI = {
    type: "function",
    name: "poolTokenAmounts",
    inputs: [{name: "", type: "address", internalType: "address"}],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}],
    stateMutability: "view"
};
const poolAddresses = {
    hela: {
        pool: "0x850034064016D9105D8719b3E06c30789e5E87Fc",
        token: ADDRESSES.null
    },
    bsc: {
        pool: "0x528d46B5780879E28Cf410C0b86D991A38Fe64Aa",
        tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC]
    },
    polygon: {
        pool: "0x109d3042a3c682f94107b3818e93b3ade2a47544",
        tokens: [ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT]
    },
    ethereum: {
       pool: "0x109D3042a3c682F94107b3818e93b3aDE2A47544",
       tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT]
    }
}

async function tvl(api, chain) {
    if (chain === 'hela') {
        const tvl = await api.call({ abi: poolABI, target: poolAddresses[chain].pool, params: poolAddresses[chain].token, chain})
        api.add(poolAddresses[chain].token, tvl)
    }
    if (chain === 'bsc' || chain === 'polygon' || chain === 'ethereum') {
        const tvls = await api.multiCall({ abi: poolABI, calls: poolAddresses[chain].tokens.map((t) => ({ target: poolAddresses[chain].pool, params: t })), chain })
        tvls.forEach((tvl, i) => api.add(poolAddresses[chain].tokens[i], tvl))
    }
}
 
module.exports = {
  hela: {
    tvl: async (api) => {
      await tvl(api, 'hela', api.chain)
    }
  },
  bsc: {
    tvl: async (api) => {
      await tvl(api, 'bsc', api.chain)
    }
  },
  polygon: {
    tvl: async (api) => {
      await tvl(api, 'polygon', api.chain)
    }
  },
  ethereum: {
    tvl: async (api) => {
      await tvl(api, 'ethereum', api.chain)
    }
  }
}
