const { sumTokens2 } = require('../helper/unwrapLPs');

const lendingPoolAddressProvider = '0x3d8a1ea95ea4afa2469bfb80d94a4f9068670e82';

module.exports = { 
  methodology: 'TVL consists of all assets supplied to the protocol on Optimism, held in aToken contracts.',
  optimism: {
    tvl: async (api) => {
      const lendingPoolAbi = 'function getLendingPool() external view returns (address)';
      const lendingPool = await api.call({ target: lendingPoolAddressProvider, abi: lendingPoolAbi });

      const reservesListAbi = 'function getReservesList() external view returns (address[])';
      const reserves = await api.call({ target: lendingPool, abi: reservesListAbi });

      const getReserveDataAbi = 'function getReserveData(address asset) external view returns (uint256, uint128, uint128, uint128, uint128, uint128, uint40, address, address, address, address, uint8)';
      const reserveData = await api.multiCall({
        abi: getReserveDataAbi,
        calls: reserves.map(token => ({ target: lendingPool, params: [token] })),
      });
      
      const tokensAndOwners = reserveData.map(data => {
        const underlying = reserves[reserveData.indexOf(data)];
        const aToken = data[7];
        return [underlying, aToken];
      });

      return sumTokens2({ api, tokensAndOwners });
    },
  },
};
