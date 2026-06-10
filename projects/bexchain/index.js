const sdk = require('@defillama/sdk');

const factory = '0xe6ade1cf5b60d9f135e1d8c003b1e4bf9a897fd2';

// Mendefinisikan format objek ABI terurai yang wajib diikuti oleh SDK DefiLlama
const allPairsLengthAbi = {
  "inputs": [],
  "name": "allPairsLength",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
};

const allPairsAbi = {
  "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "name": "allPairs",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
};

const getReservesAbi = {
  "inputs": [],
  "name": "getReserves",
  "outputs": [
    { "internalType": "uint112", "name": "reserve0", "type": "uint112" },
    { "internalType": "uint112", "name": "reserve1", "type": "uint112" },
    { "internalType": "uint32", "name": "blockTimestampLast", "type": "uint32" }
  ],
  "stateMutability": "view",
  "type": "function"
};

const token0Abi = {
  "inputs": [],
  "name": "token0",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
};

const token1Abi = {
  "inputs": [],
  "name": "token1",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
};

async function tvl(api) {
  // Memanggil fungsi menggunakan objek ABI terurai
  const poolLength = await api.call({
    target: factory,
    abi: allPairsLengthAbi,
    chain: 'bexchain'
  });

  if (Number(poolLength) === 0) return {};

  const pairCalls = Array.from({ length: Number(poolLength) }, (_, i) => i);
  
  const pairs = await api.call({
    target: factory,
    abi: allPairsAbi,
    calls: pairCalls,
    chain: 'bexchain'
  });

  const reserves = await api.call({
    abi: getReservesAbi,
    calls: pairs,
    chain: 'bexchain'
  });

  const tokens = await Promise.all([
    api.call({ abi: token0Abi, calls: pairs, chain: 'bexchain' }),
    api.call({ abi: token1Abi, calls: pairs, chain: 'bexchain' })
  ]);

  reserves.forEach((res, i) => {
    api.add(tokens[0][i], res.reserve0);
    api.add(tokens[1][i], res.reserve1);
  });
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  bexchain: {
    tvl
  }
};
