const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokens } = require("../helper/unwrapLPs")
const { createIncrementArray } = require("../helper/utils")
const { resolveCrvTokens } = require("../helper/resolveCrvTokens")
const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const poolInfos = {}

const templeStakingContract = "0x4D14b24EDb751221B3Ff08BBB8bd91D4b1c8bc77";
const templePool2Contract = '0x10460d02226d6ef7B2419aE150E6377BdbB7Ef16'
const TEMPLE_FRAX_LP = '0x6021444f1706f15465bee85463bcc7d7cc17fc03'
const TEMPLE = "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7";

const templeTreasuryContract = "0x5c8898f8e0f9468d4a677887bc03ee2659321012";
const FRAX = "0x853d955acef822db058eb8505911ed77f175b99e";
const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
const CVX_FXS = "0xFEEf77d3f69374f66429C91d732A244f074bdf74";
const TEMPLE_DENDEND1 = '0x8A5058100E60e8F7C42305eb505B12785bbA3BcA'
const TEMPLE_DENDEND2 = '0xb0D978C8Be39C119922B99f483cD8C4092f0EA56'
const FRAX_3CRV_CVX_POOL = '0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e'
const chain = 'ethereum'

const tokensAndOwners = [
  [FRAX, TEMPLE_DENDEND1],
  [FRAX, TEMPLE_DENDEND2],
  [FXS, templeTreasuryContract],
  [CVX_FXS, templeTreasuryContract],
]

async function treasuryTvl(ts, block) {
  const balances = {}
  await sumTokens(balances,  tokensAndOwners, block, chain, undefined)
  await getCvxPoolValue({ block, balances, pool: FRAX_3CRV_CVX_POOL, owner: templeTreasuryContract })
  return balances;
}

async function getCvxPoolValue({ block, owner, pool, balances, chain }) {
  const poolBalance = (await sdk.api.erc20.balanceOf({ target: pool, owner, block, chain, })).output
  const stakingToken = (await sdk.api.abi.call({ target: pool, block, chain, abi: abi.stakingToken })).output
  const operator = (await sdk.api.abi.call({ target: stakingToken, block, chain, abi: abi.operator })).output
  await setPoolInfo(operator)
  const ourPoolInfo = poolInfos[operator].find(i => JSON.stringify(i).indexOf(stakingToken) > -1)
  const crvToken = ourPoolInfo.lptoken
  balances[crvToken] = poolBalance
  await resolveCrvTokens(balances, block, chain) 

  async function setPoolInfo(operator) {
    if (poolInfos[operator])  return;
    const poolLength = +(await sdk.api.abi.call({ target: operator, block, chain, abi: abi.poolLength })).output
    const poolInfoArr = createIncrementArray(poolLength)
    poolInfos[operator] = (await sdk.api.abi.multiCall({ target: operator, block, chain, abi: abi.poolInfo, calls: poolInfoArr.map(i => ({ params: [i] })) })).output.map(i => i.output)
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(templeStakingContract, TEMPLE),
    pool2: pool2(templePool2Contract, TEMPLE_FRAX_LP),
    tvl: treasuryTvl,
  },
  methodology:
    "Counts tvl on the treasury through TempleTreasury Contract",
};
