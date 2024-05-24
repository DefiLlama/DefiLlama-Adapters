const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');
const { nullAddress } = require('../helper/tokenMapping');
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2: sumToken2Sol  } = require("../helper/solana");

const evmOwenerList = [
  '0x80c67432656d59144ceff962e8faf8926599bcf8',
  '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8',
  '0x41d3d33156ae7c62c094aae2995003ae63f587b3',
  '0xe01a40a0894970fc4c2b06f36f5eb94e73ea502d',
  '0xd7aa9ba6caac7b0436c91396f22ca5a7f31664fc',
  '0xee73323912a4e3772b74ed0ca1595a152b0ef282',
  '0x0a88bc5c32b684d467b43c06d9e0899efeaf59df',
  '0x1c84daa159cf68667a54beb412cdb8b2c193fb32',
  '0x8086061cf07c03559fbb4aa58f191f9c4a5df2b2',
  '0x732efacd14b0355999aebb133585787921aba3a9',
];

const solanaOwenerList = [
  'DowTWse9Sjzj1kN1V6zevfGtQ6wWpigug7TPCdTr6UNP',
]

let chainList = {
  ethereum: {
    id: '1'
  },
  arbitrum: {
    id: '42161'
  },
  polygon: {
    id: '137'
  },
  optimism: {
    id: '10'
  },
  metis: {
    id: '1088'
  },
  era: {
    id: '324'
  },
  bsc: {
    id: '56'
  },
  arbitrum_nova: {
    id: '42170'
  },
  polygon_zkevm: {
    id: '1101'
  },
  scroll: {
    id: '534352'
  },
  base: {
    id: '8453'
  },
  linea: {
    id: '59144'
  },
  mantle: {
    id: '5000'
  },
  op_bnb: {
    id: '204'
  },
  zora: {
    id: '7777777'
  },
  manta: {
    id: '169'
  },
  kroma: {
    id: '255'
  },
  zkfair: {
    id: '42766'
  },
  blast: {
    id: '81457'
  },
  zeta: {
    id: '7000'
  },
  mode: {
    id: '34443'
  },
  merlin: {
    id: '4200'
  },
  bevm: {
    id: '11501'
  },
  xlayer: {
    id: '196'
  },
  core: {
    id: '1116'
  },
  btr: {
    id: '200901'
  },
  bsquared: {
    id: '223'
  },
  // bob: { //FIXME: some issue
  //   id: '60808'
  // },
  bouncebit: {
    id: '6001'
  },
  solana: {
    id: 'SOLANA_MAIN'
  },
}

async function getOwnerTokens(chainId) {
  let tokenAddress = []
  const { result } = await getConfig('orbiter', 'https://api.orbiter.finance/sdk/chains')
  const chain = (result.find(chain => chain.chainId == chainId))
  if(chain.hasOwnProperty('tokens')){
    tokenAddress = chain.tokens.map(token => { 
      if(token.address == '0x0000000000000000000000000000000000000000') {
        return nullAddress;
      }
      return token.address;
    })
  }
  if(tokenAddress.length == 0) {
    return []
  }

  let ownerTokens = []
  let owenerList = []
  if(chainId == 'SOLANA_MAIN') {
    owenerList = solanaOwenerList
  } else {
    owenerList = evmOwenerList
  }
  owenerList.forEach(owener => {
    ownerTokens.push([tokenAddress, owener]);
    }
  )
  // console.log(JSON.stringify(ownerTokens));
  // console.log(chainId);
  return ownerTokens;
}

Object.keys(chainList).forEach(chainName => {
  const chain = chainList[chainName]
  module.exports[chainName] = {
    tvl: async (api) => {
      if(chainName == 'solana') {
        const owenerTokens = await getOwnerTokens(chain.id)
        return sumToken2Sol({api, owenerTokens})
      } else {
        //get nativecurrency tvl
        // let nativeBalance = await getNativeBalance(api, evmOwenerList)
        // api.add(nullAddress, nativeBalance.toString());
        //get erc20 tvl
        const ownerTokens = await getOwnerTokens(chain.id);
        return sumTokens2({ api, ownerTokens })
      }
    }
  }
})

// async function getNativeBalance(api, addressList) {
//   let balance = new BigNumber(0);
//   for(const address of addressList) {
//     await api.provider.getBalance(address).then(value => {
//       balance = balance.plus(new BigNumber(value));
//     })
//   }
//   return balance;
// }