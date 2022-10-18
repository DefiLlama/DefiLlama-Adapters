const { stakings } = require('../helper/staking')
const {getBlock} = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const {default: BigNumber} = require("bignumber.js");
const {getChainTransform} = require("../helper/portedTokens");

const minto = '0x410a56541bD912F9B60943fcB344f1E3D6F09567'
const hminto = '0x410a56541bd912f9b60943fcb344f1e3d6f09567'
const stackingContracts = [
  '0x78ae303182fca96a4629a78ee13235e6525ebcfb',
  '0xe742FCE58484FF7be7835D95E350c23CE55A7E12',
]
const heco = mintoStaking(stackingContracts, minto, 'heco');
const bsc = mintoStaking(stackingContracts, minto, 'bsc');

const abiBalanceOfSum = {
  "inputs": [
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  "name": "balanceOfSum",
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

function mintoStaking(stakingContracts, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {

  return async (timestamp, _ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, true)
    const bal = (await sdk.api.abi.multiCall({
      calls: stakingContracts.map(c => ({target: stakingToken, params: [c]})),
      chain,
      block,
      abi: abiBalanceOfSum
    })).output.reduce((total, call) => BigNumber(total).plus(call.output).toFixed(0), "0")
    let address = stakingToken;
    if (transformedTokenAddress) {
      address = transformedTokenAddress
    } else {
      address = (await getChainTransform(chain))(stakingToken)
    }
    if (decimals !== undefined) {
      return {
        [address]: Number(bal) / (10 ** decimals)
      }
    }
    return {
      [address]: bal
    }
  }
}
module.exports = {
  bsc: {
    tvl: bsc,
  },
  heco: {
    tvl: heco,
  }
}
