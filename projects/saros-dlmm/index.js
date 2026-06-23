
const { Program } = require('@coral-xyz/anchor')
const { getConnection, getAssociatedTokenAddress, sumTokens2, getProvider } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

const LiquidityBookIdl = {
  "address": "1qbkdrr3z4ryLA7pZykqxvxWPoeifcVKo6ZG9CfkvVE",
  "metadata": { "name": "liquidity_book", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor" },
  "instructions": [],
  "accounts": [{ "name": "Pair", "discriminator": [85, 72, 49, 176, 182, 228, 141, 82] }],
  "types": [
    {
      "name": "Pair",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "bump", "type": { "array": ["u8", 1] } },
          { "name": "liquidity_book_config", "type": "pubkey" },
          { "name": "bin_step", "type": "u8" },
          { "name": "bin_step_seed", "type": { "array": ["u8", 1] } },
          { "name": "token_mint_x", "type": "pubkey" },
          { "name": "token_mint_y", "type": "pubkey" },
          { "name": "static_fee_parameters", "type": { "defined": { "name": "StaticFeeParameters" } } },
          { "name": "active_id", "type": "u32" },
          { "name": "dynamic_fee_parameters", "type": { "defined": { "name": "DynamicFeeParameters" } } },
          { "name": "protocol_fees_x", "type": "u64" },
          { "name": "protocol_fees_y", "type": "u64" },
          { "name": "hook", "type": { "option": "pubkey" } }
        ]
      }
    },
    {
      "name": "StaticFeeParameters",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "base_factor", "type": "u16" },
          { "name": "filter_period", "type": "u16" },
          { "name": "decay_period", "type": "u16" },
          { "name": "reduction_factor", "type": "u16" },
          { "name": "variable_fee_control", "type": "u32" },
          { "name": "max_volatility_accumulator", "type": "u32" },
          { "name": "protocol_share", "type": "u16" },
          { "name": "_space", "type": { "array": ["u8", 2] } }
        ]
      }
    },
    {
      "name": "DynamicFeeParameters",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "time_last_updated", "type": "u64" },
          { "name": "volatility_accumulator", "type": "u32" },
          { "name": "volatility_reference", "type": "u32" },
          { "name": "id_reference", "type": "u32" },
          { "name": "_space", "type": { "array": ["u8", 4] } }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
}

const DEX_ID_V3 = '1qbkdrr3z4ryLA7pZykqxvxWPoeifcVKo6ZG9CfkvVE'
const blacklistedTokens = new Set([
  'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',  // there is more tokens in the pool than mcap on gecko
  '73xsLcBnLnc9bh81cqVKqj8uEyiarXng5ZwJuTbnVebG', // not enough liquidity
  'EGNjqB7LfRxpkbVMSroA6UaKtGPuy6wWPx7bmijmPuCD', // not enough liquidity
  'memsZQiMFoXYwuZj6fFEaRFNgyLGiLDEDqHz5PwtvRa', // not enough liquidity
  'CmV6utUF7odMbDkJpbtccTSfWdenDnDrcAvzXReihDpt', // not enough liquidity
  'jokeSc37tSJ5V5MYTmLtKh3SZf11vWd2i8eZC9sd74m', // not enough liquidity
  'SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL', // projects own token, no enough liqudity on the other side of the pool
  'uniBKsEV37qLRFZD7v3Z9drX6voyiCM8WcaePqeSSLc', // uniBTC wash trading
  'CtzPWv73Sn1dMGVU3ZtLv9yWSyUAanBni19YWDaznnkn', // XBTC was trading
]);

async function tvl() {

  const connection = getConnection();
  const program = new Program(LiquidityBookIdl, getProvider())
  const pairs = await program.account.pair.all();
  console.log(`Found ${pairs.length} accounts for program ${DEX_ID_V3}`);
  let tokens = pairs.map(pair => [pair.account.tokenMintX.toString(), pair.account.tokenMintY.toString()]).flat();
  tokens = [...new Set(tokens)]; // remove duplicates
  const programAccounts = await connection.getMultipleAccountsInfo(tokens.map(token => new PublicKey(token)));
  const tokenInfoMap = {};
  programAccounts.forEach((account, index) => {
    if (account) {
      const pubkey = tokens[index];
      tokenInfoMap[pubkey] = account.owner.toString();
    }
  })
  const tokenAccounts = pairs.map(pair => {
    const tokenMintX = pair.account.tokenMintX.toString();
    const tokenMintY = pair.account.tokenMintY.toString();
    const ownerProgramIdX = tokenInfoMap[tokenMintX];
    const ownerProgramIdY = tokenInfoMap[tokenMintY];


    const tokenAccounts = []
    if (!blacklistedTokens.has(tokenMintX))
      tokenAccounts.push(getAssociatedTokenAddress(tokenMintX, pair.publicKey, ownerProgramIdX));

    if (!blacklistedTokens.has(tokenMintY))
      tokenAccounts.push(getAssociatedTokenAddress(tokenMintY, pair.publicKey, ownerProgramIdY));

    return tokenAccounts;
  }).flat();
  return sumTokens2({ tokenAccounts, allowError: true, })
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl,
  },
}
