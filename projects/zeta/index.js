const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const { sumTokens2 } = require("../helper/solana");
const ZETA_PROGRAM_ID = new PublicKey(
  "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD"
);
const USDC_MINT = new PublicKey(ADDRESSES.solana.USDC);

module.exports = {
  timetravel: false,
  methodology: "Fetches TVL from zeta's vaults and insurance fund",
  solana: {
    tvl,
  },
};

async function tvl(api) {
  const legacyZetaGroupAddrs = [
    new PublicKey("CoGhjFdyqzMFr5xVgznuBjULvoFbFtNN4bCdQzRArNK2"),
    new PublicKey("5XC7JWvLGGds4tjaawgY8FwMdotUb5rrEUmxcmyp5ZiW"),
    new PublicKey("HPnqfiRSVvuBjfHN9ah4Kecb6J9et2UTnNgUwtAJdV26"),
    new PublicKey("D19K6rrppbWAFa4jE1DJUStPnr7cSrqKk5TruGqfc5Ns"),
    new PublicKey("CU6pPA2E2yQFqMzZKrFCmfjrSBEc6GxfmFrSqpqazygu"),
  ];

  const legacyVaults = legacyZetaGroupAddrs
    .map((addr) => {
      return [insuranceVaultAddr(addr), vaultAddr(addr)];
    })
    .flat();

  const vault = PublicKey.findProgramAddressSync(
    [Buffer.from(anchor.utils.bytes.utf8.encode("combined-vault"))],
    ZETA_PROGRAM_ID
  )[0].toBase58();

  const insuranceVault = PublicKey.findProgramAddressSync(
    [
      Buffer.from(
        anchor.utils.bytes.utf8.encode("zeta-combined-insurance-vault")
      ),
    ],
    ZETA_PROGRAM_ID
  )[0].toBase58();

  const treasury = PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("zeta-treasury-wallet")),
      USDC_MINT.toBuffer(),
    ],
    ZETA_PROGRAM_ID
  )[0].toBase58();

  const vaults = [...legacyVaults, vault, insuranceVault, treasury];

  return sumTokens2({ tokenAccounts: vaults });
}

function vaultAddr(zetaGroup) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("vault")),
      zetaGroup.toBuffer(),
    ],
    ZETA_PROGRAM_ID
  )[0].toBase58();
}

function insuranceVaultAddr(zetaGroup) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("zeta-insurance-vault")),
      zetaGroup.toBuffer(),
    ],
    ZETA_PROGRAM_ID
  )[0].toBase58();
}