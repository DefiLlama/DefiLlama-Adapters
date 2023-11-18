const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
               '0x5a57cfafe8b9e94419cc7d0cb1f4a95c73f40110',
               '0x4a5f98e2c2784d359fc0decc8533ae27af0e5974',
               '0x5af8da2675dd31beffa2619145957b15e8013f37',
               '0x91af50adb57283283c8b442622e95c26d46d911c',
               '0x96c38eeed002d3df2e369deffe6cc84688eadb01'
  ]
  },
  tron: {
    owners: [
               'TKM9AYxWxRe7hESuWmKFXwcDjnb5cQK92E',
               'TMp2qThJSRZbmvFQwuRjyoL8ygykqMZDEo',
               'TPYcvyecPr5TAXRUSjKu2iNJuG6dNHxri3'
            ]
  },
  bitcoin: {
    owners: [
               'bc1qze8pn5vywzk8enqdr9ve28lyas23kurzd37027',
               'bc1qgy5zyuvsw5wnt5lrx3m62tt2pmdl69avd5vw6n',
               'bc1qk4l4u3lh7rrufsw0z6vmkln5kesf0a9q0srnkr'
            ]
  },

}

module.exports = cexExports(config)
