const sdk = require('@defillama/sdk')
const _ = require('underscore');

const gold = {
  "eth": "0x358dBA28848cca268BA8a76B65E5b3eF9Ef92238",
  "heco": "0xFB371c8B99ba0b239E66E0a66bB6296b00dCD09f",
  "polygon": "0x56746a8099a7e6D962802A23e01FeDdc1282cDAe",
}
const wood = {
  "eth": "0xD4B784Ae5c12153D11Ca55853d832D2a2D514a08",
  "heco": "0xcA3749C8C3aF04278D596a3fBe461481B6aa1b01",
  "polygon": "0xe97C7F83ec91E29569f1a08De95ad3Bb0e8B6B3A",
}
const hoo = {
  "eth": "0x19E22a73A046f19eCB51a46ACe4cA7A4bB7c20c6",
  "heco": "0x56746a8099a7e6D962802A23e01FeDdc1282cDAe",
  "polygon": "0x81989cD57271565DBFfe9807E917Afc098B30c9A",
}
const fire = {
  "eth": "0x8469A695D70033EcD170c82BE1253842162AA77e",
  "heco": "0xe97C7F83ec91E29569f1a08De95ad3Bb0e8B6B3A",
  "polygon": "0x8216981a3eF2b45C705119644D0D48AcF7d14472",
}
const sioo = {
  "eth": "0x1320994fA466E19F17b143995999C7275EAe50E1",
  "heco": "0x81989cD57271565DBFfe9807E917Afc098B30c9A",
  "polygon": "0x2D8822a54fe8966891cEF3aC5A29d3B916393739",
}
const ring = {
  "eth": "0x9469D013805bFfB7D3DEBe5E7839237e535ec483",
  "heco": "0x15e65456310ecb216B51EfBd8a1dBf753353DcF9",
  "polygon": "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
}
const weth = {
  "eth": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "heco": "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F",
  "polygon": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
}

const lpGOLD = {
  "eth": "0x9504b4A2d5f2E88fD9a5D30AEe307573EA03Bea0",
  "heco": "0x8C318CD47D8DD944d969307B1249062197267564",
  "polygon": "0x2D489AeA7b643B49108dffd948891A4D88040ef1",
}
const lpWOOD = {
  "eth": "0xf79e6890D3B78b5E04Ad405376C1064e3DAb0d85",
  "heco": "0x2Fbe5228a08260DB7bFed841cd4b340C88E13b9A",
  "polygon": "0x9686f71715134ccB38367849c049A58f6552C668",
}
const lpHOO = {
  "eth": "0xdf2cdD051EF8835b25231f61dCeb5DF5F3A27274",
  "heco": "0xc8f8ba346781447a3e060eE913f56C2323fa83E5",
  "polygon": "0x98b0e9849D610394a29a0FC33476cA497315f1c3",
}
const lpFIRE = {
  "eth": "0xd446E044d62392afED6bA4a40a0Ac8bdB0d91F07",
  "heco": "0xDD6F102f7044f5a8635AA9DaAC1483C5ce5265A3",
  "polygon": "0x90e3653a7aDb60E9184622B640dBf0A6EDA06858",
}
const lpSIOO = {
  "eth": "0x31BF5eaA7C761871c83d9748b00a2277657cD6f5",
  "heco": "0x31BF5eaA7C761871c83d9748b00a2277657cD6f5",
  "polygon": "0xA1b2216DB6Dbb4fCead88180b753dA0EcC42b626",
}
const lpETH = {
  "eth": "0xa32523371390b0cc4e11f6bb236ecf4c2cdea101",
  "heco": "0x55C643AcA8b4cBaB1dBA05393fc0687bFbb9A98d",
  "polygon": "0x610A9007FD86C960ccB717783f88347A2c154D4E",
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
  return await stakingBalanceTvl(timestamp, block, "polygon", lps)
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
  return await stakingBalanceTvl(timestamp, block, "heco", lps)
}

async function ethTvl(timestamp, blocks) {
  let block = blocks["ethereum"];

  const lps = [
    {
      "target": ring.eth,
      "params": lpGOLD.eth
    },
    {
      "target": ring.eth,
      "params": lpWOOD.eth
    },
    {
      "target": ring.eth,
      "params": lpHOO.eth
    },
    {
      "target": ring.eth,
      "params": lpFIRE.eth
    },
    {
      "target": ring.eth,
      "params": lpSIOO.eth
    },
    {
      "target": ring.eth,
      "params": lpETH.eth
    },
    {
      "target": weth.eth,
      "params": lpETH.eth
    },
  ]
  let ethBal = await stakingBalanceTvl(timestamp, block, "ethereum", lps)
  let hecoBal = await hecoTvl(timestamp, blocks)
  sdk.util.sumSingleBalance(ethBal, ring.eth, hecoBal[ring.heco])
  return ethBal
}

async function stakingBalanceTvl(timestamp, block, chain, lps) {

  const balancesOfResult = await sdk.api.abi.multiCall({
    calls: _.map(lps, (lp) => ({
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
  tvl: sdk.util.sumChainTvls([ethTvl, hecoTvl, polygonTvl])
}
