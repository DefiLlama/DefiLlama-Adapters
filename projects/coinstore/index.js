const { cexExports } = require("../helper/cex");

const config = {
  ethereum: {
    owners: [
      "0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1",
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9",
      "0x748577Ce82346C61e9d6e52628Eda8dFaB3241b3",
      "0xf2067abfab8bc621211935431519d41825d2f344",
      "0xaDc7cf570DDf2Ff99C723F946c7F5A5D34cF868C",
    ],
  },
  bsc: {
    owners: [
      "0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1",
      "0xa089b8de0eA45db84CCadE5751EE165A88F90b4F",
      "0x20664cacdcfeb318c8e145a03c75e34bc2cc4a3b",
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9",
      "0x6148f792622c3B85F04f87E8a09474a591E71C5f",
      "0xC349541773D5eCa27D36E9bD95094920f4B7A536",
      "0x40C847f59600286cFEE8d6De6640E967a7824d57"
    ],
  },
  arbitrum: {
    owners: [
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9", 
      "0x2a6e62f040a7f0b830847da101539a7eef7bb040"
    ],
  },
  optimism: {
    owners: [
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
    ],
  },
  polygon: {
    owners: [
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9",
      "0x65e1615efc11c63e15c00ac4447c56af294135a9"
    ],
  },
  avax: {
    owners: [
      "0x1e14f71c96262c45167465ab380b684d652377d9"
    ],
  },
  base: {
    owners: [
      "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
    ],
  },
  bitcoin: {
    owners: [
      "bc1q4w3drxrdhcsxlrhrqpl7kecesn53pf455muj30"
    ],
  },
  solana: {
    owners: [
      "27XKFUkuY8VyXLbinENSVp4aTxHSCtZcJ9poKWP4GEuj",
      "DVoATqaFVS98WwbGAYvBxUAX88bWTrW9Ej2mgFJ8Gm64",
      "2YH3L1nAknnDC5Bu6S6Z5Dzurw2fUG63Msws96NLRpAi"
    ],
  },
    tron: {
    owners: [
    "TWGV42YRYpK1rfMHZCYYxhK1fZDbTNrqzz",
    "TBhbX5S51L1C34wBExL9efV5YfTE5NAFi1",
    "TJa4jS3qsAa2je4ksDP9BD7NzsffuWfRQK",
    "TM7rxykbNRuFd2iZ1zVH4P8xrpSCduw9vD"
    ],
  },
};

module.exports = cexExports(config);
