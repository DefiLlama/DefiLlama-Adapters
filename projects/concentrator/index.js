const sdk = require("@defillama/sdk");
const abi = require('./abis/abi.json')
const { default: BigNumber } = require("bignumber.js");

const AladdinConvexVaultABI = require('./abis/AladdinConvexVault.json')
const AladdinCRVABI = require('./abis/AladdinCRV.json')
const curvePools = require('./pools-crv.js');
const { createIncrementArray } = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs')


const concentratorVault = '0xc8fF37F7d057dF1BB9Ad681b53Fa4726f268E0e8';
const concentratorAcrv = '0x2b95A1Dcc3D405535f9ed33c219ab38E8d7e0884';
const cvxcrvAddress = '0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7';

const concentratorNewVault = '0x3Cf54F3A1969be9916DAD548f3C084331C4450b5';
const addressZero = "0x0000000000000000000000000000000000000000"
const ethAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const replacements = [
  "0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc",
  "0x9777d7E2b60bB01759D0E2f8be2095df444cb07E",
  "0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59",
  "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01",
  "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e",
  "0x83f798e925BcD4017Eb265844FDDAbb448f1707D",
  "0x73a052500105205d34Daf004eAb301916DA8190f"
].map(i => i.toLowerCase())

async function tvl(timestamp, block) {
  let balances = {}

  const acrvTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAcrv,
    block,
    abi: AladdinCRVABI.totalUnderlying,
  })).output;
  const acrvTotalSupply = (await sdk.api.abi.call({
    target: concentratorAcrv,
    block,
    abi: AladdinCRVABI.totalSupply,
    params: []
  })).output;
  const rate = acrvTotalSupply * 1 ? BigNumber(acrvTotalUnderlying).div(acrvTotalSupply) : 1
  const cvxcrvBalance = BigNumber(acrvTotalUnderlying).multipliedBy(rate)
  sdk.util.sumSingleBalance(balances, cvxcrvAddress, BigNumber(cvxcrvBalance).toFixed(0))

  const oldPoolLength = (await sdk.api.abi.call({
    target: concentratorVault,
    abi: abi.poolLength,
    block
  })).output;
  const newPoolLength = (await sdk.api.abi.call({
    target: concentratorNewVault,
    abi: abi.poolLength,
    block
  })).output;

  await getVaultInfo(oldPoolLength, 'old', balances, block)
  await getVaultInfo(newPoolLength, 'New', balances, block)
  sdk.util.sumSingleBalance(balances, cvxcrvAddress, BigNumber(acrvTotalUnderlying).toFixed(0))
  return balances
}

async function getVaultInfo(poolLength, type, balances, block) {
  const _target = type == 'New' ? concentratorNewVault : concentratorVault;
  const paramsCalls = createIncrementArray(poolLength).map(i => ({ params: i }))
  const { output: poolInfos } = await sdk.api.abi.multiCall({
    target: _target,
    abi: AladdinConvexVaultABI.poolInfo,
    calls: paramsCalls,
    block,
  })
  const { output: totalSupplies } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: poolInfos.map(i => ({ target: i.output.lpToken })),
    block,
  })

  await Promise.all(poolInfos.map(async (_, i) => {
    const poolInfo = poolInfos[i];
    const poolData = curvePools.find(crvPool => crvPool.addresses.lpToken.toLowerCase() === poolInfo.output.lpToken.toLowerCase())

    if (poolData === undefined) {
      console.log(poolInfo.output, poolData,);
      throw new Error('Missing pool data');
    }

    const swapAddress = poolData.addresses.swap
    const coinCalls = createIncrementArray(poolData.coins.length).map(num => {
      return {
        target: swapAddress,
        params: [num]
      }
    });

    let coins = await sdk.api.abi.multiCall({
      abi: abi.coinsUint,
      calls: coinCalls,
      block
    })
    if (!coins.output[0].success) {
      coins = await sdk.api.abi.multiCall({
        abi: abi.coinsInt,
        calls: coinCalls,
        block
      })
    }

    let coinBalances = []
    const tokens = coins.output.map(i => {
      if (i.output.toLowerCase() == wethAddress.toLowerCase()) {
        return ethAddress
      }
      return i.output;
    })
    let tempBalances = await sumTokens2({ block, owner: swapAddress, tokens, })
    Object.entries(tempBalances).forEach(([coin, balance]) => coinBalances.push({ coin, balance }))
    const resolvedLPSupply = totalSupplies[i].output;

    coinBalances.map((coinBalance) => {
      let coinAddress = coinBalance.coin.toLowerCase()
      if (replacements.includes(coinAddress)) {
        coinAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // dai
      } else if (coinAddress === '0xFEEf77d3f69374f66429C91d732A244f074bdf74'.toLowerCase()) {
        coinAddress = '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0' // replace cvxFXS -> FXS
      }
      const balance = BigNumber(poolInfo.output.totalUnderlying * coinBalance.balance / resolvedLPSupply);
      if (!balance.isZero()) {
        sdk.util.sumSingleBalance(balances, coinAddress, balance.toFixed(0))
      }
    })
  }))
}
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
}
