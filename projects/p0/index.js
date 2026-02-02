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

  // Calculate available liquidity for each bank and aggregate by mint
  // Use BigInt for all calculations to preserve precision
  const availableLiquidityByMint = {};

  for (const { account: bank } of allBanks) {
    const mint = bank.mint.toString();
    
    // Calculate total deposits
    const assetShareValueRaw = BigInt(bank.assetShareValue.value.toString());
    const totalAssetSharesRaw = BigInt(bank.totalAssetShares.value.toString());
    const totalDeposits = (assetShareValueRaw * totalAssetSharesRaw) / (2n ** 96n);
    
    // Calculate total borrows
    const liabilityShareValueRaw = BigInt(bank.liabilityShareValue.value.toString());
    const totalLiabilitySharesRaw = BigInt(bank.totalLiabilityShares.value.toString());
    const totalBorrows = (liabilityShareValueRaw * totalLiabilitySharesRaw) / (2n ** 96n);
    
    // Available liquidity = deposits - borrows
    const availableLiquidity = totalDeposits > totalBorrows ? totalDeposits - totalBorrows : 0n;
    
    if (availableLiquidity > 0n) {
      if (!availableLiquidityByMint[mint]) {
        availableLiquidityByMint[mint] = 0n;
      }
      availableLiquidityByMint[mint] = availableLiquidityByMint[mint] + availableLiquidity;
    }
  }

  for (const [mint, amountBigInt] of Object.entries(availableLiquidityByMint)) {
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
  solana: { 
    tvl,
    borrowed 
  },
  methodology: "TVL is calculated as available liquidity across all banks in the P0 program."
};
