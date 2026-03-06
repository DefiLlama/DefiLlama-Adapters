const ADDRESSES = require("../helper/coreAssets.json");
const methodologies = require("../helper/methodologies");
const abi = {
  getOverallTokensDataLegacy:
    "function getOverallTokensData(address[] tokens_) view returns ((uint256 borrowRate, uint256 supplyRate, uint256 fee, uint256 lastStoredUtilization, uint256 storageUpdateThreshold, uint256 lastUpdateTimestamp, uint256 supplyExchangePrice, uint256 borrowExchangePrice, uint256 supplyRawInterest, uint256 supplyInterestFree, uint256 borrowRawInterest, uint256 borrowInterestFree, uint256 totalSupply, uint256 totalBorrow, uint256 revenue, (uint256 version, (address token, uint256 kink, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink, uint256 rateAtUtilizationMax) rateDataV1, (address token, uint256 kink1, uint256 kink2, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink1, uint256 rateAtUtilizationKink2, uint256 rateAtUtilizationMax) rateDataV2) rateData)[] overallTokensData_)",
  getOverallTokensData:
    "function getOverallTokensData(address[] tokens_) view returns ((uint256 borrowRate, uint256 supplyRate, uint256 fee, uint256 lastStoredUtilization, uint256 storageUpdateThreshold, uint256 lastUpdateTimestamp, uint256 supplyExchangePrice, uint256 borrowExchangePrice, uint256 supplyRawInterest, uint256 supplyInterestFree, uint256 borrowRawInterest, uint256 borrowInterestFree, uint256 totalSupply, uint256 totalBorrow, uint256 revenue, uint256 maxUtilization, (uint256 version, (address token, uint256 kink, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink, uint256 rateAtUtilizationMax) rateDataV1, (address token, uint256 kink1, uint256 kink2, uint256 rateAtUtilizationZero, uint256 rateAtUtilizationKink1, uint256 rateAtUtilizationKink2, uint256 rateAtUtilizationMax) rateDataV2) rateData)[] overallTokensData_)",
};

const config = {
  liquidity: "0x52aa899454998be5b000ad077a46bbe360f4e497",
  ethereum: {
    liquidityResolver: (block) => {
      if (block < 19992056) {
        return "0x741c2Cd25f053a55fd94afF1afAEf146523E1249";
      }
      return "0xD7588F6c99605Ab274C211a0AFeC60947668A8Cb";
    },
    weETH: ADDRESSES.ethereum.WEETH,
    zircuit: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
    weETHs: "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  },
  arbitrum: {
    liquidityResolver: (block) => "0x46859d33E662d4bF18eEED88f74C36256E606e44",
  },
  base: {
    liquidityResolver: (block) => "0x35A915336e2b3349FA94c133491b915eD3D3b0cd",
  },
  polygon: {
    liquidityResolver: (block) => "0x98d900e25AAf345A4B23f454751EC5083443Fa83",
  },
  plasma: {
    liquidityResolver: (block) => "0x4b6Bb77196A7B6D0722059033a600BdCD6C12DB7",
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
  const chain = api.chain;

  if (chain == "ethereum") {
    // add WeETH deployed to Zircuit
    api.add(
      config.ethereum.weETH,
      await api.call({
        target: config.ethereum.zircuit,
        abi: "function balance(address, address) public view returns (uint256 balance)",
        params: [config.ethereum.weETH, config.liquidity],
      })
    );
    // add WeETHs deployed to Zircuit
    api.add(
      config.ethereum.weETHs,
      await api.call({
        target: config.ethereum.zircuit,
        abi: "function balance(address, address) public view returns (uint256 balance)",
        params: [config.ethereum.weETHs, config.liquidity],
      })
    );
  }

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
    abi: api.chain == "ethereum" && api.block < 19992056 ? abi.getOverallTokensDataLegacy : abi.getOverallTokensData,
    params: [tokens],
  });
  api.add(
    tokens,
    borrowed.map((x) => x.totalBorrow)
  );
}

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: { tvl, borrowed },
  arbitrum: { tvl, borrowed },
  base: { tvl, borrowed },
  polygon: { tvl, borrowed },
  plasma: { tvl, borrowed },
};
// node test.js projects/fluid/index.js
