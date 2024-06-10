const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokens2, } = require('../helper/unwrapLPs')
const abi = require("../pendle/abi.json");
const positions = require('./positions.json');

const cvx_abi = {
  cvxBRP_pid: "uint256:pid",
  cvxBRP_balanceOf: "function balanceOf(address account) view returns (uint256)",
  cvxBRP_earned: "function earned(address account) view returns (uint256)",
  cvxBRP_rewards: "function rewards(address) view returns (uint256)",
  cvxBRP_userRewardPerTokenPaid: "function userRewardPerTokenPaid(address) view returns (uint256)",
  cvxBRP_stakingToken: "address:stakingToken",
  cvxBooster_poolInfo: "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
  stkcvxFRAXBP_lockedStakesOf: "function lockedStakesOf(address account) view returns (tuple(bytes32 kek_id, uint256 start_timestamp, uint256 liquidity, uint256 ending_timestamp, uint256 lock_multiplier)[])",
}

const degenesisContract = "0xc803737D3E12CC4034Dde0B2457684322100Ac38";
const wethPool = "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36";
const usdcPool = "0x04bda0cf6ad025948af830e75228ed420b0e860d";
const usdc = ADDRESSES.ethereum.USDC;
const weth = ADDRESSES.ethereum.WETH;
const ohmPool = "0xe7a7D17e2177f66D035d9D50A7f48d8D8E31532D";
const ohm = "0x383518188C0C6d7730D91b2c03a03C837814a899";
const gohmPool = "0x41f6a95Bacf9bC43704c4A4902BA5473A8B00263";
const gohm = "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f";
const alcxPool = "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84";
const alcx = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";
const fxsPool = "0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655";
const fxs = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
const tcrPool = "0x15A629f0665A3Eb97D7aE9A7ce7ABF73AeB79415";
const tcr = "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050";
const toke = ADDRESSES.ethereum.TOKE;
const rtoke1 = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930";
const rtoke2 = "0x96f98ed74639689c3a11daf38ef86e59f43417d3";
const rtoke3 = "0xA374A62DdBd21e3d5716cB04821CB710897c0972";
const sushiPool = "0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777";
const sushi = ADDRESSES.ethereum.SUSHI;
const fraxPool = "0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2";
const frax = ADDRESSES.ethereum.FRAX;
const daiPool = "0x0CE34F4c26bA69158BC2eB8Bf513221e44FDfB75";
const dai = ADDRESSES.ethereum.DAI;
const feiPool = "0x03DccCd17CC36eE61f9004BCfD7a85F58B2D360D";
const fei = "0x956F47F50A910163D8BF957Cf5846D573E7f87CA";
const lusdPool = "0x9eEe9eE0CBD35014e12E1283d9388a40f69797A3";
const lusd = ADDRESSES.ethereum.LUSD;
const wormUstPool = "0x482258099De8De2d0bda84215864800EA7e6B03D";
const wormtust = "0xa693b19d2931d498c5b318df961919bb4aee87a5";
const foxPool = "0x808D3E6b23516967ceAE4f17a5F9038383ED5311";
const fox = "0xc770eefad204b5180df6a14ee197d99d808ee52d";
const apwPool = "0xDc0b02849Bb8E0F126a216A2840275Da829709B0";
const apw = "0x4104b135dbc9609fc1a9490e61369036497660c8";
const snxPool = "0xeff721Eae19885e17f5B80187d6527aad3fFc8DE";
const snx = ADDRESSES.ethereum.SNX;
const gamma = '0x6bea7cfef803d1e3d5f7c0103f7ded065644e197';
const gammaPool = '0x2Fc6e9c1b2C07E18632eFE51879415a580AD22E1';
const mim = '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3';
const mimPool = '0x2e9F9bECF5229379825D0D3C1299759943BD4fED';
const slp = "0xd4e7a6e2d03e4e48dfc27dd3f46df1c176647e38";
const slpStaking = "0x8858a739ea1dd3d80fe577ef4e0d03e88561faa3";
const uni = "0x5fa464cefe8901d66c09b85d5fcdc55b3738c688";
const uniStaking = "0x1b429e75369ea5cd84421c1cc182cee5f3192fd3";
const alusd = "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9";
const alusdPool = "0x7211508D283353e77b9A7ed2f22334C219AD4b4C";
const steth = ADDRESSES.ethereum.STETH;
const crvSteth = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
const myc = "0x4b13006980acb09645131b91d259eaa111eaf5ba";
const mycPool = "0x061aee9ab655e73719577EA1df116D7139b2A7E7";
const visr = "0xF938424F7210f31dF2Aee3011291b658f872e91e";
const visrPool = "0x2d3eADE781c4E203c6028DAC11ABB5711C022029";

