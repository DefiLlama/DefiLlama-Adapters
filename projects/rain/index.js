
const { Program } = require("@coral-xyz/anchor");
const bs58 = require('bs58');
const { getProvider } = require("../helper/solana");
const bankIdl = require('./bank-idl');
const defiIdl = require('./defi-idl');

async function tvl(api) {
  const provider = getProvider();
  const bankProgram = new Program(bankIdl, provider);
  const defiProgram = new Program(defiIdl, provider);

  // Get all banks
  const banks = await bankProgram.account.bank.all();

  // Get all active defi loans
  const defiLoans = await defiProgram.account.loan.all([
    {
      memcmp: {
        offset: 8 + 64 + 1,
        bytes: bs58.encode(Buffer.from([0])), // active loans only
      },
    },
  ]);

  // Add bank available liquidity to TVL, availableLiquidity = totalLiquidity - borrowedLiquidity
  for (const bank of banks) {
    api.add(
      bank.account.mint.toString(),
      bank.account.availableLiquidity
    );
  }

  // Add defi loan collateral to TVL
  for (const loan of defiLoans) {
    api.add(
      loan.account.collateral.toString(),
      loan.account.collateralAmount
    );
  }
}

async function borrowed(api) {
  const provider = getProvider();
  const defiProgram = new Program(defiIdl, provider);

  // Get all active defi loans
  const defiLoans = await defiProgram.account.loan.all([
    {
      memcmp: {
        offset: 8 + 64 + 1,
        bytes: bs58.encode(Buffer.from([0])), // active loans only
      },
    },
  ]);

  // Add defi loan collateral to TVL
  for (const loan of defiLoans) {
    api.add(
      loan.account.principal.toString(),
      loan.account.borrowedAmount
    );
  }
}

module.exports = {
  solana: { tvl, borrowed, },
}