const { sumTokensExport } = require('../helper/sumTokens')
const { getTokensMinted, getAssets } = require("../helper/chain/cardano/blockfrost");

const cBTC = "4190b2941d9be04acc69c39739bd5acc66d60ccab480d8e20bc87e3763425443"

// holds 10.1k cBTC minted 2026-08-04
const UNBACKED_MINT_ADDRESSES = [
  "addr1qypuy75x8hfvxy27t35ren9shh9nyv8wuz39hz95ffen2v867ejhnsmmcpccmmttah2jcluxspmrrnsqwdkm7f0wqv8srtjkn3",
  "addr1w99tz7huen9td2svkzar054wymckga4z7vhraeldllkpdcsfrxn64",
  "addr1w99tz7hungv6furtdl3zn72sree86wtghlcr4jc637r2eagr7ycqd"
]


async function tvl(){
  const minted = await getTokensMinted(cBTC)
  const balances = (await Promise.all(UNBACKED_MINT_ADDRESSES.map(addr => getAssets(addr)))).flat()
  const excluded = balances
    .filter(a => a.unit === cBTC)
    .reduce((sum, a) => sum + Number(a.quantity), 0)
  return { bitcoin : (minted - excluded) / 100_000_000 }
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking: sumTokensExport({ tokens: ['b34b3ea80060ace9427bda98690a73d33840e27aaa8d6edb7f0c757a634e455441'], owner: 'addr1w8p79rekquuw5kmdg4z36y9gpnm88k5huddwqluk9mjjeqgc3xmss', logCalls: true })
  },
  ergo: {
    staking: sumTokensExport({ tokens: ['472c3d4ecaa08fb7392ff041ee2e6af75f4a558810a74b28600549d5392810e8'], owner: '5ASYVJ2w8tH3bDQx5ZLz6rZUdokD1kmTXSRZ8GfrsAUW4vqy9eg5omtTYVzY22ibHANf7GgSc2E5FiThgo8qXzWpU3RDLohN277hksbAf9yykajXbYPUaXUeMPfSXbS1GdE4y2GoYKaXHR3H57MV5CDZE58YteqWe3XVXzmMvj1192AD7UZ1N6nguRfjgijxEWTrLq2ZrykjRAut2JBGYHanAKn46tYWW3chpxNosXG7ZW2ShDzKju2ttHhfxeZVMBydryuoEya5E9KVagjsfa9E2qPUdLpbh8enppVWcwoQ4GF1ktgzSX32QbfKhfpD23iWQixThUbcCca14FjXDt94GVFPuhAT5tQyiKen863Cq5eRAEgsQ7otX6pWa32Q28sxSF9Az4abwiJKNbFhbhb3cDCs6A45ZnW6aB6AkfwTJSAZ2ZzqqG7LXT4HdxNpdmiwno9sJWxPf2PC4vRhVqBPdxxyCgoodjyutf4UuinSCibhfqdhUJLc1JM8zX9UcD699mChgUZoKE8kXD4soVGSgQD3qfGXC6RP7n8dtowArNLm3H5QJ3EobDCbEgECLHFaHN2BPwwWscAt5eejKeFvkp3CuQ3mqFW7vfQG4n9tTLnshj8cjxnpkBdfFKC83sW8A3AoZAX4K1UrhndfLSFh4w', logCalls: true })
  }
}