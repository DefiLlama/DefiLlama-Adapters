
const { Kamino } = require('@hubbleprotocol/kamino-sdk')
const { sleep } = require('../helper/utils')
const { getConnection, } = require('../helper/solana')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")
const strategyList = [
  "Cfuy5T6osdazUeLego5LFycBQebm9PP3H7VNdCndXXEN",
  "ByXB4xCxVhmUEmQj3Ut7byZ1Hbva1zhKjaVcv3jBMN7E",
  "98kNMp1aqWoYAaUU8m5REBAYVwhFb4aX9yoSpgq8kUFu",
  "FshxiQWH1kTya19d186VyCSLT8PAVKn6wpVU4wP26S2M",
  "CofEPsAoV6bdn7guCPHhmb5nJ1xmnhZ4Ha2zZVx14Ppb",
  "A4ufgHTe3jLzxbR6sDdrZhLxNdR1Lw2ija1uEdDFLPbX",
  "CYLt3Bs51QT3WeFhjtYnPGZNDzdd6SY5vfUMa86gT2D8",
  "7KqB3vRJQDdGwK7ewiDpAxXpTeMmgGicdDdbftQH41XC",
  "BfyQYYr2T9eJfMfq5gPXcq3SUkJSh2ahtk7ZNUCzkx9e",
  "3w1MiUh6Nn4YJLue8Ut8uwonKvFupLKve9nifDaicBf2",
  "9zBNQtnenpQY6mCoRqbPpeePeSy17h34DZP82oegt1fL",
  "2VQaDuSqqxeX2h9dS9WgpvN6ShaBxd8JjaaWEvbmTDY1",
  "F3v6sBb5gXL98kaMkaKm5GfEoBNUaSd3ZGErbjqgzTho",
  "8NP2J7q6swBkVoLDZAqkejKPQrWkRizZHaVVM897CKpA",
  "5EfeGn1h7m6Rx9mGEmamDoxMtdhRmUh2N9fYRiDQqteS",
  "HWg7yB3C1BnmTKFMU3KGD7E96xx2rUhv4gxrwbZLXHBt",
  "8XgX1EkSHC43mwdaUCZeXL2JVFz15JJynFrcxrQa3jss"
  
  // "HoqXSSbQGZS8o6fTqtfn9d14FVCm9WiuRB13zbHNKs7d",
  // "Agz8ExDrjd7UqjACotmw6XhKgXsjhnufza9Nfn6C7Ktx",
]

async function tvl() {
  const kamino = new Kamino('mainnet-beta', getConnection());

  // get all strategies supported by Kamino 
  const strategies = await kamino.getStrategies(strategyList.map(i => new PublicKey(i)));
  sdk.log('strategies count:', strategies.length)
  const sBalances = []

  const { errors } = await PromisePool
    .withConcurrency(3)
    .for(strategies)
    .process(async s => {
      sBalances.push(await kamino.getStrategyBalances(s))
      await sleep(1000)
    })

  if (errors && errors.length)
    throw errors[0]

  return {
    tether: sBalances.reduce((a, i) => a + +i.computedHoldings.totalSum, 0)
  };
}

module.exports = {
  solana: { tvl },
};
