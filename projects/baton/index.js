const { getLogs } = require("../helper/cache/getLogs");

async function tvl(timestamp, blockHeight, _2, { api }) {
  const batonFactory = "0xEB8D09235255b37fBC810df41Fa879225c04639a";

  // get all the farms from the factory
  const logs = await getLogs({
    api,
    target: batonFactory,
    topic: "FarmCreated(address,address,address,address,address,uint256,uint8)",
    fromBlock: 17411300,
    eventAbi:
      "event FarmCreated(address farmAddress, address owner, address rewardsDistributor, address rewardsToken, address pairAddress, uint256 rewardsDuration, uint8 farmType)",
    onlyArgs: false
  });

  // filter any farms where the reward token is not fractional nfts or the underlying pair is not paired with eth
  const filteredFarms = await Promise.all(
    logs.map(async ({ args: { farmAddress, pairAddress, rewardsToken } }) => {
      const baseToken = await api.call({
        abi: "function baseToken() view returns (address)",
        target: pairAddress,
        params: []
      });

      const isEthPairAndNftRewards =
        pairAddress === rewardsToken &&
        baseToken === "0x0000000000000000000000000000000000000000";

      return [isEthPairAndNftRewards, { farmAddress, pairAddress }];
    })
  ).then(farms =>
    farms.filter(([isEthPairAndNftRewards]) => isEthPairAndNftRewards)
  );

  // get the lp tokens staked and reward token balance for each farm and then calculate the eth value
  const totalEthInFarms = await Promise.all(
    filteredFarms.map(async ([, { farmAddress, pairAddress }]) => {
      const totalStakedLpTokens = await api.call({
        abi: "function totalSupply() view returns (uint256)",
        target: farmAddress,
        params: []
      });

      const [baseTokenAmount] = await api.call({
        abi: "function removeQuote(uint256) view returns (uint256,uint256)",
        target: pairAddress,
        params: [totalStakedLpTokens]
      });

      const price = await api.call({
        abi: "function price() view returns (uint256)",
        target: pairAddress,
        params: []
      });

      const rewardsTokenBalance = await api.call({
        abi: "erc20:balanceOf",
        target: pairAddress,
        params: [farmAddress]
      });

      const stakedEthValue = (2 * baseTokenAmount) / 1e18;
      const rewardsEthValue = (price * rewardsTokenBalance) / 1e36;

      return stakedEthValue + rewardsEthValue;
    })
  ).then(farms => farms.reduce((a, b) => a + b, 0));

  return { ethereum: totalEthInFarms };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Sums the total staked in baton farms and the total amount of tokens deposited as yield farming rewards.",
  start: 17411300,
  ethereum: {
    tvl
  }
};
