const ADDRESSES = require('../helper/coreAssets.json')
const tokens = {
  SOY: ['0x8A78C1042F24349595f36f1a83091163487f2241', '0xD4630ECeE730DC19d092869f9cdd19204a5A131E'],
  RICE: ['0x3356328A3CA51D2664620757bd1c475Ca77FFaB5', '0x0d9554CEebCD34A5796cE09216040e1ed58e1193'],
  CORN: ['0x5074c4FA383d63D62d5F531D1CF92125fb39E859', '0x803205486937A151acf0eE14FD14Caf10EF24c39'],
  WHEAT: ['0x1B2B0FA9283595F5036C007dD99Ed0aA6de8362E', '0x44C7Aca9C406DED532748194DA0d691808473aC9']
}

const oraclePrices = '0xF49A0863D532E6036D693FBACfd2417Aebda8784'
const rentFoundation = '0xc1B9119eA8f8164BE56eB15674107A8d1b09C285'

async function getCTokensTVL(api) {
  const cStrings = Object.keys(tokens)
  const xTokens = Object.values(tokens).map(t => t[0])
  const cTokens = Object.values(tokens).map(t => t[1])
  const prices = await api.multiCall({  abi: 'function prices(string memory) public view returns (uint256)', calls: cStrings, target: oraclePrices})
  const cTokenSupplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: cTokens})
  const availableToClaims = await api.multiCall({  abi: 'function totalAvailableToClaim() public view returns (uint256)', calls: xTokens})
  cTokenSupplies.forEach((val, i) => {
    api.add(ADDRESSES.ethereum.USDC, val * prices[i] / 1e9)
    api.add(ADDRESSES.ethereum.USDC, availableToClaims[i] * prices[i] / 1e9)
  })
}

async function getXTokensTVL(api) {
  const xTokens = Object.values(tokens).map(t => t[0])
  const prices = await api.multiCall({  abi: 'function getXTokenPrice(address xToken) public view returns (uint256)', calls: xTokens, target: oraclePrices})
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: xTokens})
  supplies.forEach((val, i) => {
    api.add(ADDRESSES.ethereum.USDC, val * prices[i] / 1e6)
  })
}

async function tvl(api) {
  await Promise.all([
    getCTokensTVL(api),
    getXTokensTVL(api),
    api.sumTokens({ owner: rentFoundation, tokens: [ADDRESSES.ethereum.USDC]})
  ])
}

module.exports = {
  misrepresentedTokens: true,
  ethereum :{
    tvl
  }
}