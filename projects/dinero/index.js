const dinero = '0x6DF0E641FC9847c0c6Fde39bE6253045440c14d3';
const sDinero = '0x55769490c825CCb09b2A6Ae955203FaBF04857fd';
const sDineroAbi = {
    totalAssets: "function totalAssets() view returns (uint256)"
}

module.exports = {
    ethereum: {
      tvl: async (api) => {
        const totalSupply = await api.call({ target: sDinero, abi: sDineroAbi.totalAssets});
      
        return {
          [dinero]: totalSupply
        };
      }
    }
  };