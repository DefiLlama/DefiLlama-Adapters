
const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");

async function tvl() {
  const provider = getProvider();
  const programId = new PublicKey("6dMXqGZ3ga2dikrYS9ovDXgHGh5RUsb2RTUj6hrQXhk6");
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)
  const pools = await program.account.poolState.all();
  const tokenAccounts = pools.map(({ account }) => [account.tokenVault0, account.tokenVault1]).flat();

  return sumTokens2({tokenAccounts  });
}

module.exports = {
  solana: { tvl },
};

const IDL = {
  "accounts": [
    {
      "docs": [],
      "fieldType": {
        "fields": [
          {"docs": ["Bump to identify PDA"], "name": "bump", "type": "array(u8, 1)"},
          {"docs": [], "name": "ammConfig", "type": "pubkey"},
          {"docs": [], "name": "owner", "type": "pubkey"},
          {"docs": ["Token pair of the pool, where token_mint_0 address < token_mint_1 address"], "name": "tokenMint0", "type": "pubkey"},
          {"docs": [], "name": "tokenMint1", "type": "pubkey"},
          {"docs": ["Token pair vault"], "name": "tokenVault0", "type": "pubkey"},
          {"docs": [], "name": "tokenVault1", "type": "pubkey"},
          {"docs": ["observation account key"], "name": "observationKey", "type": "pubkey"},
          {"docs": ["mint0 and mint1 decimals"], "name": "mintDecimals0", "type": "u8"},
          {"docs": [], "name": "mintDecimals1", "type": "u8"},
          {"docs": ["The minimum number of ticks between initialized ticks"], "name": "tickSpacing", "type": "u16"},
          {"docs": ["The currently in range liquidity available to the pool."], "name": "liquidity", "type": "u128"},
          {"docs": ["The current price of the pool as a sqrt(token_1/token_0) Q64.64 value"], "name": "sqrtPriceX64", "type": "u128"},
          {"docs": ["The current tick of the pool, i.e. according to the last tick transition that was run."], "name": "tickCurrent", "type": "i32"},
          {"docs": [], "name": "padding3", "type": "u16"},
          {"docs": [], "name": "padding4", "type": "u16"},
          {
            "docs": [
              "The fee growth as a Q64.64 number, i.e. fees of token_0 and token_1 collected per",
              "unit of liquidity for the entire life of the pool."
            ],
            "name": "feeGrowthGlobal0X64",
            "type": "u128"
          },
          {"docs": [], "name": "feeGrowthGlobal1X64", "type": "u128"},
          {"docs": ["The amounts of token_0 and token_1 that are owed to the protocol."], "name": "protocolFeesToken0", "type": "u64"},
          {"docs": [], "name": "protocolFeesToken1", "type": "u64"},
          {"docs": ["The amounts in and out of swap token_0 and token_1"], "name": "swapInAmountToken0", "type": "u128"},
          {"docs": [], "name": "swapOutAmountToken1", "type": "u128"},
          {"docs": [], "name": "swapInAmountToken1", "type": "u128"},
          {"docs": [], "name": "swapOutAmountToken0", "type": "u128"},
          {
            "docs": [
              "Bitwise representation of the state of the pool",
              "bit0, 1: disable open position and increase liquidity, 0: normal",
              "bit1, 1: disable decrease liquidity, 0: normal",
              "bit2, 1: disable collect fee, 0: normal",
              "bit3, 1: disable collect reward, 0: normal",
              "bit4, 1: disable swap, 0: normal"
            ],
            "name": "status",
            "type": "u8"
          },
          {"docs": ["Leave blank for future use"], "name": "padding", "type": "array(u8, 7)"},
          {"docs": [], "name": "rewardInfos", "type": "array(RewardInfo, 3)"},
          {"docs": ["Packed initialized tick array state"], "name": "tickArrayBitmap", "type": "array(u64, 16)"},
          {"docs": ["except protocol_fee and fund_fee"], "name": "totalFeesToken0", "type": "u64"},
          {"docs": ["except protocol_fee and fund_fee"], "name": "totalFeesClaimedToken0", "type": "u64"},
          {"docs": [], "name": "totalFeesToken1", "type": "u64"},
          {"docs": [], "name": "totalFeesClaimedToken1", "type": "u64"},
          {"docs": [], "name": "fundFeesToken0", "type": "u64"},
          {"docs": [], "name": "fundFeesToken1", "type": "u64"},
          {"docs": [], "name": "openTime", "type": "u64"},
          {"docs": [], "name": "recentEpoch", "type": "u64"},
          {"docs": [], "name": "padding1", "type": "array(u64, 24)"},
          {"docs": [], "name": "padding2", "type": "array(u64, 32)"}
        ],
        "kind": "struct"
      },
      "name": "PoolState"
    }
  ],
  "errors": [],
  "events": [],
  "instructions": [],
  "pdas": [],
  "types": []
}
