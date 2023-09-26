const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');
//Polygon FeedPrice contract address
const DFeedPriceAddress = "0x7d4d68f18d1be3410ab8d827fb7ebc690f938d2d"
//Contract ABI
const tokenListAbi = {
  "inputs": [],
  "name": "getAllTokenRecords",
  "outputs": [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "tokenType",
          "type": "uint64"
        }
      ],
      "internalType": "struct DFeedPrice.TokenRecord[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const tokenPriceAbi = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "chainId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "tokenAddress",
      "type": "address"
    }
  ],
  "name": "getTokenPrice",
  "outputs": [
    {
      "internalType": "uint128",
      "name": "",
      "type": "uint128"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const MumbaiApi = new sdk.ChainApi({ chain: 'polygon' });

async function getTokenList(chainId) {
  return (await MumbaiApi.call({
    target: DFeedPriceAddress,
    abi: tokenListAbi
  })).filter(item => item[0] == chainId && item[2] == '1').map(item => item[1]);
}

async function getTokenPrice(chainId, address) {
  return (await MumbaiApi.call({
    target: DFeedPriceAddress,
    abi: tokenPriceAbi,
    params: [chainId, address]
  })) / 1e18;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (...args) => {
      const { api } = args[3];
      const tokenList = await getTokenList(api.chainId);
      for (let address of tokenList) {
        const result = await api.call({ target: address, abi: 'uint256:totalSupply' }) / (10 ** (await api.call({ target: address, abi: 'uint8:decimals' })));
        const price = await getTokenPrice(api.chainId, address);
        const vl = result * price * 1e6
        api.add(ADDRESSES.ethereum.USDC, vl);
      }
    }
  }
};
