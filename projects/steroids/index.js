
const { sumTokens, unwrapCrv,  sumTokensAndLPs, } = require('../helper/unwrapLPs')

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

const unwrapCurveMetaPool = [
  '0x075b1bb99792c9e1041ba13afef80c91a1e70fb3' // wBTC-SBTC curve pool
]


async function tvl(timestamp, block) {
  const balances = {}
  const curveLPs = {}

  const uniTokens = Object.values(UNI_CONTRACTS).map(({ uniPair, address }) => [uniPair, address, true])
  // Resolve all Unswap LPs staked
  await sumTokensAndLPs(balances, uniTokens, block)

  // Resolve pBTC curve pool that was staked
  await sumTokens(curveLPs, CURVE_CONTRACTS.map(({ token, address }) => [token, address]), block,)
  const unwarpCurves = Object.keys(curveLPs).map(token => unwrapCrv(balances, token, curveLPs[token], block))
  await Promise.all(unwarpCurves)
  for (const unwrapCurveToken of unwrapCurveMetaPool) {
    if (balances[unwrapCurveToken]) {
      await unwrapCrv(balances, unwrapCurveToken, balances[unwrapCurveToken], block)
      delete balances[unwrapCurveToken]
    }
  }

  return balances
}


module.exports = {
  ethereum: {
    tvl
  },
}