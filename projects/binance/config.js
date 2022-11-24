
const { getUniqueAddresses } = require('../helper/utils')

// taken from https://www.binance.com/en/blog/community/our-commitment-to-transparency-2895840147147652626
const assetList = [
  ["BTC", "BTC", "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"],
  ["BTC", "BTC", "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb"],
  ["BTC", "BTC", "3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6"],
  ["BTC", "BTC", "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  ["ETH", "ETH", "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8"],
  ["ETH", "ETH", "0xf977814e90da44bfa03b6295a0616a897441acec"],
  ["ETH", "ETH", "0x5a52e96bacdabb82fd05763e25335261b270efcb"],
  ["ETH", "ETH", "0x28c6c06298d514db089934071355e5743bf21d60"],
  ["ETH", "ETH", "0x9696f59e4d72e237be84ffd425dcad154bf96976"],
  ["ETH", "ETH", "0x21a31ee1afc51d94c2efccaa2092ad1028285549"],
  ["ETH", "ETH", "0xdfd5293d8e347dfe59e90efd55b2956a1343963d"],
  ["ETH", "ETH", "0x56eddb7aa87536c09ccc2793473599fd21a8b17f"],
  ["ETH", "ETH", "0x4976a4a02f38326660d17bf34b431dc6e2eb2327"],
  ["USDC", "ETH", "0xa344c7aDA83113B3B56941F6e85bf2Eb425949f3"],
  ["USDC", "ETH", "0x28c6c06298d514db089934071355e5743bf21d60"],
  ["USDC", "ETH", "0x21a31ee1afc51d94c2efccaa2092ad1028285549"],
  ["USDC", "ETH", "0xdfd5293d8e347dfe59e90efd55b2956a1343963d"],
  ["USDC", "TRX", "TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi"],
  ["USDT", "ETH", "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"],
  ["USDT", "ETH", "0xf977814e90da44bfa03b6295a0616a897441acec"],
  ["USDT", "ETH", "0xa344c7aDA83113B3B56941F6e85bf2Eb425949f3"],
  ["USDT", "ETH", "0x28c6c06298d514db089934071355e5743bf21d60"],
  ["USDT", "ETH", "0x21a31ee1afc51d94c2efccaa2092ad1028285549"],
  ["USDT", "ETH", "0x56eddb7aa87536c09ccc2793473599fd21a8b17f"],
  ["USDT", "ETH", "0xdfd5293d8e347dfe59e90efd55b2956a1343963d"],
  ["USDT", "ETH", "0x9696f59e4d72e237be84ffd425dcad154bf96976"],
  ["USDT", "ETH", "0x4976a4a02f38326660d17bf34b431dc6e2eb2327"],
  ["USDT", "TRX", "TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9"],
  ["USDT", "TRX", "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb"],
  ["USDT", "TRX", "TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi"],
  ["USDT", "TRX", "TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe"],
  ["USDT", "TRX", "TAzsQ9Gx8eqFNFSKbeXrbi45CuVPHzA8wr"],
  ["USDT", "TRX", "TQrY8tryqsYVCYS3MFbtffiPp2ccyn4STm"],
  ["USDT", "TRX", "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G"],
  ["USDT", "TRX", "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS"],
  ["BUSD", "ETH", "0xf977814e90da44bfa03b6295a0616a897441acec"],
  ["BUSD", "ETH", "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"],
  ["BUSD", "ETH", "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8"],
  ["BUSD", "ETH", "0x5a52e96bacdabb82fd05763e25335261b270efcb"],
  ["BUSD", "ETH", "0xa344c7aDA83113B3B56941F6e85bf2Eb425949f3"],
  ["BUSD", "ETH", "0xdfd5293d8e347dfe59e90efd55b2956a1343963d"],
  ["BUSD", "ETH", "0x28c6c06298d514db089934071355e5743bf21d60"],
  ["BUSD", "ETH", "0x21a31ee1afc51d94c2efccaa2092ad1028285549"],
  ["BNB", "BEP2", "bnb1edrs5cukhx060e02u98v9j8spum7vhuqg9ctxd"],
  ["BNB", "BEP2", "bnb142q467df6jun6rt5u2ar58sp47hm5f9wvz2cvg"],
  ["BNB", "BEP2", "bnb1u2agwjat20494fmc6jnuau0ls937cfjn4pjwtn"],
  ["BNB", "BEP2", "bnb1lsmt5a8vqqus5fwslx8pyyemgjtg4y6ugj308t"],
  ["BNB", "BEP2", "bnb1fnd0k5l4p3ck2j9x9dp36chk059w977pszdgdz"],
  ["BNB", "BEP2", "bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m"],
  ["BNB", "BEP2", "bnb1m5amny2gs3xdyta6pksmr43zu4727w24syyks7"],
  ["BNB", "BEP2", "bnb1panyupy43sazh4dka6fg3s08909ejhqz4k23eg"],
  ["BNB", "BEP2", "bnb1ymasdm96ld0v6s38ylvu0qsw0xmhdlhy47tpsg"],
  ["BNB", "BEP2", "bnb1tdcrvgjl580p2qv77y0cu2ezk3c80039psx6sh"],
  ["BNB", "BEP2", "bnb1e08c39tjpr5fvdh4cfhqmyclrh62ag45qmddud"],
  ["BNB", "BEP2", "bnb1lq4s05lgat8d0qh275q0elt4m9rs760m0ryced"],
  ["BNB", "BEP2", "bnb1t5fn9faqu5aanvexqu8dt9tah4jg20eun8gsee"],
  ["BNB", "BEP2", "bnb1dkckvfuqv7fjl902cvuqmde27skk94kjp09j99"],
  ["BNB", "BEP2", "bnb14u5qnp4peug4a6wlz327mx9xjd0xf6phe7ew8u"],
  ["BNB", "BEP2", "bnb19fk9hqqlp8xcwrt0w35weyufnglp43hlthev3l"],
  ["BNB", "BEP2", "bnb1uexf06gd94qsxdmqamk360d893dsrm8lvwyjsd"],
  ["BNB", "BEP2", "bnb1uwdm6vrfvx43wqj8cj3h362kad0g0nrk3gumg8"],
  ["BNB", "BEP2", "bnb1a5f0ghn3c2whfmz3z0wjggwcgsk2t26ynqn68x"],
  ["BNB", "BEP2", "bnb1s3czyqxaf4hyt3rueg9gss08nfnvxjzy5qfu2p"],
  ["BNB", "BEP2", "bnb1yud0r5kz3ctu07fwax3j753ueef6d0n0uxrx94"],
  ["BNB", "BEP2", "bnb1fxk3lmfu2h0qhywdump0hvggg6prlge88f42n9"],
  ["BNB", "BEP2", "bnb1erq4ykp99sm87tsrfg8mgjef350gqtzhsqwys6"],
  ["BNB", "BEP2", "bnb1u70jtt2umum4ag3vcpw2h8v8levm47t0mtjwmh"],
  ["BNB", "BEP2", "bnb1xrfwzlu9c5208lhtn7ywt0mjrhjh4nt4fjyqxy"],
  ["BNB", "BEP20", "0xf977814e90da44bfa03b6295a0616a897441acec"],
  ["BNB", "BEP20", "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8"],
  ["BNB", "BEP20", "0x5a52e96bacdabb82fd05763e25335261b270efcb"],
  ["BNB", "BEP20", "0x3c783c21a0383057d128bae431894a5c19f9cf06"],
  ["BNB", "BEP20", "0xdccf3b77da55107280bd850ea519df3705d1a75a"],
  ["BNB", "BEP20", "0x8894e0a0c962cb723c1976a4421c95949be2d4e3"],
  ["BNB", "BEP20", "0x515b72ed8a97f42c568d6a143232775018f133c8"],
  ["BNB", "BEP20", "0xbd612a3f30dca67bf60a39fd0d35e39b7ab80774"],
  ["BNB", "BEP20", "0x01c952174c24e1210d26961d456a77a39e1f0bb0"],
  ["BNB", "BEP20", "0x29bdfbf7d27462a2d115748ace2bd71a2646946c"],
  ["BNB", "BEP20", "0xe2fc31f816a9b94326492132018c3aecc4a93ae1"],
  ["BNB", "BEP20", "0x73f5ebe90f27b46ea12e5795d16c4b408b19cc6f"],
  ["BNB", "BEP20", "0x161ba15a5f335c9f06bb5bbb0a9ce14076fbb645"],
  ["BNB", "BEP20", "0x1fbe2acee135d991592f167ac371f3dd893a508b"],
  ["BNB", "BEP20", "0xeb2d2f1b8c558a40207669291fda468e50c8a0bb"],
  ["BNB", "BEP20", "0xa180fe01b906a1be37be6c534a3300785b20d947"],
  ["BNB", "ETH", "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8"],
  ["BNB", "ETH", "0xf977814e90da44bfa03b6295a0616a897441acec"]
]

function getAddresses(chain) {
  return assetList.filter(i => i[1] === chain).map(i => i[2])
}
function getOwners(chain) {
  const isCaseSensitive = ['BTC', 'TRX'].includes(chain)
  return getUniqueAddresses(assetList.filter(i => i[1] === chain).map(i => i[2]), isCaseSensitive)
}

module.exports = {
  bitcoin: {
    owners: getAddresses('BTC'),
  },
  ethereum: {
    owners: getOwners('ETH'),
  },
  bsc: {
    owners: getOwners('BEP20'),
    tokens: ['0x0000000000000000000000000000000000000000',],
  },
  bep2: {
    geckoId: 'binancecoin',
    owners: getAddresses('BEP2'), 
  },
  tron: {
    owners: getOwners('TRX'),
  }
}
