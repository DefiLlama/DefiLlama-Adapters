const { sumTokens2 } = require('../helper/unwrapLPs')

const sablierAddresses = {
  "v1.0.0": "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a",
  "v1.1.0": "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
};

// tokens fetched used this query: https://api.thegraph.com/subgraphs/name/sablierhq/sablier/graphql?query=query+AllTokens+%7B%0A++++++++++++++++++++tokens+%28first%3A1000%29%7B%0A++++++++++++++++++++id%0A++++++++++++++++++++++symbol%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D
const whitelistedTokens = {
  "TUSD": "0x0000000000085d4780b73119b644ae5ecd22b376",
  "RAI": "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
  "UNI-V2": "0x7d611e4cf1c7b94561c4caa5602f329d108336e3",
  "UNI-V2-1": "0x065a489b2da5d239407c04f5bc8cf67e0f1df40f",
  "UNI-V2-2": "0x1e9ed2a6ae58f49b3f847eb9f301849c4a20b7e3",
  "UNI-V2-3": "0x3bf862093cbb6412b6ee498f4d652bba005aa7f3",
  "UNI-V2-4": "0xe77f9daf52e2eec41a1ac70fcae81a99fe056f0b",
  "WBTC": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "SLP": "0xc3f279090a47e80990fe3a9c30d24cb117ef91a8",
  "SLP-1": "0xc7ff546c6cbc87ad9f6f557db5a0df5c742ca440",
  "ScUSDC": "0x391a437196c81eea7bbbbd5ed4df6b49de4f5c96",
  "cUSDC": "0x39aa39c021dfbae8fac545936693ac917d5e7563",
  "iDAI": "0x493c57c4763932315a328269e1adad09653b9081",
  "stkAAVE": "0x4da27a545c0c5b758a6ba100e3a049001de870f5",
  "FTM": "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
  "LINK": "0x514910771af9ca656af840dff83e8264ecf986ca",
  "yUSDC": "0x597ad1e0c13bfe8025993d9e79c69e1c0233522e",
  "ETHA": "0x59e9261255644c411afdd00bd89162d09d862e38",
  "cDAI": "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
  "DAI": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
  "MATIC": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
  "AAVE": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
  "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "UST": "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
  "stETH": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
  "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "COMP": "0xc00e94cb662c3520282e6f5717214004a7f26888",
  "USD": "0xd233d1f6fd11640081abb8db125f722b5dc729dc",
  "USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "mUSD": "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
  "iUSDC": "0xf013406a0b1d544238083df0b93ad0d2cbe0f65f",
  "aDAI": "0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d",
}

async function tvl(timestamp, block) {
  return sumTokens2({
    block,
    owners: Object.values(sablierAddresses),
    tokens: Object.values(whitelistedTokens),
  })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-01') / 1e3), 'Vested tokens are no longer included in tvl'],
  ],
  start: 1573582731,
  ethereum: { tvl }
};