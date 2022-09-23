const sdk = require("@defillama/sdk");
const { getChainTransform,
  getFixBalances } = require("./helper/portedTokens");

const minedTokens = {
  'cake': '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
  'busd': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  'matic': '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  'ftm': '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  'avax': '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  'usdc': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // polygon
  'doge': '0xba2ae424d960c26247dd6c32edc70b295c744c43', // bsc
  'eth': '0x2170ed0880ac9a755fd29b2688956bd959f933f8'   // bsc
};
const minerContracts = {
  'cake': '0xD5d38f1815b4555527DE075a584268E08c5909EA',
  'busd': '0xe5973C042Cda75Dacd7bF36B3E7C7F1Ea2980A25',
  'matic': '0xf08665261ef76E56e732c711330e905020E445DA',
  'ftm': '0x69e7D335E8Da617E692d7379e03FEf74ef295899',
  'avax': '0x0c01328A0D8E996433Dd9720F40D896089eb966D',
  'usdc': '0xFF53b9822E114c0AE46cBdE4F7b4C642f8F9bbAA', // polygon
  'doge': '0x026d814935a053D10abA9987e4D047Aa9369c97E', // bsc
  'eth': '0x212A3A41a0e58CCdc86F013b003d4afF805a958c'   // bsc
};
const abi = {
  "constant": true,
  "inputs": [],
  "name": "getBalance",
  "outputs": [
    {
      "name": "",
      "type": "uint256"
    }
  ],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

const config = {
  bsc: {
    keys: ['cake', 'eth', 'doge', 'busd'],
  },
  polygon: {
    keys: ['matic', 'usdc'],
  },
  fantom: {
    keys: ['ftm'],
  },
  avax: {
    keys: ['avax'],
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { keys } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const balances = {}
      const transform = await getChainTransform(chain)
      const fixBalances = await getFixBalances(chain)
      const calls = keys.map(i => ({ target: minerContracts[i] }))
      const { output: bals } = await sdk.api.abi.multiCall({
        abi, calls, chain, block,
      })
      bals.forEach((data, i) => sdk.util.sumSingleBalance(balances, transform(minedTokens[keys[i]]), data.output))
      fixBalances(balances)
      return balances
    }
  }
})