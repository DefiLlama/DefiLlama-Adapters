const sdk = require('@defillama/sdk')
const { userInfo } = require('../pendle/abi.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const getTotalDeposited = { "inputs": [], "name": "getTotalDeposited", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';

async function tvl(timestamp, block) {
  const { output: total } = await sdk.api.abi.call({ target: FRACTAL_VAULT_CONTRACT, block, abi: getTotalDeposited })

  return {
    'usd-coin': total / 1e6
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: sumTokensExport({ owner: FRACTAL_VAULT_CONTRACT, tokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], chain: 'ethereum' }),
    borrowed: async (_, block) => {
      const loanContract = '0xf0e3020934450152308e4a84a3c4a5801fcb8d29'
      const { output: token } = await sdk.api.abi.call({ block, target: loanContract, abi: abis.principalToken })
      const { output: debt } = await sdk.api.abi.call({ block, target: loanContract, abi: abis.getDebt })
      return {
        [token]: debt.principalDebtAmount,
      }
    }
  },
  avax: {
    tvl: async (_, _b, { avax: block }) => {
      const chain = 'avax'
      const strategy = '0x9fea225c7953869e68b8228d2c90422d905e5117'
      const nUSDLP = '0xCA87BF3ec55372D9540437d7a86a7750B42C02f4'
      const nUSDSwap = '0xed2a7edd7413021d440b09d654f3b87712abab66'
      const synapseMiniChef = '0x3a01521f8e7f012eb37eaaf1cb9490a5d9e18249'
      const { output: { amount } } = await sdk.api.abi.call({
        target: synapseMiniChef, params: [1, strategy],
        abi: userInfo, chain, block,
      })
      const { output: price } = await sdk.api.abi.call({
        target: nUSDSwap, abi: abis.getVirtualPrice, chain, block,
      })
      return { tether: amount * price / 1e36 }
    }
  },
  polygon: {
    tvl: async (_, _b, { polygon: block }) => {
      const chain = 'polygon'
      const strategy = '0x894cB5e24DDdD9ececb27831647ae869541Af28F'
      const nUSDLP = '0x7479e1bc2f2473f9e78c89b4210eb6d55d33b645'
      const nUSDSwap = '0x85fcd7dd0a1e1a9fcd5fd886ed522de8221c3ee5'
      const synapseMiniChef = '0x7875af1a6878bda1c129a4e2356a3fd040418be5'
      const { output: { amount } } = await sdk.api.abi.call({
        target: synapseMiniChef, params: [1, strategy],
        abi: userInfo, chain, block,
      })
      const { output: price } = await sdk.api.abi.call({
        target: nUSDSwap, abi: abis.getVirtualPrice, chain, block,
      })
      return { tether: amount * price / 1e36 }
    }
  },
  moonriver: {
    tvl: async (_, _b, { moonriver: block }) => {
      const chain = 'moonriver'
      const muSDCToken = '0xd0670aee3698f66e2d4daf071eb9c690d978bfa8'
      const { output: mUSDC } = await sdk.api.erc20.balanceOf({ target: muSDCToken, chain, block, owner: '0x3Bc4D91B0dEdC1e8E93B356a7572f51815fe843B' })
      const { output:  exchangeRate } = await sdk.api.abi.call({
        target: muSDCToken, abi: abis.exchangeRateStored, chain, block,
      })
      return {
        tether: mUSDC/1e8 * exchangeRate/1e16
      }
    }
  },
}

const abis = {
  exchangeRateStored: {"constant":true,"inputs":[],"name":"exchangeRateStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  getVirtualPrice: {"inputs":[],"name":"getVirtualPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  principalToken: {"inputs":[],"name":"principalToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  getDebt: {"inputs":[],"name":"getDebt","outputs":[{"internalType":"uint256","name":"interestDebtAmount","type":"uint256"},{"internalType":"uint256","name":"grossDebtAmount","type":"uint256"},{"internalType":"uint256","name":"principalDebtAmount","type":"uint256"},{"internalType":"uint256","name":"interestOwed","type":"uint256"},{"internalType":"uint256","name":"applicableLateFee","type":"uint256"},{"internalType":"uint256","name":"netDebtAmount","type":"uint256"},{"internalType":"uint256","name":"daysSinceFunding","type":"uint256"},{"internalType":"uint256","name":"currentBillingCycle","type":"uint256"},{"internalType":"uint256","name":"minPaymentAmount","type":"uint256"},{"internalType":"uint256","name":"maxPaymentAmount","type":"uint256"}],"stateMutability":"view","type":"function"},
}