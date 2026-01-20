const { getAssociatedTokenAddress, getProvider, TOKEN_PROGRAM_ID } = require('../helper/solana');
const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
// const { Program, } = require("@project-serum/anchor");
const { Program } = require("@coral-xyz/anchor");


const USDC_MINT = new PublicKey(ADDRESSES.solana.USDC);
const ONYC_MINT = new PublicKey("5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5"); // ONyc mainnet (9 decimals)

// const idl = require("./onreapp.idl.json");
const idl = {
  "address": "onreuGhHHgVzMWSkj2oQDLDtvvGvoepBPkqyaubFcwe",
  "metadata": { "name": "onreapp" },
  "instructions": [
    {
      "name": "get_tvl",
      "discriminator": [ 88, 225, 219, 204, 86, 91, 184, 51 ],
      "accounts": [
        { "name": "offer", "writable": false, "pda": { "seeds": [ { "kind": "const", "value": [ 111, 102, 102, 101, 114 ] }, { "kind": "account", "path": "token_in_mint" }, { "kind": "account", "path": "token_out_mint" } ] } },
        { "name": "token_in_mint", "writable": false },
        { "name": "token_out_mint", "writable": false },
        { "name": "vault_authority", "writable": false, "pda": { "seeds": [ { "kind": "const", "value": [ 111, 102, 102, 101, 114, 95, 118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121 ] } ] } },
        { "name": "vault_token_out_account", "writable": false },
        { "name": "token_out_program", "writable": false }
      ],
      "args": [],
      "returns": "u64"
    }
  ]
};
async function tvl(api) {

    const provider = getProvider()
    // const programId = new PublicKey('onreuGhHHgVzMWSkj2oQDLDtvvGvoepBPkqyaubFcwe');
    // const idl = await Program.fetchIdl(programId, provider)
    const program = new Program(idl, provider)
    // const program = new Program(idl, getProvider());

    const offerVaultAuthorityPda = PublicKey.findProgramAddressSync([Buffer.from("offer_vault_authority")], program.programId)[0]
    // const vaultTokenOutAccount = getAssociatedTokenAddress(ONYC_MINT, offerVaultAuthorityPda, true, TOKEN_PROGRAM_ID);
    const vaultTokenOutAccount = new PublicKey('6zqQk9iDWzCx4NUyKNyfNVyxp8e3od8Br7jwkSDeRz8K');

    const tvl = await program.methods
        .getTvl()
        .accounts({
            tokenInMint: USDC_MINT,
            tokenOutMint: ONYC_MINT,
            vaultTokenOutAccount: vaultTokenOutAccount,
            tokenOutProgram: TOKEN_PROGRAM_ID 
        }) .view();

    api.add(ADDRESSES.solana.USDC, tvl.toNumber() / 1_000_000_000n);
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    solana: {tvl},
} 
