const BN = require("bn.js");
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const ORACLE_REGISTRY_CONTRACT = '0x6A96Db69c0FAAe20998247FAE7E79b04BFdc4DB5';

const contracts = [
  "0x35b5129e86EBE5Fd00b7DbE99aa202BE5CF5FA04", // Champfleury Contract
].map(i => i.toLowerCase())

const blacklistedOwners = [
]

// `api` is an injected `sdk.ChainApi` object with which you can interact with
// a given chain through `call/multiCall/batchCall` method based on your need,
// also stores tvl balances
async function tvl(api) {
  let tokens = [...contracts]
  console.log("🚀 ~ tvl ~ tokens:", tokens)

  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })

  console.log("🚀 ~ tvl ~ supplies:", supplies)

  // const res = await sumTokens2({ api, tokens, owners: blacklistedOwners, balances, transformAddress: i => i})

  const oracles = await api.multiCall({
    calls: tokens.map(token => ({
      target: ORACLE_REGISTRY_CONTRACT,
      params: [token]
    })),
    abi: abi.getOracle,
    withMetadata: true,
  });

  console.log("🚀 ~ tvl ~ oracles:", oracles)

  const values = await api.multiCall({
    calls: oracles.map(oracle => ({
      target: oracle.output
    })),
    abi: abi.latestAnswer,
    withMetadata: true,
  });

  console.log("🚀 ~ tvl ~ values:", values)

  const PRECISION = new BN(100_000_000);

  values.forEach((value, i) => {
    console.log("🚀 ~ values.forEach ~ i:", i)
    console.log("🚀 ~ values.forEach ~ value.output:", value.output)
    console.log("🚀 ~ values.forEach ~ supplies[i]:", supplies[i])
    console.log("🚀 ~ values.forEach ~ tokens[i]:", tokens[i])
    const precise_value = new BN(supplies[i]).mul(new BN(value.output)).div(PRECISION).toNumber()
    console.log("🚀 ~ values.forEach ~ precise_value:", precise_value)
    api.add(tokens[i], precise_value)
    // api.addTokens(tokens[i], precise_value)
  });

  return sumTokens2({ api })
}

const chains = ["base"]

chains.forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})

