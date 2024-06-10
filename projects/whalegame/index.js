
const ADDRESSES = require("../helper/coreAssets.json");

const GAME_CONTRACT_ADDRESS = "0xF1baf16Db25405856f5379246Beba2B694e1449D";

async function tvl(api) {
  const whaleTokenAddress = await api.call({ abi: abi.whaleToken, target: GAME_CONTRACT_ADDRESS, });
  const owners = [GAME_CONTRACT_ADDRESS, whaleTokenAddress]

  owners.push(...await api.fetchList({ itemAbi: abi.vestingContractforRound, lengthAbi: abi.round, target: GAME_CONTRACT_ADDRESS, }))
  return api.sumTokens({ tokens: [ADDRESSES.null], owners, blacklistedOwners: [ADDRESSES.null] })
}

module.exports = {
  methodology:
    "Counts the amount of ETH in the Game Pot, WHALE Rewards Contract and unclaimed ETH in vesting contracts",
  ethereum: {
    tvl,
  },
};

const abi = {
  "vestingContractforRound": "function vestingContractForRound(uint256) view returns (address)",
  "round": "uint256:round",
  "whaleToken": "address:whaleToken"
}