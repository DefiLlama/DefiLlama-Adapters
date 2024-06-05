const { request, } = require("graphql-request");
const { getBlock } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const graphEndpoints = {
  // ethereum: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  // "bsc": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
  // //"heco": "https://q.hg.network/subgraphs/name/dodoex/heco",
  // "polygon": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
  // "arbitrum": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
  // "aurora": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-aurora",
  // "avax": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-avax",
  // "optimism": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-optimism",
  // "base": "https://api.studio.thegraph.com/query/2860/dodoex_v2_base/v0.0.5",
  // "linea": "https://api.dodoex.io/graphql?chainId=59144&schemaName=dodoex&apikey=graphqldefiLlamadodoYzj5giof",
  // "scroll": "https://api.dodoex.io/graphql?chain=src&schemaName=dodoex&apikey=graphqldefiLlamadodoYzj5giof", // ChainId mapping error, so using chain 
  // "manta": "https://api.dodoex.io/graphql?chainId=169&schemaName=dodoex&apikey=graphqldefiLlamadodoYzj5giof",
  // "mantle": "https://api.dodoex.io/graphql?chainId=5000&schemaName=dodoex&apikey=graphqldefiLlamadodoYzj5giof"
}
const graphQuery = `query get_pairs($lastId: ID, $block: Int!) {
  pairs(
    first: 1000
    block: {number: $block}
    where: {and: [{id_gt: $lastId}, {or: [{baseReserve_gt: 0}, {quoteReserve_gt: 0}]}]}
  ) {
    id
    baseReserve
    quoteReserve
    baseToken {
      id
      symbol
      usdPrice
      decimals
    }
    quoteToken {
      id
      symbol
      usdPrice
      decimals
    }
  }
}`

Object.keys(graphEndpoints).forEach(chain => {
  module.exports[chain] = {
    tvl: async (ts, _, chainBlocks) => {

      const block = await getBlock(ts, chain, chainBlocks)
      let allPairs = []
      let lastId = ""
      let response;
      do {
        response = await request(
          graphEndpoints[chain],
          graphQuery,
          { lastId, block: block - 500, }
        );
        allPairs = allPairs.concat(response.pairs)
        lastId = response.pairs[response.pairs.length - 1].id
      } while (response.pairs.length >= 1000);

      const balances = {}
      const blacklist = [
        '0xd79d32a4722129a4d9b90d52d44bf5e91bed430c',
        '0xdb1e780db819333ea79c9744cc66c89fbf326ce8', // this token is destroyed
        '0xa88c5693c9c2549a75acd2b44f052f6a5568e918', // this token is destroyed
        '0x738076a6cb6c30d906bcb2e9ba0e0d9a58b3292e', // SRSB is absuredly priced 
        '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1', // YSL is absuredly priced 
        '0x2b1e9ded77ff8ecd81f71ffc5751622e6f1291c3', // error querying balance
        '0x272c2CF847A49215A3A1D4bFf8760E503A06f880', // abnb LP mispriced
        '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183', // XRPC
      ].map(i => i.toLowerCase())

      allPairs.forEach(pair => {
        if (pair.id.includes('-'))
          return null
        if (!blacklist.includes(pair.baseToken.id.toLowerCase()) && +pair.baseReserve > 1 && +pair.baseToken.usdPrice > 0)
          sdk.util.sumSingleBalance(balances, chain + ':' + pair.baseToken.id, pair.baseReserve * (10 ** pair.baseToken.decimals))
        if (!blacklist.includes(pair.quoteToken.id.toLowerCase()) && +pair.quoteReserve > 1 && +pair.quoteToken.usdPrice > 0)
          sdk.util.sumSingleBalance(balances, chain + ':' + pair.quoteToken.id, pair.quoteReserve * (10 ** pair.quoteToken.decimals))
      })

      return balances
    }
  }
})

