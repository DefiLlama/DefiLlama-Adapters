const sdk = require('@defillama/sdk');

const BigNumber = require("bignumber.js");


const tokens = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
];

const ownerAddress = [
  '0xA1D5443F2FB80A5A55ac804C948B45ce4C52DCbb'
]

async function tvl (timestamp, block) {
  const balances = {};

  let balanceOfCalls = [];
  ownerAddress.forEach((contract) => {
    balanceOfCalls = [
      ...balanceOfCalls,
      ...tokens.map((token) => ({
        target: token,
        params: contract
      }))
    ];
  });

  const balanceOfResult = (await sdk.api.abi.multiCall({
    block,
    calls: balanceOfCalls,
    abi: 'erc20:balanceOf',
  }));

  sdk.util.sumMultiBalanceOf(balances, balanceOfResult, true)

  return balances;
}

module.exports = {
  start: 15402867,
  ethereum: { tvl },
};
