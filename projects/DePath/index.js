const CA_CONTRACT_ADDRESSES = [
  '0x977B2cF155362Bb0e74116Be65278d3068FDA46e',
  '0x42c3D269A462387925373018828882FAa3f5fcEc',
  '0xd221a9f7BEB5F942a49E19dC3e837C139b9024F2',
];

function getChainTvl() {
  return async (api) => {
    const balances = await Promise.all(
      CA_CONTRACT_ADDRESSES.map(address => api.nativeBalance(address))
    );

    balances.forEach(balance => {
      if (balance > 0) {
        api.addNative(balance);
      }
    });

    return api.getBalances();
  };
}

module.exports = {
  methodology: "Calculates TVL by tracking the native token balance held across multiple, multi-chain CA addresses used for different protocol functionalities.",
  start: 1756694400,
  
  bsc: { tvl: getChainTvl() },
  optimism: { tvl: getChainTvl() },
  base: { tvl: getChainTvl() },
  avax: { tvl: getChainTvl() },
  arbitrum: { tvl: getChainTvl() },
};
