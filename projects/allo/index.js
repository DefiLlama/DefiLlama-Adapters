const { sumTokensExport } = require("../helper/sumTokens");

const owner = [
  "bc1pn87rjuhzl3sr9tffhgx3nrrq7rhyxg7y58dl0uk5kyhmkfj26ssqz76lfc",
  "bc1pu64y7m8hdekc5h4xtdl8ru9g3ct5n6mghmaqs8qtqecznccvy38s8tvdv4",
  "bc1pjgn7m39vu02el3xpk2rtgt5kww8g5tkhmc55zevjld4n6cc9tuyq6akrq0",
  "bc1pn29hejmt2mrslsa0ttfknp268qrpsmc7wqmw4ddxqytctzjl50ws2yrpmt",
  "bc1pkpddzz2px40f803qug3l28c7d99qvvjkccgzj7tc80xx29pkd2vq3lqrg3",
  "bc1p23su0d2sxwg95c7ny0p5vn4vf83jmvhyzacw3srjv84hmvynkacqe52r9d",
  "bc1pn6rqr5z8yu5z9qphs0ccmcnt2c8ye04e3f2590rdxsd2mga0harq9k4207"
];

module.exports = {
  methodology: `Total amount of BTC in restaked on babylon`,
  bitcoin: {
    tvl: sumTokensExport({ owner }),
  },
};
