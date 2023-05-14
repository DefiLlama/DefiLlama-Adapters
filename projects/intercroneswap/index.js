const { chainExports: getChainExports } = require('../helper/exports.js')
const { unverifiedCall, multicall, getTokenBalance } = require('../helper/chain/tron.js')
const { getUniTVL } = require('../helper/unknownTokens.js')
const factory = require('../helper/abis/uniswap.js')
const sdk = require('@defillama/sdk')
const { default: axios } = require('axios')
const { fromHex } = require('tron-format-address')

const TRON_FACTORY ='TPvaMEL5oY2gWsJv7MDjNQh2dohwvwwVwx'
//const TRON_FACTORY = "0x991255549e4fd299f03acd368497366cb9a2bfb0"
const factories = {
    bsc: "0xFa51B0746eb96deBC619Fd2EA88d5D8B43BD8230",
    bittorrent: "0x5f4f1a36b7c141a12817580bc35277955c0afd78",
}

const tokens = {
  ACTIV: { 'address': 'TVoxBVmFuBM7dsRnfi1V8v1iupv4uyPifN', 'id': '_activ' },
  BBT: { 'address': 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL', 'id': '_bbt' },
  BCN: { 'address': 'TAoA331n3iKDkR62kAZ4H2n3vNL7y3d8x9', 'id': 'bemchain' },
  BEMT: { 'address': 'TBp6ZMzkxci5o4sJjFa6Fo9Wy36gcubQLW', 'id': 'bem' },
  BTC: { 'address': 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 'id': 'bitcoin' },
  BTT: { 'address': 'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4', 'id': 'bittorrent' },
  COME: { 'address': 'TXMdyszg7XyiVW98QyvwcBh71y7i4pytoH', 'id': 'communityearth' },
  CREED: { 'address': 'TM2fhs1CFiS696VW13s3oBuDdPazCEGcfJ', 'id': '_creed' },
  CREEDX: { 'address': 'TQSC8P2nLsawUZHF6iMAD6KPH8HdJXFWYi', 'id': '_creedx' },
  CUBE: { 'address': 'TQxzbBVFRFUgHXnhyCRiatrkwX9BAJnHam', 'id': '_cube' },
  CYFM: { 'address': 'TZ5jA9F5zGRgi9qk9ATMu6D7wyEpnxQGJh', 'id': 'cyberfm' },
  DOGE: { 'address': 'THbVQp8kMjStKNnf2iCY6NEzThKMK5aBHg', 'id': 'dogecoin' },
  ETH: { 'address': 'THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF', 'id': 'ethereum' },
  HT: { 'address': 'TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h', 'id': 'huobi' },
  ICR: { 'address': 'TKqvrVG7a2zJvQ3VysLoiz9ijuMNDehwy7', 'id': 'intercrone' },
  JM: { 'address': 'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR', 'id': 'justmoney-2' },
  JST: { 'address': 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9', 'id': 'just' },
  KLV: { 'address': 'TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS', 'id': 'klever' },
  KODX: { 'address': 'TTUwzoZAK6rpDjpSh8B2XFTnxGfbMLHJaq', 'id': 'kodx' },
  KTY: { 'address': 'TTroZqb95vmsw4kppupQ8tVEzkNDDP2bcG', 'id': '_kty' },
  LDA: { 'address': 'TNP1D18nJCqQHhv4i38qiNtUUuL5VyNoC1', 'id': '_lda' },
  LUMI: { 'address': 'TDBNKiYQ8yfJtT5MDP3byu7f1npJuG2DBN', 'id': 'lumi-credits' },
  MEOX: { 'address': 'TQy3PRQda43yb3Ku35AktG549KMQLCJVDb', 'id': '_meox' },
  NFT: { 'address': 'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq', 'id': 'apenft' },
  NOLE: { 'address': 'TPt8DTDBZYfJ9fuyRjdWJr4PP68tRfptLG', 'id': '_nole' },
  OLDJM: { 'address': 'TT8VkSkW6igkiRsV5WiJgLrsbVwY5bLLjA', 'id': 'justmoney' },
  PLZ: { 'address': 'TYK71t3eD1pTxpkDp7gbqXM5DYfaVdfKjV', 'id': 'plz' },
  PROS: { 'address': 'TFf1aBoNFqxN32V2NQdvNrXVyYCy9qY8p1', 'id': '_pros' },
  SafeMoney: { 'address': 'TNBrVEzuVYbNbGF2ua3ivSX5Y5V9N4xhax', 'id': 'safemoney' },
  SFI: { 'address': 'TVGiaML3hJE7sv9NEEVjqLbF5DcXJgHSfy', 'id': 'strx-finance' },
  SUN: { 'address': 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S', 'id': 'sun-token' },
  TBT: { 'address': 'TJpCQC2gJRAbqG9nuQHvzYBmCuYJQzP3SS', 'id': '_tbt' },
  TNT: { 'address': 'TL33cN6t22RcKyqPKkb14iVrPHDFaFMH7t', 'id': '_tnt' },
  TRX: { 'address': 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', 'id': 'tron' },
  TUSD: { 'address': 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4', 'id': 'trueusd' },
  turu: { 'address': 'TK8K7HFDLkhYS6XnFC8MKQkVK6Xq8D13qJ', 'id': '_turu' },
  TREX: { 'address': 'THyYjzy42cy83Nwg6pbsUTcV1GBrPPqGE5', 'id': '_trex' },
  TWJ: { 'address': 'TNq5PbSssK5XfmSYU4Aox4XkgTdpDoEDiY', 'id': '_twj' },
  USDC: { 'address': 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', 'id': 'usdc' },
  USDD: { 'address': 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', 'id': 'usdd' },
  USDT: { 'address': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'id': 'tether' },
  USTX: { 'address': 'TYX2iy3i3793YgKU5vqKxDnLpiBMSa5EdV', 'id': 'upstabletoken' },
  VBS: { 'address': 'TJRc6ZTMhHEPrWPtfsVvXW1mxHPLw1arZo', 'id': '_vbs' },
  WOX: { 'address': 'TYVFMntFj7xLMxp1CvuXwg9LpPw1dPwWhM', 'id': '_wox' },
  WIN: { 'address': 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7', 'id': 'winklink' },
  ZLF: { 'address': 'TXoPCbHtWTerfiNjFBpJdMQqQJoXoT87pq', 'id': '_zlf' },
}
const IswapURL = 'https://api.intercroneswap.com/pairs/all?chainId=';

async function getTronPairs(balances) {

    const allPairs = await axios.get(IswapURL + '11111')
    for (let index = 0; index < allPairs.data.data.length; index++) {
        const pair = allPairs.data.data[index];
        t0 = Object.values(tokens).find((token) => token.address === fromHex(pair.tokenAmount0.address) )
        t1 = Object.values(tokens).find((token) => token.address === fromHex(pair.tokenAmount1.address) )
        if (!t0) {
            sdk.log('couldn\'t find token: ', pair.tokenAmount0.symbol);   
            continue
        } else if(!t1) {
            sdk.log('couldn\'t find token: ', pair.tokenAmount1.symbol);   
            continue
        }

        sdk.util.sumSingleBalance(balances, t0.id, Number(pair.tokenAmount0.numerator / (10 ** pair.tokenAmount0.decimals)))
        sdk.util.sumSingleBalance(balances, t1.id, Number(pair.tokenAmount1.numerator / (10 ** pair.tokenAmount1.decimals)))

    }
}

async function tronTvl() {
    const balances = {}
    await getTronPairs(balances)
    return balances
}

function chainTvl(chain) {
    return getUniTVL({ chain, factory: factories[chain], useDefaultCoreAssets: false, })
}

const chainExports = getChainExports(chainTvl, Object.keys(factories))

chainExports.misrepresentedTokens = true
chainExports.timetravel = true

module.exports = {
    ...chainExports,
    tron: {
        tvl: tronTvl
    }
} 
