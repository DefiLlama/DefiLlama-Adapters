const BigNumber = require("bignumber.js");
const { PublicKey, Connection } = require("@solana/web3.js");
const { parseReserve } = require("./utils");
const { getTokenBalance } = require("../helper/solana");
const { fetchURL } = require('../helper/utils')

const connection = new Connection("https://solana-api.projectserum.com/");
const solendConfigEndpoint = "https://api.solend.fi/v1/config?deployment=production";

async function getCoingeckoId(contract_address) {
  return (await fetchURL(`https://api.coingecko.com/api/v3/coins/solana/contract/${contract_address}`))?.data?.id;
}

async function borrowed() {
  const solendConfig = (await fetchURL(solendConfigEndpoint))?.data;
  const borrowed = {};

  for (const market of solendConfig.markets) {
    for (const reserve of market.reserves) {
      const mintAddress = solendConfig.assets.find(asset => asset.symbol === reserve.asset);
      const coingeckoId = await getCoingeckoId(mintAddress) || reserve.asset;
      const accountInfo = await connection.getAccountInfo(new PublicKey(reserve.address), "processed");
      const parsedReserve = parseReserve(PublicKey.default, accountInfo);
      const amount = new BigNumber(
        parsedReserve.info.liquidity.borrowedAmountWads.toString()
      ).dividedBy(
        new BigNumber(
          `1${Array(parsedReserve.info.liquidity.mintDecimals + 19)
            .fill("")
            .join("0")}`
        )
      );
      if (!borrowed[coingeckoId]) {
        borrowed[coingeckoId] = new BigNumber(0);
      }

      borrowed[coingeckoId] = borrowed[coingeckoId].plus(amount)
    }
  }

  return borrowed;
}

async function tvl() {
  const solendConfig = await fetchURL(solendConfigEndpoint)?.data;
  const tvl = {};

  for (const market of solendConfig.markets) {
    for (const reserve of market.reserves) {
      const mintAddress = solendConfig.assets.find(asset => asset.symbol === reserve.asset);
      const coingeckoId = await getCoingeckoId(mintAddress) || reserve.asset;
      const amount = await getTokenBalance(mintAddress, market.authorityAddress);
      if (!tvl[coingeckoId]) {
        tvl[coingeckoId] = new BigNumber(0);
      }
      tvl[coingeckoId] = tvl[coingeckoId].plus(amount)
    }
  }

  return tvl;
}

module.exports = {
  timetravel: false,
  solana:{
    tvl,
    borrowed
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [[1635940800, "SLND launch"]],
};

