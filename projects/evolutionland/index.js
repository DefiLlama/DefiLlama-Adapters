const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const ring = {
  "ethereum": "0x9469D013805bFfB7D3DEBe5E7839237e535ec483",
  "heco": "0x15e65456310ecb216B51EfBd8a1dBf753353DcF9",
  "polygon": "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
  "crab": "0x7399Ea6C9d35124d893B8d9808930e9d3F211501",
}
const weth = {
  "ethereum": ADDRESSES.ethereum.WETH,
  "heco": ADDRESSES.heco.WHT,
  "polygon": ADDRESSES.polygon.WMATIC_2,
  "crab": ADDRESSES.crab.WCRAB,
}

const lpGOLD = {
  "ethereum": "0x9504b4A2d5f2E88fD9a5D30AEe307573EA03Bea0",
  "heco": "0x8C318CD47D8DD944d969307B1249062197267564",
  "polygon": "0x2D489AeA7b643B49108dffd948891A4D88040ef1",
  "crab": "0x8e97f45bD127E7af3034d82a34d665746d348841",
}
const lpWOOD = {
  "ethereum": "0xf79e6890D3B78b5E04Ad405376C1064e3DAb0d85",
  "heco": "0x2Fbe5228a08260DB7bFed841cd4b340C88E13b9A",
  "polygon": "0x9686f71715134ccB38367849c049A58f6552C668",
  "crab": "0x3710F045307d7e0906F1Fbd0B0dF12c0Bc787382",
}
const lpHOO = {
  "ethereum": "0xdf2cdD051EF8835b25231f61dCeb5DF5F3A27274",
  "heco": "0xc8f8ba346781447a3e060eE913f56C2323fa83E5",
  "polygon": "0x98b0e9849D610394a29a0FC33476cA497315f1c3",
  "crab": "0xdb279D65225162280fACae2F3Ca8A3D2F63ea9BF",
}
const lpFIRE = {
  "ethereum": "0xd446E044d62392afED6bA4a40a0Ac8bdB0d91F07",
  "heco": "0xDD6F102f7044f5a8635AA9DaAC1483C5ce5265A3",
  "polygon": "0x90e3653a7aDb60E9184622B640dBf0A6EDA06858",
  "crab": "0x15f2fBD98a0657e2afcAB08922632e58B1cC9FdD",
}
const lpSIOO = {
  "ethereum": "0x31BF5eaA7C761871c83d9748b00a2277657cD6f5",
  "heco": "0x31BF5eaA7C761871c83d9748b00a2277657cD6f5",
  "polygon": "0xA1b2216DB6Dbb4fCead88180b753dA0EcC42b626",
  "crab": "0x1E4b46582bbA7E5Ddb107d3a640e441774980525",
}
const lpETH = {
  "ethereum": "0xa32523371390b0cc4e11f6bb236ecf4c2cdea101",
  "heco": "0x55C643AcA8b4cBaB1dBA05393fc0687bFbb9A98d",
  "polygon": "0x610A9007FD86C960ccB717783f88347A2c154D4E",
  "crab": "0xF157c9393255Db1728bC6483c3545Ca8a1655a0F",
}

async function tvl(api) {
  const owners = [lpETH].map(i => i[api.chain])
  const balances = await sumTokens2({ api, owners, tokens: [weth[api.chain]] })
  const owners1 = [lpGOLD, lpWOOD, lpHOO, lpFIRE, lpSIOO, lpETH].map(i => i[api.chain])
  return sumTokens2({ balances, api, owners: owners1, tokens: [ring[api.chain]], transformAddress: i => ring.ethereum })
}

module.exports = {};

['ethereum', 'polygon', 'heco', 'crab'].forEach(chain => {
  module.exports[chain] = { tvl }
})