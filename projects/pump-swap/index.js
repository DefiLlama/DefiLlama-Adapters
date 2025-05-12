const { Program } = require("@coral-xyz/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");

async function tvl() {

  const provider = getProvider()
  idl.metadata.address = idl.address
  const program = new Program(idl, provider)

  const pools = await program.account.pool.all()
  const tokenAccounts = pools.map(i => [i.account.poolBaseTokenAccount, i.account.poolQuoteTokenAccount]).flat()
  return sumTokens2({ tokenAccounts })
}


module.exports = {
  solana: { tvl, },
  isHeavyProtocol: true,
}

const idl = {
  "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
  "metadata": {"name": "pump_amm", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [{"name": "Pool", "discriminator": [241, 154, 109, 4, 17, 177, 109, 188]}],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "pool_bump", "type": "u8"},
          {"name": "index", "type": "u16"},
          {"name": "creator", "type": "pubkey"},
          {"name": "base_mint", "type": "pubkey"},
          {"name": "quote_mint", "type": "pubkey"},
          {"name": "lp_mint", "type": "pubkey"},
          {"name": "pool_base_token_account", "type": "pubkey"},
          {"name": "pool_quote_token_account", "type": "pubkey"},
          {"name": "lp_supply", "docs": ["True circulating supply without burns and lock-ups"], "type": "u64"}
        ]
      }
    }
  ]
}