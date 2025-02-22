
const { Program } = require("@coral-xyz/anchor");
const bs58 = require('bs58');
const { getProvider } = require("../helper/solana");
const bankIdl = require('./bank-idl');
const defiIdl = require('./defi-idl');

const BANK_PROGRAM_ID = 'rain2M5b9GeFCk792swkwUu51ZihHJb3SUQ8uHxSRJf';
const DEFI_PROGRAM_ID = 'rDeFiHPjHZRLiz4iBzMw3zv6unZs4VwdU6qQcVd3NSK';

async function tvl(api) {
  const provider = getProvider();
  const bankProgram = new Program(bankIdl, BANK_PROGRAM_ID, provider);
  const defiProgram = new Program(defiIdl, DEFI_PROGRAM_ID, provider);

  // Get all banks
  const banks = await bankProgram.account.bank.all();

  // Get all active defi loans
  const defiLoans = await defiProgram.account.loan.all([
    {
      memcmp: {
        offset: 8 + 1,
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

tvl()

module.exports = {
  solana: { tvl },
}