const config = {
  ethereum: { dvmFactory: '0x72d220cE168C4f361dD4deE5D826a01AD8598f6C', dodoBirthFactory: '0x3a97247df274a17c59a3bd12735ea3fcdfb49950', fromBlock: 10613640, dspFactory: '0x6fddb76c93299d985f4d3fc7ac468f9a168577a4', dppFactory: ['0x5336ede8f971339f6c0e304c66ba16f1296a2fbe', '0xb5dc5e183c2acf02ab879a8569ab4edaf147d537', '0x6b4fa0bc61eddc928e0df9c7f01e407bfcd3e5ef'] },
  arbitrum: { dvmFactory: '0xDa4c4411c55B0785e501332354A036c04833B72b', fromBlock: 226578, dspFactory: '0xC8fE2440744dcd733246a4dB14093664DEFD5A53', dodoBirthFactory: '0xbcc3401e16c25eaf4d3fed632ce3288503883b1f', dppFactory: ['0xDdB13e6dd168E1a68DC2285Cb212078ae10394A9', '0xa6cf3d163358af376ec5e8b7cc5e102a05fde63d'] },
  bsc: {
    dvmFactory: ['0x790B4A80Fb1094589A3c0eFC8740aA9b0C1733fB', '0xf50bdc9e90b7a1c138cb7935071b85c417c4cb8e'], fromBlock: 726278, dspFactory: '0x0fb9815938Ad069Bf90E14FE6C596c514BEDe767', dppFactory: ['0xd9CAc3D964327e47399aebd8e1e6dCC4c251DaAE', '0x7737fd30535c69545deeea54ab8dd590ccaebd3c', '0x9b64c81ba54ea51e1f6b7fefb3cff8aa6f1e2a09', '0xafe0a75dffb395eaabd0a7e1bbbd0b11f8609eef'], dodoBirthFactory: '0xca459456a45e300aa7ef447dbb60f87cccb42828', blacklistedTokens: [
      '0xcc7fc8666f6e62cb44aa781de841ee6be3bbe54c',
      '0xdb1e780db819333ea79c9744cc66c89fbf326ce8',
    ]
  },
  polygon: {
    dppFactory: ['0xd24153244066F0afA9415563bFC7Ba248bfB7a51', '0x95E887aDF9EAa22cC1c6E3Cb7f07adC95b4b25a8'], dvmFactory: '0x79887f65f83bdf15Bcc8736b5e5BcDB48fb8fE13', fromBlock:
      14604330, dspFactory: '0x43C49f8DD240e1545F147211Ec9f917376Ac1e87', blacklistedTokens: [
        '0xd79d32a4722129a4d9b90d52d44bf5e91bed430c',
        '0xa88c5693c9c2549a75acd2b44f052f6a5568e918',
      ]
  },
  avax: { dvmFactory: '0xfF133A6D335b50bDAa6612D19E1352B049A8aE6a', fromBlock: 8488454, dspFactory: '0x2b0d94Eb7A63B8a2909dE1CB3951ecF7Ae76D2fE', dppFactory: '0xb7865a5cee051d35b09a48b624d7057d3362655a' },
  aurora: { dvmFactory: '0x5515363c0412AdD5c72d3E302fE1bD7dCBCF93Fe', dodoBirthFactory: '0xf50BDc9E90B7a1c138cb7935071b85c417C4cb8e', fromBlock: 50554196, dspFactory: '0xbe9a66e49503e84ae59a4d0545365AABedf33b40', dppFactory: '0x40672211D4310ad71daDc8cDE7Aa3Fb90d420855' },
  optimism: { dvmFactory: '0x2b800dc6270726f7e2266ce8cd5a3f8436fe0b40', fromBlock: 5886090, dspFactory: '0x1f83858cD6d0ae7a08aB1FD977C06DABEcE6d711', dppFactory: '0xdb9c53f2ced34875685b607c97a61a65da2f30a8' },
  base: { dvmFactory: '0x0226fCE8c969604C3A0AD19c37d1FAFac73e13c2', fromBlock: 1996181, dspFactory: '0x200D866Edf41070DE251Ef92715a6Ea825A5Eb80', dppFactory: '0xc0F9553Df63De5a97Fe64422c8578D0657C360f7' },
  linea: { dvmFactory: '0xc0F9553Df63De5a97Fe64422c8578D0657C360f7', fromBlock: 91468, dspFactory: '0x2933c0374089D7D98BA0C71c5E02E1A0e09deBEE', dppFactory: '0x97bBF5BB1dcfC93A8c67e97E50Bea19DB3416A83' },
  scroll: { dvmFactory: '0x5a0C840a7089aa222c4458b3BE0947fe5a5006DE', fromBlock: 83070, dspFactory: '0x7E9c460d0A10bd0605B15F0d0388e307d34a62E6', dppFactory: '0x31AC053c31a77055b2ae2d3899091C0A9c19cE3a' },
  manta: { dvmFactory: '0x97bBF5BB1dcfC93A8c67e97E50Bea19DB3416A83', fromBlock: 384137, dspFactory: '0x29C7718e8B606cEF1c44Fe6e43e07aF9D0875DE1', dppFactory: '0xa71415675F68f29259ddD63215E5518d2735bf0a' },
  mantle: { dvmFactory: '0x29C7718e8B606cEF1c44Fe6e43e07aF9D0875DE1', fromBlock: 21054048, dspFactory: '0x7dB214f2D46d94846936a0f8Bd9044c5C5Bd2b93', dppFactory: '0x46AF6b152F2cb02a3cFcc74014C2617BC4F6cD5C' },
  // okexchain: { dvmFactory: '0x9aE501385Bc7996A2A4a1FBb00c8d3820611BCB5', fromBlock: 4701083, dspFactory: '0x44D5dF24d5Ef52A791D6436Fa45A8D426f6de34e' },
}

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, dppFactory, dodoBirthFactory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      const funcs = [];
      const builder = (factorys, event) => {
        if (Array.isArray(factorys)) {
          factorys.forEach(factory => funcs.push(addLogs(factory, event)));
        } else {
          funcs.push(addLogs(factorys, event));
        }
      }
      builder(dvmFactory, 'event NewDVM (address baseToken, address quoteToken, address creator, address pool)');
      builder(dspFactory, 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)');
      builder(dppFactory, 'event NewDPP (address baseToken, address quoteToken, address creator, address pool)');
      builder(dodoBirthFactory, 'event DODOBirth (address pool, address baseToken, address quoteToken)');

      await Promise.all(funcs)
      if (chain === 'ethereum')
        ownerTokens.push([['0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd', ADDRESSES.ethereum.USDT], '0x8876819535b48b551C9e97EBc07332C7482b4b2d'])
      api.log(ownerTokens.length * 2, api.chain)
      if (chain === 'base')
        ownerTokens.push(...[
          [[ADDRESSES.optimism.WETH_1, ADDRESSES.base.USDbC], '0x1172035a744ea18161497e94f0bbce244d51de9f'],
          [[ADDRESSES.optimism.WETH_1, '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22'], '0xce670438dadb080d7aae65fdaff51355aa30535e'],
          [[ADDRESSES.optimism.WETH_1, '0x78a087d713be963bf307b18f2ff8122ef9a63ae9'], '0x3c388c812dada10e597f802a766e7ce898bc7751'],
          [[ADDRESSES.base.USDbC, ADDRESSES.optimism.WETH_1], '0xd804cf0ac2a4b6dd6d375504a27874f5db073625'],
          [[ADDRESSES.optimism.WETH_1, ADDRESSES.base.USDbC], '0x72e663c4e8fd50184c8b8135315c20326cc4ad75'],
          [[ADDRESSES.base.USDC, ADDRESSES.base.USDbC], '0xe8ef69e4dd7f6ed2d84f256e97469bca22b78a8b'],
        ])

      return api.sumTokens({ ownerTokens, blacklistedTokens, permitFailure: true, })

      async function addLogs(target, eventAbi) {
        if (!target) return;
        const convert = i => [[i.baseToken, i.quoteToken], i.pool]
        let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, })
        if (chain === 'base' && target === '0xc0F9553Df63De5a97Fe64422c8578D0657C360f7')
          logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock: 8964122, }) // hard to get old logs, too far back in time, manually added missing pairs
        else
          logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, })
        ownerTokens.push(...logs.map(convert))
      }
    }
  }
})