const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, getConnection, decodeAccount, getAssociatedTokenAddress } = require("../helper/solana");
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');

const VAULT_PROGRAM_ID = new PublicKey("Vau1t6sLNxnzB7ZDsef8TLbPLfyZMYXH8WTNqUdm9g8");
const VAULT_DISCRIMINATOR = Buffer.from([2]);

function getVaultPubkey(vault) {
  const [associatedTokenAddress] = PublicKey.findProgramAddressSync([Buffer.from("vault"), vault.base.toBuffer()], VAULT_PROGRAM_ID);
  return associatedTokenAddress;
}

async function tvl(api) {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(
    VAULT_PROGRAM_ID,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(VAULT_DISCRIMINATOR),
          },
        },
      ]
    }
  );

  const vaults = accounts.map(i => decodeAccount('jitoVault', i.account))

  const tokensAndOwners = vaults.map((vault) => {
    const vaultPubkey = getVaultPubkey(vault).toBase58();
    const supportedMint = vault.supportedMint.toBase58();
    return [supportedMint, vaultPubkey];
  });



  const fragSOL = [
    [ADDRESSES.solana.JitoSOL, 'AkbZvKxUAxMKz92FF7g5k2YLCJftg8SnYEPWdmZTt3mp'],
    [ADDRESSES.solana.BNSOL, 'AkbZvKxUAxMKz92FF7g5k2YLCJftg8SnYEPWdmZTt3mp'],
    ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'AkbZvKxUAxMKz92FF7g5k2YLCJftg8SnYEPWdmZTt3mp'],
  ]

  tokensAndOwners.push(...fragSOL)

  return sumTokens2({
    balances: api.getBalances(), tokensAndOwners
  })
}



module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};