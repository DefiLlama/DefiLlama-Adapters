const ethers = require('ethers')
const { getProvider } = require('@defillama/sdk/build/general')
const fs = require('fs')
const coreAssets = require('../../projects/helper/coreAssets.json')

const bytecode = fs.readFileSync(__dirname + `/../artifacts/UniV2TVL.bytecode`, 'utf8')
// const inputData = ethers.utils.defaultAbiCoder.encode(['address'], ['0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f']);
const inputData = ethers.utils.defaultAbiCoder.encode(['address', 'address[]', 'bool', 'uint256', 'uint256'], ['0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE', Object.values(coreAssets.ethereum), false, 0, 0]);

// concatenate the bytecode of BatchPoolManagerData with the input data.
// the slice is done to remove the 0x prefix from the input data added by the encoding
const contractCreationCode = bytecode.concat(inputData.slice(2));

const provider = getProvider('ethereum')

async function main() {
  const returnedData = await provider.call({ data: '0x' + contractCreationCode })
  console.log(returnedData)
  // decode the returned data to get the array of tuples using the same data types as the Data struct in the PoolManager contract
  const [decoded] = ethers.utils.defaultAbiCoder.decode(['tuple(address,uint256)[]'], returnedData);
  console.log(decoded)
}

main()