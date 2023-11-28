const { getConfig } = require("../helper/cache");

const OMNI_LENS_ADDRESS = "0x4F003a858644E085186dfbC991E872b8B4Aac507";

const GET_MARKET_ADDRESS_URL =
  "https://omni-api-2sjjqcgcja-ew.a.run.app/market-addresses";

async function getMarketAddresses(chainId = 1) {
  const url = GET_MARKET_ADDRESS_URL + `?chainId=${chainId}`;
  return await getConfig("beta-finance/" + chainId, url);
}

function marketTrancheOverviewFor(output) {
  const [
    _trancheIndex,
    _totalDeposit,
    _totalBorrow,
    _totalDepositShare,
    _totalBorrowShare,
    cumulativeTotalDeposit,
    _cumulativeTotalBorrow,
    _interestRate,
  ] = output;
  return { cumulativeTotalDeposit };
}

async function tvl(_, block, _2, { api }) {
  const addresses = await getMarketAddresses();

  const borrowableMarkets = await api.multiCall({
    calls: addresses.borrowableMarkets.map((marketAddress) => ({
      target: OMNI_LENS_ADDRESS,
      params: [marketAddress],
    })),
    abi: "function getOmniMarketOverview(address) view returns (tuple(uint8, uint256, uint256, uint256, uint256, uint256, uint256, uint256)[])",
    block,
  });

  const noBorrowMarket = await api.multiCall({
    calls: addresses.noBorrowMarkets.map((marketAddress) => ({
      target: OMNI_LENS_ADDRESS,
      params: [marketAddress],
    })),
    abi: "function getOmniMarketNoBorrowOverview(address) view returns (tuple(uint8, uint256, uint256, uint256, uint256, uint256, uint256, uint256))",
    block,
  });

  const cumulativeTotalDeposits = [
    ...borrowableMarkets.map((market) => market[0]),
    ...noBorrowMarket,
  ].map((market) => marketTrancheOverviewFor(market).cumulativeTotalDeposit);

  cumulativeTotalDeposits.map((balance, i) => {
    api.add(addresses.underlyings[i], balance);
  });
}

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  ethereum: {
    tvl,
  },
};
