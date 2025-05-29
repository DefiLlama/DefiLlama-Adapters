
const { Program, BorshCoder } = require('@coral-xyz/anchor')
const { exportDexTVL, sumTokensExport, getConnection, getAssociatedTokenAddress, sumTokens2 } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

const LiquidityBookIdl = {
  "address": "1qbkdrr3z4ryLA7pZykqxvxWPoeifcVKo6ZG9CfkvVE",
  "metadata": {
    "name": "liquidity_book",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
  
  ],
  "accounts": [
    
    {
      "name": "Pair",
      "discriminator": [
        85,
        72,
        49,
        176,
        182,
        228,
        141,
        82
      ]
    },
   
  ],
  "types": [
    {
      "name": "Bin",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "total_supply",
            "type": "u128"
          },
          {
            "name": "reserve_x",
            "type": "u64"
          },
          {
            "name": "reserve_y",
            "type": "u64"
          }
        ]
      }
    },

  
    {
      "name": "DynamicFeeParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "time_last_updated",
            "type": "u64"
          },
          {
            "name": "volatility_accumulator",
            "type": "u32"
          },
          {
            "name": "volatility_reference",
            "type": "u32"
          },
          {
            "name": "id_reference",
            "type": "u32"
          },
          {
            "name": "_space",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LiquidityBookConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "preset_authority",
            "type": "pubkey"
          },
          {
            "name": "pending_preset_authority",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "LiquidityBookConfigInitializationEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "preset_authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "Pair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "liquidity_book_config",
            "type": "pubkey"
          },
          {
            "name": "bin_step",
            "type": "u8"
          },
          {
            "name": "bin_step_seed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "token_mint_x",
            "type": "pubkey"
          },
          {
            "name": "token_mint_y",
            "type": "pubkey"
          },
          {
            "name": "static_fee_parameters",
            "type": {
              "defined": {
                "name": "StaticFeeParameters"
              }
            }
          },
          {
            "name": "active_id",
            "type": "u32"
          },
          {
            "name": "dynamic_fee_parameters",
            "type": {
              "defined": {
                "name": "DynamicFeeParameters"
              }
            }
          },
          {
            "name": "protocol_fees_x",
            "type": "u64"
          },
          {
            "name": "protocol_fees_y",
            "type": "u64"
          },
          {
            "name": "hook",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
  
    {
      "name": "StaticFeeParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base_factor",
            "type": "u16"
          },
          {
            "name": "filter_period",
            "type": "u16"
          },
          {
            "name": "decay_period",
            "type": "u16"
          },
          {
            "name": "reduction_factor",
            "type": "u16"
          },
          {
            "name": "variable_fee_control",
            "type": "u32"
          },
          {
            "name": "max_volatility_accumulator",
            "type": "u32"
          },
          {
            "name": "protocol_share",
            "type": "u16"
          },
          {
            "name": "_space",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          }
        ]
      }
    },
    
  ]
}

const DEX_ID_V2 = 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'
const DEX_ID_V3 = '1qbkdrr3z4ryLA7pZykqxvxWPoeifcVKo6ZG9CfkvVE'

function mergeAndSumObjects(...objects) {
  return objects.reduce((acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      acc[key] = (acc[key] || 0) + Number(value);
    }
    return acc;
  }, {});
}

async function tvl(...args) {
  const dexTVL = await exportDexTVL(DEX_ID_V2)(...args)
  const stakingTVL = await sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'] })(...args)

  const connection = getConnection();
  const programPublicKey = new PublicKey(DEX_ID_V3)
  const programAccounts = await connection.getParsedProgramAccounts(programPublicKey);

  const formattedAccounts = programAccounts.map(item => ({
    ...item,
    pubkey: item.pubkey.toString(),
    account: {
      ...item.account,
      owner: item.account.owner.toString(),
    },
  }));
  
  const coder = new BorshCoder(LiquidityBookIdl);
  const decodedPairs = [];
  
  for (const item of formattedAccounts) {
      const dataBuffer = Buffer.from(item.account.data);
      const discriminator = dataBuffer.subarray(0, 8);
      
      const idlAccount = LiquidityBookIdl.accounts.find((ix) =>
        Buffer.from(ix.discriminator).equals(discriminator)
      );
      
      if (idlAccount?.name === 'Pair') {
        const decodedData = coder.accounts.decode(idlAccount.name, item.account.data);
        decodedPairs.push({ ...decodedData, pubkey: item.pubkey });
      }
  }
  
  const atas = [];
  
  for (const pair of decodedPairs) {
    const accountInfoX = await connection.getParsedAccountInfo(pair.token_mint_x);
    if (!accountInfoX) {
      console.log(`Token mint not found: ${pair.token_mint_x.toString()}`);
      return null;
    }

    const ownerProgramIdX = accountInfoX.value.owner;
    const ataX = getAssociatedTokenAddress( pair.token_mint_x, new PublicKey(pair.pubkey), ownerProgramIdX);
    atas.push(new PublicKey(ataX))

    const accountInfoY = await connection.getParsedAccountInfo(pair.token_mint_y);
    if (!accountInfoY) {
      return null;
    }
    const ownerProgramIdY = accountInfoY.value.owner;
    const ataY = getAssociatedTokenAddress( pair.token_mint_y, new PublicKey(pair.pubkey), ownerProgramIdY);
    atas.push(new PublicKey(ataY))
  }

  const dexV3TVL = await sumTokens2({
    tokenAccounts: atas,
    allowError: true
  })

  const mergedTVL = mergeAndSumObjects(dexTVL, dexV3TVL, stakingTVL);

  return mergedTVL
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
  "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: { 
    tvl ,
    staking: sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'], tokens: ['SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL'] })
  },
}
