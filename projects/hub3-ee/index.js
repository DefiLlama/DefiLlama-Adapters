const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, getProvider, getConnection, } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')

async function _tvl() {
  const provider = getProvider();
  const programId = new PublicKey("2pi53pUUC5S4zyUU6Wrbe6EfYXS9LNcpikpwPFahtQQw");
  const program = new Program(sharesIDL, programId, provider);
  let accounts = await program.account.issuer.all();
  accounts = accounts.filter(i => +i.account.holders > 0)
  accounts.sort((a, b) => +b.account.holders - a.account.holders)
  sdk.log(accounts.length)
  console.log(accounts.slice(0, 10).map(i => i.account.span))
  return sumTokens2({ solOwners: accounts.map(i => i.publicKey) })
}

async function tvl() {
  const programId = new PublicKey("2pi53pUUC5S4zyUU6Wrbe6EfYXS9LNcpikpwPFahtQQw");
  const accounts = await getConnection().getProgramAccounts(programId, {
    filters: [{
      dataSize: 94
    }],
    dataSlice: { offset: 0, length: 1 } // we dont care about the data, just the lamports
  })

  return {
    solana: accounts.reduce((tvl, { account }) => { return tvl + account.lamports / 1e9 }, 0)
  }
}


module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};

const sharesIDL = {
  version: '0.1.0',
  name: 'shares',
  instructions: [],
  accounts: [
    {
      name: 'issuer',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'issuerKey',
            type: 'publicKey'
          },
          {
            name: 'price',
            type: 'u64'
          },
          {
            name: 'totalShares',
            type: 'u64'
          },
          {
            name: 'totalFees',
            type: 'u64'
          },
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'holders',
            type: 'u32'
          },
          {
            name: 'migration',
            type: 'bool'
          },
          {
            name: 'a',
            type: 'u64'
          },
          {
            name: 'b',
            type: 'u64'
          },
          {
            name: 'd',
            type: 'u64'
          }
        ]
      }
    },
  ],
  errors: []
}
//test it
