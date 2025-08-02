const axios = require('axios');
const { Interface } = require('ethers');

const B3TR_CONTRACT = '0x5ef79995FE8a89e0812330E4378eB2660ceDe699';
const VOT3_CONTRACT = '0x76Ca782B59C74d088C7D2Cce2f211BC00836c602';
const NODE_URL = 'https://mainnet.vechain.org';

const VOT3_ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

async function getVot3TotalSupply() {
  const calldata = new Interface(VOT3_ABI).encodeFunctionData('totalSupply');

  const data = {
    clauses: [{
      to: VOT3_CONTRACT,
      value: '0x0',
      data: calldata
    }]
  };    

  const resp = await axios.post(`${NODE_URL}/accounts/*`, data);
  const hexBalance = resp.data[0].data;
  return BigInt(hexBalance);
}

async function tvl(api) {
  const totalSupply = await getVot3TotalSupply();

  // The price of B3TR is equivalent to the price of VOT3, and on coingecko only B3TR is tracked
  // So we can use the totalSupply of VOT3 to get the total value locked, 
  // and use B3TR price to convert it to USD
  api.add(B3TR_CONTRACT, totalSupply)
}

module.exports = {
  timetravel: false, 
  misrepresentedTokens: false,
  methodology: 'Reads the VOT3 token circulating supply from the contract',
  vechain: { tvl },
};
