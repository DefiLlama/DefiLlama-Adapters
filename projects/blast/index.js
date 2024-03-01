const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens } = require("../helper/sumTokens");
const { nullAddress } = require("../helper/treasury");

// Blast addresses
const blastPreLaunchDeposit = "0x5f6ae08b8aeb7078cf2f96afb089d7c9f51da47d";
const blastEthYieldManagerProxy = "0x98078db053902644191f93988341e31289e1c8fe";
const blastDaiYieldManagerProxy = "0xa230285d5683c74935ad14c446e137c8c8828438";

// DAI DSR address
const dsrContract = "0x373238337bfe1146fb49989fc222523f83081ddb";
const dsrPieOfABI = "function pieOf(address) external view returns (int256)"

async function tvl(_, _a, _b, { api }) {
  // Get the balances of DAI staked in DSR from the waiting contract and the yield manager
  const data = await api.multiCall({
    target: dsrContract,
    abi: dsrPieOfABI,
    calls: [blastPreLaunchDeposit, blastDaiYieldManagerProxy],
  });
  const daiBalancesInDsr = data
    .reduce((total, daiBalance) => BigInt(total) + BigInt(daiBalance), 0)
    .toString();
  const balances = {
    [ADDRESSES.ethereum.DAI]: daiBalancesInDsr,
  };
  // Get the balances of DAI and ETH that are not staked yet, and the stETH in each contract
  await sumTokens({
    api,
    balances,
    owners: [
      blastPreLaunchDeposit,
      blastEthYieldManagerProxy,
      blastDaiYieldManagerProxy,
    ],
    tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.DAI, nullAddress],
  });
  return balances;
}

module.exports = {
  ethereum: { tvl },
};
