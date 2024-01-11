const sdk = require("@defillama/sdk");

lendingPoolCore = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
async function tvl(lendingPoolCore, block) {

  abi={"getUserAccountData": "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase)"}
  const reserves = (
      await sdk.api.abi.call({
          target: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
          params: ["0x01ae5e1e0fed8369aef5c4e6ff1ab62bd0381b9b"],
          abi: abi["getUserAccountData"],
          block: 9104473,
          chain: "base",
          skipCache: true
      })
  ).output;
console.log(reserves)
  return reserves
}

  module.exports = {
    methodology: "Counts assets (ETH and USDC) deposited ",
    base: {
      tvl,
    },
  };
