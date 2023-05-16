const ADDRESSES = require("../helper/coreAssets.json");
const BigNumber = require("bignumber.js");
const { PublicKey } = require("@solana/web3.js");
const { Program, utils, BN } = require("@project-serum/anchor");
const { getProvider, sumTokens2, sumTokens } = require("../helper/solana");

const MAX_NUMBER_OF_ACCOUNT_INFOS = 99;
const MARKET_SEED_FINTECH = "credix-marketplace";
const MARKET_SEED_RECEIVABLES = "receivables-factoring";
const IDL = require("./credix.json");
const USDC = ADDRESSES.solana.USDC;
const programId = new PublicKey("CRDx2YkdtYtGZXGHZ59wNv1EwKHQndnRc1gT4p8i2vPX");
const encodeSeedString = (seedString) =>
  Buffer.from(utils.bytes.utf8.encode(seedString));

const constructProgram = (provider) => {
  return new Program(IDL, programId, provider);
};

const findPDA = async (seeds) => {
  return PublicKey.findProgramAddress(seeds, programId);
};

const findGlobalMarketStatePDA = async (globalMarketSeed) => {
  const seed = encodeSeedString(globalMarketSeed);
  return findPDA([seed]);
};

const findSigningAuthorityPDA = async (globalMarketSeed) => {
  const globalMarketStatePDA = await findGlobalMarketStatePDA(globalMarketSeed);
  const seeds = [globalMarketStatePDA[0].toBuffer()];
  return findPDA(seeds);
};

const findDealPda = (marketPk, borrowerPk, dealNumber) => {
  const dealSeed = encodeSeedString("deal-info");
  const dealNumberSeed = new BN(dealNumber).toArrayLike(Buffer, "le", 2);
  const seeds = [
    marketPk.toBuffer(),
    borrowerPk.toBuffer(),
    dealNumberSeed,
    dealSeed,
  ];
  return findPDA(seeds);
};

async function generateRepaymentSchedulePDA(deal, globalMarketSeed) {
  const marketAdress = await findGlobalMarketStatePDA(globalMarketSeed);
  const seed = [
    marketAdress[0].toBuffer(),
    deal.publicKey.toBuffer(),
    encodeSeedString("repayment-schedule"),
  ];
  return PublicKey.findProgramAddress(seed, programId);
}

function periodIsRepaid(period) {
  const principal = period.principal;
  const principalRepaid = period.principalRepaid;
  const interest = period.interest;
  const interestRepaid = period.interestRepaid;

  return principal === principalRepaid && interest === interestRepaid;
}

function isRepaid(schedule) {
  return schedule.periods.every((period) => periodIsRepaid(period));
}

function openedAt(deal) {
  const openedAt = deal.openedAt;
  return openedAt.bitLength() > 53 ? null : openedAt.toNumber();
}

function goLiveAt(deal) {
  const goLiveAt = deal.goLiveAt;
  return goLiveAt.bitLength() > 53 ? null : goLiveAt.toNumber();
}

function status(deal, schedule) {
  if (!schedule) {
    return "NO SCHEDULE FOUND";
  }
  if (deal.defaulted) {
    return "DEFAULTED";
  }

  if (!openedAt(deal)) {
    return "PENDING";
  }

  if (!goLiveAt(deal)) {
    return "OPEN_FOR_FUNDING";
  }

  if (isRepaid(schedule)) {
    return "CLOSED";
  }

  return "IN_PROGRESS";
}

function isInProgress(deal, schedule) {
  const dealStatus = status(deal.account, schedule);
  return dealStatus === "IN_PROGRESS";
}

function totalPrincipal(repaymentSchedule) {
  return new BigNumber(
    repaymentSchedule.periods[
      repaymentSchedule.periods.length - 1
    ].totalPrincipalExpected.toString()
  );
}

