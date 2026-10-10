const { PublicKey } = require("@solana/web3.js");
const { Program, utils,} = require("@project-serum/anchor");
const { getProvider, getMultipleAccounts, sumTokens2, } = require("../helper/solana");

const MARKET_SEED_FINTECH = "credix-marketplace";
const MARKET_SEED_RECEIVABLES = "receivables-factoring";
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

// treasuryPoolTokenAccount sits at byte 80 in GlobalMarketState: discriminator(8) +
// baseTokenMint(32) + lpTokenMint(32) + poolOutstandingCredit(8). Read straight from the
// market states: getTokenAccountsByOwner discovery is heavily throttled on public RPCs,
// while getMultipleAccounts + balance reads on known accounts are not.
const TREASURY_OFFSET = 80;

async function tvl(api) {
  const [fintechState] = await findGlobalMarketStatePDA(MARKET_SEED_FINTECH);
  const [receivablesState] = await findGlobalMarketStatePDA(MARKET_SEED_RECEIVABLES);
  const accounts = await getMultipleAccounts(
    [fintechState.toString(), receivablesState.toString()],
    { api },
  );
  const tokenAccounts = accounts.map((account, i) => {
    if (!account) throw new Error(`credix: missing market state ${i}`)
    if (account.owner.toString() !== programId.toString()) throw new Error(`credix: unexpected program owner for market state ${i}`)
    return new PublicKey(account.data.slice(TREASURY_OFFSET, TREASURY_OFFSET + 32)).toString();
  });
  return sumTokens2({ api, tokenAccounts });
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the USDC balance of the Credix pool treasuries (treasury accounts read from the two on-chain market states). No borrowed figure is reported: the on-chain poolOutstandingCredit ledger ($10.6M) is unrecoverable phantom — inflated by the Aug 2025 admin-wallet exploit (unbacked-mint borrows, SlowMist) and the team has since vanished (CertiK, suspected exit scam), so it is excluded per the post-exploit bad-debt doctrine.',
  solana: {
    tvl,
  },
};

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