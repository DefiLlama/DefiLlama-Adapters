const sdk = require("@defillama/sdk");
const abi = require('./abis/abi.json')
const { default: BigNumber } = require("bignumber.js");

const AladdinConvexVaultABI = require('./abis/AladdinConvexVault.json')
const AladdinCRVABI = require('./abis/AladdinCRV.json')
const curvePools = require('./pools-crv.js');


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
]

async function tvl(timestamp, block) {
  let balances = {}

  const acrvTotalUnderlying = (await sdk.api.abi.call({
    target: concentratorAcrv,
    block,
    abi: AladdinCRVABI.totalUnderlying,
    params: []
  })).output;

  const acrvTotalSupply = (await sdk.api.abi.call({
    target: concentratorAcrv,
    block,
    abi: AladdinCRVABI.totalSupply,
    params: []
  })).output;

  const rate = acrvTotalSupply * 1 ? BigNumber(acrvTotalUnderlying).div(acrvTotalSupply) : 1

  const cvxcrvBalance = BigNumber(acrvTotalUnderlying).multipliedBy(rate)

  const oldPoolLength = (await sdk.api.abi.call({
    target: concentratorVault,
    abi: abi.poolLength,
    block
  })).output;
  await getVaultInfo(oldPoolLength, 'old', balances, block)
  const newPoolLength = (await sdk.api.abi.call({
    target: concentratorNewVault,
    abi: abi.poolLength,
    block
  })).output;
  await getVaultInfo(newPoolLength, 'New', balances, block)
  if (!cvxcrvBalance.isZero()) {
    sdk.util.sumSingleBalance(balances, cvxcrvAddress, cvxcrvBalance.toFixed(0))
  }
  return balances
}

async function getVaultInfo(poolLength, type, balances, block) {
  const _target = type == 'New' ? concentratorNewVault : concentratorVault;
  await Promise.all([...Array(Number(poolLength)).keys()].map(async i => {
    const poolInfo = await sdk.api.abi.call({
      target: _target,
      block,
      abi: AladdinConvexVaultABI.poolInfo,
      params: [i]
    });

    const lpTokenSupply = await sdk.api.erc20.totalSupply({
      target: poolInfo.output.lpToken,
      block
    })
    const poolData = curvePools.find(crvPool => crvPool.addresses.lpToken.toLowerCase() === poolInfo.output.lpToken.toLowerCase())
    if (poolData === undefined) {
      console.log(poolInfo.output);
      return;
    }

    const swapAddress = poolData.addresses.swap
    const coinCalls = [...Array(Number(poolData.coins.length)).keys()].map(num => {
      return {
        target: swapAddress,
        params: [num]
      }
    });

    const coinsUint = sdk.api.abi.multiCall({
      abi: abi.coinsUint,
      calls: coinCalls,
      block
    })

    const coinsInt = sdk.api.abi.multiCall({
      abi: abi.coinsInt,
      calls: coinCalls,
      block
    })

    let coins = await coinsUint
    if (!coins.output[0].success) {
      coins = await coinsInt
    }

    let coinBalances = []
    for (let i = 0, l = coins.output.length; i < l; i++) {
      let _coinAddress = coins.output[i].output
      if (_coinAddress == addressZero) {
        continue;
      }
      if (_coinAddress != ethAddress && _coinAddress != wethAddress) {
        var bal = await sdk.api.erc20.balanceOf({
          target: _coinAddress,
          owner: swapAddress,
          block
        })
        coinBalances.push({ coin: _coinAddress, balance: bal.output });
      } else {
        var ethbal = await sdk.api.eth.getBalance({
          target: swapAddress,
          block
        })
        coinBalances.push({ coin: addressZero, balance: ethbal.output })
      }
    }
    const resolvedLPSupply = lpTokenSupply.output;

    await Promise.all(coinBalances.map(async (coinBalance, index) => {
      let coinAddress = coinBalance.coin
      if (replacements.includes(coinAddress)) {
        coinAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // dai
      }
      const balance = BigNumber(poolInfo.output.totalUnderlying).times(coinBalance.balance).div(resolvedLPSupply);
      if (!balance.isZero()) {
        sdk.util.sumSingleBalance(balances, coinAddress, balance.toFixed(0))
      }
    }))
  }))
}
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
}
