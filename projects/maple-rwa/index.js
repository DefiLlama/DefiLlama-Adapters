const axios = require('axios');

const query_url = "https://api.maple.finance/v2/graphql";

const coingeckoMapping = {
  'BTC': { name: 'bitcoin', decimals: 8 },
  'ETH': { name: 'ethereum', decimals: 18 },
  'SOL': { name: 'solana', decimals: 18 },
  'INJ': { name: 'injective-protocol', decimals: 18 }
}

const query = `
  query {
    nativeLoans {
      liquidityAsset {
        symbol
        decimals
      }
      createdAt
      principalOwed
      collateralAsset
      collateralAssetAmount
    }
  }
`;

const getLoans = async (api) => {
  const payload = {
    query,
    headers: { "Content-Type": "application/json" }
  };

  const { data } = await axios.post(query_url, payload);
  return data.data.nativeLoans.filter(({ createdAt }) => createdAt < api.timestamp * 1000);
};

const processLoans = async (api, key) => {
  const loans = await getLoans(api)
  const isCollateral = key === "collateralValue";

  loans.forEach(({ liquidityAsset: { symbol, decimals }, principalOwed, collateralAssetAmount, collateralAsset }) => {
    const assetKey = isCollateral ? collateralAsset : symbol;
    const balance = Number(isCollateral ? collateralAssetAmount : principalOwed);
    const token = coingeckoMapping[assetKey]?.name;
    const parseDecimals = coingeckoMapping[assetKey]?.decimals ?? decimals;
    if (!token) return;
    api.addCGToken(token, balance / 10 ** parseDecimals);
  })
}


module.exports = {
  ethereum: { 
    tvl: async (api) => processLoans(api, "collateralValue"),
    borrowed: async (api) => processLoans(api),
  }
};
