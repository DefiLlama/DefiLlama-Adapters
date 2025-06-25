const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

const stablesPool = "0xc90dB0d8713414d78523436dC347419164544A3f"
const fraxPool = "0xa34315F1ef49392387Dd143f4578083A9Bd33E94"
const atustPool = "0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8"
const maiPool = "0x65a761136815B45A9d78d9781d22d47247B49D23"

const DAI = "0xe3520349F477A5F6EB06107066048508498A291b"
const USDC = ADDRESSES.aurora.USDC_e
const USDT = ADDRESSES.aurora.USDT_e
const FRAX = ADDRESSES.aurora.FRAX
const UST = "0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC"
const MAI = ADDRESSES.moonbeam.MAI
const ROSE = "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970"
const STROSE = "0xe23d2289FBca7De725DC21a13fC096787A85e16F"
const NEAR = ADDRESSES.aurora.NEAR
const WETH = "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB"
const WBTC = "0xf4eb217ba2454613b15dbdea6e5f22276410e89e"

const VASE = "0xee793001Ce9Fa988712B15a59CCf5dC7d54b22FF"

const poolToTokensMap = {
  [stablesPool]: [DAI, USDC, USDT],
  [fraxPool]: [FRAX],
  [atustPool]: [UST],
  [maiPool]: [MAI],
}

const tvl = async (api) => {
  const ownerTokens = []

  Object.entries(poolToTokensMap).forEach(([pool, tokens]) => ownerTokens.push([tokens, pool]))
  const gardenTokens = [NEAR, USDC, USDT, WETH, UST, WBTC]
  ownerTokens.push([gardenTokens, VASE])

  return api.sumTokens({ ownerTokens})
}

module.exports = {
  methodology:
    "TVL is computed as the sum of the underlying token balances on all Rose liquidity pools",
  aurora: {
    tvl,
    staking: staking(STROSE, ROSE),
  },
}
