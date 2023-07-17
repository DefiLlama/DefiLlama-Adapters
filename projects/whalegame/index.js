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
  api.add(ADDRESSES.null, ethBalanceInWhaleToken.output);
}
module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "Counts the amount of ETH in the Game Pot and WHALE Rewards Contract",
  ethereum: {
    tvl,
  },
};
