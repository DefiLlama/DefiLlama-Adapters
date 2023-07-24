const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

const GAME_CONTRACT_ADDRESS = "0xF1baf16Db25405856f5379246Beba2B694e1449D";

async function tvl(_, _1, _2, { api }) {
  const whaleTokenAddress = await api.call({
    abi: abi.whaleToken,
    target: GAME_CONTRACT_ADDRESS,
  });

  //Count amount in Game Pot Contract
  const ethBalance = await sdk.api.eth.getBalance({
    target: GAME_CONTRACT_ADDRESS,
    chain: "ethereum",
  });
  api.add(ADDRESSES.null, ethBalance.output);

  //Count amount in WHALE Rewards Contract
  const ethBalanceInWhaleToken = await sdk.api.eth.getBalance({
    target: whaleTokenAddress,
    chain: "ethereum",
  });

  const currentRound = await api.call({
    abi: abi.round,
    target: GAME_CONTRACT_ADDRESS,
  });

  const round = currentRound;
  const roundsComplete = Array.from({ length: round - 1 }, () => 0);

  //Account for balances in vesting contracts that have not yet been claimed
  await Promise.all(
    roundsComplete.map(async (_, i) => {
      const vestingContract = await api.call({
        abi: abi.vestingContractforRound,
        target: GAME_CONTRACT_ADDRESS,
        params: [i + 1],
      });

      const ethBalanceInVestingContract = await sdk.api.eth.getBalance({
        target: vestingContract,
        chain: "ethereum",
      });
      api.add(ADDRESSES.null, ethBalanceInVestingContract.output);
    })
  );

  api.add(ADDRESSES.null, ethBalanceInWhaleToken.output);
}
module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "Counts the amount of ETH in the Game Pot, WHALE Rewards Contract and unclaimed ETH in vesting contracts",
  ethereum: {
    tvl,
  },
};
