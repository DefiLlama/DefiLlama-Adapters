const ADDRESSES = require('../helper/coreAssets.json')
const methodologies = require("../helper/methodologies")
const abi = {
  "getOverallTokensData": "function getOverallTokensData(address[] tokens_) view returns ((uint256 borrowRate, uint256 supplyRate, uint256 fee, uint256 lastStoredUtilization, uint256 storageUpdateThreshold, uint256 lastUpdateTimestamp, uint256 supplyExchangePrice, uint256 borrowExchangePrice, uint256 supplyRawInterest, uint256 supplyInterestFree, uint256 borrowRawInterest, uint256 borrowInterestFree, uint256 totalSupply, uint256 totalBorrow, uint256 revenue, (uint256 version, (address token, uint256 kink, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink, uint256 rateAtUtilizationMax) rateDataV1, (address token, uint256 kink1, uint256 kink2, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink1, uint256 rateAtUtilizationKink2, uint256 rateAtUtilizationMax) rateDataV2) rateData)[] overallTokensData_)"
}

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl: async (api) => {
      const tokens = await api.call({ target: "0x741c2Cd25f053a55fd94afF1afAEf146523E1249", abi: "function listedTokens() public view returns (address[] memory listedTokens_)" })
      api.add("0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee", await api.call({
        target: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
        abi: "function balance(address, address) public view returns (uint256 balance)",
        params: ["0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee", "0x52aa899454998be5b000ad077a46bbe360f4e497"]
      }))
      return api.sumTokens({
        owner: "0x52aa899454998be5b000ad077a46bbe360f4e497", tokens: [
          ADDRESSES.null,
          ...tokens.filter(t => t.toLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
        ]
      })
    },
    borrowed: async (api) => {
      const fluidLiquidityResolver = "0x645C84DeA082328e456892D2E68d434b61AD7dBF";
      const tokens = await api.call({
        target: "0x741c2Cd25f053a55fd94afF1afAEf146523E1249",
        abi: "function listedTokens() public view returns (address[] memory listedTokens_)",
      });

      const borrowed = await api.call({ target: fluidLiquidityResolver, abi: abi.getOverallTokensData, params: [tokens], })
      api.add(tokens, borrowed.map(x => x.totalBorrow));
    },
  }
}
// node test.js projects/fluid/index.js