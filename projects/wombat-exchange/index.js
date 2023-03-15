const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

let pools = {
  mainPool: '0x312bc7eaaf93f1c60dc5afc115fccde161055fb0',
  bnbPool: '0x0029b7e8e9eD8001c868AA09c74A1ac6269D4183',
  sidePool: '0x0520451B19AD0bb00eD35ef391086A692CFC74B2',
  wmxWom: '0xeEB5a751E0F5231Fc21c7415c4A4c6764f67ce2e',
  mWOM: '0x083640c5dBD5a8dDc30100FB09B45901e12f9f55',
  qWOM: '0x2c5464b9052319e3d76f8279031f04e4B7fd7955',
  Innovation: '0x48f6A8a0158031BaF8ce3e45344518f1e69f2A14',
  BNBx: '0x8df1126de13bcfef999556899F469d64021adBae',
  stkBNB: '0xB0219A90EF6A24a237bC038f7B7a6eAc5e01edB0',
  iUSD: '0x277E777F7687239B092c8845D4d2cd083a33C903',
  CUSD: '0x4dFa92842d05a790252A7f374323b9C86D7b7E12',
  axlUSDC: '0x8ad47d7ab304272322513eE63665906b64a49dA2',
  USDD: '0x05f727876d7C123B9Bb41507251E2Afd81EAD09A',
  BOB: '0xeA6cDd9e8819BbF7f8791E7D084d9F0a6Afa7892',
  frxETH: '0x2Ea772346486972E7690219c190dAdDa40Ac5dA4'
}

async function tvl(_t, _, { bsc: block }, { api }) {
  pools = Object.values(pools)
  let allUnderlying = await api.multiCall({  abi: 'address[]:getTokens', calls: pools })

  const tokens = []
  const calls = []
  pools.forEach((v, i) => {
    allUnderlying[i].forEach(t => {
      tokens.push(t)
      calls.push({ target: v, params: t})
    })
  })
  const wTokens = await api.multiCall({  abi: 'function addressOfAsset(address) view returns (address)', calls }) 

  return sumTokens2({ api, tokensAndOwners: tokens.map((v, i) => [v, wTokens[i]])})
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(
      "0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc",
      "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1",
      "bsc"
    ),
  },
  hallmarks: [
    [1662417125, "Liquidity Mining Start"],
    [1663120800, "Staking Pool Start"],
    [1663725600, "Side Pool Start"],
  ],
};
