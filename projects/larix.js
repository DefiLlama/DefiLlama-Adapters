const { getConnection, decodeAccount, } = require("./helper/solana");
const { PublicKey, } = require("@solana/web3.js");
const sdk = require('@defillama/sdk');
let programs = {
  main: '7Zb1bGi32pfsrBkzWdqd4dFhUXwp5Nybr1zuaEwN34hy',
  bonfida: '3cKREQ3Z7ioCQ4oa23uGEuzekhQWPxKiBEZ87WfaAZ5p',
  xsol: '3cKREQ3Z7ioCQ4oa23uGEuzekhQWPxKiBEZ87WfaAZ5p',
  larix: '3cKREQ3Z7ioCQ4oa23uGEuzekhQWPxKiBEZ87WfaAZ5p',
  stepn: '3cKREQ3Z7ioCQ4oa23uGEuzekhQWPxKiBEZ87WfaAZ5p',
  step: '3cKREQ3Z7ioCQ4oa23uGEuzekhQWPxKiBEZ87WfaAZ5p',
}

let allData

async function getAllData() {
  if (!allData) allData = _getAllData()
  return allData

  async function _getAllData() {
    const balances = {
      tvl: {},
      borrowed: {},
    }
    const data = []
    const connection = getConnection()
    programs = [...new Set(Object.values(programs))]
    for (const program of programs) {
      const accounts = await connection.getProgramAccounts(new PublicKey(program), {
        filters: [{
          dataSize: 873
        }]
      })
      data.push(...accounts.map(i => decodeAccount('larixReserve', i.account)))
    }
    
    const tokenAccounts = []
    data.forEach(({ liquidity: { mintPubkey, borrowedAmountWads, supplyPubkey, availableAmount, } }) => {
      tokenAccounts.push(supplyPubkey)
      sdk.util.sumSingleBalance(balances.tvl, mintPubkey.toString(), availableAmount, 'solana')
      sdk.util.sumSingleBalance(balances.borrowed, mintPubkey.toString(), borrowedAmountWads / 1e18, 'solana')
    })
    return balances
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl: async () => (await getAllData()).tvl,
    borrowed: async () => (await getAllData()).borrowed,
  },
};