const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const abi = require('./abi.json')
const { dodoPool2 } = require('../helper/pool2')
const ADDRESSES = require('../helper/coreAssets.json')

const ethMarketsManager = "0x5ed98Ebb66A929758C7Fe5Ac60c979aDF0F4040a"

const opMarketsManager = "0xBE086E0A2c588Ad64C8530048cE4356190D6a6F3"
const OP_SUSD = ADDRESSES.optimism.sUSD
const opThalesStaking = "0xc392133eea695603b51a5d5de73655d571c2ce51"
const opThalesAmm = "0x278b5a44397c9d8e52743fedec263c4760dc1a1a"
const opRangedAmm = "0x2d356b114cbCA8DEFf2d8783EAc2a5A5324fE1dF"
const opParlayAmm = "0x82B3634C0518507D5d817bE6dAb6233ebE4D68D9"
const opSportsLp = "0x842e89b7a7eF8Ce099540b3613264C933cE0eBa5"
const opSportsVault = ["0x43d19841d818b2ccc63a8b44ce8c7def8616d98e", "0x5e2b49c68f1fd68af1354c377eacec2f05632d3f", "0x8285047f33c26c1bf5b387f2b07f21a2af29ace2", "0xbaac5464bf6e767c9af0e8d4677c01be2065fd5f", "0xc922f4CDe42dD658A7D3EA852caF7Eae47F6cEcd"]
const opAmmVault = ["0xb484027CB0c538538Bad2bE492714154f9196F93", "0x6c7Fd4321183b542E81Bcc7dE4DfB88F9DBca29F", "0x43318DE9E8f65b591598F17aDD87ae7247649C83"]
const opThalesLpToken = "0xac6705BC7f6a35eb194bdB89066049D6f1B0B1b5";
const opThalesToken = "0x217d47011b23bb961eb6d93ca9945b7501a5bb11"
const opSportsMarketsManager = "0xFBffEbfA2bF2cF84fdCf77917b358fC59Ff5771e"

const polygonMarketsManager = "0x85f1B57A1D3Ac7605de3Df8AdA056b3dB9676eCE"
const polygon_USDC = ADDRESSES.polygon.USDC
const polygonThalesAmm = "0xd52B865584c25FEBfcB676B9A87F32683356A063"
const polygonRangedAMM = "0xe8e022405505a9F2b0B7452C844F1e64423849fC"

const arbitrumMarketsManager = "0x95d93c88c1b5190fA7FA4350844e0663e5a11fF0"
const arbitrum_USDC = ADDRESSES.arbitrum.USDC
const arbThalesStaking = "0x160Ca569999601bca06109D42d561D85D6Bb4b57"
const arbitrumThalesAMM = "0x2b89275efB9509c33d9AD92A4586bdf8c4d21505"
const arbSportsMarketsManager = "0x72ca0765d4bE0529377d656c9645600606214610"
const arbParlayAmm = "0x2Bb7D689780e7a34dD365359bD7333ab24903268"
const arbSportsLp = "0x8e9018b48456202aA9bb3E485192B8475822B874"
const arbSportsVault = ["0xfF7AEA98740fA1e2a9eB81680583e62aaFf1e3Ad", "0xE26374c7aFe71a2a6AB4A61080772547C43B87E6", "0xA852a651377fbE23f3d3acF5919c3D092aD4b77d", "0x31c2947c86412A5e33794105aA034DD9312eb711"]
const arbAmmVault = ["0x640c34D9595AD5351Da8c5C833Bbd1AfD20519ea", "0x0A29CddbdAAf56342507574820864dAc967D2683", "0x008A4e30A8b41781F5cb017b197aA9Aa4Cd53b46"]
const arbThalesToken = "0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30"

async function guniPool2(_timestamp, _ethBlock, chainBlocks, { api }) {
  const [lp, token0, token1] = await api.batchCall([
    { target: opThalesLpToken, abi: abi.getUnderlyingBalance, },
    { target: opThalesLpToken, abi: 'address:token0', },
    { target: opThalesLpToken, abi: 'address:token1', },
  ])
  api.add(token0, lp[0])
  api.add(token1, lp[1])
}

async function getMarkets(api, manager) {
  return api.call({ target: manager, abi: abi.activeMarkets, params: [0, 1000] })
}

async function addSportsLPTvl(api, contract, token) {
  api.add(token, await api.call({ target: contract, abi: abi.totalDeposited, }))
}

module.exports = {
  methodology: "sUSD/USDC locked on markets",
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      return sumTokens2({ api, owners: await getMarkets(api, ethMarketsManager), tokens: [ADDRESSES.ethereum.sUSD] })
    },
    pool2: dodoPool2("0x136829c258e31b3ab1975fe7d03d3870c3311651", "0x031816fd297228e4fd537c1789d51509247d0b43"),
  },
  polygon: {
    tvl: async (_, _1, _2, { api }) => {
      const markets = await getMarkets(api, polygonMarketsManager)
      markets.push(polygonThalesAmm, polygonRangedAMM)
      return sumTokens2({ api, owners: markets, tokens: [polygon_USDC] })
    },
  },
  optimism: {
    tvl: async (_, _1, _2, { api }) => {
      await addSportsLPTvl(api, opSportsLp, OP_SUSD)
      const markets = (await Promise.all([opMarketsManager, opSportsMarketsManager,].map(i => getMarkets(api, i)))).flat()
      markets.push(opThalesAmm, opParlayAmm, opRangedAmm, ...opSportsVault, ...opAmmVault)
      return sumTokens2({ api, tokens: [OP_SUSD], owners: markets })
    },
    staking: staking(opThalesStaking, opThalesToken),
    pool2: guniPool2,
  },
  arbitrum: {
    tvl: async (_, _1, _2, { api }) => {
      await addSportsLPTvl(api, arbSportsLp, arbitrum_USDC)
      const markets = (await Promise.all([arbitrumMarketsManager, arbSportsMarketsManager,].map(i => getMarkets(api, i)))).flat()
      markets.push(arbitrumThalesAMM, arbParlayAmm, ...arbSportsVault, ...arbAmmVault)
      return sumTokens2({ api, tokens: [arbitrum_USDC], owners: markets })
    },
    staking: staking(arbThalesStaking, arbThalesToken),
  },
}