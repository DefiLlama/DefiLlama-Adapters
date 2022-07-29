const sdk = require('@defillama/sdk')
const { sumTokens, sumTokensAndLPs, unwrapCrv, unwrapUniswapLPs, genericUnwrapCvx, } = require('../helper/unwrapLPs')
const abi = require("../pendle/abi.json");
const BigNumber = require('bignumber.js')
const positions = require('./positions.json');

const cvx_abi = {
	"cvxBRP_pid": { "inputs": [], "name": "pid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	"cvxBRP_balanceOf": { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	"cvxBRP_earned": { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "earned", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	"cvxBRP_rewards": { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	"cvxBRP_userRewardPerTokenPaid": { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userRewardPerTokenPaid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	"cvxBRP_stakingToken": { "inputs": [], "name": "stakingToken", "outputs": [{ "internalType": "address", "name": "stakingToken", "type": "address" }], "stateMutability": "view", "type": "function" },
	"cvxBooster_poolInfo": { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "address", "name": "lptoken", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "gauge", "type": "address" }, { "internalType": "address", "name": "crvRewards", "type": "address" }, { "internalType": "address", "name": "stash", "type": "address" }, { "internalType": "bool", "name": "shutdown", "type": "bool" }], "stateMutability": "view", "type": "function" }
}

const cvxBoosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const degenesisContract = "0xc803737D3E12CC4034Dde0B2457684322100Ac38";
const wethPool = "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36";
const usdcPool = "0x04bda0cf6ad025948af830e75228ed420b0e860d";
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
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
const toke = "0x2e9d63788249371f1dfc918a52f8d799f4a38c94";
const rtoke1 = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930";
const rtoke2 = "0x96f98ed74639689c3a11daf38ef86e59f43417d3";
const sushiPool = "0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777";
const sushi = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2";
const fraxPool = "0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2";
const frax = "0x853d955acef822db058eb8505911ed77f175b99e";
const daiPool = "0x0CE34F4c26bA69158BC2eB8Bf513221e44FDfB75";
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
const feiPool = "0x03DccCd17CC36eE61f9004BCfD7a85F58B2D360D";
const fei = "0x956F47F50A910163D8BF957Cf5846D573E7f87CA";
const lusdPool = "0x9eEe9eE0CBD35014e12E1283d9388a40f69797A3";
const lusd = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
const wormUstPool = "0x482258099De8De2d0bda84215864800EA7e6B03D";
const wormtust = "0xa693b19d2931d498c5b318df961919bb4aee87a5";
const foxPool = "0x808D3E6b23516967ceAE4f17a5F9038383ED5311";
const fox = "0xc770eefad204b5180df6a14ee197d99d808ee52d";
const apwPool = "0xDc0b02849Bb8E0F126a216A2840275Da829709B0";
const apw = "0x4104b135dbc9609fc1a9490e61369036497660c8";
const snxPool = "0xeff721Eae19885e17f5B80187d6527aad3fFc8DE";
const snx = "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f";
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
const steth = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
const crvSteth = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";

async function tvl(timestamp, block) {
  const balances = {}

  await sumTokens(balances, [
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
    [alusd, alusdPool]
  ], block)
  const cvxUSTWPool = "0x7e2b9b5244bcfa5108a76d5e7b507cfd5581ad4a";
  const cvxFRAXPool = "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";
  const cvxalUSDPool = "0x02E2151D4F351881017ABdF2DD2b51150841d5B3";
  const cvxstethPool = "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03";

  let tokeManager = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";
  // node test.js projects/tokemak/index.js
  await unwrapCvxSteth(balances, tokeManager, cvxstethPool, block, "ethereum");

  //UST CVX Wormhole Pool
  await genericUnwrapCvx(balances, tokeManager, cvxUSTWPool, block, "ethereum");

  //FRAX CVX Pool
  await genericUnwrapCvx(balances, tokeManager, cvxFRAXPool, block, "ethereum");

  //CVX alUSD Pool
  await genericUnwrapCvx(
    balances,
    tokeManager,
    cvxalUSDPool,
    block,
    "ethereum"
  );

  let curveHoldings = positions.exchanges.filter(
    pool => pool.type == 'Curve')
  let uniHoldings = positions.exchanges.filter(
    pool => pool.type != 'Curve')

  await lpBalances(block, balances, curveHoldings)
  await lpBalances(block, balances, uniHoldings)

  return balances
}

async function unwrapCvxSteth(balances, holder, cvx_BaseRewardPool, block, chain) {
  const [{ output: cvx_LP_bal }, { output: pool_id }] = await Promise.all([
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_balanceOf'],
      target: cvx_BaseRewardPool,
      params: [holder],
      block
    }),
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_pid'],
      target: cvx_BaseRewardPool,
       block
    })
  ])

  const { output: crvPoolInfo } = await sdk.api.abi.call({
    abi: cvx_abi['cvxBooster_poolInfo'],
    target: cvxBoosterAddress,
    params: [pool_id],
    block: block,
  })
  const { output: resolvedCrvTotalSupply } = await sdk.api.erc20.totalSupply({
    target: crvPoolInfo.lptoken,
    block
  })

  const crvLP_steth_balance = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    target: steth,
    params: crvSteth,
    block
  })
  sdk.util.sumSingleBalance(
    balances, 
    steth, 
    BigNumber(crvLP_steth_balance.output)
      .times(cvx_LP_bal).div(resolvedCrvTotalSupply).toFixed(0)
    )

  const crvLP_eth_balance = await sdk.api.eth.getBalance({ 
    target: crvSteth, 
    block 
  })
  sdk.util.sumSingleBalance(
    balances, 
    weth, 
    BigNumber(crvLP_eth_balance.output)
      .times(cvx_LP_bal).div(resolvedCrvTotalSupply).toFixed(0)
    )
}

async function lpBalances(block, balances, holdings) {
  const manager = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14"
  let masterChef
  switch (holdings[0].type) {
    case 'Curve':
      masterChef = "0x5F465e9fcfFc217c5849906216581a657cd60605"; break;
    default:
      masterChef = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"; break;
  }

  let lpPositions = []
  for (let pool of holdings) {
    const wallet = (await sdk.api.abi.call({
      block,
      target: pool.pool_address,
      abi: 'erc20:balanceOf',
      params: [manager]
    })).output;

    if (wallet > 0) {
      holdings[0].type == 'Curve' ?
        await unwrapCrv(balances, pool.pool_address, wallet, block) :
        lpPositions.push({ balance: wallet, token: pool.pool_address })
    }

    if (!pool.hasOwnProperty('staking')) {
      continue
    }

    const staked = (await sdk.api.abi.call({
      block,
      target: masterChef,
      abi: abi.userInfo,
      params: [pool.staking.pool_id, manager]
    })).output.amount;

    if (staked > 0) {
      holdings[0].type == 'Curve' ?
        await unwrapCrv(balances, pool.pool_address, staked, block) :
        lpPositions.push({ balance: staked, token: pool.pool_address })
    }
  }
  await unwrapUniswapLPs(balances, lpPositions, block)
}

async function staking(timestamp, block) {
  let balances = {}
  await sumTokens(balances, [
    [toke, rtoke1], [toke, rtoke2]
  ], block)
  let vestedToke = BigNumber('57238445430000000000000000')
  balances[toke] = BigNumber(balances[toke]).minus(vestedToke)
  return balances
}

async function pool2(timestamp, block) {
  const balances = {}
  await sumTokensAndLPs(balances, [
    [slp, slpStaking, true],
    [uni, uniStaking, true]
  ], block)
  return balances
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
    staking
  }
}
