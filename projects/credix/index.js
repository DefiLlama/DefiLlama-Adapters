const BigNumber = require("bignumber.js");
const { PublicKey } = require("@solana/web3.js");
const { Program, utils } = require("@project-serum/anchor");
const {
  getAssociatedTokenAddress,
  AccountLayout,
  u64,
} = require("@solana/spl-token");
const { toUSDTBalances } = require("../helper/balances");
const { getProvider } = require("../helper/solana");

const MAX_NUMBER_OF_ACCOUNT_INFOS = 99;
const USDC_DECIMALS = 1_000_000;
const MARKET_SEED = "credix-marketplace";
const IDL = require("./credix.json");
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

const getAssociatedBaseTokenAddressPK = async (publicKey) => {
  const baseMintPK = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  ); //USDC
  return await getAssociatedTokenAddress(baseMintPK, publicKey, true);
};

async function fetchLiquidityPoolBalance() {
  const provider = getProvider();
  const signingAuthorityKey = await findSigningAuthorityPDA(MARKET_SEED);
  const liquidityPoolKey = await getAssociatedBaseTokenAddressPK(
    signingAuthorityKey[0]
  );
  const liquidityPool = await provider.connection.getTokenAccountBalance(
    liquidityPoolKey
  );

  return new BigNumber(liquidityPool.value.amount.toString());
}

async function generateRepaymentSchedulePDA(deal) {
  const marketAdress = await findGlobalMarketStatePDA(MARKET_SEED);
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

async function asyncMap(arr, map) {
  return Promise.all(arr.map(map));
}

async function baseTokenAccount(deal) {
  const dealTokenAccount = encodeSeedString("deal-token-account");
  const marketAddress = await findGlobalMarketStatePDA(MARKET_SEED);
  const seeds = [
    marketAddress[0].toBuffer(),
    deal.publicKey.toBuffer(),
    dealTokenAccount,
  ];

  // TODO: just ignore the bump and return the public key
  return PublicKey.findProgramAddress(seeds, programId);
}

async function fetchRepaymentScheduleForDeals(program, provider, deals) {
  const pdaPromises = deals.map((d) => generateRepaymentSchedulePDA(d));
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

// TODO: clean up
async function tvl() {
  const provider = getProvider();
  const program = constructProgram(provider);
  const liquidityPoolBalanceTokenAmount = await fetchLiquidityPoolBalance();
  const allDeals = await program.account.deal.all();
  const allRepaymentSchedules = await fetchRepaymentScheduleForDeals(
    program,
    provider,
    allDeals
  );

  const tvlDealSchedulePairs = (
    await allDeals.map((deal, index) => {
      const schedule = allRepaymentSchedules[index];

      // Return early so we don't try to get the status of a deal without a schedule
      if (schedule === null) {
        return null;
      }

      const dealStatus = status(deal.account, schedule);

      switch (dealStatus) {
        case "OPEN_FOR_FUNDING":
        case "IN_PROGRESS":
        case "CLOSED":
          return [deal, schedule, dealStatus];
        default:
          return null;
      }
    })
  ).filter((pair) => pair !== null);

  const tvlDeals = tvlDealSchedulePairs.map((p) => p[0]);

  let dealsTokenAccountBalance = new BigNumber(0);
  let dealsAmountWithdrawn = new BigNumber(0);
  const schedulesPrincipal = tvlDealSchedulePairs.reduce(
    (principalSum, pair) => {
      if (pair[2] === "OPEN_FOR_FUNDING") {
        return principalSum;
      }

      return principalSum.plus(totalPrincipal(pair[1]));
    },
    new BigNumber(0)
  );

  //////// Temp solution
  // TODO: cleanup
  const tokenAccountAddresses = (
    await asyncMap(tvlDeals, (deal) => baseTokenAccount(deal))
  ).map((pda) => pda[0]);
  const chunks = chunk(tokenAccountAddresses, MAX_NUMBER_OF_ACCOUNT_INFOS - 1);
  const tokenAccountInfos = (
    await asyncMap(chunks, (chunk) =>
      provider.connection.getMultipleAccountsInfo(chunk)
    )
  )
    .flat()
    .filter((info) => info !== null);

  dealsTokenAccountBalance = tokenAccountInfos
    .map((info) => AccountLayout.decode(info.data))
    .reduce(
      (total, info) => total.plus(new BigNumber(info.amount.toString())),
      new BigNumber(0)
    );
  /////////
  for (const deal of tvlDeals) {
    dealsAmountWithdrawn = dealsAmountWithdrawn.plus(
      new BigNumber(deal.account.amountWithdrawn.toString())
    );
  }
  const dealsLiquidity = dealsTokenAccountBalance.minus(
    schedulesPrincipal.minus(dealsAmountWithdrawn)
  );
  const tvl = liquidityPoolBalanceTokenAmount.plus(dealsLiquidity);

  return toUSDTBalances(tvl.dividedBy(USDC_DECIMALS));
}

async function borrowed() {
  const provider = getProvider();
  const program = constructProgram(provider);
  const allDeals = await program.account.deal.all();
  const allRepaymentSchedules = await fetchRepaymentScheduleForDeals(
    program,
    provider,
    allDeals
  );
  const inProgressSchedules = allDeals.map((deal, index) => {
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

  return toUSDTBalances(totalOutstandingCredit.dividedBy(USDC_DECIMALS));
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};
