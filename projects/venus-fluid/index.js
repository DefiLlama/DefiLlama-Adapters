const ADDRESSES = require("../helper/coreAssets.json");
const methodologies = require("../helper/methodologies");
const abi = {
  getOverallTokensData:
    "function getOverallTokensData(address[] tokens_) view returns ((uint256 borrowRate, uint256 supplyRate, uint256 fee, uint256 lastStoredUtilization, uint256 storageUpdateThreshold, uint256 lastUpdateTimestamp, uint256 supplyExchangePrice, uint256 borrowExchangePrice, uint256 supplyRawInterest, uint256 supplyInterestFree, uint256 borrowRawInterest, uint256 borrowInterestFree, uint256 totalSupply, uint256 totalBorrow, uint256 revenue, uint256 maxUtilization, (uint256 version, (address token, uint256 kink, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink, uint256 rateAtUtilizationMax) rateDataV1, (address token, uint256 kink1, uint256 kink2, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink1, uint256 rateAtUtilizationKink2, uint256 rateAtUtilizationMax) rateDataV2) rateData)[] overallTokensData_)",
};

const config = {
  liquidity: '0x52Aa899454998Be5b000Ad077a46Bbe360F4e497',
  bsc: {
    liquidityResolver: (_block) => "0xca13A15de31235A37134B4717021C35A3CF25C60",
  },
};

async function getListedTokens(api) {
  return await api.call({
    target: config[api.chain].liquidityResolver(api.block),
    abi: "function listedTokens() public view returns (address[] memory listedTokens_)",
  });
}

async function tvl(api) {
  const tokens = await getListedTokens(api);
  return api.sumTokens({
    owner: config.liquidity,
    tokens: [
      ADDRESSES.null,
      ...tokens.filter(
        (t) => t.toLowerCase() !== ADDRESSES.GAS_TOKEN_2.toLowerCase()
      ),
    ],
  });
}

async function borrowed(api) {
  const tokens = await getListedTokens(api);
  const borrowed = await api.call({
    target: config[api.chain].liquidityResolver(api.block),
    abi: abi.getOverallTokensData,
    params: [tokens],
  });
  api.add(
    tokens,
    borrowed.map((x) => x.totalBorrow)
  );
}

module.exports = {
  methodology: methodologies.lendingMarket,
  bsc: { tvl, borrowed },
};
