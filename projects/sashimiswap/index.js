const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { staking } = require("../helper/staking");

module.exports = {
  methodology:
    "We count liquidity on the Farms (LP tokens) threw Factory Contract; and on the lending markets same as compound",
    hallmarks: [
      [Math.floor(new Date('2021-12-30')/1e3), 'Protocol was hacked for 210K USD'],
    ],
};

const config = {
  ethereum: {
    dexFactory: '0xF028F723ED1D0fE01cC59973C49298AA95c57472',
    dexFromBlock: 10943133,
    comptroller: '0xB5d53eC97Bed54fe4c2b77f275025c3fc132D770',
    // cToken: '0xC597F86424EEb6599Ea40f999DBB739e3Aca5d82',
    stakingContracts: ['0x6ed306DbA10E6c6B20BBa693892Fac21f3B91977'],
    stakingToken: '0xC28E27870558cF22ADD83540d2126da2e4b464c2',
  },
  bsc: {
    dexFactory: '0x1DaeD74ed1dD7C9Dabbe51361ac90A69d851234D',
    dexFromBlock: 5208518,
    comptroller: '0x88fEf82FDf75E32e4BC0e662d67CfcEF4838F026',
    // cToken: '0xC597F86424EEb6599Ea40f999DBB739e3Aca5d82',
  },
  heco: {
    dexFactory: '0xC28E27870558cF22ADD83540d2126da2e4b464c2',
    dexFromBlock: 783990,
    comptroller: '0x6Cb9d7ecf84b0d3E7704ed91046e16f9D45C00FA',
    // cToken: '0xC597F86424EEb6599Ea40f999DBB739e3Aca5d82',
  },
}

Object.keys(config).forEach(chain => {
  const { stakingContracts, stakingToken, dexFactory, comptroller, dexFromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const ownerTokens = []
      if (comptroller) {
        const markets = await api.call({ abi: 'address[]:getAllMarkets', target: comptroller, })
        let uTokens = await api.multiCall({ abi: 'address:underlying', calls: markets, permitFailure: true })
        uTokens = uTokens.map(i => i ?? nullAddress)
        ownerTokens.push(...markets.map((m, i) => [[uTokens[i]], m]))
      }
      if (dexFactory) {
        const logs = await getLogs({
          api,
          target: dexFactory,
          topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
          eventAbi: 'event PairCreated (address indexed token0, address indexed token1, address pair, uint256)',
          onlyArgs: true,
          fromBlock: dexFromBlock,
        })
        const routers = await api.multiCall({ abi: 'address:router', calls: logs.map(i => i.pair) })
        routers.forEach((r, i) => ownerTokens.push([[logs[i].token0, logs[i].token1], r]))
      }
      return sumTokens2({ api, ownerTokens, blacklistedTokens, })
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      if (comptroller) {
        const markets = await api.call({ abi: 'address[]:getAllMarkets', target: comptroller, })
        let uTokens = await api.multiCall({ abi: 'address:underlying', calls: markets, permitFailure: true })
        uTokens = uTokens.map(i => i ?? nullAddress)
        let borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: markets })
        api.addTokens(uTokens, borrows)
      }
      api.getBalances()
    },
  }

  if (stakingContracts) {
    module.exports[chain].staking = staking(stakingContracts, stakingToken)
  }
})

