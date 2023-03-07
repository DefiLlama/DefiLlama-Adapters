const { default: axios } = require("axios")
const { getWhitelistedNFTs, tokensBare} = require('../helper/tokenMapping');
const { sumTokensExport, } = require('../helper/unwrapLPs')

async function fetchEstimatedValue(){
  const response = await axios.get("https://api.zharta.io/lending_pools/v2");
  const lendingPool = response.data.lending_pools[0];
  return lendingPool.collateral_estimated_value;
}

// Vaults
const collateralVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";
const punkVault = "0x94925030F48aDfc3e4A65a2E0A7444733406c144";
const LP_CORE = "0xe3c959bc97b92973d5367dbf4ce1b7b9660ee271";
const appraisalVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {

    tvl: async () => {
      const collateralEstimatedValue = await fetchEstimatedValue();
      const tokensTvl = sumTokensExport({ ownerTokens: [
        [getWhitelistedNFTs(), collateralVault], 
        [getWhitelistedNFTs(), punkVault], 
        [getWhitelistedNFTs(), appraisalVault], 
        [[tokensBare.weth], LP_CORE],      
      ]});
      return tokensTvl + Number(collateralEstimatedValue);
    }
  }
}
