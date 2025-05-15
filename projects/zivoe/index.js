const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs");

const LOANS_FROM_BLOCK = 20973423;

// On-Chain Credit Locker
const OCC_USDC = "0xfAb4e880467e26ED46F00c669C28fEaC58262698";

// TVL Owners
const DAO = "0xB65a66621D7dE34afec9b9AC0755133051550dD7";
const YDL = "0xfB7920B55887840643e20952f22Eb18dDC474B2B";
const ST_STT = "0x0D45c292baCdC47CE850E4c83a2FA2e8509DEd5D";
const ST_JTT = "0xcacdB1A5a11F824E02De4CA6E7b2D12BB278aA7c";

// TVL Asset
const USDC = ADDRESSES.ethereum.USDC;

async function borrowed(api) {
  const loansIds = await getLogs2({
    api,
    target: OCC_USDC,
    eventAbi: "event OfferAccepted(uint256 indexed id, uint256 principal, address indexed borrower, uint256 paymentDueBy)",
    fromBlock: LOANS_FROM_BLOCK,
    customCacheFunction: ({ cache, logs }) => {
      if (!cache.logs) cache.logs = []
      cache.logs.push(...logs.map(i => i.id.toString()))
      cache.logs = [...new Set(cache.logs)]
      return cache
    },
  });

  const loans = await api.multiCall({
    abi: "function loans(uint256) view returns (address borrower, uint256 principalOwed, uint256 APR, uint256 APRLateFee, uint256 paymentDueBy, uint256 paymentsRemaining, uint256 term, uint256 paymentInterval, uint256 offerExpiry, uint256 gracePeriod, int8 paymentSchedule, uint8 state)",
    target: OCC_USDC,
    calls: loansIds,
  });
  const owedAmounts = loans.map(({ principalOwed }) => principalOwed);

  const occAsset = await api.call({ abi: "address:stablecoin", target: OCC_USDC });
  const tokens = Array(owedAmounts.length).fill(occAsset);

  api.addTokens(tokens, owedAmounts);
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    borrowed,
  },
};
