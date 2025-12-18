const { Program } = require("@project-serum/anchor");
const { getProvider } = require("../helper/solana");
const idl = require('./idl');

// MarginFi program ID
const MARGINFI_PROGRAM_ID = 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA';

async function tvl(api) {
  const provider = getProvider();
  const program = new Program(idl, MARGINFI_PROGRAM_ID, provider);
  
  // Get all bank accounts from the MarginFi program
  const allBanks = await program.account.bank.all();

  // Calculate TVL (total deposits) for each bank and aggregate by mint
  // Use BigInt for all calculations to preserve precision
  const depositsByMint = {};

  for (const { account: bank } of allBanks) {
    const assetShareValueRaw = BigInt(bank.assetShareValue.value.toString());
    const totalAssetSharesRaw = BigInt(bank.totalAssetShares.value.toString());
    
    const totalDeposits = (assetShareValueRaw * totalAssetSharesRaw) / (2n ** 96n);
    
    if (totalDeposits > 0n) {
      const mint = bank.mint.toString();
      if (!depositsByMint[mint]) {
        depositsByMint[mint] = 0n;
      }
      depositsByMint[mint] = depositsByMint[mint] + totalDeposits;
    }
  }

  for (const [mint, amountBigInt] of Object.entries(depositsByMint)) {
    if (amountBigInt > 0n) {
      api.add(mint, amountBigInt.toString());
    }
  }

  return api.getBalances();
}

async function borrowed(api) {
  const provider = getProvider();
  const program = new Program(idl, MARGINFI_PROGRAM_ID, provider);
  
  // Get all bank accounts from the MarginFi program
  const allBanks = await program.account.bank.all();

  const borrowedByMint = {};

  for (const { account: bank } of allBanks) {

    const liabilityShareValueRaw = BigInt(bank.liabilityShareValue.value.toString());
    const totalLiabilitySharesRaw = BigInt(bank.totalLiabilityShares.value.toString());
    
    const totalBorrows = (liabilityShareValueRaw * totalLiabilitySharesRaw) / (2n ** 96n);
    
    if (totalBorrows > 0n) {
      const mint = bank.mint.toString();
      if (!borrowedByMint[mint]) {
        borrowedByMint[mint] = 0n;
      }
      borrowedByMint[mint] = borrowedByMint[mint] + totalBorrows;
    }
  }

  for (const [mint, amountBigInt] of Object.entries(borrowedByMint)) {
    if (amountBigInt > 0n) {
      api.add(mint, amountBigInt.toString());
    }
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true,
  solana: { 
    tvl,
    borrowed 
  },
  methodology: "TVL is calculated as total deposits across all banks from the MarginFi program. Borrows are tracked separately and do not reduce TVL."
};
