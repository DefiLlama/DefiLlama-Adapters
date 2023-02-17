const BigNumber = require("bignumber.js");
const { PublicKey, } = require("@solana/web3.js");
const { sliceIntoChunks, } = require('../helper/utils')
const { transformBalances, } = require('../helper/portedTokens')
const { sumTokens, getConnection, decodeAccount, } = require("../helper/solana");
const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const solendConfigEndpoint = "https://api.solend.fi/v1/markets/configs?scope=all&deployment=production";

async function borrowed() {
  const markets = (await getConfig('solend', solendConfigEndpoint))
  const connection = getConnection()
  const balances = {};
  const reserves = []

  for (const market of markets)
    for (const reserve of market.reserves)
      reserves.push(new PublicKey(reserve.address))

  const chunks = sliceIntoChunks(reserves, 99)
  for (const chunk of chunks) {
    const infos = await connection.getMultipleAccountsInfo(chunk)
    infos.forEach(i => {
      const { info: { liquidity } } = decodeAccount('reserve', i)
      const amount = new BigNumber(liquidity.borrowedAmountWads.toString() / 1e18).toFixed(0);
      sdk.util.sumSingleBalance(balances, liquidity.mintPubkey.toString(), amount)
    })
  }

  return transformBalances('solana', balances);
}

async function tvl() {
  const markets = (await getConfig('solend', solendConfigEndpoint))
  const tokensAndOwners = []

  for (const market of markets) {
    for (const reserve of market.reserves) {
      tokensAndOwners.push([reserve.liquidityToken.mint, market.authorityAddress])
    }
  }

  return sumTokens(tokensAndOwners);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [
    [1635940800, "SLND launch"],
    [1667826000, "FTX collapse, SOL whale liquidated"],
  ],
};

