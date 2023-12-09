const sdk = require('@defillama/sdk');

const LINEA_CONTRACTS = {
  linea: "0xf024541569796286d58fFF4b5898A3C3f1635bd1"
};

const getAumInUsdlAbi = {
    "inputs": [{"internalType":"bool","name":"maximise","type":"bool"}],
    "name": "getAumInUsdl",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
};

async function lineatvl(_, _1, _2, { api }) {
  const chainAddress = LINEA_CONTRACTS[api.chain];
  const aumInUSDL = await api.call({
      abi: getAumInUsdlAbi,
      target: chainAddress,
      params: [true]
  });

  // Replace 'usd-coin' with the actual token address of USDL
  const balances = {
      'usd-coin': aumInUSDL / 1e18 
  };

  return balances;
}

module.exports = {
  methodology: 'To get TVL we call the getAumInUsdl function from contract address: 0xf024541569796286d58fFF4b5898A3C3f1635bd1',
  linea: {
      tvl: lineatvl,
  },
};
