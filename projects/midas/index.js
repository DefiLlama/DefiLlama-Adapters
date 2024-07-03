const ADDRESSES = require("../helper/coreAssets.json");
const MTBILL_TOKEN_CONTRACT = "0xDD629E5241CbC5919847783e6C96B2De4754e438";

async function getTokenData(api, tokenContract) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: tokenContract,
  });

  return totalSupply / 1e18;
}

async function tvl(api) {
  const mtbillSupply = await getTokenData(api, MTBILL_TOKEN_CONTRACT);

  const rate = await api.call({
    target: "0x32d1463EB53b73C095625719Afa544D5426354cB", // IB01/USD
    abi: "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  });
  // format chainlink return 
  const normalizedRate = rate.answer / 1e8;

  // times feed price and convert to expected format
  const mtbillValue = (mtbillSupply * normalizedRate) * 1_000_000;

  return {
    [ADDRESSES.ethereum.USDC]: mtbillValue,
  };
}

const chains = ["ethereum"];

chains.forEach((chain) => {
  module.exports[chain] = { tvl };
});
