const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x187e3534f461d7c59a7d6899a983a5305b48f93f',
        '0x33ddd548fe3a082d753e5fe721a26e1ab43e3598',
        '0x90f86774e792e91cf81b2ff9f341efca649343a6',
        '0x85cf05f35b6d542ac1d777d3f8cfde57578696fc',
        '0xda07f1603a1c514b2f4362f3eae7224a9cdefaf9',
        '0x601a63c50448477310fedb826ed0295499baf623',
        '0x53eb3ea47643e87e8f25dd997a37b3b5260e7336',
        '0xd782e53a49d564f5fce4ba99555dd25d16d02a75',
        '0x5ad4d300fa795e9c2fe4221f0e64a983acdbcac9',  
    ],
  },
  bitcoin: {
    owners: [
        '189myj1KAbiCWfqWhT6Td4noANKBuag3QN',
        '1C2Pxf3ghtKyM4mKC3xSLKrN33YcKnKF2a',
        '1JZw5HYSoAEfvGGVQ4U2JihZaQkjcXrr2i',
        '16M3n9p6CLATDnpsJNTjCn22AaxzErxg5V',
        '15cYMF4jcRwpcbjENMdMizCzAmd7Pc51So',
        '18JQXgQ4GjZAuYCy1fNAFGHVEAWUui2q9h',
        '1LGbUy11yMaNC9s73q7vEad8JTZyczCima',
        '1DGXwH2gzBYM6UrVE57DaaQ3hJJm3s32YK',
        '152GodsXfK5kYMdH4spzYD3Ttm1u2oNipN',
        '18oxoXCq5mah3GjLjGCS3BRTQxxN7738rL',
        '1H21g458T25SnAzvFDJiBrcyhfwHiCH5YF',
        '14BhR6aE8Fkt2c8E1m2ydx76fBz5kpt62K',
        '1Ef59jZsv87uAcwBZdDhNxiSbCceQ6bFTA',
        '14ukjw4r3UFC5A8yvG7yt2GdvLUHEWtskS',
        '141TDnaiLEW1vE5xd42Dw8HEhDCA2qrZTr',
        '1Ew9SPwBHY8GjHd3uBxhtGcvVmyBN7PHcw',
        '1LYrQCjUf54vf9G4qwFpJQ9RCyL2DprPqQ',
    ]
  },
  tron: {
    owners: [
        'TTMWTPp1vonsdYBuLey3x8k6PsAvZcdR1J',
        'TFp4V3S9JqJyQAMMCewyn4aAaLueJwzS7H',
    ]
  },
}

module.exports = cexExports(config)