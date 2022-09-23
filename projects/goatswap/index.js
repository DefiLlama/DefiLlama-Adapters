const { Program } = require("@project-serum/anchor");
const { getProvider, getSolBalances, } = require("../helper/solana");
const {
  PublicKey,
} = require("@solana/web3.js");
const programId = 'Goats192jeQq3r2sn8pe69LyJtisLMfEoq8LyDienct1';

function getPoolAuthority(pool) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pair_authority"),
    pool.toBuffer()],
    new PublicKey(programId)
  )[0].toString()
}

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const accounts = await program.account.pair.all()
  const poolAuthorities = accounts.map(i => getPoolAuthority(i.publicKey))
  return {
    solana: await getSolBalances(poolAuthorities)
  }
}

module.exports = {
  methodology: 'Add all the SOL in the pools, NFT value is not included in tvl',
  timetravel: false,
  solana: {
    tvl,
  },
};

const idl = {
  version: '0.1.0',
  name: 'goatswap',
  instructions: [],
  accounts: [
    {
      name: 'pair',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'owner',
            type: 'publicKey'
          },
          {
            name: 'collection',
            type: 'publicKey'
          },
          {
            name: 'poolType',
            type: {
              defined: 'PoolType'
            }
          },
          {
            name: 'bondingCurve',
            type: {
              defined: 'BondingCurve'
            }
          },
          {
            name: 'spotPrice',
            type: 'u64'
          },
          {
            name: 'delta',
            type: 'u64'
          },
          {
            name: 'feeBps',
            type: 'u32'
          },
          {
            name: 'assetRecipient',
            type: {
              option: 'publicKey'
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'BondingCurve',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Linear'
          },
          {
            name: 'Exponential'
          }
        ]
      }
    },
    {
      name: 'PoolType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Token'
          },
          {
            name: 'Nft'
          },
          {
            name: 'Trade'
          }
        ]
      }
    }
  ],
  errors: []
}