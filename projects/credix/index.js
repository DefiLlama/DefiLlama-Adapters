const ADDRESSES = require("../helper/coreAssets.json");
const { PublicKey } = require("@solana/web3.js");
const { Program, utils,} = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const MARKET_SEED_FINTECH = "credix-marketplace";
const MARKET_SEED_RECEIVABLES = "receivables-factoring";
const USDC = ADDRESSES.solana.USDC;
const programId = new PublicKey("CRDx2YkdtYtGZXGHZ59wNv1EwKHQndnRc1gT4p8i2vPX");
const encodeSeedString = (seedString) =>
  Buffer.from(utils.bytes.utf8.encode(seedString));

const constructProgram = (provider) => {
  return new Program(idl, programId, provider);
};

const findPDA = async (seeds) => {
  return PublicKey.findProgramAddress(seeds, programId);
};

const findGlobalMarketStatePDA = async (globalMarketSeed) => {
  const seed = encodeSeedString(globalMarketSeed);
  return findPDA([seed]);
};

const findSigningAuthorityPDA = async (globalMarketSeed) => {
  const globalMarketStatePDA = await findGlobalMarketStatePDA(globalMarketSeed);
  const seeds = [globalMarketStatePDA[0].toBuffer()];
  return findPDA(seeds);
};

async function tvl() {
  // Fintech pool
  const [signingAuthorityKeyFintech] = await findSigningAuthorityPDA(
    MARKET_SEED_FINTECH
  );

  // Receivables factoring pool
  const [signingAuthorityKeyReceivables] = await findSigningAuthorityPDA(
    MARKET_SEED_RECEIVABLES
  );
  const tokens = await sumTokens2({
    tokensAndOwners: [
      [USDC, signingAuthorityKeyFintech],
      [USDC, signingAuthorityKeyReceivables],
    ],
  });
  return tokens;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};

async function borrowed(api) {
  
  const provider = getProvider();
  const program = constructProgram(provider);
  const states = await program.account.globalMarketState.all();

  states.forEach(({ account }) => {
    api.add(account.baseTokenMint.toBase58(), account.poolOutstandingCredit.toString())
  })
}

async function tvl1(api) {
  
  const provider = getProvider();
  const program = constructProgram(provider);
  const states = await program.account.globalMarketState.all();

  const tokenAccounts = states.map(({ account }) => account.treasuryPoolTokenAccount.toBase58())
  return sumTokens2({ tokenAccounts })
}

const idl = {
  version: '3.11.0',
  name: 'credix',
  instructions: [],
  accounts: [{
    name: 'globalMarketState',
    type: {
      kind: 'struct',
      fields: [
        {
          name: 'baseTokenMint',
          type: 'publicKey'
        },
        {
          name: 'lpTokenMint',
          type: 'publicKey'
        },
        {
          name: 'poolOutstandingCredit',
          docs: [
            'The amount from senior tranche lent'
          ],
          type: 'u64'
        },
        {
          name: 'treasuryPoolTokenAccount',
          type: 'publicKey'
        },
        {
          name: 'signingAuthorityBump',
          type: 'u8'
        },
        {
          name: 'bump',
          type: 'u8'
        },
        {
          name: 'credixFeePercentage',
          type: {
            defined: 'Fraction'
          }
        },
        {
          name: 'withdrawalFee',
          docs: [
            'The fee charged for withdrawals'
          ],
          type: {
            defined: 'Fraction'
          }
        },
        {
          name: 'frozen',
          type: 'bool'
        },
        {
          name: 'seed',
          type: 'string'
        },
        {
          name: 'poolSizeLimitPercentage',
          docs: [
            'Maximum possible deposit limit in addition the pool outstanding credit',
            'pool_size_limit = pool_outstanding_credit + pool_size_limit_percentage * pool_outstanding_credit'
          ],
          type: {
            defined: 'Fraction'
          }
        },
        {
          name: 'withdrawEpochRequestSeconds',
          type: 'u32'
        },
        {
          name: 'withdrawEpochRedeemSeconds',
          type: 'u32'
        },
        {
          name: 'withdrawEpochAvailableLiquiditySeconds',
          type: 'u32'
        },
        {
          name: 'latestWithdrawEpochIdx',
          type: 'u32'
        },
        {
          name: 'latestWithdrawEpochEnd',
          type: 'i64'
        },
        {
          name: 'lockedLiquidity',
          type: 'u64'
        },
        {
          name: 'totalRedeemedBaseAmount',
          type: 'u64'
        },
        {
          name: 'hasWithdrawEpochs',
          type: 'bool'
        },
        {
          name: 'redeemAuthorityBump',
          docs: [
            'This is only used for wormhole related token transfer occurs.'
          ],
          type: 'u8'
        }
      ]
    }
  }],
  types: [
    {
      name: 'Fraction',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'numerator',
            type: 'u32'
          },
          {
            name: 'denominator',
            type: 'u32'
          }
        ]
      }
    }],
  events: [],
  errors: [ ]
}