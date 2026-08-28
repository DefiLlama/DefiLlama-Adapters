const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')

const LOANS_FROM_BLOCK = 20973423;

// On-Chain Credit Lockers
const OCC_USDC = "0xfAb4e880467e26ED46F00c669C28fEaC58262698";
const OCC_Variable = "0x26Ac8662F7502EF246F763311176e3131326f29E";
const OCC_Cycle = "0x161c42FB3cA3baE7755124b56D48a88BcEccc17F";

// TVL Owners
const DAO = "0xB65a66621D7dE34afec9b9AC0755133051550dD7";
const YDL = "0xfB7920B55887840643e20952f22Eb18dDC474B2B";
const ST_STT = "0x0D45c292baCdC47CE850E4c83a2FA2e8509DEd5D";
const OCT_DAO = "0xd702332915fDDf588793D54d63872a97ad78d108";
const OCR = "0x7720e6eEe8EF2457d4e1C38D6A9295967b2a89ec";
const OCR_Cycle = "0x12E46E69623350aB3AE6D52CAb86a152A078Ad6F";

// Token Addresses
const USDC = ADDRESSES.ethereum.USDC;
const USDT = ADDRESSES.ethereum.USDT;
const FRX_USD = "0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29";
const M0 = "0x437cc33344a0B27A429f795ff6B469C72698B291";
const aUSDC = "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c";

// Borrowers
const BORROWER_PORTFOLIO_B = "0x50C72Ff8c5e7498F64BEAeB8Ed5BE83CABEB0Fd5";
const BORROWER_PORTFOLIO_A = "0xC8d6248fFbc59BFD51B23E69b962C60590d5f026";

const OCC_CYCLE_START_BLOCK = 23484381;

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      // USDC balances
      [USDC, DAO],
      [USDC, YDL],
      [USDC, ST_STT],
      [USDC, OCT_DAO],
      [USDC, OCC_Variable],
      [USDC, OCC_Cycle],

      // USDT balances
      [USDT, DAO],
      [USDT, OCT_DAO],

      // frxUSD balances
      [FRX_USD, DAO],
      [FRX_USD, OCT_DAO],

      // M0 balances
      [M0, DAO],
      [M0, OCT_DAO],

      // aUSDC balance
      [aUSDC, OCR],
      [aUSDC, OCR_Cycle],
    ],
  });
}

async function borrowed(api) {
  const logs = await getLogs({
    api,
    target: OCC_USDC,
    eventAbi:
      "event OfferAccepted(uint256 indexed id, uint256 principal, address indexed borrower, uint256 paymentDueBy)",
    fromBlock: LOANS_FROM_BLOCK,
    onlyArgs: true,
    extraKey: "v2",
  });

  const loansIds = logs.map(({ id }) => id);
  const loans = await api.multiCall({
    abi: "function loans(uint256) view returns (address borrower, uint256 principalOwed, uint256 APR, uint256 APRLateFee, uint256 paymentDueBy, uint256 paymentsRemaining, uint256 term, uint256 paymentInterval, uint256 offerExpiry, uint256 gracePeriod, int8 paymentSchedule, uint8 state)",
    target: OCC_USDC,
    calls: loansIds,
  });

  const owedAmounts = loans.map(({ principalOwed }) => principalOwed);

  const occVariableBorrowed = await api.call({
    abi: "function usage(address) view returns (uint256)",
    target: OCC_Variable,
    params: [BORROWER_PORTFOLIO_B],
  });

  const portfolioABorrowed = await api.call({
    abi: "function usage(address) view returns (uint256)",
    target: OCC_Cycle,
    params: [BORROWER_PORTFOLIO_A],
  });

  const portfolioBBorrowed = await api.call({
    abi: "function usage(address) view returns (uint256)",
    target: OCC_Cycle,
    params: [BORROWER_PORTFOLIO_B],
  });

  const isOCCCycle = api.block >= OCC_CYCLE_START_BLOCK;
  if (isOCCCycle) {
    api.add(USDC, portfolioABorrowed);
    api.add(USDC, portfolioBBorrowed);
  } else {
    api.addTokens([USDC], owedAmounts);
    api.add(USDC, occVariableBorrowed);
  }
}

module.exports = {
  ethereum: {
    tvl,
    borrowed,
    staking: staking('0xb397aa1d78109115dcc57b907dcd9d61bb6b2dce', "0xe412D46a0fBD567332b7689cFFfE1F8A4f19A9d2"),
  },
};
