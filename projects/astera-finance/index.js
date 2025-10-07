const poolDataAbi = require('./abis/poolDataAbi');
const stakingDataAbi = require('./abis/stakingDataAbi');

const POOL_DATA_ADDRESSES = {
  linea: '0xE4FeC590F1Cf71B36c0A782Aac2E4589aFdaD88e',
};
const STAKING_DATA_ADDRESSES = {
  linea: { 
    dataProvider: '0x0f8487F0B70295b73f08bE04614848c30Eb39F6D', 
    token: '0xa500000000e482752f032eA387390b6025a2377b',
  },
}

const fetchReserveData = async (api, poolDataAddress, isBorrowed) => {
  const allMarketData = await api.call({ target: poolDataAddress, abi: poolDataAbi.getAllMarketData });
  if (allMarketData) {
    allMarketData.mainPoolReservesData.forEach((mainPool) => {
      const amounts = 
        isBorrowed 
          ? [mainPool.totalScaledVariableDebt] 
          : [mainPool.availableLiquidity, mainPool.totalScaledVariableDebt];
      api.add(mainPool.underlyingAsset, amounts);
    }); 
    allMarketData.miniPoolData.forEach((miniPool) => {
      miniPool.reservesData.forEach((mpReservesData) => {
        const amounts = 
          isBorrowed 
            ? [mpReservesData.totalScaledVariableDebt] 
            : [mpReservesData.availableLiquidity, mpReservesData.totalScaledVariableDebt];
        api.add(mpReservesData.underlyingAsset, amounts);
      });
   });
  }
  return api.getBalances();
}

const fetchStakingData = async (api, stakingDataAddress, tokenAddress) => {
  const stakingData = await api.call({ target: stakingDataAddress, abi: stakingDataAbi.totalSupply });
  if (stakingData) {
    api.add(tokenAddress, [stakingData]);
  }
  return api.getBalances();
}

Object.keys(POOL_DATA_ADDRESSES).forEach((chain) => {
  const poolDataAddress = POOL_DATA_ADDRESSES[chain];
  const stakingDataAddresses = STAKING_DATA_ADDRESSES[chain];
  module.exports[chain] = {
    tvl: (api) => fetchReserveData(api, poolDataAddress),
    borrowed: (api) => fetchReserveData(api, poolDataAddress, true),
    staking: (api) => fetchStakingData(api, stakingDataAddresses.dataProvider, stakingDataAddresses.token),
  };
});