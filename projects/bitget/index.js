const { cexExports } = require('../helper/cex')

const config = {
  bsc: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x149ded7438caf5e5bfdc507a6c25436214d445e1',
        '0x3a7d1a8c3a8dc9d48a68e628432198a2ead4917c',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ],
  },
  ethereum: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x1Ae3739E17d8500F2b2D80086ed092596A116E0b',
        '0x2bf7494111a59bD51f731DCd4873D7d71F8feEEC',
        '0x31a36512d4903635b7dd6828a934c3915a5809be',
        '0x461f6dCdd5Be42D41FE71611154279d87c06B406',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689',
        '0x9E00816F61a709fa124D36664Cd7b6f14c13eE05',
        '0xdFE4B89cf009BFfa33D9BCA1f19694FC2d4d943d',
        '0xe2b406ec9227143a8830229eeb3eb6e24b5c60be',
        '0xe6a421f24d330967a3af2f4cdb5c34067e7e4d75',
        '0xe80623a9d41f2f05780d9cd9cea0f797fd53062a',
        '0xf646d9B7d20BABE204a89235774248BA18086dae'
    ]
  },
  tron: {
    owners: [
        'TAa8e7U7seCy7NcZ52xYVQXXybFfwvsUxz',
        'TBXEdr2pD1tszUNAkVX18K7nie1MptkZ1y',
        'TBytnmJqL47n8bAP2NgPWfboXCwEUfEayv',
        'TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR',
        'TGJagVsVg9QSePG5GreotgdefgaXPRo8SH',
        'TGZ959FTLRk8droUqDNgLxML1X9mEVej8q',
        'TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG',
        'TZHW3PJe6VoyV8NWAaeukqWNRe3bVU7u8n',
    ]
  },
  bitcoin: {
    owners: [
        '1FWQiwK27EnGXb6BiBMRLJvunJQZZPMcGd',
        '1GDn5X4R5vjdSvFPrq1MJubXFkMHVcFJZv',
        '3GbdoiTnQrJYatcr2nhq7MYASSCWEKmN6L',
        '3HcSp9sR23w6MxeRrLqqyDzLqThtSMaypQ',
        '3MdofQ2ouxom9MzC9kKazGUShoL5R3cVLG'
    ]
  },
  arbitrum: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  optimism: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  fantom :{
    owners: ['0x5bdf85216ec1e38d6458c870992a69e38e03f7ef']
  },
  cronos: {
    owners: ['0x0639556F03714A74a5fEEaF5736a4A64fF70D206']
  },
  avax: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef'
    ]
  },
  polygon: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  ripple: {
    owners: [
        'r3AEihLNr81VYUf5PdfH5wLPqtJJyJs6yY',
        'rGDreBvnHrX1get7na3J4oowN19ny4GzFn'
    ]
  },
  solana: {
    owners: ['A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR']
  }
}

module.exports = cexExports(config)