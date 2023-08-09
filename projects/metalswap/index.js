const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require('../helper/staking')
const { pool2UniV3 } = require('../helper/pool2')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

// const ETH_DAO_CONTRACT = "0xc35BD9072de45215a25EB9DADB4fA54eea445a01";

const config = {
  ethereum: {
    toa: [
      [nullAddress, '0xaAA50f60a256b74D1C71ED4AD739836b50059201'],  // ETH pool legacy
      [nullAddress,'0x9494c9FfE0735832885269a10c910CDb227a7B0F'],   // ETH pool new
      [ADDRESSES.ethereum.USDT, '0x51bb873D5b68309cf645e84234bC290b7D991D2C'], //usdt pool legacy 
      [ADDRESSES.ethereum.USDT, '0x2535D0578562C88c1c875075A1085a4AD3117b20'], //usdt pool new 
      [ADDRESSES.ethereum.WBTC, '0xdCE224F9299CDd66e4D01D196d4cabce35a2F478'], //wbtc pool legacy 
      [ADDRESSES.ethereum.WBTC, '0x725fbd08e4c5d4b5978E48667d96D03F9B1C4d3A'], //wbtc pool new
      ['0x45804880De22913dAFE09f4980848ECE6EcbAf78', '0x787c68f6bCAb352Ec871C522d038bc7A30268020'], //paxg pool
    ],
    token: '0x3E5D9D8a63CC8a88748f229999CF59487e90721e',
    staking: [
      '0xCbD0F8e80e32B8e82f21f39FDE0A8bcf18535B21', // Pool 360 days
      '0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A', // Pool 30 days
      '0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed', // Pool 90 days
      '0xB9B17B61F7Cf8BDB192547948d5379C8EeaF3cd8', // Pool 180 days
      '0xcbF519299A115e325d6C82b514358362A9CA6ee5', // Iron Pool 180 days
      '0xaF9101314b14D8e243e1D519c0dd4e69DFd44466', // Iron Pool 360 days
      '0x6b392C307E0Fe2a8BE3687Bc780D4157592F4aC2', // nft Pre order
      '0x65e4FCDf4C0F6D8C5eA4842B5B7f4a9FF68bC0d6', // Smart Pool 6 months + 3 months 
    ],
  },
  bsc: {
    token: '0x582c12b30f85162fa393e5dbe2573f9f601f9d91',
    staking: [
      '0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed', // Pool 210 days
      '0xd38b66aACA9819623380f60814308c6594E2DC26', // Pool 30 days
      '0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A', // Pool 60 days
      '0x306825856807321671d21d4A2A9a65b02CCB51db', // Smart Pool 3 months + 3 months
      '0x842fDf4A6e861983D3Ef9299bF26EFC1FDB1Ba7A', // Smart Pool 2 months + 6 months
      '0x799BfC125170ab4dF34E9dC07DB47AA0edB9bC7C', // Smart Pool 6 months + 6 months
    ],
  },
  
  optimism: {
    toa: [
      [nullAddress, '0x5B7C5daa5f4Bb37c457dA468Da1CDaA6219892A1'],  // ETH pool 
      [ADDRESSES.optimism.USDC, '0x24682cFDc060316355C26C420d0748F289502e83'], //usdt pool new 
      ['0x68f180fcCe6836688e9084f035309E29Bf0A2095', '0x469CC7AF1696B5e4E6151796Dc3B3fEf39b34f39'], //wbtc pool new
      [ADDRESSES.optimism.OP, '0xc9394748D5f633152AD3F8f557a9B7743148db1B'], //Op pool new
    ],
    token: '0x3E5D9D8a63CC8a88748f229999CF59487e90721e',
  },
}

module.exports = {
  polygon: {
    pool2: pool2UniV3({ stakingAddress: '0x313c3F878998622f18761d609AA007F2bbC378Db', chain: 'polygon' })
  }
};

Object.keys(config).forEach(chain => {
  const { staking, token, toa = [] } = config[chain]
  module.exports[chain] = {
    tvl: (_, _b, {[chain]: block }) => sumTokens2({chain, block, tokensAndOwners: toa }),
    staking: stakings(staking, token, chain),
  }
})