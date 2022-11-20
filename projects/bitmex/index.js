const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0xEEA81C4416d71CeF071224611359F6F99A4c4294', // Etherscan Label (seems cold)
       '0xfb8131c260749c7835a08ccbdb64728de432858e'  // Etherscan Label (seems hot)
    ],
  },
  bitcoin: {
    owners: [
      '3BMEXqGpG4FxBA1KWhRFufXfSTRgzfDBhJ',
      '3BMEXxSMT2b2kvsnC4Q35d2kKJZ4u9bSLh',
      '3BMEXfK7c3STqJjYmy2VQTGtzD3QAXNz3T',
      '3BMEXiuRhJpLMfKh64G6M9orH9tWvn2H3o',
      '3BMEXN9w646RK9cu9n8BzqD9H2znozaA4P',
      '3BMEXXmSdDVTgVh6yZwaU5tBG75tjSfu9n',
      '3BMEXwZGidWWMpNj1TfcB5U9UaiUxGpvXR',
      '3BMEXoBTq1gvcMdMMBMdufs9KCk7drChow',
      '3BMEXNLUsMrq927zDscUueuwWKjjCtrJdz',
      '3BMEXUdS3RQdrz5iz9sQEhCpeoeWbQn7Ud',
      '3BMEXTSAXi7XUsRZs2NqvnCas5xTt7dunz',
      '3BMEXmXRzq5P9y49riiFCAQinjBJDLjBcK',
      '3BMEXBYZrEw4aD2CsD7daq9NpXr5NR7UkL',
      '3BMEXWsu4CEzbdYocHi7JdkwRrzpn1dFA2',
      '3BMEXxk6S7nQ1dvhHgZff4turaac8Pttur',
      '3BMEXamEuqXoefJk6Ud9FQhwLDgbV6hWQZ',
      'bc1qmexes846z67cac8a93pgp7f9qlr7m0x63mkyvz85fp49dgqmz9xq74dapt',
      '3BMEXeFtNdKTxPY361GKqh9bJP7ntULcNC',
      'bc1qmexf4f4rfejcj8d9pkrkfyc8yrp9zjys7txqswgxuxrevjhmfgzsmarcsp',
      'bc1qmexc6mvxvf09ed3wtsr78ng4ap4hzrejut243hwp5tjjaea34htsyxxsgy',
      '3BMEXnNxVoHaHrWcndZaTQknPMWxG2xDyJ',
      '3BMEXnt4D5QftorEMiGobquaQwYH1SNTMN',
      '3BMEXWUFWK58CCbEpCS7P8BkBbE62QMC8t',
      '3BMEX5L5ug17eBFD3iXtYjQQ8TS1CpxMFR',
      'bc1qmex8falnm7g4rvpgvdma7htgwjgfm98mj25r88794rk2ll4uasqszp7qmn',
      'bc1qmexpudcs3teafyvm0vyydk9k34tw7a6874jz3njzl5p9gy7hxr8s72ym5a',
      'bc1qmexdzxht8j3j7xt66fd4kv4yt33qv9jxw468g5dwu8jm7qsl5s0qzy72mu'
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We collect only wallets that have more than 100 bitcoins'