const { decimals } = require("@defillama/sdk/build/erc20");
const { ethers, formatUnits } = require("ethers");

const abi = {
    totalValue: "function totalValue() view returns ((address tokenAddress, int256 value, uint8 decimals, int256 valueUsd, uint16 targetWeight,uint16 feeBasisPoints,uint16 taxBasisPoints, bool dynamicFee)[])",
};

  const CONFIG = {
    bitlayer: '0x3d0E678776e4287BEfB0449d344D195ad1A2C418',
    base: '0xa67998d867cd4b64fe9ecc1549341f1d86389c0f',
  };
  
  const queryTvlData = async (api,chain) => {
    const tokenBalance = await api.call({
        abi: abi.totalValue,
        target: CONFIG[chain],
        params: [],
      });
      const reData = {}
      tokenBalance.forEach(async item=>{
        reData[item.tokenAddress] = item.value
      })
      return reData
  }
  
  Object.keys(CONFIG).forEach((chain) => {
      module.exports[chain] = {
        tvl: (api) => queryTvlData(api, chain),
      };
  });

  
  