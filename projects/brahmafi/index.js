const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const vaults = [
  '0xAa0508FcD0352B206F558b2B817dcC1F0cc3F401', // ETH Maxi
  '0x1c4ceb52ab54a35f9d03fcc156a7c57f965e081e', // PM USDC
]

const tvl = async (timestamp, block) => {
  const calls = vaults.map(v => ({ target: v }))
  const balances = {}

  const [
    tokens, balance
  ] = await Promise.all([
    sdk.api.abi.multiCall({ block, calls, abi: abi.wantToken }),
    // sdk.api.abi.multiCall({ block, calls, abi: abi.totalVaultFunds }),
    sdk.api.abi.multiCall({ block, calls, abi: 'erc20:totalSupply' }),
  ]).then(o => o.map(i => i.output))

  tokens.forEach((i, j) => {
    balances[i.output] = balance[j].output
  });

  return balances
};

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl,
  },
};
