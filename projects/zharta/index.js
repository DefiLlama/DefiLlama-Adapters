const { default: axios } = require("axios");
const { getWhitelistedNFTs, tokensBare} = require('../helper/tokenMapping');
const { sumTokensExport, } = require('../helper/unwrapLPs')


// https://api.zharta.io/collaterals/v2/doc#/collaterals/get_collateral_from_pool_collaterals_v2_lending_pool__token_symbol__get
// WETH
async function fetchCollateralData() {
  try {
    const response = await axios.get("https://api.zharta.io/collaterals/v2/lending_pool/WETH");
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
}

function getTotalAppraisal(collaterals) {
  return collaterals.reduce((accumulator, currentValue) =>
    accumulator + parseFloat(currentValue.appraisal), 0);
}

// appraisal
async function fetchTotalAppraisal() {
  const data = await fetchCollateralData();
  const collaterals = data.collaterals;
  totalAppraisal = getTotalAppraisal(collaterals);
}

let totalAppraisal = 0;
fetchTotalAppraisal();


// Vaults
const collateralVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";
const punkVault = "0x94925030F48aDfc3e4A65a2E0A7444733406c144";
const LP_CORE = "0xe3c959bc97b92973d5367dbf4ce1b7b9660ee271";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({ ownerTokens: [
      [getWhitelistedNFTs(), collateralVault], 
      [getWhitelistedNFTs(), punkVault], 
      [[tokensBare.weth], LP_CORE],
      [[tokensBare.weth], totalAppraisal],
    ]}),
  }
}