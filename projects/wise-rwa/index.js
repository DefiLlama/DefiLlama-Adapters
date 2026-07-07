const contracts = {
  ethereum: [
    { token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', vault: '0x11cEeE394842d9492f2C97050f66dE0e3f89D3A6' }, // USDC forwarding deposit
    { token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', vault: '0x3Ed1f16BbE0eE2C58119c13517a88fe9ccedfd45' }, // USDT forwarding deposit
  ],
  arbitrum: [
    { token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', vault: '0x025421D3e98D3bB7A33d6814Dd576eD8B9090077' }, // USDC forwarding deposit
    { token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', vault: '0xD69670d0eCaf032Ea8b1A6925E59dBacAA20f43A' }, // USDT forwarding deposit
  ],
};

function tvl(chain) {
  return async (api) => {
    for (const { token, vault } of contracts[chain]) {
      const supply = await api.call({ target: vault, abi: 'erc20:totalSupply' });
      api.add(token, supply);
    }
  };
}

module.exports = {
  methodology: 'Sums totalSupply() of Wise RWA forwarding-deposit vaults (USDC + USDT) per chain.',
  ethereum: { tvl: tvl('ethereum') },
  arbitrum: { tvl: tvl('arbitrum') },
};
