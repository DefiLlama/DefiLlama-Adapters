
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2, getConnection, decodeAccount, } = require("../helper/solana")
const { Program, } = require("@project-serum/anchor");

async function tvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  const tokenAccounts = []
  const owners= []
  await getClassicMarketTokenAccounts()
  await addP2PBalances()
  await addParlay()
  // await addParimutuel()

  const balances = api.getBalances()
  await sumTokens2({ owners, balances, })
  return sumTokens2({ tokenAccounts, balances, })

  async function getClassicMarketTokenAccounts() {

    const classicMarketProgramId = "D8vMVKonxkbBtAXAxBwPPWyTfon8337ARJmHvwtsF98G"
    const idl = await Program.fetchIdl(classicMarketProgramId, provider)

    const program = new Program(idl, classicMarketProgramId, provider)
    const markets = await program.account.market.all()
    const collateralAccounts = markets.map(({ account }) => account.marketCollateral)
    tokenAccounts.push(...collateralAccounts)
  }

  async function addParlay() {
    const programId = new PublicKey('PLYaNRbQs9GWyVQdcLrzPvvZu7NH4W2sneyHcEimLr7')
    const poolOwner = "8Y46GkrbUqXnbs6kPD6SWr44NjcKPEWYzvpAn8UB5duR"
    owners.push(poolOwner)

    const accounts = await connection.getProgramAccounts(programId, {
      // We only care about:
      // - mint address (69..101)
      // - entry count (101..105)
      // - entry cost (105..113)
      dataSlice: { offset: 69, length: 44 },
      filters:  [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4" } },
        // Open markets have a state of 0 at offset 149.
        { memcmp: { offset: 149, bytes: "1" } },
      ],
    })

    accounts.forEach(({ account }) => {
      const data = decodeAccount('hhParlay', account)

      api.add(data.mint.toString(), Number(data.entryCount) * Number(data.entryCost))
    })
  }

  async function addP2PBalances() {
    // https://github.com/Hedgehog-Markets/hedgehog-program-library/blob/master/p2p/idl.json
    const programId = new PublicKey('P2PzLraW8YF87BxqZTZ5kgrfvzcrKGPnqUBNhqmcV9B')
    const poolOwner = "J9EH18EWSo8s69gouHGNy5zFHkhcHRbb9zBZXwSG4cHy"
    owners.push(poolOwner)

    const accounts = await connection.getProgramAccounts(programId, {
      // We only care about:
      // - mint address (73..105)
      // - yes amount (113..121)
      // - no amount (121..129)
      dataSlice: { offset: 69, length: 56 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4",  } },
        // Open markets have a state of 0 at offset 129.
        { memcmp: { offset: 129, bytes: "1"} },
      ],
    });

    accounts.forEach(({ account: { data } }) => {
      const mint = new PublicKey(data.slice(0,  32)).toString()
      const yesAmount = Number(data.readUInt8(40));
      const noAmount = Number(data.readUInt8(48));
      api.add(mint, yesAmount + noAmount)
    })
  }


  async function addParimutuel() {
    const programId = new PublicKey('PARrVs6F5egaNuz8g6pKJyU4ze3eX5xGZCFb3GLiVvu')
    const poolOwner = "3SAUPiGiATqv8TBgvzSJqpLxLGF6LbJamvimueJQT7WT"
    owners.push(poolOwner)

    const accounts = await connection.getProgramAccounts(programId, {
      dataSlice: { offset: 69, length: 70 },
      filters:  [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0, bytes: "4" } },
        // Open markets have a state of 0 at offset 149.
        { memcmp: { offset: 149, bytes: "1" } },
      ],
    })

    accounts.forEach(({ account }) => {
      const data = decodeAccount('hhPari', account)
      const token  = data.mint.toString()
      const amounts = data.amounts.map(Number)
      api.add(token, amounts)
    })
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL consists of deposits made into Hedgehog Markets.",
};
