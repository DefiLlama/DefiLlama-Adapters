// If enzoBTC uses the same address across all chains (CREATE2 deployment)
const enzoBtcAddress = "0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a"; // Replace with actual enzoBTC contract address
const chains = ["ethereum", "bsc", "swellchain", "morph", "rsk", "soneium", "core", "sei", "goat"]; // Add your deployed chains

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: enzoBtcAddress });
      api.add(enzoBtcAddress, supply);
    },
  }
});

// Alternative: If addresses are different per chain, use this approach instead:
/*
const ENZO_BTC_ADDRESSES = {
  ethereum: "0x...", 
  bsc: "0x...", 
  arbitrum: "0x...", 
  polygon: "0x...", 
};

Object.keys(ENZO_BTC_ADDRESSES).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: ENZO_BTC_ADDRESSES[chain] });
      api.add(ENZO_BTC_ADDRESSES[chain], supply);
    },
  }
});
*/

module.exports.methodology = "enzoBTC total supply across all chains - Lorenzo Wrapped Bitcoin deployed on multiple networks";
