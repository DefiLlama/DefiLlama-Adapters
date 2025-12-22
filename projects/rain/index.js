const { Program } = require("@coral-xyz/anchor");
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const { getProvider } = require("../helper/solana");
const bankIdl = require('./bank-idl');
const defiIdl = require('./defi-idl');

async function tvl(api) {
  const provider = getProvider();
  const bankProgram = new Program(bankIdl, provider);
  const defiProgram = new Program(defiIdl, provider);

  // Get all banks
  const banks = [];
  
  const expectedDiscriminant = Buffer.from([142, 49, 166, 242, 50, 66, 97, 188]);
  const rawAccounts = await provider.connection.getProgramAccounts(bankProgram.programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(expectedDiscriminant),
        },
      },
    ],
  });

  for (const acc of rawAccounts) {
    const data = acc.account.data;

    if (!data.slice(0, 8).equals(expectedDiscriminant)) continue;
    if (data.length < 900) continue;

    const bankTypeTag = data.readUInt8(128);
    if (bankTypeTag !== 0 && bankTypeTag !== 1) continue;

    const decoded = bankProgram.coder.accounts.decode('bank', data);
    banks.push({ publicKey: acc.pubkey, account: decoded });
  }

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