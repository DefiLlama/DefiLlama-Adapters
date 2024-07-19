const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");

async function tvl(api) {
  const batonFactory = "0xEB8D09235255b37fBC810df41Fa879225c04639a";

  // get all the farms from the factory
  const logs = await getLogs({
    api,
    target: batonFactory,
    topic: "FarmCreated(address,address,address,address,address,uint256,uint8)",
    fromBlock: 17411300,
    eventAbi:
      "event FarmCreated(address farmAddress, address owner, address rewardsDistributor, address rewardsToken, address pairAddress, uint256 rewardsDuration, uint8 farmType)",
    onlyArgs: true
  });

  // filter any farms where the reward token is not fractional nfts or the underlying pair is not paired with eth
  let filteredLogs = logs.filter(i => i.farmType === 2)
  const baseTokens = await api.multiCall({ abi: 'address:baseToken', calls: filteredLogs.map(i => i.pairAddress) })
  const filteredFarms = filteredLogs.filter((i, idx) => baseTokens[idx] = nullAddress)

  const farms = filteredFarms.map(i => i.farmAddress)
  const pairs = filteredFarms.map(i => i.pairAddress)
  const rewardTokens = filteredFarms.map(i => i.rewardsToken)
  const totalSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: farms })
  const prices = await api.multiCall({ abi: 'uint256:price', calls: rewardTokens })
  const baseTokenAmounts = (await api.multiCall({ abi: "function removeQuote(uint256) view returns (uint256,uint256)", calls: pairs.map((v, i) => ({ target: v, params: [totalSupplies[i]] })) })).map(i => i[0])
  const rewardBalances = (await api.multiCall({ abi: "erc20:balanceOf", calls: rewardTokens.map((v, i) => ({ target: v, params: [farms[i]] })) }))
  baseTokenAmounts.forEach(i => api.add(nullAddress, i * 2));
  rewardBalances.forEach((v, i) => api.add(nullAddress, (prices[i] * v) / 1e18));
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Sums the total staked in baton farms and the total amount of tokens deposited as yield farming rewards.",
  start: 17411300,
  ethereum: {
    tvl
  }
};
