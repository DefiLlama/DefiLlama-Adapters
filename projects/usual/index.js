const { abi } = require ('./abi')
const ADDRESSES = require('../helper/coreAssets.json')

const USD0 = '0x73a15fed60bf67631dc6cd7bc5b6e8da8190acf5'
const USYC = '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b'
const treasury = '0xdd82875f0840AAD58a455A70B88eEd9F59ceC7c7'
const oracle = '0x4c48bcb2160F8e0aDbf9D4F3B034f1e36d1f8b3e'

const tvl = async (api) => {
  const [usycHoldFromTreasury, { answer }] = await Promise.all([
    api.call({ target: USYC, abi: 'erc20:balanceOf', params: [treasury] }),
    api.call({ target: oracle, abi})
  ])

  const supply =  (answer / Math.pow(10, 8)) * usycHoldFromTreasury
  api.add(ADDRESSES.ethereum.USDC, supply)
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL represents the value in RWA held by the protocol',
  ethereum: {
    tvl
  }
}