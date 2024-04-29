const ADDRESSES = require('../helper/coreAssets.json')
const {nullAddress, sumTokens2} = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const contracts = {
  stark: '0x5d22045daceab03b158031ecb7d9d06fad24609b',
  arbiBridge: '0x10417734001162Ea139e8b044DFe28DbB8B28ad0',
  polyBridge: '0xBA4EEE20F434bC3908A0B18DA496348657133A7E',
  polySmartWallet: '0xda7EeB4049dA84596937127855B50271ad1687E7',
  bscBridge: '0xB80A582fa430645A043bB4f6135321ee01005fEf',
  bscSmartWallet: '0xCA8E436347a46502E353Cc36b58FE3bB9214D7Fd'
};

const listedTokens = [
  nullAddress,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.DAI,
  '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
  '0x940a2db1b7008b6c776d4faaca729d6d4a4aa551',
  ADDRESSES.ethereum.YFI,
  ADDRESSES.ethereum.MKR,
  ADDRESSES.ethereum.WBTC,
  '0xe41d2489571d322189246dafa5ebde1f4699f498',
  '0xcc80c051057b774cd75067dc48f8987c4eb97a5e',
  ADDRESSES.ethereum.USDC,
  '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  ADDRESSES.ethereum.YFI,
  '0xba100000625a3754423978a60c9317c58a424e3d',
  ADDRESSES.ethereum.UNI,
  '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0xec67005c4e498ec7f55e092bd1d35cbc47c91892',
  ADDRESSES.ethereum.BAT,
  ADDRESSES.ethereum.LINK,
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  ADDRESSES.ethereum.SNX,
  ADDRESSES.ethereum.AAVE,
  '0xeef9f339514298c6a857efcfc1a762af84438dee',
  '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
  '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
  '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
  ADDRESSES.ethereum.LIDO,
  '0xdddddd4301a082e62e84e43f474f044423921918',
  '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d',
  ADDRESSES.ethereum.MATIC,
  '0x0a0e3bfd5a8ce610e735d4469bc1b3b130402267',
  ADDRESSES.ethereum.INU,
  ADDRESSES.ethereum.CRV,
  '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
  '0x0391d2021f89dc339f60fff84546ea23e337750f',
  ADDRESSES.ethereum.TOKE,
  '0x33349b282065b0284d756f0577fb39c158f935e6',
  '0x767fe9edc9e0df98e07454847909b5e959d7ca0e',
  '0x25f8087ead173b73d6e8b84329989a8eea16cf73',
  '0xdddd0e38d30dd29c683033fa0132f868597763ab',
  ADDRESSES.ethereum.WSTETH,
  ADDRESSES.ethereum.SUSHI
];
const arbitrumTokens = [
  nullAddress,
  ADDRESSES.arbitrum.USDC,
  ADDRESSES.arbitrum.USDT,
  ADDRESSES.optimism.DAI
];
const polygonTokens = [
  nullAddress,
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.USDT,
  ADDRESSES.polygon.DAI
];

async function tvl(timestamp, block){
    return sumTokens2({ owner: contracts.stark, tokens: listedTokens, block })
}

async function arbitrumTvl(timestamp, ethBlock, {arbitrum: block}){
  return sumTokens2({ owner: contracts.arbiBridge, tokens: arbitrumTokens, block, chain: 'arbitrum' })
}

async function polygonTvl(timestamp, ethBlock, {polygon: block}){
  return sumTokens2({ owners: [contracts.polyBridge, contracts.polySmartWallet], tokens: polygonTokens, block, chain: 'polygon' })
}

module.exports = {
    methodology: `Counts the tokens on ${contracts.stark} and on rhino.fi cross-chain swap smart-wallet contracts`,
    ethereum: {
      tvl
    },
    arbitrum: {
      tvl: arbitrumTvl
    },
    polygon: {
      tvl: polygonTvl
    }
}
