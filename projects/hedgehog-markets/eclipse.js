const { PublicKey } = require("@solana/web3.js");
const { getConnection, runInChunks, decodeAccount } = require("../helper/solana");

async function tvl(api) {
  const connection = getConnection("eclipse");

  const tokenAccounts = [];

  await addP2PDepositTokenAccounts();
  await addParimutuelDepositTokenAccounts();
  await addParlayDepositTokenAccounts();

  // Sum balances from token accounts, gracefully handling accounts that have been closed.
  {
    const sleepTime = tokenAccounts.length > 2000 ? 2000 : 200;

    api.log("total token accounts: ", tokenAccounts.length, "sleepTime: ", sleepTime);

    const accounts = await runInChunks(
      tokenAccounts,
      (chunk) => connection.getMultipleAccountsInfo(chunk),
      { sleepTime },
    );

    for (const [i, data] in accounts.entries()) {
      if (data == null) {
        continue;
      }

      try {
        const { mint, amount } = decodeAccount("tokenAccount", data);

        api.add(mint.toString(), amount.toString());
      } catch (e) {
        throw new Error(`Error decoding account: ${tokenAccounts[i]}`, { cause: e });
      }
    }
  }

  return api.getBalances();

  async function addP2PDepositTokenAccounts() {
    const programId = new PublicKey("P2PototC41acvjMc9cvAoRjFjtaRD5Keo9PvNJfRwf3");

    const result = await connection.getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about the market addresses.
      dataSlice: { offset: 0, length: 0 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4" } },
      ],
    });

    for (const { pubkey } of result) {
      // Market deposit account.
      const [deposit] = PublicKey.findProgramAddressSync(
        [Buffer.from("deposit"), pubkey.toBuffer()],
        programId,
      );

      tokenAccounts.push(deposit);
    }
  }

  async function addParimutuelDepositTokenAccounts() {
    const programId = new PublicKey("PARrVs6F5egaNuz8g6pKJyU4ze3eX5xGZCFb3GLiVvu");

    const result = await connection.getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about the market addresses.
      dataSlice: { offset: 0, length: 0 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4" } },
      ],
    });

    for (const { pubkey } of result) {
      // Market deposit account.
      const [deposit] = PublicKey.findProgramAddressSync(
        [Buffer.from("deposit"), pubkey.toBuffer()],
        programId,
      );

      tokenAccounts.push(deposit);
    }
  }

  async function addParlayDepositTokenAccounts() {
    const programId = new PublicKey("PLYaNRbQs9GWyVQdcLrzPvvZu7NH4W2sneyHcEimLr7");

    const result = await connection.getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about the market addresses.
      dataSlice: { offset: 0, length: 0 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4" } },
      ],
    });

    for (const { pubkey } of result) {
      // Market deposit account.
      const [deposit] = PublicKey.findProgramAddressSync(
        [Buffer.from("deposit"), pubkey.toBuffer()],
        programId,
      );

      tokenAccounts.push(deposit);
    }
  }
}

module.exports = tvl;
