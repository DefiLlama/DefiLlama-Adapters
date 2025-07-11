const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const { mergeExports, getStakedEthTVL } = require("../helper/utils");

const config = {
  ethereum: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
        // '0x4fd797f0cc7c87b1b48b0a0db6b66db63780717d',
        '0x0cabd4fa219af5954ffb4fb3d88c7f950f80c05d'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitrue
  },
  era: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  mantle: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  scroll: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  linea: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  core: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  taiko: {
    owners: [
        '0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21',
    ],
  },
  cardano: {
    owners: [
        'addr1v9wa6entm75duchtu50mu6u6hkagdgqzaevt0cwryaw3pnca870vt',
        'addr1q9n7fk3ldjprw08egt78ekdseec4h27kwyc597wk54d30mjmj4sg7lyj4mpf0qmkzc7rz4j3g8ge0pgq25ju9wzqengq7qqf4z',
    ],
  },
  bsc: {
    owners: [
        '0x868f027a5e3bd1cd29606a6681c3ddb7d3dd9b67',
    ],
  },
  solana: {
    owners: [
        '7RmkMNQerKaVioRnmqZsHM5Gm8F3gngQG8umLNoK97q4',
        'DFsnJoF2jjkFngB1WSPXTaiJJEjJTBAmPLCxcWwknuxq',
        '2rXk5bgHTVHYGkLWCi16AVoXnMFArJH1MAfaqbXiMLAo',
        'AxQyoXiqZAW2ca64CE2828pYXX7U3jXKJTNVa1hvhQzn',
        '7ziHMYFe6st7b6AWnLSSqLoVqbZcXJPUxSDsTG4xzmoV'
    ],
  },
  polygon: {
    owners: [
        '0xa813251e163766361adfb9700748397977a54ea0',
    ],
  },
  tron: {
    owners: [
        'TKGZE5pXLrRYiAsHMbTvSsgsJgSYPYtsRA',
        'TMESwrQ1NVjyqwj74yzEcqpaBRy8mubAUj',
        'TBGKMndepWM4HYgaVYAbWzTuoV9aJuxYMW',
    ],
  },
  ripple: {
    owners: [
        'r3RaNVLvWjqqtFAawC6jbRhgKyFH7HvRS8',
        'rfKsmLP6sTfVGDvga6rW6XbmSFUzc3G9f3',
        'rNYW2bie6KwUSYhhtcnXWzRy5nLCa1UNCn',
        'r4DbbWjsZQ2hCcxmjncr7MRjpXTBPckGa9',
        'rftiWeaS6JPLJDvJLV4CoSQ2XWJ1U4jg3a',
        'rr6sWbuKMsYs5JkKNARxUpEPfZ3GNUjFE',
        'rNrFVnR47ZinYNBGtrbk8Xcgp2FHkGfDYi'
    ],
  },
  sui: {
    owners: [
        '0x5e2baf93b9ca87b17443f1a175b620879e1cec076096d4adf25e3a4b48588abf'
    ],
  },
  flare: {
    owners: [
        '0x7560B22b42B3E2596BD989764f1EB9bEC1896C8d'
    ],
  },
  hedera: {
    owners: [
        '0.0.1405108',
        '0.0.285576'
    ],
  },
  cosmos: {
    owners: [
        'cosmos1mtauzk3q40zt3weujcqwu009vw5t6m5fnv4xxr'
    ],
  },
  polkadot: {
    owners: [
        '1F5fhgHpekmLPSdbwESJRsWU5KJdhEFZuwBMTj1czBuvyzm'
    ],
  },
  xdc: {
    owners: [
        'xdcc1b519019639c7e684c6626440b448582cbe0a75',
        'xdc27f03b6bc690a5739b0603b4c92eaff176e3d567'
    ],
  },
vechain: {
    owners: [
        '0x20a02aca8f66cbf324c61dc9c1c40d48a8946651',
    ],
  },
}

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddress: '0x4fd797f0cC7C87B1b48b0A0db6b66DB63780717d', size: 200, sleepTime: 20_000, proxy: true }) } },
])