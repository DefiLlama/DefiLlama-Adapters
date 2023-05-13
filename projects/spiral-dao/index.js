const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { ethers } = require("ethers");
const abi = require('./abi.json');

const MASTERMIND = "0xFACE8DED582816E2f2cD4C6cc1cbD1aCCc9df65E"
const STAKING = "0x6701e792b7cd344bae763f27099eeb314a4b4943"
const COIL = '0x823E1B82cE1Dc147Bbdb25a203f046aFab1CE918'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function tvl(_, _1, _2, { api }) {
  const balances = {}
  let pools = await api.fetchList({ target: MASTERMIND, itemAbi: abi.poolInfo, lengthAbi: abi.poolCount, })
  let poolInputs = await api.fetchList({ target: MASTERMIND, itemAbi: abi.lockableToken, lengthAbi: abi.poolCount, })
  for (let i = 0; i < pools.length; i++) {
    await sdk.util.sumSingleBalance(balances, poolInputs[i], pools[i].rewardableDeposits)
  }
  return balances;
}

async function staking(_, _1, _2, { api }) {
  const balances = {}
  const amount = await api.call({
    abi: 'erc20:balanceOf',
    target: COIL,
    params: [STAKING]
  })

  await sdk.util.sumSingleBalance(balances, COIL, amount)
  return balances
}async function treasury(_, _1, _2, { api }) {
  let balances = {};

  const toWei = async(address, balance) => {
    const decimals = await api.call({
      abi: 'erc20:decimals',
      target: address,
    })
    return ethers.utils.parseUnits((balance >> 0).toString(), decimals).toString()
  }

  const response = await utils.fetchURL('https://api.spiral.farm/data/eth/treasury');
  if (response.data.success) {
    for (let [address, info] of Object.entries(response.data.tokens)){
      if (address === 'eth'){
        await sdk.util.sumSingleBalance(balances, 'ethereum', info.totalAmount)
      } else {
        await sdk.util.sumSingleBalance(balances, address, await toWei(address, info.totalAmount))
      }

    }
    await sdk.util.sumSingleBalance(balances, USDC,
      await toWei(USDC, response.data.extraUsdValues.tokenRedeemContractUsdcBalance))
    await sdk.util.sumSingleBalance(balances, USDC, response.data.extraUsdValues.bribes)
  }

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: 'Information is retrieved from both the blockchain and the SpiralDAO API. "https://api.spiral.farm".',
  start: 16991020,
  ethereum: {
    tvl,
    staking,
    treasury,
  }
};

