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
      'bc1qmexdzxht8j3j7xt66fd4kv4yt33qv9jxw468g5dwu8jm7qsl5s0qzy72mu',
      'bc1qmex0207wfx4va9s36vyrx7mzfvz8625wj8kwc3a35ru2wnd4lnws26nv9q',
      'bc1qmexjqatszu0grvm6ypwzfha70qgu3lm5jhuumz6gjus8tp5jxvks5yeh22',
      '3BMEXpqTbaMUWDPMBTVHFvj5JcNgkunij2',
      'bc1qmexs039ax3smlfy7gcpv75sksrul5pzye0arhjc3gy9unfnkqh0qu5n8j7',
      'bc1qmex88hwycd0wwcgxd50huhj3zjl9d603heugnkladvq9k3n6uwds7rmdxn',
      'bc1qmexvrw0a8y7ch0k3drhu05xcc4vlxq8wav74kn99qppxldex944q74kc9l',
      '3BMEX5jadtCE6fkqRBHueTBQNJMY1djV2y',
      'bc1qmex992nvknthg9a3pykmh0xs286y5smqcrndrg7xv3zt39yrwreqv4hy8s',
      'bc1qmexqp93tenm3nrkkk7vp7fgadp2r47gn6ensp4evtcjrarxasmjqmfqtlj',
      '3BMEXmzhx5wLw9y3EUo31yJhTrdzeaoUVG',
      'bc1qmexqgyr2zfw7vzzuftuh9q043mfh4da7rhjc09meuze2jrld5sqsy63684',
      'bc1qmexwnyf7ksc5xejeffscsmux7yf20hzt6sjtjns235t6tadnlajqvtyp0h',
      'bc1qmex5pr63gjuye9yjpm4krtn2uc5p8vf3gzty3975v9mrkde080dsmck2we',
      'bc1qmexcuuhznmeu7jswjqj87hsdytv59fw9gfctkwt2a5stfg4988us65r96f',
      'bc1qmexywf3xzxasq8r4yepmggea4mnrehxmxgsrg5evrjrmc3d60l0sdtrxwg',
      'bc1qmexx8cdsty67jc6gferczjtrgfeghlk889emnw2ne6kn929s4e8qc49u04',
      '3BMEXNMVjkEad9eHPKJt1fjBb7fh4fGrNq',
      '3BMEXqkc78VdmDzyR6usPVAJbJ5snBNAjb',
      '3BMEXPLQD2LjDuZ8PrDxZstmNp5jzYqRin',
      '3BMEXzr7WeUPmhQQEcttF1SpdfZogVTrQm',
      '3BMEXHrjRmEGYToeGijpk8xPxV9Uv3R7ZG',
      '3BMEXFJS1RCvU8NbxySPdHnZUhtjwd58eP',
      '3BMEXaERPKK7TCk8JN6TYgEJ5bQ61xC7i6',
      '3BMEX97gY1QiN3Afyjq1wYyW21KEgzpuzY',
      'bc1qmexx7dczgfajm0hgwsk5ndkwsln0dhqm8yvve797qsw78a2tm4lq0ajal2',
      '3BMEXY8Wf4Y6V5Cy5L9HHmDG1EBzLc6o1u',
      '3BMEXFwKNBRwask4tHuoVm1RjQagFwifHt',
      '3BMEXbEZH1VtMi1evSXoRxbdhYREtVns9v',
      'bc1qmexwrvjsqhsfq3mtthqpn5wvdeumsrsl578v5lat286azdm3uczsg6c4gj',
      '3BMEXamEuqXoefJk6Ud9FQhwLDgbV6hWQZ',
      'bc1qmexdm3enas9y2j2fhyr43264rjeyll7qddzf622scnzzf5ezs4tqk3ckaj',
      'bc1qmexmaeekc3emgqgrg0etu5ncf5n4tepkyn33yu2p2d00y8p9ewvseslk9n',
      '3BMEX3K5dxeHvf7UX338JhbMCgxGqboZWg',
      '3BMEXZtv6wnDRmhNptLLFKnDRV2tJwpWmQ', //50 btc
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We collect only wallets that have more than 50 bitcoins'