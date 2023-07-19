const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokens, sumTokens2, unwrapUniswapV3NFTs } = require("../helper/unwrapLPs")
const { createIncrementArray } = require("../helper/utils")
const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const poolInfos = {}

const templeStakingContract = "0xEc3C1aBDAb15EbC069ec5e320EaACf716eDfC011";
const temepleGnosisAddress = "0xb1bd5762faf7d6f86f965a3ff324bd81bb746d00";
const templePool2Contract = '0x10460d02226d6ef7B2419aE150E6377BdbB7Ef16'
const TEMPLE_FRAX_LP = '0x6021444f1706f15465bee85463bcc7d7cc17fc03'
const TEMPLE = "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7";
const auraLocker = '0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC';

const templeTreasuryContract = "0x5c8898f8e0f9468d4a677887bc03ee2659321012";
const FRAX = ADDRESSES.ethereum.FRAX;
const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
const CVX_FXS = ADDRESSES.ethereum.cvxFXS;
const AURA = '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF'
const TEMPLE_DENDEND1 = '0x8A5058100E60e8F7C42305eb505B12785bbA3BcA';
const TEMPLE_DENDEND2 = '0xb0D978C8Be39C119922B99f483cD8C4092f0EA56';
const FRAX_3CRV_CVX_POOL = '0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e';
const FRAX_USDC_CVX_POOL = '0x963f487796d54d2f27ba6f3fbe91154ca103b199';
const FRAX_USDC_FRAX4CVX_PROXY = '0xb9CcDA67dF9606615F43C1c9AAEbB539A3635e10';
const chain = 'ethereum'

const tokensAndOwners = [
  [FRAX, TEMPLE_DENDEND1],
  [FRAX, TEMPLE_DENDEND2],
  [FXS, templeTreasuryContract],
  [FXS, FRAX_USDC_FRAX4CVX_PROXY],
  [CVX_FXS, templeTreasuryContract],
]

async function treasuryTvl(ts, block) {
  const balances = {}
  await sumTokens(balances, tokensAndOwners, block, chain, undefined);
  await getCvxPoolValue({ block, balances, pool: FRAX_3CRV_CVX_POOL, owner: templeTreasuryContract });
  await getCvxProxyVaultValue({block, balances, pool: FRAX_USDC_CVX_POOL, vault: FRAX_USDC_FRAX4CVX_PROXY});
  
  const auraLockerDetails = await sdk.api.abi.call({target: auraLocker, params: [temepleGnosisAddress], abi: abi.balances, block, chain});
  const lockedAuraBalance = auraLockerDetails.output.locked;
  sdk.util.sumSingleBalance(balances, AURA, lockedAuraBalance);
  await unwrapUniswapV3NFTs({ owner: temepleGnosisAddress, balances, block, })

  return sumTokens2({ balances, chain, owner: temepleGnosisAddress, tokens: [
    '0x3835a58ca93cdb5f912519ad366826ac9a752510',
    '0xfb6b1c1a1ea5618b3cfc20f81a11a97e930fa46b',
    '0x173063a30e095313eee39411f07e95a8a806014e',
  ]})
}

async function getCvxPoolValue({ block, owner, pool, balances, chain }) {
  const poolBalance = (await sdk.api.erc20.balanceOf({ target: pool, owner, block, chain, })).output
  const stakingToken = (await sdk.api.abi.call({ target: pool, block, chain, abi: abi.stakingToken })).output
  const operator = (await sdk.api.abi.call({ target: stakingToken, block, chain, abi: abi.operator })).output
  await setPoolInfo(operator)
  const ourPoolInfo = poolInfos[operator].find(i => JSON.stringify(i).indexOf(stakingToken) > -1)
  const crvToken = ourPoolInfo.lptoken
  balances[crvToken] = poolBalance
  async function setPoolInfo(operator) {
    if (poolInfos[operator])  return;
    const poolLength = +(await sdk.api.abi.call({ target: operator, block, chain, abi: abi.poolLength })).output
    const poolInfoArr = createIncrementArray(poolLength)
    poolInfos[operator] = (await sdk.api.abi.multiCall({ target: operator, block, chain, abi: abi.poolInfo, calls: poolInfoArr.map(i => ({ params: [i] })) })).output.map(i => i.output)
  }
}

async function getCvxProxyVaultValue({block, balances, pool, vault}) {
  const stakingToken = (await sdk.api.abi.call({ target: pool, block, chain, abi: abi.stakingToken })).output
  const unwrappedToken = (await sdk.api.abi.call({ target: stakingToken, block, chain, abi: abi.curveToken })).output
  const lpTokenBalance = (await sdk.api.abi.call({ target: stakingToken, params: [vault], block, chain, abi: abi.totalBalanceOf })).output
  sdk.util.sumSingleBalance(balances, unwrappedToken, lpTokenBalance);
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(templeStakingContract, TEMPLE),
    pool2: pool2(templePool2Contract, TEMPLE_FRAX_LP),
    tvl: treasuryTvl,
  },
  methodology:
    "Counts TVL through TempleTreasury contract, locked LP in Convex and Aura",
  hallmarks:[
      [1665457200, "Exploit $2M"],
    ], 
};
