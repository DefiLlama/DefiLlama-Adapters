const { BigNumber } = require("ethers");
const tokens = new Map
tokens.set('SOY', ['0x8A78C1042F24349595f36f1a83091163487f2241', '0xD4630ECeE730DC19d092869f9cdd19204a5A131E'])
tokens.set('RICE', ['0x3356328A3CA51D2664620757bd1c475Ca77FFaB5', '0x0d9554CEebCD34A5796cE09216040e1ed58e1193'])
tokens.set('CORN', ['0x5074c4FA383d63D62d5F531D1CF92125fb39E859', '0x803205486937A151acf0eE14FD14Caf10EF24c39'])
tokens.set('WHEAT', ['0x1B2B0FA9283595F5036C007dD99Ed0aA6de8362E', '0x44C7Aca9C406DED532748194DA0d691808473aC9'])

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const oraclePrices = '0xF49A0863D532E6036D693FBACfd2417Aebda8784'
const rentFoundation = '0xc1B9119eA8f8164BE56eB15674107A8d1b09C285'


async function lockedRend(api) {
 const rent = await api.call({
    abi: 'erc20:balanceOf',
    target: usdc,
    params: rentFoundation,
  })
  return BigNumber.from(rent)
}
async function getPrice(address, api) {
  return await api.call({
    abi: 'function getXTokenPrice(address xToken) public view returns (uint256)',
    target: oraclePrices,
    params: address
  })
}

async function getCropPrice(crop, api){
  return await api.call({
    abi: 'function prices(string memory) public view returns (uint256)',
    target: oraclePrices,
    params: crop
  })
}

async function getAvailableToClaim(address, api){
  return await api.call({
    abi: 'function totalAvailableToClaim() public view returns (uint256)',
    target: address,
  })
}

async function getCTokensTVL(api) {
  let sum = BigNumber.from(0)
  for (const token of tokens) {
    const price = BigNumber.from(await getCropPrice(token[0], api))
    const cTokenSupply = BigNumber.from(await api.call({
      abi: 'erc20:totalSupply',
      target: token[1][1],
    }))
    const availableToClaim = BigNumber.from(await  getAvailableToClaim(token[1][0], api))
    sum = sum.add(cTokenSupply.add(availableToClaim).mul(price).div(BigNumber.from(10 ** 9)))
  }
  return sum
}

async function getXTokensTVL(api) {
  let sum = BigNumber.from(0)
  for (const token of tokens) {
    let price= BigNumber.from(await getPrice(token[1][0], api))
    const xTokenSupply = BigNumber.from(await api.call({
      abi: 'erc20:totalSupply',
      target: token[1][0],
    }))
    sum = sum.add(price.mul(xTokenSupply).div(BigNumber.from(1000000)))
  }
  return sum
}

async function tvl(_, _b, _cb, { api, }) {

  const rent = await lockedRend(api)
  const xTokenTvl = await getXTokensTVL(api)
  const cTokenTvl = await getCTokensTVL(api)

  api.add(usdc, rent.add(xTokenTvl).add(cTokenTvl))
}

module.exports = {
  ethereum :{
    tvl
  }
}