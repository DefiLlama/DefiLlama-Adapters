const methodologies = require("../helper/methodologies");

const DATA_PROVIDER_ADDRESS = {
  arbitrum: "0x8Cb093763cD2EB1e418eaEFfFC4f20c1665304a2",
  base: "0x22d6Ab83EEe06B7EE815420a7F2e737D64E534ef",
};
const getAllReservesTokensABI =
  "function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])";
const getReserveDataABI =
  "function getReserveData(address asset) view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)";

async function getData(api, chain, key, tokens) {
  const { reserves, lpReserves } = tokens;
  for (const reserve of reserves) {
    const reserveData = await api.call({
      abi: getReserveDataABI,
      target: DATA_PROVIDER_ADDRESS[chain],
      params: [reserve],
    });

    api.add(reserve, reserveData[key]);
  }

  const [token0s, token1s, bals, totalSupplies] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: lpReserves }),
    api.multiCall({ abi: "address:token1", calls: lpReserves }),
    api.multiCall({
      abi: "function getAssets() view returns (uint256, uint256)",
      calls: lpReserves,
    }),
    api.multiCall({ abi: "uint256:totalSupply", calls: lpReserves }),
  ]);

  const lpReserveKeyDataArr = [];
  for (const lpReserve of lpReserves) {
    const reserveData = await api.call({
      abi: getReserveDataABI,
      target: DATA_PROVIDER_ADDRESS[chain],
      params: [lpReserve],
    });

    lpReserveKeyDataArr.push(reserveData[key]);
  }

  bals.forEach(([v0, v1], i) => {
    const v0BN = v0
    const v1BN = v1
    const keyDataBN = lpReserveKeyDataArr[i]
    const totalSupplyBN = totalSupplies[i]

    const properV0 = v0BN * keyDataBN / totalSupplyBN
    const properV1 = v1BN * keyDataBN / totalSupplyBN

    api.add(token0s[i], properV0);
    api.add(token1s[i], properV1);
  });
}

function lavaTvl(borrowed) {
  return async function (api) {
    const { chain } = api
    const reservesList = await api.call({
      abi: getAllReservesTokensABI,
      target: DATA_PROVIDER_ADDRESS[chain],
    });

    const lpReserves = reservesList
      .filter((r) => r[0].includes("LP"))
      .map(([, a]) => a);
    const reserves = reservesList
      .filter((r) => !r[0].includes("LP"))
      .map(([, a]) => a);

    const tokens = { reserves, lpReserves };
    if (borrowed) {
      return getData(api, chain, "totalVariableDebt", tokens);
    } else {
      return getData(api, chain, "availableLiquidity", tokens);
    }
  };
}

function getMetrics() {
  return {
    tvl: lavaTvl(false),
    borrowed: lavaTvl(true),
  };
}

module.exports = {
  methodology: methodologies.lendingMarket,
  arbitrum: getMetrics(),
  base: getMetrics(),
  hallmarks: [
    [Math.floor(new Date('2024-03-28')/1e3), 'Protocol was exploited'],
    [Math.floor(new Date("2024-04-01") / 1e3), "Protocol was relaunched"],
  ],
};
