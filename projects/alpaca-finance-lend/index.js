const { calLendingTvl, calBorrowingTvl } = require("./lend");

async function bscLendingTvl(timestamp, ethBlock, chainBlocks) {
  const bscLendingTvl = await calLendingTvl("bsc", chainBlocks.bsc);
  return { ...bscLendingTvl };
}

async function bscCalBorrowingTvl(timestamp, ethBlock, chainBlocks) {
  const bscBorrowingTvl = await calBorrowingTvl("bsc", chainBlocks.bsc);
  return { ...bscBorrowingTvl };
}

async function ftmLendingTvl(timestamp, ethBlock, chainBlocks) {
  const ftmLendingTvl = await calLendingTvl("fantom", chainBlocks.fantom);
  return { ...ftmLendingTvl };
}

async function ftmCalBorrowingTvl(timestamp, ethBlock, chainBlocks) {
  const ftmBorrowingTvl = await calBorrowingTvl("fantom", chainBlocks.fantom);
  return { ...ftmBorrowingTvl };
}

// node test.js projects/alpaca-finance-lend/index.js
module.exports = {
  start: 1602054167,
  timetravel: true,
  doublecounted: false,
  methodology: "Sum floating balance and vaultDebtValue in each vault",
  bsc: {
    tvl: bscLendingTvl,
    borrowed: bscCalBorrowingTvl,
  },
  fantom: {
    tvl: ftmLendingTvl,
    borrowed: ftmCalBorrowingTvl,
  },
};