function principalRepaid(repaymentSchedule) {
  const cumulPrincipalRepaid = repaymentSchedule.periods.reduce(
    (acc, p) => acc.plus(new BigNumber(p.principalRepaid.toString())),
    new BigNumber(0)
  );

  return cumulPrincipalRepaid;
}

function chunk(inputArray, perChunk) {
  const result = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
}

async function asyncFilter(arr, filter) {
  const results = await Promise.all(arr.map(filter));
  return arr.filter((_, i) => results[i]);
}

async function filterDealsForMarket(deals, globalMarketSeed) {
  const [globalMarketStatePk] = await findGlobalMarketStatePDA(
    globalMarketSeed
  );
  const marketDeals = await asyncFilter(deals, async (deal) => {
    const [dealPDA] = await findDealPda(
      globalMarketStatePk,
      deal.account.borrower,
      deal.account.dealNumber
    );
    return dealPDA.equals(deal.publicKey);
  });
  return marketDeals;
}

async function fetchRepaymentScheduleForDeals(
  program,
  provider,
  deals,
  globalMarketSeed
) {
  const pdaPromises = deals.map((d) =>
    generateRepaymentSchedulePDA(d, globalMarketSeed)
  );
  const pdas = await Promise.all(pdaPromises);
  const addresses = pdas.map((pda) => pda[0]);
  const addressesChunks = chunk(addresses, MAX_NUMBER_OF_ACCOUNT_INFOS - 1);
  const accountInfosChunks = await Promise.all(
    addressesChunks.map((addressChunk) => {
      const accInfos =
        provider.connection.getMultipleAccountsInfo(addressChunk);
      return accInfos;
    })
  );
  const accountInfos = accountInfosChunks.flat();

  const programVersions = accountInfos.map(
    (accountInfo) =>
      accountInfo &&
      program.coder.accounts.decode("RepaymentSchedule", accountInfo.data)
  );
  return programVersions;
}

async function tvl() {
  // Fintech pool
  const [signingAuthorityKeyFintech] = await findSigningAuthorityPDA(
    MARKET_SEED_FINTECH
  );

  // Receivables factoring pool
  const [signingAuthorityKeyReceivables] = await findSigningAuthorityPDA(
    MARKET_SEED_RECEIVABLES
  );
  const tokens = await sumTokens2({
    tokensAndOwners: [
      [USDC, signingAuthorityKeyFintech],
      [USDC, signingAuthorityKeyReceivables],
    ],
  });
  return tokens;
}

async function fetchOutstandingCreditPool(
  provider,
  program,
  deals,
  globalMarketSeed
) {
  const marketDeals = await filterDealsForMarket(deals, globalMarketSeed);
  const allRepaymentSchedules = await fetchRepaymentScheduleForDeals(
    program,
    provider,
    marketDeals,
    globalMarketSeed
  );
  const inProgressSchedules = marketDeals.map((deal, index) => {
    const schedule = allRepaymentSchedules[index];
    const dealIsInProgress = isInProgress(deal, schedule);
    return dealIsInProgress ? schedule : null;
  });
  const totalOutstandingCredit = inProgressSchedules
    .filter((schedule) => schedule !== null)
    .reduce((principalSum, schedule) => {
      return principalSum
        .plus(totalPrincipal(schedule))
        .minus(principalRepaid(schedule));
    }, new BigNumber(0));

  return totalOutstandingCredit;
}

async function borrowed() {
  const provider = getProvider();
  const program = constructProgram(provider);
  const allDeals = await program.account.deal.all();

  // FinTech pool
  const totalOutstandingCreditFintech = await fetchOutstandingCreditPool(
    provider,
    program,
    allDeals,
    MARKET_SEED_FINTECH
  );

  // Receivables factoring pool
  const totalOutstandingCreditReceivables = await fetchOutstandingCreditPool(
    provider,
    program,
    allDeals,
    MARKET_SEED_RECEIVABLES
  );

  return {
    ["solana:" + USDC]: totalOutstandingCreditFintech
      .plus(totalOutstandingCreditReceivables)
      .toString(),
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};
