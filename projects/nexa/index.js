const { ethers } = require("ethers");

const DATA_CONTRACT = "0xBf39404960eD6BFB4d782Ab04D232F240aA5B6Bc";
const BRLA_TOKEN = "0xe6a537a407488807f0bbeb0038b79004f19dddfb";

async function tvl(api) {
  const data = await api.call({
    target: DATA_CONTRACT,
    /* 
    projectAddresses: Addresses of the RWA tokens
    projectUUIDs: UUIDs
    projectTickers: Tickers
    projectFundingGoals: Funding goals
    totalFundingGoal: Total funding goal
    */
    abi: `function getTenantDetailedFundingGoal(string calldata _tenantName) external view returns (
      address[] memory projectAddresses,
      string[] memory projectUUIDs,
      string[] memory projectTickers,
      uint256[] memory projectFundingGoals,
      uint256 totalFundingGoal
    )`,
    params: ["nexa-finance"],
  });
  api.add(BRLA_TOKEN, data.totalFundingGoal);
}

module.exports = {
  methodology: "Sum the total TVL of all active RWA tokens.",
  polygon: { tvl },
};
