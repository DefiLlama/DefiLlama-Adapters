const { lendingMarket } = require("../helper/methodologies");
const utils = require("../helper/utils");

const abi = {
  debt: "function debt(address pool) external view returns (uint256)",
  totalCollateral: "uint256:totalGem",
  totalSupply: "uint256:totalSupply",
  underlyingLender: "address:underlying",
  underlyingCollateral: "address:GEM",
};

async function getMarkets() {
  const response = await utils.fetchURL(
    "https://ion-backend.vercel.app/v1/bigbrother/markets"
  );
  return response.data;
}

async function calculateTvl(api, markets) {
  const gems = markets.map((m) => m.gemJoin);
  const pools = await api.multiCall({ abi: "address:POOL", calls: gems });
  const tokens = await api.multiCall({
    abi: abi.underlyingLender,
    calls: pools,
  });
  const gemUnderlyings = await api.multiCall({
    abi: abi.underlyingCollateral,
    calls: gems,
  });
  return api.sumTokens({
    tokens: tokens.concat(gemUnderlyings),
    owners: pools.concat(gems),
  });
}

async function calculateBorrowed(api, markets) {
  const gems = markets.map((m) => m.gemJoin);
  const pools = await api.multiCall({ abi: "address:POOL", calls: gems });
  const tokens = await api.multiCall({
    abi: abi.underlyingLender,
    calls: pools,
  });
  const ionLens = markets.map((m) => m.ionLens);
  const debtCalls = pools.map((pool, index) => ({
    target: ionLens[index],
    params: [pool],
  }));

  const debt = await api.multiCall({ abi: abi.debt, calls: debtCalls });
  api.add(
    tokens,
    debt.map((b) => b / 1e27)
  );
}

const tvl = async (api) => {
  const markets = await getMarkets();
  return calculateTvl(api, markets);
};

const borrowed = async (api) => {
  const markets = await getMarkets();
  return calculateBorrowed(api, markets);
};

module.exports = {
  methodology: lendingMarket,
  ethereum: {
    tvl,
    borrowed,
  },
};
