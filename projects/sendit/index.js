const { sumTokens2, decodeAccount, getMultipleAccounts, } = require("../helper/solana");
const { getConfig } = require('../helper/cache')
const { PublicKey } = require("@solana/web3.js");

const senditConfigEndpoint = "https://backend.sendit.fun/api/accounts/assets?limit=1000";
const senditProgramId = new PublicKey("SenditXmUCHPeV6iyFoMY8dRNB4PofGKTfp52hEWpJx")

async function borrowed(api) {
  const response = (await getConfig('sendit', senditConfigEndpoint))
  const assets = response.data.assets
  const reserves = []

  for (const asset of assets) {
    for (const market of asset.markets) {
      reserves.push(market.solReserve.address)
      reserves.push(market.nonSolReserve.address)
    }
  }

  const infos = await getMultipleAccounts(reserves)
  infos.forEach(i => {
    const reserve = decodeAccount('senditReserve', i)
    const amount = reserve.liquidityBorrowedAmountWads.toString() / 1e18
    api.add(reserve.liquidityMintPubkey.toString(), amount)
  })
}

async function tvl() {
  const response = (await getConfig('sendit', senditConfigEndpoint))
  const assets = response.data.assets
  const markets = []
  
  for (const asset of assets) {
    for (const market of asset.markets) {
      markets.push({ lendingMarketId: market.lendingMarketId })
    }
  }
  
  return sumTokens2({ owners: markets.map(i => PublicKey.findProgramAddressSync([new PublicKey(i.lendingMarketId).toBuffer()], senditProgramId)[0]) });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted.",
};

