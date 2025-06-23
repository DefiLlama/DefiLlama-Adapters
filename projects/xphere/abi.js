 const LOCKUP_CONTRACT_ABI = [
    {
      inputs: [],
      name: 'cancelEarlyWithdrawal',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'fee',
          type: 'uint256',
        },
      ],
      name: 'confirmEarlyWithdrawal',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
      ],
      name: 'EarlyWithdrawalCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'fee',
          type: 'uint256',
        },
      ],
      name: 'EarlyWithdrawalConfirmed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'EarlyWithdrawalRequested',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'unlockBlock',
          type: 'uint256',
        },
      ],
      name: 'LockCreated',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'requestEarlyWithdrawal',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'Withdrawn',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'earlyWithdrawalRequests',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'requestTime',
          type: 'uint256',
        },
        {
          internalType: 'bool',
          name: 'isConfirmed',
          type: 'bool',
        },
        {
          internalType: 'bool',
          name: 'isCancelled',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'getAccountLockInfo',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'unlockBlock',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'isReleased',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'getEarlyWithdrawalRequest',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'requestTime',
          type: 'uint256',
        },
        {
          internalType: 'bool',
          name: 'isConfirmed',
          type: 'bool',
        },
        {
          internalType: 'bool',
          name: 'isCancelled',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getEarlyWithdrawalRequestCount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'offset',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'limit',
          type: 'uint256',
        },
      ],
      name: 'getEarlyWithdrawalRequests',
      outputs: [
        {
          internalType: 'address[]',
          name: 'accounts',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'offset',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'limit',
          type: 'uint256',
        },
      ],
      name: 'getLockedAccounts',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getLockedAccountsCount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getLockInfo',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'unlockBlock',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'isReleased',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
      ],
      name: 'getLockupAccountByNode',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getLockUpNode',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
      ],
      name: 'getNodeLockInfo',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'unlockBlock',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'lockupAccount',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'isReleased',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getTimeUntilUnlock',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'locks',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'unlockBlock',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'nodeAddress',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'isReleased',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
 ]
module.exports = {
    LOCKUP_CONTRACT_ABI,
}