async function tvl(api) {
  const cvxUSTWPool = "0x7e2b9b5244bcfa5108a76d5e7b507cfd5581ad4a";
  const cvxFRAXPool = "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";
  const cvxalUSDPool = "0x02E2151D4F351881017ABdF2DD2b51150841d5B3";
  const cvxstethPool = "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03";
  const cvxcrvFrax = "0x117A0bab81F25e60900787d98061cCFae023560c";
  const cvxcvxFxs = "0xCB6D873f7BbE57584a9b08380901Dc200Be7CE74";

  const tokeManager = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";
  const tokeTreasury = "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B";
  const tokeTreasuryFraxConvexVault = "0x5d9EF8F1CFa952a4a383E10a447dD23C5EA20EB8";
  const toa = [
    [weth, degenesisContract],
    [usdc, degenesisContract],
    [weth, wethPool],
    [usdc, usdcPool],
    [ohm, ohmPool],
    [alcx, alcxPool],
    [fxs, fxsPool],
    [tcr, tcrPool],
    [sushi, sushiPool],
    [frax, fraxPool],
    [dai, daiPool],
    [fei, feiPool],
    [lusd, lusdPool],
    [wormtust, wormUstPool],
    [fox, foxPool],
    [apw, apwPool],
    [snx, snxPool],
    [gohm, gohmPool],
    [mim, mimPool],
    [gamma, gammaPool],
    [alusd, alusdPool],
    [myc, mycPool],
    [visr, visrPool],
    [steth, tokeTreasury],
    [cvxstethPool, tokeManager],
    [cvxUSTWPool, tokeManager],
    [cvxFRAXPool, tokeManager],
    [cvxalUSDPool, tokeManager],
  ]
  const balances = {}

  // cvxcrvFRAX
  const cvxFraxUsdcPool = "0x7e880867363A7e321f5d260Cade2B0Bb2F717B02";
  const cvxcrvFraxBal = await api.call({
    abi: cvx_abi['cvxBRP_balanceOf'],
    target: cvxFraxUsdcPool,
    params: [tokeManager],
  });
  const fraxFraxUsdcPool = "0x963f487796d54d2f27bA6F3Fbe91154cA103b199";
  const treasuryFraxBal = await api.call({
    abi: cvx_abi['stkcvxFRAXBP_lockedStakesOf'],
    target: fraxFraxUsdcPool,
    params: [tokeTreasuryFraxConvexVault],
  });

  /// cvxcvxFXS
  const cvxcvxFxsPool = "0xf27AFAD0142393e4b3E5510aBc5fe3743Ad669Cb";
  const cvxcvxFxsBal = await api.call({
    abi: cvx_abi['cvxBRP_balanceOf'],
    target: cvxcvxFxsPool,
    params: [tokeTreasury],
  });
  sdk.util.sumSingleBalance(balances, cvxcrvFrax, cvxcrvFraxBal)
  sdk.util.sumSingleBalance(balances, cvxcrvFrax, treasuryFraxBal[0]['liquidity'])
  sdk.util.sumSingleBalance(balances, cvxcvxFxs, cvxcvxFxsBal)

  let curveHoldings = positions.exchanges.filter(
    pool => pool.type == 'Curve')
  let uniHoldings = positions.exchanges.filter(
    pool => pool.type != 'Curve')

  const tokens = []
  const calls = []
  lpBalances(curveHoldings, toa, tokens, calls,)
  lpBalances(uniHoldings, toa, tokens, calls)
  const amountRes = await api.multiCall({ abi: abi.userInfo, calls })
  tokens.forEach((val, i) => sdk.util.sumSingleBalance(balances, val, amountRes[i].amount, api.chain))


  return sumTokens2({ balances, api, tokensAndOwners: toa, })
}

function lpBalances(holdings, toa, tokens, calls) {
  const manager = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14"
  let masterChef
  switch (holdings[0].type) {
    case 'Curve':
      masterChef = "0x5F465e9fcfFc217c5849906216581a657cd60605"; break;
    default:
      masterChef = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"; break;
  }

  for (let pool of holdings) {
    const { pool_address: token } = pool
    toa.push([token, manager])
    if (!pool.hasOwnProperty('staking'))
      continue

    tokens.push(token)
    calls.push({ target: masterChef, params: [pool.staking.pool_id, manager] })
  }
}

async function staking(api) {
  let vestedToke = '57238445'
  api.add(ADDRESSES.ethereum.TOKE, vestedToke * 1e18 * -1)
  return sumTokens2({
    api, tokensAndOwners: [
      [toke, rtoke1], [toke, rtoke2], [toke, rtoke3]
    ]
  })
}

async function pool2(timestamp, block) {
  return sumTokens2({
    block, tokensAndOwners: [
      [slp, slpStaking],
      [uni, uniStaking],
    ]
  })
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
    staking
  }
}
