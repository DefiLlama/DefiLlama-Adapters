
const { sumTokens2, } = require('../helper/unwrapLPs')

const UNI_CONTRACTS = {
  pntETH: {
    address: '0xea8ddc2f50626f1f8f8c11242d1876710d65ff44',
    uniPair: '0x77bbC2B409C2c75E4999e8E3eb8309EFff37cf2D',
  },
  wBTCpBTC: {
    address: '0x7c43ea3bb6921e9b1ac53ba06f196efd296b3fa8',
    uniPair: '0x9f8d8df26d5ab71b492ddce9799f432e36c289df',
  },
  pLTCETH: {
    address: '0xAA298Fa032ae863E0156F1e1B54A7AD1A27534a4',
    uniPair: '0x8b56a00cc3d30ccc3a258c7dceaf72b5bae5d3eb',
  },
  pBTCETH: {
    address: '0x279E670c560FBA394B665ADb9c66293ECA051BE9',
    uniPair: '0x8d50d0fd88016ea63229e432803db4069c40db09',
  },
  pDOGEETH: {
    address: '0xeB8A0BaC52fE10949c088A43AfBBB42cF0C3684E',
    uniPair: '0x48584714106c724c6954c5546708aaD5811c29BD',
  },
}

const CURVE_CONTRACTS = [{  // pBTCsBTC curve
  address: '0xf7977edc1fa61Aa9b5F90d70A74a3fbC46E9DAd3',
  token: '0xDE5331AC4B3630f94853Ff322B66407e0D6331E8',
}]

async function tvl(api) {
  const toa = Object.values(UNI_CONTRACTS).map(({ uniPair, address }) => ([uniPair, address]))
  CURVE_CONTRACTS.forEach(i => toa.push([i.token, i.address]))
  return sumTokens2({ api, tokensAndOwners: toa})}


module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  },
}