const blacklistedTokens = [
  // ethereum
  '0x24efe6b87bf1bfe9ea2ccb5a9d0a959c7172b364',
  '0x786448439d9401e0a8427acf7ca66a5114eb2368',
  '0x32503febaa15d0bcfda2a9d8fe492d14a750e52c',
  '0x7756661eea92e4423ae4680f552aa0be0da040f1',
  '0x03012a6f9bb5bff61997aee59477a893debd203b',
  '0x0c7858badb509262e736748e6041b8d7b0b94dbf',
  '0xb904d3f16bf305e99fd785dda1bb13df354c381b',
  '0x674dcbde5c622abb3122d6934fcce446b95060dc',
  '0x90b4fc25a6bd9a666aa4507148f07198a4abc849',
  '0x0aa387225497ccca54fe9de989d3274c1377efe7',
  '0x823b35caa9d0c66a5f9ffb6d042fa130f34cb760',
  '0x9e844c8a08b6e56c7c89c7428d63599b64f62ea9',
  '0x7a77073c1191f2d2fd31a71c758d44f3de0af831',
  '0xbacbd121f37557e5ea1d0c4bb67756867866c3fe',
  '0xf1b43f4e14650ac8c4bb009d9b56eb77c1ae87cd',
  '0x5b8c75d6f91663c515bb12e3cf7c29ade0e1a302',
  '0x7578fd876752a5e4999a16fb80cfe30c1056de11',
  '0x1ad47ee8074ee1adabd76e97b23b94713de9d175',
  '0x9a3eed88730378393e903387087964184b462c71',
  '0xdd530cbe1409df4e7e2dfd18931292c81d8c5e17',
  '0x6e4e0a7f4dc3068970ecb81fd28cd19d4119125b',
  '0x0c662c1e8635aead580714ffa19ab5f008ab7aeb',
  '0x30404353bdceebe86e0b6391fe66db1082bc6cb7',
  '0xa503ddef9c88b5b566705298f8c8faace130b80b',
  '0x002141edcfb5814ad2772e3aecb73a3312f0b60c',
  '0xa6ce576e27ee546cb64e280bb2aa18ad438c28cc',
  '0xa35ff70c648acd83cf0742b919bce4d1b424dca4',
  '0x079308fcea7973da3ae2b45904948a5b51f3cba3',
  '0x4ff5b5108f4db6f925cd76a68bb80565fd8053e6',
  '0x0df2d534cc6849558a9d237c98be560b5ff502f8',

  // bsc
  '0xc28e27870558cf22add83540d2126da2e4b464c2',
  '0x4b64a2d17231882e62d7d5d84daa92e6a39e93b4',
  '0xd9f2894257a57333e84682f463c01e539af15f3a',
  '0x627c99cfc6421224a99b88cec08ba9894253779c',
  '0xabc2984de273dd6fc4cfe602d5a9736ab94402be',
  '0xd7bfb8faa3c395d475ac97f337f528565b2ea2c6',
  '0x216ca859fbc236a32d6464ce17b18591dd72c3d3',
  '0x5fbce2d40ea2c5233c2ba399e27a2a21b0d6964c',
  '0xa9cb2cb1f0080b2d479e4be62a27969d80b6577c',
  '0x2f11f3a4656732c2f9e77c8642ed8a7d42aa2a02',
  '0x6047ac230eef705d294ece482f1652235dac6405',
  '0xd771dcc836d69f45e8ed604be03a26bdf4be2623',
  '0x01876dccb99cd6172f343a874021427afe550472',
  '0x176c673a31904dbfff4255f2501567b4ddc73f65',
  '0x7213c252e7857b529582dddc770ddb275759d1ec',

  // heco
  '0xc2037c1c13dd589e0c14c699dd2498227d2172cc',
  '0x03271182cf2b47929978d0e4ca4af0846f66e2de',
  '0x891daabf6de7a648c9665928e1097b808c1721e2',
  '0xe9c95876f144bbdf5dc33d1a35c26cab0611903f',
  '0x389eec1b8795853770874b76b912ec18de796e1b',
  '0xeaac96f59e40d38bd970b37879a79a1d28737d8a',
  '0x6c606fb47d99d1e66f9b599f8c5602cd4eb44d5a',
  '0xae399aea42867fec2cd4a04963a7f0e247a39431',
  '0x818bbc9b9d37685f9f4db032d46b52a70d890632',
  '0x6ccbc3a5ae94e8a75f9571438a78f3e3aa956655',
  '0xc2d36a8c0b1235ddecac2ed519139e9177e67736',
  '0x611e93a7718a215bfda3c63f7175d764793272df',
  '0x377dca38ff279a73a9075f25d36d00b98515a9a1',
  '0x937a48287fdc4b503d608cb988ac35eee75f076f',
  '0x3f3aaaa941ad756fc49a4b3241a87a7c04e39a4e',
  '0x06068d90e0cbf9b7ccfd21efddb9bceb4c47fd31',
  '0xe2a246c36fa86eee290acef79a8dc66b6b7f25ba',
  '0x8fc67b8ed339c740a58ebd7aae24ba9d57d8dd25',
]
