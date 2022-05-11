const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const lockCvxAddress = '0x96C68D861aDa016Ed98c30C810879F9df7c64154';

const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";



async function tvl(timestamp, block) {
  let balances = {}
  const totalLockedGlobal = (await sdk.api.abi.call({
    target: lockCvxAddress,
    block,
    abi: {
      "inputs": [],
      "name": "totalLockedGlobal",
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
  })).output
  if (!BigNumber(totalLockedGlobal).isZero()) {
    sdk.util.sumSingleBalance(balances, cvxAddress, BigNumber(totalLockedGlobal).toFixed(0))
  }
  return balances
}
module.exports = {
  ethereum: {
    tvl
  }
}
