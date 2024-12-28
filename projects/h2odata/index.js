  const sdk = require("@defillama/sdk");

  
  async function tvl(timestamp, block) {
    // OCEAN ERC20 contract
    const ocean = "0x967da4048cD07aB37855c090aAF366e4ce1b9F48";
  
    // Contract holding all of the OCEAN balance in the system
    const oceanCollateralJoin = "0x13288BD148160f76B37Bea93861cA61BAea120D1";
  
    const balance = (
      await sdk.api.erc20.balanceOf({
        target: ocean,
        owner: oceanCollateralJoin,
        block,
      })
    ).output;
  
    return { [ocean]: balance };
  }
  

  
  module.exports = {
    ethereum:{
      tvl
    }
    
  };