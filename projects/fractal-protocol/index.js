const sdk = require('@defillama/sdk')
const { userInfo } = require('../pendle/abi.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const FRACTAL_VAULT_CONTRACT = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';
const YIELD_RESERVE = '0xbA83B569e99B6afc2f2BfE5124460Be6f36a4a56';

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (_, block) => {
      const convexStakingWrapper_tUSD = '0x00Ec5E23B203B8aE16d55C7F601d1c67e45D826c'
      const franUnifiedFarm_tUSD = '0xb324b2bd8a3dc55b04111e84d5cce0c3771f8889'
      const convexStakingWrapper_alUSD = '0x0def0fac24dead04e2f4b49b5fb50b10478e2fa6'
      const franUnifiedFarm_alUSD = '0x711d650cd10df656c2c28d375649689f137005fa'
      const { output: tUSDBal } = await sdk.api.abi.call({
        target: franUnifiedFarm_tUSD, params: convexStakingWrapper_tUSD,
        abi: abis.lockedLiquidityOf, block,
      })
      const { output: alUSDBal } = await sdk.api.abi.call({
        target: franUnifiedFarm_alUSD, params: convexStakingWrapper_alUSD,
        abi: abis.lockedLiquidityOf, block,
      })
      const { output: convexTUSD  } = await sdk.api.erc20.balanceOf({
        target: '0x4a744870fd705971c8c00ac510eac2206c93d5bb', owner: '0xFD1D1339Dbc24496D70DBF7912c07aE2EF71bC2d', block,
      })
      const balances = {
        '0xB30dA2376F63De30b42dC055C93fa474F31330A5': alUSDBal,
        '0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893': tUSDBal,
        '0x10BE382cfAB53e0aBD093D6801B5e95C6Aedb715': convexTUSD,
      }
      return sumTokens2({ balances, owners: [FRACTAL_VAULT_CONTRACT, YIELD_RESERVE,], tokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], block, })
    },
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
  lockedLiquidityOf: { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "lockedLiquidityOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  getDebt: {"inputs":[],"name":"getDebt","outputs":[{"internalType":"uint256","name":"interestDebtAmount","type":"uint256"},{"internalType":"uint256","name":"grossDebtAmount","type":"uint256"},{"internalType":"uint256","name":"principalDebtAmount","type":"uint256"},{"internalType":"uint256","name":"interestOwed","type":"uint256"},{"internalType":"uint256","name":"applicableLateFee","type":"uint256"},{"internalType":"uint256","name":"netDebtAmount","type":"uint256"},{"internalType":"uint256","name":"daysSinceFunding","type":"uint256"},{"internalType":"uint256","name":"currentBillingCycle","type":"uint256"},{"internalType":"uint256","name":"minPaymentAmount","type":"uint256"},{"internalType":"uint256","name":"maxPaymentAmount","type":"uint256"}],"stateMutability":"view","type":"function"},
}
