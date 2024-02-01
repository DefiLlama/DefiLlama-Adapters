const fs = require('fs')
const coreAssets = require('../../projects/helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const bytecode = fs.readFileSync(__dirname + `/../artifacts/UniV2TVL.bytecode`, 'utf8')

async function main() {
  await getUniTvl('0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE', 'ethereum')
  await getUniTvl('0x21cadeb92c8bbfbef98c3098846f0999209c3a97', 'avax')
  await getUniTvl('0xAaA04462e35f3e40D798331657cA015169e005d7', 'dogechain')
}

async function getUniTvl(factory, chain = 'ethereum') {
  const api = new sdk.ChainApi({ chain})
  const res = await api.bytecodeCall({
    bytecode,
    inputs: [factory, Object.values(coreAssets[chain]), false, 0, 50],
    inputTypes: ['address', 'address[]', 'bool', 'uint256', 'uint256'],
    outputTypes: ['tuple(address,uint256)[]']
  })
  console.log(chain, factory, res)
}

main()