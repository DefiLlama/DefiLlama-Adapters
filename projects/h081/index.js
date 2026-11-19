// H081 Capital: a private bank for AI agents on Solana (https://h081.xyz).
// Every address is derived at runtime from the program ids and mints; nothing is read from an API.
const { PublicKey } = require("@solana/web3.js");
const { sumTokensExport } = require("../helper/solana");

// Programs (live on Solana mainnet, not audited yet)
const STIPEND_POOL = "E16DKmtrYtYGp7guSso25Pvq8gzKunnUULU28RmRmDGM"; // the bank: shielded deposits
const CAPACITY_STAKE = "CH1rrfFyJMVn158UHL2fLpKTtoLJojrz5f68toMQdQKU"; // H081 staking for relay capacity
const SAFETY_POOL = "HmzKNPn8LaRyjmggt2uT95B7KvphtoVXQkeVc2HHARTt"; // H081 safety pool (loan cover)
const H081 = "EgqxxR7zowzaLEm24oep5qqBieLVAWYX78LhgeqAJAo"; // protocol token

// Deposit assets the bank accepts (the per-mint vault ["vault", mint] is created by the program's
// initialize / add-asset path). Only these mints are counted: a token account someone else creates
// for the vault authority in another mint is never touched by the program and is not TVL.
const USDG = "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH"; // Token-2022, 6 decimals
const DEPOSIT_MINTS = [USDG];

const pda = (seeds, programId) =>
  PublicKey.findProgramAddressSync(seeds, new PublicKey(programId))[0].toBase58();

// stipend_pool: PDA ["vault_auth"] owns every per-mint vault (["vault", mint], e.g. the USDG vault
// FaRG7DV8e7XF3RyoZrBb3h1oLiFFWFFCuYDSXsDoyyzG) and every "owed" lender escrow. The helper lists the
// owner's token accounts per accepted mint (getTokenAccountsByOwner with a mint filter), so the PDA
// vault and the escrows of that mint are all counted.
const vaultAuthority = pda([Buffer.from("vault_auth")], STIPEND_POOL);

// capacity_stake / safety_pool: PDA ["vault", mint] holds the staked / deposited H081.
const capacityVault = pda([Buffer.from("vault"), new PublicKey(H081).toBuffer()], CAPACITY_STAKE);
const safetyVault = pda([Buffer.from("vault"), new PublicKey(H081).toBuffer()], SAFETY_POOL);

module.exports = {
  timetravel: true,
  start: "2026-10-31",
  methodology:
    "TVL is the balance of the accepted deposit assets (USDG today) in the token accounts owned by the stipend_pool vault authority PDA (the bank's deposit vault and lender escrows). " +
    "Staking is the H081 held by the capacity_stake and safety_pool vault PDAs (the protocol's own token, reported separately). " +
    "Loan principal is paid by the lender directly to the borrower's named account and never passes through the bank vault; only the borrower's pledged deposit (already in the vault) is in TVL, so no borrowed bucket is reported.",
  solana: {
    tvl: sumTokensExport({ owners: [vaultAuthority], tokens: DEPOSIT_MINTS }),
    staking: sumTokensExport({ tokenAccounts: [capacityVault, safetyVault] }),
  },
};
