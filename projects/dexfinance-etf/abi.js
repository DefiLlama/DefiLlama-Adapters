const ETF_ABI = {
  'getCurrentTokens':"address[]:getCurrentTokens"
}

const VAULT_FACTORY_ABI = {
  profitTokensWhitelistCount: {
    'inputs': [],
    'name': 'profitTokensWhitelistCount',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  profitTokensWhitelist: {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': 'index',
        'type': 'uint256'
      }
    ],
    'name': 'profitTokensWhitelist',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  profitTokenConnector: {
    'inputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'name': 'profitTokenConnector',
    'outputs': [
      {
        'internalType': 'contract IDexFiProfit',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  }
}
const VAULT_PROFIT_TOKEN_ABI = {
  underlying: {
    'inputs': [],
    'name': 'underlying',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
}

const VAULT_ETF_ABI = {
  tokensCount:   {
    'inputs': [

    ],
    'name': 'tokensCount',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  tokens:   {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': 'index',
        'type': 'uint256'
      }
    ],
    'name': 'tokens',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
}

module.exports = {
  ETF_ABI,
  VAULT_FACTORY_ABI,
  VAULT_PROFIT_TOKEN_ABI,
  VAULT_ETF_ABI
}