const sdk = require("@defillama/sdk");
const { chainExports } = require("../helper/exports");

const lendingPoolCore = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

async function tvl(_, _1, _2, { api }) {
  abi = {
    getUserAccountData:
      "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase)",
    getTotalDebt:
      "function getTotalDebt(address asset) external view override returns (uint256)"
  };
  //blockNumber = await sdk.api.util.getLatestBlock("base")
  const reserves = await sdk.api.abi.call({
    target: lendingPoolCore,
    params: ["0x01ae5e1e0fed8369aef5c4e6ff1ab62bd0381b9b"],
    abi: abi["getUserAccountData"],
    chain: "base",
    //block: blockNumber,
    skipCache: true
  });

  const totalCollateralBase = reserves.output[0];
  const totalCollateralBaseBigInt = BigInt(totalCollateralBase);
  const dividedValue = totalCollateralBaseBigInt / BigInt(100); // (100);  //reserves.output[0]
  let tvlOk = dividedValue; //(totalCollateralBase/100)

  const bal = api.getBalance; //("0x044d9B2C4d8A696Fe83FBB723F6006bd2d7a0E7e")
 

  const balances = {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": totalCollateralBase
  };

  const ethLocked = await sdk.api.eth.getBalances({
    targets: [
      "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      "0x044d9B2C4d8A696Fe83FBB723F6006bd2d7a0E7e"
    ],
    chain: "base"
    //block: chainBlocks.fantom
  });
 
  api.add("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", tvlOk);
  api.add(
    "0x0000000000000000000000000000000000000000",
    ethLocked.output[1].balance
  );
} 

module.exports = {
  methodology: "Counts assets (ETH and USDC) deposited",
  base: {
    tvl: tvl
  }
};
