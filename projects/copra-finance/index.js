const { getLogs, } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(_, _b, _cb, { api }) {
  const { factory, fromBlock } = config[api.chain];

  const logs = await getLogs({
    api,
    target: factory,
    onlyArgs: true,
    eventAbi: 'event CreditAccountDeployed (address indexed creditAccount)',
    fromBlock,
  })
  const creditAccounts = logs.map((i) => i.creditAccount)

  const tvls = await Promise.all(creditAccounts.map(async (creditAccountAddr) => {
    const status = await getStatus(creditAccountAddr, api)
    if (status == 0 || status == 1) {
      const assetAddr = await getCreditAccountAsset(creditAccountAddr, api)
      const borrowerFundedAmount = await getBorrowerFundedAmount(creditAccountAddr, api);
      const lenderFundedAmount = await getLenderFundedAmount(creditAccountAddr, api)

      const totalFundedAmount = BigInt(borrowerFundedAmount) + BigInt(lenderFundedAmount)
      if (totalFundedAmount == 0) return ["", BigInt(0)]
      return [assetAddr, totalFundedAmount]
    }

    return ["", BigInt(0)]
  }))

  const tokenBalances = tvls.reduce((acc, curr) => {
    const [tokenAddr, balance] = curr
    if (!tokenAddr) return acc

    if (acc[tokenAddr]) {
      acc[tokenAddr] += balance
    } else {
      acc[tokenAddr] = balance
    }

    return acc
  }, {})

  api.addTokens(Object.keys(tokenBalances), Object.values(tokenBalances))
}

const getStatus = async (creditAccountAddr, api) => {
  return await api.call({
    abi: {
      "inputs": [],
      "name": "getStatus",
      "outputs": [
        {
          "internalType": "enum ICreditAccount.Status",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: creditAccountAddr,
    params: [],
  });
}

const getCreditAccountAsset = async (creditAccountAddr, api) => {
  const terms = await api.call({
    abi: {
      "inputs": [],
      "name": "getTerms",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tenor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "principalAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "interestAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "securityDepositAmount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "internalType": "struct ICreditAccount.Terms",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: creditAccountAddr,
    params: []
  })
  return terms.token
}

const getBorrowerFundedAmount = async (creditAccountAddr, api) => {
  return await api.call({
    abi: {
      "inputs": [],
      "name": "getBorrowerFundedAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: creditAccountAddr,
    params: []
  })
}

const getLenderFundedAmount = async (creditAccountAddr, api) => {
  return await api.call({
    abi: {
      "inputs": [],
      "name": "getTotalFundedPrincipalAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: creditAccountAddr,
    params: []
  })
}

const config = {
  arbitrum: {
    factory: "0x2eaA3A5223FCb7A9EeC3bFCD399A4c479c6008f6",
    fromBlock: 183991616 ,
    tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.null]
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})