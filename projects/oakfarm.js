const { masterchefExports } = require('./helper/unknownTokens')
const { unwrapLPsAuto } = require('./helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const abi = {
  poolInfo: {
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolInfo",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "lpToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allocPoint",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accSushiPerShare",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  token: {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  balance: {
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
}
const mcExports =
  masterchefExports({
    chain: 'okexchain',
    masterchef: '0xb7C1E1ceAE8b974685872eB8f5196E3440655928',
    nativeToken: '0xc8644956a0c9334a82f26f5773f5dc090d095d2a',
    poolInfoABI: abi.poolInfo,
    useDefaultCoreAssets: true,
  })

const config = {
  okexchain: {
    vaults: [
      '0x85fa637524da5a438df26b85fd55c8ce759168b1',
      '0xfb75a5998dff36862571fb93b9953b78d33401d7',
      '0xa8c3fccd40018bf16e152bef3abc66c245a942c0',
      '0xb8f2c41d33d11fa2e06407ba8b0e09abdb7d6fa1',
      '0xd51524bb57bac2287135f9651984fb4b3e0aea35',
      '0xd730dab3aff9dd845b3054f4de0a9e935d125b58',
    ],
  },
  // bsc: {
  //   vaults: Object.values({
  //     cake_maximizer_cake_bnb: '0xDcf55Cc791Ef7c04Da67625b00aD38CbbdC211F4',
  //     cake_maximizer_usdt_busd: '0x8204E97267309D880f8430f6E20c1a39AF96D568',
  //     cake_maximizer_busd_bnb: '0x3a90bC01eB56Dc9ae5460705711F678Ae84240BE',
  //     cake_maximizer_bp_bnb: '0x7Ceed8Ad4D242CA3a5d88ED482dA7Cd92Bcb36c8'
  //   })
  // }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const balances = {}
      const { vaults } = config[chain]
      const calls = vaults.map(i => ({ target: i }))
      const { output: tokens } = await sdk.api.abi.multiCall({
        abi: abi.token, calls, chain, block,
      })
      const { output: bal } = await sdk.api.abi.multiCall({
        abi: abi.balance, calls, chain, block,
      })
      tokens.forEach(({ output: token, }, i) => sdk.util.sumSingleBalance(balances, `${chain}:${token}`, bal[i].output))
      await unwrapLPsAuto({ balances, chain, block, })
      return balances
    }
  }
  if (chain === 'okexchain')
  module.exports[chain].pool2 = mcExports[chain].pool2
})