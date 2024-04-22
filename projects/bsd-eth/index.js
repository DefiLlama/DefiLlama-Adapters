const { default: BigNumber } = require("bignumber.js");

const tokenName = 'bsdETH';
const contracts = {
  base: {
    //bsdETH
    token: "0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff",
    oracle: "0xDf99ccA98349DeF0eaB8eC37C1a0B270de38E682",
    //staking
    rsr: "0x3D190D968a8985673285B3B9cD5f5BDC12c9b368",
    rsrOracle: "0xAa98aE504658766Dfe11F31c5D95a0bdcABDe0b1",
  },
};
const decimals = 18;
const rsrDecimals = 8;

const tvl = async (api) => {
  // bsdETH Token
  let totalSupply = await api.call({
    target: contracts[api.chain].token,
    abi: "uint256:totalSupply",
  });
  totalSupply = new BigNumber(totalSupply).div(`1e${decimals}`);
  const rate = await api.call({
    target: contracts[api.chain].oracle,
    abi: "function price(address _forex) external view returns (uint192 low, uint192 high)",
    params: contracts[api.chain].token,
  });
  const lowRate = new BigNumber(rate.low).div(`1e${decimals}`);
  const highRate = new BigNumber(rate.high).div(`1e${decimals}`);
  const avgRate = new BigNumber(lowRate.plus(highRate)).div(2);
  // staking
  let totalStakedTokens = await api.call({
    target: contracts[api.chain].rsr,
    abi: "uint256:totalSupply",
  });
  totalStakedTokens = new BigNumber(totalStakedTokens).div(`1e${decimals}`);
  let stakedTokensRate = await api.call({
    target: contracts[api.chain].rsr,
    abi: "uint256:exchangeRate",
  });
  stakedTokensRate = new BigNumber(stakedTokensRate).div(`1e${decimals}`);
  // rsr Oracle
  const rsrPrice = await api.call({
    target: contracts[api.chain].rsrOracle,
    abi: "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  });
  const rsrAnswer = new BigNumber(rsrPrice.answer).div(`1e${rsrDecimals}`);
  return {
    tether:
      totalSupply * avgRate + totalStakedTokens * stakedTokensRate * rsrAnswer,
  };
};

module.exports = {
  methodology:
  `TVL consists of the ${tokenName} supply along with the RSR tokens deposited to the protocol as overcollaterization.`,
  base: {
    tvl,
  },
};
