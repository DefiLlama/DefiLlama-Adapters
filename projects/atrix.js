const { sumTokens2, getConnection , getProvider} = require('./helper/solana')
// const { getConfig } = require('./helper/cache')
// const { PublicKey, } = require("@solana/web3.js");
// const { TokenAmountLayout, } = require("./helper/utils/solana/layouts/raydium-layout");
// const { Program } = require('@project-serum/anchor');

async function tvl() {
  // previously we were incorrectly counting all tokens in serum pools as atrix tvl
  return sumTokens2({ owner: '3uTzTX5GBSfbW7eM9R9k95H7Txe32Qw3Z25MtyD2dzwC', })
/*   const connection = getConnection()
  const provider = getProvider()
  const program = new Program(idl, 'HvwYjjzPbXWpykgVZhqvvfeeaSraQVnTiQibofaFw9M7', provider)

  const acc = await program.account.poolAccount.all()
  const tokenAccounts = acc.map(({ account:i}) => [i.poolCoinAccount, i.poolPcAccount, ]).flat()

  console.log(tokenAccounts, tokenAccounts.length)
  return sumTokens2({ tokenAccounts })
  return {}
  const auth = 'CmiPgGfWeteicRisWRuJzn7L649zWpw9Qya8g3ey9cZt'

  console.time('raydium: ammV4Tvl fetching vault balances')
  const allPoolVaultAmount = await connection.getProgramAccounts(new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), { filters: [{ dataSize: 165 }, { memcmp: { offset: 32, bytes: auth } }], dataSlice: { offset: 64, length: TokenAmountLayout.span } })
  console.timeEnd('raydium: ammV4Tvl fetching vault balances')
  console.log(allPoolVaultAmount.length, 'fetched vault amounts')
  return {} */
 
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  hallmarks: [
    [1665521360, "Mango Markets Hack"],
    [1667865600, "FTX collapse"]
  ],
}
/* 
const idl = {
  "version": "0.0.0",
  "name": "atrix",
  "instructions": [],
  "accounts": [
    {
      "name": "ProtocolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lpFeeNumerator",
            "type": "u16"
          },
          {
            "name": "protocolFeeNumerator",
            "type": "u16"
          },
          {
            "name": "feeDenominator",
            "type": "u16"
          },
          {
            "name": "maxCancelPerIx",
            "type": "u8"
          },
          {
            "name": "maxPlacePerIx",
            "type": "u8"
          },
          {
            "name": "maxPlacePostLiq",
            "type": "u8"
          },
          {
            "name": "orderProportionNumerators",
            "type": {
              "array": [
                "u16",
                12
              ]
            }
          },
          {
            "name": "orderProportionLen",
            "type": "u8"
          },
          {
            "name": "orderProportionDenominator",
            "type": "u16"
          },
          {
            "name": "crankSolAccount",
            "type": "publicKey"
          },
          {
            "name": "poolInitCrankFee",
            "type": "u64"
          },
          {
            "name": "solBond",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PoolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "coinMint",
            "type": "publicKey"
          },
          {
            "name": "pcMint",
            "type": "publicKey"
          },
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "openOrders",
            "type": "publicKey"
          },
          {
            "name": "poolCoinAccount",
            "type": "publicKey"
          },
          {
            "name": "poolPcAccount",
            "type": "publicKey"
          },
          {
            "name": "poolLpAccount",
            "type": "publicKey"
          },
          {
            "name": "lpMint",
            "type": "publicKey"
          },
          {
            "name": "firstPlaced",
            "type": "bool"
          },
          {
            "name": "orderIndex",
            "type": "u8"
          },
          {
            "name": "lpFee",
            "type": "u64"
          },
          {
            "name": "stableFee",
            "type": "u64"
          },
          {
            "name": "ixi",
            "type": "u8"
          },
          {
            "name": "icx",
            "type": "u8"
          },
          {
            "name": "clientOrderId",
            "type": "u64"
          },
          {
            "name": "orderProportionNumerators",
            "type": {
              "array": [
                "u16",
                12
              ]
            }
          },
          {
            "name": "poolType",
            "type": "u8"
          },
          {
            "name": "stableswapAmpCoef",
            "type": "u64"
          },
          {
            "name": "coinDecimals",
            "type": "u8"
          },
          {
            "name": "pcDecimals",
            "type": "u8"
          },
          {
            "name": "lastAskCoin",
            "type": "u64"
          },
          {
            "name": "lastAskPc",
            "type": "u64"
          },
          {
            "name": "lastBidCoin",
            "type": "u64"
          },
          {
            "name": "lastBidPc",
            "type": "u64"
          },
          {
            "name": "version",
            "type": "u64"
          },
          {
            "name": "placedAsks",
            "type": {
              "array": [
                {
                  "defined": "PlacedOrder"
                },
                12
              ]
            }
          },
          {
            "name": "placedBids",
            "type": {
              "array": [
                {
                  "defined": "PlacedOrder"
                },
                12
              ]
            }
          },
          {
            "name": "pca",
            "type": "u64"
          },
          {
            "name": "ppca",
            "type": "u64"
          },
          {
            "name": "mmActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PlacedOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "limitPrice",
            "type": "u64"
          },
          {
            "name": "coinQty",
            "type": "u64"
          },
          {
            "name": "maxNativePcQtyIncludingFees",
            "type": "u64"
          },
          {
            "name": "clientOrderId",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
}
 */
