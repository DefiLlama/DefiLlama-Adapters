async function tvl(api) {
  const contracts = [
    {
      token: "0xDD629E5241CbC5919847783e6C96B2De4754e438", // mTBILL contract
      oracle: "0x056339C044055819E8Db84E71f5f2E1F536b2E5b", // mTBILL oracle
    },
    {
      token: "0x2a8c22E3b10036f3AEF5875d04f8441d4188b656", // mBASIS contract
      oracle: "0xE4f2AE539442e1D3Fb40F03ceEbF4A372a390d24", // mBASIS oracle
    },
  ];

  let totalTvl = 0;

  for (const { token, oracle } of contracts) {
    const supply = await api.call({
      abi: "erc20:totalSupply",
      target: token,
    });

    const rate = await api.call({
      target: oracle,
      abi: "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    });

    const tokenTvl = (supply / 1e18) * (rate.answer / 1e8);
    totalTvl += tokenTvl;
  }

  api.addCGToken("tether", totalTvl);
}

const chains = ["ethereum"];

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.misrepresentedTokens = true;
