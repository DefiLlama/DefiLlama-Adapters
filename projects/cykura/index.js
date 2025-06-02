const { Program }  = require("@project-serum/anchor");
const { sumTokens2, getProvider, } = require("../helper/solana");


const idl = {
  "version": "0.1.6",
  "name": "cyclos_core",
  "instructions": [],
  "accounts": [
    {
      "name": "PoolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "token0",
            "type": "publicKey"
          },
          {
            "name": "token1",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u32"
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "liquidity",
            "type": "u64"
          },
          {
            "name": "sqrtPriceX32",
            "type": "u64"
          },
          {
            "name": "tick",
            "type": "i32"
          },
          {
            "name": "observationIndex",
            "type": "u16"
          },
          {
            "name": "observationCardinality",
            "type": "u16"
          },
          {
            "name": "observationCardinalityNext",
            "type": "u16"
          },
          {
            "name": "feeGrowthGlobal0X32",
            "type": "u64"
          },
          {
            "name": "feeGrowthGlobal1X32",
            "type": "u64"
          },
          {
            "name": "protocolFeesToken0",
            "type": "u64"
          },
          {
            "name": "protocolFeesToken1",
            "type": "u64"
          },
          {
            "name": "unlocked",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": [],
  "metadata": {
    "address": "cysPXAjehMpVKUapzbMCCnpFxUFFryEWEaLgnb9NrR8"
  }
}

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, idl.metadata.address, provider)
  const amms = await program.account.poolState.all()
  return sumTokens2({ owners: amms.map(i => i.publicKey.toString()), });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  }
}