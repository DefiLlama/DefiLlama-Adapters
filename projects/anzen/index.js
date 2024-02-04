const sdk = require('@defillama/sdk');

const tokens = [
  '0xEf5AAcB3c38a5Be7785a361008e27fb0328a62B5', // secured private credit token
  '0xE16f2eC94E8a0819EB93022c45E05D582f4E5c15', // private credit token
];

async function tvl() {
  let balances = {};

  await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: token,
    })),
    abi: 'erc20:totalSupply',
    chain: 'ethereum'
  }).then(({ output }) => {
    output.forEach((supply, index) => {
      sdk.util.sumSingleBalance(balances, tokens[index], supply.output);
    });
  });

  return balances;
}

module.exports = {
  methodology: "Sums the locked collateral amounts and depositor token balances.",
  ethereum: {
    tvl,
  },
};
