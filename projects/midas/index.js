async function tvl(api) {
  const MTBILL_TOKEN_CONTRACT = "0xDD629E5241CbC5919847783e6C96B2De4754e438";
  const mtbillSupply = await await api.call({ abi: "erc20:totalSupply", target: MTBILL_TOKEN_CONTRACT, })

  const rate = await api.call({
    target: "0x056339C044055819E8Db84E71f5f2E1F536b2E5b", // midas oracle
    abi: "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  });
  api.addCGToken("tether", (mtbillSupply / 1e18) * ((rate.answer / 1e8)))
}

const chains = ["ethereum"];

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.misrepresentedTokens = true