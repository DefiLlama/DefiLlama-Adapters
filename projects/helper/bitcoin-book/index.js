const wbtc = require('./wbtc')
const ainn = require('./ainn')
const fetchers = require('./fetchers.js')

module.exports = {
  ...fetchers,
  imbtc: ['3JMjHDTJjKPnrvS7DycPAgYcA6HrHRk8UG', '3GH4EhMi1MG8rxSiAWqfoiUCMLaWPTCxuy'],
  wbtc,
  '21-co': ['1HTGi4tfXSEtcXD4pk6S3vBs3s64hWY1pW', '12WZhMFFLHQ4rCMSkeBfbJXRk7aGWyBh1M'],
  ainn,
  allo: [
    "bc1pn87rjuhzl3sr9tffhgx3nrrq7rhyxg7y58dl0uk5kyhmkfj26ssqz76lfc",
    "bc1pu64y7m8hdekc5h4xtdl8ru9g3ct5n6mghmaqs8qtqecznccvy38s8tvdv4",
    "bc1pjgn7m39vu02el3xpk2rtgt5kww8g5tkhmc55zevjld4n6cc9tuyq6akrq0",
    "bc1pn29hejmt2mrslsa0ttfknp268qrpsmc7wqmw4ddxqytctzjl50ws2yrpmt",
    "bc1pkpddzz2px40f803qug3l28c7d99qvvjkccgzj7tc80xx29pkd2vq3lqrg3",
    "bc1p23su0d2sxwg95c7ny0p5vn4vf83jmvhyzacw3srjv84hmvynkacqe52r9d",
    "bc1pn6rqr5z8yu5z9qphs0ccmcnt2c8ye04e3f2590rdxsd2mga0harq9k4207"
  ],
  avalanche: [
    'bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',  // https://prnt.sc/unrBvLvw3z1t 
  ],
  'avalon-cedefi': [
    '32DgQPVHSV6FSxLnw68nggvchp3ZNKquxA',
    'bc1qr5nz7n8ulcdz0w3s6fska80fawxhvqlh273qypm3rkjequ9wpmhs65ppw7',
    'bc1qhu98nf6ddz6ja73rn72encdr8ezsyhexwpdzap0vcs7lg2wpmrnq5ygfsl',
    'bc1qg6asmzjr7nr5f5upg3xqyrdxl2tq8ef58hha7t0s82mzzx6zjxesyccp4h',
    'bc1qxe3md4lehg8gmrlx3e8xqju5mytt266l4hcy8khl6tm5mahghmeqtxlgqq',
    'bc1qy48h0kuv0r3e330wjfs6r74sk49pkzumnm907t5mhqjxml22r3ss2ucuxc',
  ]
}