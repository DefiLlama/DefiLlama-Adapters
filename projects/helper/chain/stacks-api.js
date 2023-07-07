const stacks = require('@stacks/transactions')
const { StacksMainnet } = require('@stacks/network')

const { bufferCVFromString, callReadOnlyFunction, uintCV, principalCV, } = stacks
let network

const senderAddress = 'ST2F4BK4GZH6YFBNHYDDGN4T1RKBA7DA1BJZPJEJJ'

function getNetwork() {
  if (!network)
    network = new StacksMainnet()
  return network
}

async function call({ target, abi, inputArgs = [], }) {
  const [contractAddress, contractName] = target.split('.')
  const network = getNetwork()
  const result = await callReadOnlyFunction({ network, contractAddress, contractName, functionName: abi, functionArgs: inputArgs.map(toClairty), senderAddress});
  return stacks.cvToValue(result)

  function toClairty(arg) {
    switch (arg.type) {
      case 'string': return bufferCVFromString(arg.value)
      case 'number': return uintCV(arg.value)
      case 'principal': return principalCV(arg.value)
      default: throw new Error(`Unknown type ${arg.type}`)
    }
  }
}

module.exports = {
  call,
}

async function main() {
  const result = await callReadOnlyFunction(options);
  const result1 = await callReadOnlyFunction({...options, functionName: 'get-lp-data' });
  console.log(sTransactions.cvToValue(result));
  console.log(sTransactions.cvToValue(result1));
  console.log(sTransactions.cvToValue(await callReadOnlyFunction({
    contractAddress: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275',
    contractName: 'stackswap-swap-v5k',
    functionName: 'get-pair-count',
    functionArgs: [],
    network,
    senderAddress
  })))
  console.log(sTransactions.cvToValue(await callReadOnlyFunction({
    contractAddress: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275',
    contractName: 'stackswap-swap-v5k',
    functionName: 'get-pair-contracts',
    functionArgs: [uintCV(5)],
    network,
    senderAddress
  })))
}
