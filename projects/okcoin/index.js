const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0xa28062bd708ce49e9311d6293def7df63f2b0816',
        '0x2ce910fbba65b454bbaf6a18c952a70f3bcd8299',
        '0xd30b438df65f4f788563b2b3611bd6059bff4ad9',
        '0x4a8f1f5b2a3652131eac54a6f183a4a2cf44a9a6',
        '0xd7efcbb86efdd9e8de014dafa5944aae36e817e4',
        '0x964b78ef2925f24c3a8d270c10522638dee5f17f',
    ],
  },
  bitcoin: {
    owners: [
        '3EunnmL6LhqcB9u3PVbUAdtj1vZdGQgFBP',
        '3HPQGA5BDsfk2Wxy4jjkg9bNpxKz33kN5o',
        '36Y1UJBWGGreKCKNYQPVPr41rgG2sQF7SC',
        'bc1qwx5493sxzt58j4w7tqdkkxg9prxwypcnu8yw564q9dx07j2dg2usvsgm8p',
        'bc1qdfczq588vxjw75708jnv0l58hunh0a3xpyl4xnx4pzymq0nwjfasldftyv',
        '38xvfmxwR81ZtdQRw8j5XLwP38J2AioW6i',
        '361SutatvucBNkTBZvmNPaXThLbDm1XK5i',
        '36j6PzEU83pmM1PbHCP3uBH9HcuwYX1igb',
        '36igHhLGsmCt4Qh1TZTgzinEjU3AQipVDi',
        'bc1qwkh46xvgq2znq972w9re56gznyf965244sznps3x8gfc9nk42ejsc5jn7f',
        'bc1q3kq7gcgaug7glvenrefytekkrl7wz988zqwucaulp645q76uxlzsnsayx2',
        'bc1qzqxlgw0nfuqswnrmnwpw95fdvcfvc5hcqza37c0kjuvu8zsfvlqspurstr',
        'bc1qcetd4jsxxllvj7psq7n22p5zt0z73ca8yd47wjgp2wh4rv6v4aqq7xexlk',
        'bc1q2gmemmlz64s4fnyvy3xqz98c73qpdc0p6dv7zj2qjzpc57cqnvpsshfa5e',
        'bc1qq59den5kwgas3yryp742m56crrwqqayhzzcx326s65sqw7myvqps7q0dy6',
        'bc1q6f5r5d75k4uyzly943p9z3n4n3lgaedtddt9zu9tw8d0ahsf339sucn978',
        'bc1qjnj9mvfz59kn40k9rceyxj3zue6zrzknsplk92kxsf5l26v05ezsey80cm',
        'bc1q7ud6u0gvgq2n4jl5huj5mswlxhkwmch6syn48ah72ph25ckcx4qsygvhh6',
        'bc1qr2smyzl5lcjwk03s5ca5ma74jl4sx007qmtvgx4a97fftvpm7ghq4nlvjn',
        'bc1q6vywz7nlemayvxnkacln47wr69j7j0r0dykcl23vdjr8ssdmkpjszaghna',
        'bc1qqvp7nwgh4yca3yz6ww5kxkuvwcwawcnufqzn0hv2nne7t8l0dqhqu6xjdz',
        'bc1qet9lkfpc2ggfa3pm93dd7algtx9uux5pywyq72l0m5ree82ee5cs5jy37v',
        'bc1qcmas6e30q6hyhxrsjlp02fltjpnm5ps7w54ndlhanydz6z8e2p2s3rm7ws',
        'bc1qzve88rsexgw4veds3u536j76q8u63qdqx4uyx7qmpfqls7d4d9dsvdfxa7',
        'bc1qlrkpwmw4maqendwghc726deh6ch0u659s3l3snlxnx9pvm2f7jhsfrd4lp',
        'bc1qu5t70knuu6nye084x877kny6elvx5waarj8r77v2q8eycymy6cfqnn832z',
        'bc1qdjaduy7409zl6qkf76knsv8vs96a0pcmevyply3hzyphvp6m2s6qhvljne',
        'bc1q2ckykmuc0u4l7zrsv5c52y5uku2zy3y82w8pwtks3mhpan00lplq2xv3tt',
        'bc1qet4drerlrwu86ep0xp8mdzxkmscdj3672uxeuwfzscly8axy04kq74e0ae',
        'bc1qnp7julzx0qyyz7dapdjjyuvlhd696frj0puu9gptwdutvhryyvcsuvc3na',
        'bc1quktu2u654pelsn7qtmv839yyg0xecmdr59r6tuu0t5hcxq5nsxwqc5fzpu',
        'bc1qzrz29mxxlv3lnsng50lzpa6xrl848jp3lwmcn67t082k2xv45muswkwelc',        
    ]
  },
  tron: {
    owners: [
        'TQ7wK19fhZZqLdj2Xcw2e6Ejs3cTZbfBbF',
    ]
  },
  avax: {
    owners: ["0x5793da1b0c41c7db8e3eb8dbcd18fdca94a58535"]
  },
  polygon: {
    owners: ["0x0f51a310a4dd79d373eb8be1c0ddd54570235443"]
  },
  okexchain: {
    owners: ["0x5b73841a54f6f2e8b179f1801f664f470d7f37ea"]
  }
}

module.exports = cexExports(config)

