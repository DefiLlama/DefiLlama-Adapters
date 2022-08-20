const { PublicKey } = require('@solana/web3.js');
const { getConnection } = require('../../helper/solana');
const {
  returnAnchorProgram,
  decodedTimeBasedLiquidityPool,
  decodedPriceBasedLiquidityPool,
  decodedLoan
} = require('./functions');

const getAllProgramAccounts = async (pubkey = 'A66HabVL3DzNzeJgcHYtRRNW1ZRMKwBfrdSR4kLsZ9DJ') => {
  const program = await returnAnchorProgram(new PublicKey(pubkey), getConnection());

  const liquidityPoolRaws = await program.account.liquidityPool.all();
  const priceBasedLiquidityPoolRaws = await program.account.priceBasedLiquidityPool.all();
  const loanRaws = await program.account.loan.all();

  const timeBasedLiquidityPools = liquidityPoolRaws.map((raw) => decodedTimeBasedLiquidityPool(raw.account, raw.publicKey));
  const priceBasedLiquidityPools = priceBasedLiquidityPoolRaws.map((raw) => decodedPriceBasedLiquidityPool(raw.account, raw.publicKey));
  const loans = loanRaws.map((raw) => decodedLoan(raw.account, raw.publicKey));

  return { timeBasedLiquidityPools, priceBasedLiquidityPools, loans };
};

module.exports = {
  getAllProgramAccounts
};
