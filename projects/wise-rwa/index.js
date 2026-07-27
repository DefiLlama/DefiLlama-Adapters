const contracts = {
  ethereum: [
    { token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', vault: '0x7e1EFF4301defc24936470B30bd1c686D2a295dc' }, // USDC forwarding deposit
    { token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', vault: '0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7' }, // USDT forwarding deposit
  ],
  arbitrum: [
    { token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', vault: '0x7e1EFF4301defc24936470B30bd1c686D2a295dc' }, // USDC forwarding deposit
    { token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', vault: '0x7e1EBE1D25367C6D3bC0aA72A1f00fC5320a05d7' }, // USDT forwarding deposit
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
