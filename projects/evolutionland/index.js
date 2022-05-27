const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')


const gold = {
  "ethereum": "0x358dBA28848cca268BA8a76B65E5b3eF9Ef92238",
  "heco": "0xFB371c8B99ba0b239E66E0a66bB6296b00dCD09f",
  "polygon": "0x56746a8099a7e6D962802A23e01FeDdc1282cDAe",
  "crab": "0x701A7d67B824D1Bc713FC5E77bE1C475Ec93106d",
}
const wood = {
  "ethereum": "0xD4B784Ae5c12153D11Ca55853d832D2a2D514a08",
  "heco": "0xcA3749C8C3aF04278D596a3fBe461481B6aa1b01",
  "polygon": "0xe97C7F83ec91E29569f1a08De95ad3Bb0e8B6B3A",
  "crab": "0xbA91F2d6d78953881A912f3DF71a541cD30eb980",
}
const hoo = {
  "ethereum": "0x19E22a73A046f19eCB51a46ACe4cA7A4bB7c20c6",
  "heco": "0x56746a8099a7e6D962802A23e01FeDdc1282cDAe",
  "polygon": "0x81989cD57271565DBFfe9807E917Afc098B30c9A",
  "crab": "0x54Eb408696E6b3Cc1795Caaf53B22F38F24200Fa",
}
const fire = {
  "ethereum": "0x8469A695D70033EcD170c82BE1253842162AA77e",
  "heco": "0xe97C7F83ec91E29569f1a08De95ad3Bb0e8B6B3A",
  "polygon": "0x8216981a3eF2b45C705119644D0D48AcF7d14472",
  "crab": "0xEd969c03e8881371754231FE1C8f1D4fE4AF2082",
}
const sioo = {
  "ethereum": "0x1320994fA466E19F17b143995999C7275EAe50E1",
  "heco": "0x81989cD57271565DBFfe9807E917Afc098B30c9A",
  "polygon": "0x2D8822a54fe8966891cEF3aC5A29d3B916393739",
  "crab": "0x9AC045F4B69C2DB58fDF70D4bEF8228ef5A2C5a8",
}
const ring = {
  "ethereum": "0x9469D013805bFfB7D3DEBe5E7839237e535ec483",
  "heco": "0x15e65456310ecb216B51EfBd8a1dBf753353DcF9",
  "polygon": "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
  "crab": "0x7399Ea6C9d35124d893B8d9808930e9d3F211501",
}
const weth = {
  "ethereum": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "heco": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F",
  "polygon": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  "crab": "0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329",
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

async function crabTvl(timestamp, blocks) {
  let block = blocks["crab"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "crab" }))
      .block;
  }
  const lps = [
    {
      "target": ring.crab,
      "params": lpGOLD.crab
    },
    {
      "target": ring.crab,
      "params": lpWOOD.crab
    },
    {
      "target": ring.crab,
      "params": lpHOO.crab
    },
    {
      "target": ring.crab,
      "params": lpFIRE.crab
    },
    {
      "target": ring.crab,
      "params": lpSIOO.crab
    },
    {
      "target": ring.crab,
      "params": lpETH.crab
    },
  ]
  let balances = await stakingBalanceTvl(timestamp, block, "crab", lps)
  balances[ring.ethereum] = balances[ring.crab] + '000000000'
  delete balances[ring.crab]
  return balances
}

async function polygonTvl(timestamp, blocks) {
  let block = blocks["polygon"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "polygon" }))
      .block;
  }
  const lps = [
    {
      "target": ring.polygon,
      "params": lpGOLD.polygon
    },
    {
      "target": ring.polygon,
      "params": lpWOOD.polygon
    },
    {
      "target": ring.polygon,
      "params": lpHOO.polygon
    },
    {
      "target": ring.polygon,
      "params": lpFIRE.polygon
    },
    {
      "target": ring.polygon,
      "params": lpSIOO.polygon
    },
    {
      "target": ring.polygon,
      "params": lpETH.polygon
    },
  ]
  let balances = await stakingBalanceTvl(timestamp, block, "polygon", lps)
  balances[ring.ethereum] = balances[ring.polygon]
  delete balances[ring.polygon]
  return balances
}

async function hecoTvl(timestamp, blocks) {
  let block = blocks["heco"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  }
  const lps = [
    {
      "target": ring.heco,
      "params": lpGOLD.heco
    },
    {
      "target": ring.heco,
      "params": lpWOOD.heco
    },
    {
      "target": ring.heco,
      "params": lpHOO.heco
    },
    {
      "target": ring.heco,
      "params": lpFIRE.heco
    },
    {
      "target": ring.heco,
      "params": lpSIOO.heco
    },
    {
      "target": ring.heco,
      "params": lpETH.heco
    },
  ]
  let balances = await stakingBalanceTvl(timestamp, block, "heco", lps)
  balances[ring.ethereum] = balances[ring.heco]
  delete balances[ring.heco]
  return balances
}

async function ethTvl(timestamp, blocks) {
  let block = blocks["ethereum"];

  const lps = [
    {
      "target": ring.ethereum,
      "params": lpGOLD.ethereum
    },
    {
      "target": ring.ethereum,
      "params": lpWOOD.ethereum
    },
    {
      "target": ring.ethereum,
      "params": lpHOO.ethereum
    },
    {
      "target": ring.ethereum,
      "params": lpFIRE.ethereum
    },
    {
      "target": ring.ethereum,
      "params": lpSIOO.ethereum
    },
    {
      "target": ring.ethereum,
      "params": lpETH.ethereum
    },
    {
      "target": weth.ethereum,
      "params": lpETH.ethereum
    },
  ]
  return await stakingBalanceTvl(timestamp, block, "ethereum", lps)
}

async function stakingBalanceTvl(timestamp, block, chain, lps) {

  const balancesOfResult = await sdk.api.abi.multiCall({
    calls: lps.map((lp) => ({
      target: lp.target,
      params: lp.params
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  let balances = {}
  sdk.util.sumMultiBalanceOf(balances, balancesOfResult);
  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  heco: {
    tvl: hecoTvl
  },
  polygon: {
    tvl: polygonTvl
  },
  crab: {
    tvl: crabTvl
  },
}
