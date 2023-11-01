const addressProvider = "0xFf6c50B43382f2531FEF7d6382cCe1263B0585f1"

async function tvl(_, _1, _2, { api }) {
  const lendVaultAddress = await api.call({
    abi: {
      "inputs": [],
      "name": "lendVault",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: addressProvider,
    params: [],
  });

  const supportedTokens = await api.call({
    abi: {
      "inputs": [],
      "name": "getSupportedTokens",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: lendVaultAddress,
    params: [],
  });

  for (const token of supportedTokens) {
    const balance = await api.call({
      abi: {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "totalAssets",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      target: lendVaultAddress,
      params: [token],
    });
    api.add(token, balance)
  }

  const vaults = await api.call({
    abi: {
      "inputs": [],
      "name": "getVaults",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "v",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    target: addressProvider,
    params: [],
  });

  for (const vault of vaults) {
    const balance = await api.call({
      abi: {
        "inputs": [],
        "name": "balance",
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
      target: vault,
      params: [],
    });
    const token = await api.call({
      abi: {
        "inputs": [],
        "name": "depositToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      target: vault,
      params: [],
    });
    api.add(token, balance)

  }

}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Total asset value held in the Rumi lend vault and Rumi strategies',
  start: 143884813,
  arbitrum: {
    tvl,
  }
}; 