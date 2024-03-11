const DATA_PROVIDER_ADDRESS = {
  arbitrum: "0x8CfA3a5105e87e6e5568b80F64d05eD5fc53F0a9",
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
  return async function (_, _1, _2, { api, chain }) {
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
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn lending interest. Tokens also include various wrapped liquidity positions, the tokens comprising these positions are counted as well. Borrowed tokens are not counted towards the TVL, so only the tokens actually locked in the contracts are counted. The main reason for this is to avoid inflating the TVL through cycled lending.",
  arbitrum: getMetrics(),
  base: getMetrics(),
};
