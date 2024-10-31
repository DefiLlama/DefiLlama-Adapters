const { getLogs2 } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");

const abi = {
  openEvent: 'event Open(bytes32 indexed key, uint192 indexed bookIdA, uint192 indexed bookIdB, bytes32 salt, address strategy)',
  getBookKey: {
    "inputs": [
      {
        "internalType": "BookId",
        "name": "id",
        "type": "uint192"
      }
    ],
    "name": "getBookKey",
    "outputs": [
      {
        "components": [
          {
            "internalType": "Currency",
            "name": "base",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "unitSize",
            "type": "uint64"
          },
          {
            "internalType": "Currency",
            "name": "quote",
            "type": "address"
          },
          {
            "internalType": "FeePolicy",
            "name": "makerPolicy",
            "type": "uint24"
          },
          {
            "internalType": "contract IHooks",
            "name": "hooks",
            "type": "address"
          },
          {
            "internalType": "FeePolicy",
            "name": "takerPolicy",
            "type": "uint24"
          }
        ],
        "internalType": "struct IBookManager.BookKey",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getLiquidity: {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getLiquidity",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "reserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimable",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cancelable",
            "type": "uint256"
          }
        ],
        "internalType": "struct IRebalancer.Liquidity",
        "name": "liquidityA",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "reserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimable",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cancelable",
            "type": "uint256"
          }
        ],
        "internalType": "struct IRebalancer.Liquidity",
        "name": "liquidityB",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}

const config = {
  base: {
    rebalancer: '0x13f2Ff6Cc952f4181D6c316426e9CbdA957c6482',
    bookManager: '0x382CCccbD3b142D7DA063bF68cd0c89634767F76',
    fromBlock: 21715410,
  },
}

async function tvl(api) {
  const balances = {}
  const { rebalancer, bookManager, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, factory: rebalancer, eventAbi: abi.openEvent, fromBlock, })
  for (const log of logs) {
    const poolKey = log.key
    const bookIdA = log.bookIdA
    const bookKeyA = await sdk.api.abi.call({
      chain: api.chain,
      target: bookManager,
      params: [bookIdA],
      abi: abi.getBookKey,
    });
    const currencyA = bookKeyA.output.quote
    const currencyB = bookKeyA.output.base
    const liquidity = await sdk.api.abi.call({
      chain: api.chain,
      target: rebalancer,
      params: [poolKey],
      abi: abi.getLiquidity,
    });
    const liquidityA = BigInt(liquidity.output.liquidityA.reserve) + BigInt(liquidity.output.liquidityA.claimable) + BigInt(liquidity.output.liquidityA.cancelable)
    const liquidityB = BigInt(liquidity.output.liquidityB.reserve) + BigInt(liquidity.output.liquidityB.claimable) + BigInt(liquidity.output.liquidityB.cancelable)
    balances[currencyA] = (balances[currencyA] || 0n) + liquidityA
    balances[currencyB] = (balances[currencyB] || 0n) + liquidityB
  }
  for (const [token, balance] of Object.entries(balances)) {
    api.addToken(token, balance.toString())
  }
  return api.getBalances()
}

module.exports = {
  methodology: "TVL includes all assets deposited into the Clober Liquidity Vault contract, specifically allocated for liquidity provision and market-making within the Clober ecosystem",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
