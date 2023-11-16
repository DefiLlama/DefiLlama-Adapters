const { getLogs } = require('../helper/cache/getLogs')

const CONTRACT_INFOS = {
  arbitrum: {
    substituteContract: {
      abi: {
        underlyingToken: 'function underlyingToken() external view returns (address)'
      },
    },
    assetPoolContract: {
      address: '0xBA4B7f0Dd297C68Ca472da58CfE1338B9E7A0D9e',
      fromBlock: 150536505,
    },
    bondPositionManagerContract: {
      address: '0x0Cf91Bc7a67B063142C029a69fF9C8ccd93476E2',
      fromBlock: 150536528,
      abi: {
        registerEvent: 'event RegisterAsset(address indexed asset)',
      },
      topic: {
        registerEvent: 'RegisterAsset(address)',
      }
    },
    loanPositionManagerContract: {
      address: '0x03d65411684ae7B5440E11a6063881a774C733dF',
      fromBlock: 150536540,
      abi: {
        setLoanConfigurationEvent: 'event SetLoanConfiguration(address indexed collateral, address indexed debt, uint32 liquidationThreshold, uint32 liquidationFee, uint32 liquidationProtocolFee, uint32 liquidationTargetLtv, address hook)',
      },
      topic: {
        setLoanConfigurationEvent: 'SetLoanConfiguration(address,address,uint32,uint32,uint32,uint32,address)',
      }
    }
  }
}

function chainTvl(chain) {
  return async (_, _1, _2, { api }) => {
    const CONTRACT_INFO = CONTRACT_INFOS[chain]
    const [registerEvents, setLoanConfigurationEvents] = await Promise.all([
      getLogs({
        api,
        target: CONTRACT_INFO.bondPositionManagerContract.address,
        fromBlock: CONTRACT_INFO.bondPositionManagerContract.fromBlock,
        topic: CONTRACT_INFO.bondPositionManagerContract.topic.registerEvent,
        eventAbi: CONTRACT_INFO.bondPositionManagerContract.abi.registerEvent,
        onlyArgs: true,
      }),
      getLogs({
        api,
        target: CONTRACT_INFO.loanPositionManagerContract.address,
        fromBlock: CONTRACT_INFO.loanPositionManagerContract.fromBlock,
        topic: CONTRACT_INFO.loanPositionManagerContract.topic.setLoanConfigurationEvent,
        eventAbi: CONTRACT_INFO.loanPositionManagerContract.abi.setLoanConfigurationEvent,
        onlyArgs: true,
      }),
    ])
    const substituteTokens = [...new Set([
      ...registerEvents.map(({ asset }) => asset),
      ...setLoanConfigurationEvents.map(({ collateral, debt }) => [collateral, debt]).flat(),
    ])]
    const [underlyingTokens, balances] = await Promise.all([
      api.multiCall({
        abi: CONTRACT_INFO.substituteContract.abi.underlyingToken,
        calls: substituteTokens.map(token => ({ target: token })),
      }),
      api.multiCall({
        abi: 'erc20:balanceOf',
        calls: substituteTokens.map(token => ({ target: token, params: [CONTRACT_INFO.assetPoolContract.address] })),
      })
    ])
    api.addTokens(underlyingTokens, balances)
    return api.getBalances()
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL consists of deposit and collateral in the Coupon Finance contract",
  start: 150536505,
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
};
