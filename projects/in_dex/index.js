const sdk = require("@defillama/sdk");


const FACTORY = "0x09ee9eCc6E2B458508E05Da7f90E324AE54620D2";  
const CHAIN = "hsk";               


const FACTORY_ABI_ALL_PAIRS_LENGTH = {
  "constant": true,
  "inputs": [],
  "name": "allPairsLength",
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
};

const FACTORY_ABI_ALL_PAIRS = {
  "constant": true,
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "allPairs",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const PAIR_ABI_TOKEN0 = {
  "constant": true,
  "inputs": [],
  "name": "token0",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const PAIR_ABI_TOKEN1 = {
  "constant": true,
  "inputs": [],
  "name": "token1",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const PAIR_ABI_GET_RESERVES = {
  "constant": true,
  "inputs": [],
  "name": "getReserves",
  "outputs": [
    {
      "internalType": "uint112",
      "name": "_reserve0",
      "type": "uint112"
    },
    {
      "internalType": "uint112",
      "name": "_reserve1",
      "type": "uint112"
    },
    {
      "internalType": "uint32",
      "name": "_blockTimestampLast",
      "type": "uint32"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};


async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[CHAIN] || ethBlock; 
  const balances = {};

 
  const pairLengthCall = await sdk.api.abi.call({
    target: FACTORY,
    abi: FACTORY_ABI_ALL_PAIRS_LENGTH,
    chain: CHAIN,
    block,
  });
  const totalPairs = Number(pairLengthCall.output);

  
  const pairCalls = [];
  for (let i = 0; i < totalPairs; i++) {
    pairCalls.push({ target: FACTORY, params: [i] });
  }
  const pairAddresses = (
    await sdk.api.abi.multiCall({
      abi: FACTORY_ABI_ALL_PAIRS,
      calls: pairCalls,
      chain: CHAIN,
      block,
    })
  ).output.map((res) => res.output);

  
  const token0Calls = pairAddresses.map((address) => ({ target: address }));
  const token1Calls = pairAddresses.map((address) => ({ target: address }));
  const reservesCalls = pairAddresses.map((address) => ({ target: address }));

  const [token0Results, token1Results, reservesResults] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: PAIR_ABI_TOKEN0,
      calls: token0Calls,
      chain: CHAIN,
      block,
    }),
    sdk.api.abi.multiCall({
      abi: PAIR_ABI_TOKEN1,
      calls: token1Calls,
      chain: CHAIN,
      block,
    }),
    sdk.api.abi.multiCall({
      abi: PAIR_ABI_GET_RESERVES,
      calls: reservesCalls,
      chain: CHAIN,
      block,
    }),
  ]);

  
  for (let i = 0; i < pairAddresses.length; i++) {
    const token0 = token0Results.output[i].output;
    const token1 = token1Results.output[i].output;
    const reserves = reservesResults.output[i].output;
    
    const token0Key = `${CHAIN}:${token0}`.toLowerCase();
    const token1Key = `${CHAIN}:${token1}`.toLowerCase();

    const r0 = reserves._reserve0;
    const r1 = reserves._reserve1;

    sdk.util.sumSingleBalance(balances, token0Key, r0);
    sdk.util.sumSingleBalance(balances, token1Key, r1);
  }

  return balances;
}

module.exports = {
  start: 69152, 
  [CHAIN]: {
    tvl,
  },
};
