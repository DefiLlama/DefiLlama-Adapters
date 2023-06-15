const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      //only wallets with more than 100 USD
        '0xd30b438df65f4f788563b2b3611bd6059bff4ad9',
        '0x4a8f1f5b2a3652131eac54a6f183a4a2cf44a9a6',
        '0x2ce910fbba65b454bbaf6a18c952a70f3bcd8299',
        '0xa28062bd708ce49e9311d6293def7df63f2b0816',
        '0x964b78ef2925f24c3a8d270c10522638dee5f17f',
        '0xd7efcbb86efdd9e8de014dafa5944aae36e817e4'
    ],
  },
  bitcoin: {
    owners: [
      // we only added wallets with more than 0.1 BTC
      'bc1q39q4hqvchfq2ynyl5xttshkpvdsvp958uq94m0ddv4gt92xhnlvsj32mfy',
      'bc1qv3ertag30cfd58e9krg7ee2etp2628yapwfv27scf3t4yaqvz5wslag54w',
      "36Y1UJBWGGreKCKNYQPVPr41rgG2sQF7SC",
      "bc1qwkq9e5teav7n4v5v9msdyxh3tdl8782xhf9y02ffnkutppkm4rxsq5wes2",
      "bc1qzrz29mxxlv3lnsng50lzpa6xrl848jp3lwmcn67t082k2xv45muswkwelc",
      "bc1quktu2u654pelsn7qtmv839yyg0xecmdr59r6tuu0t5hcxq5nsxwqc5fzpu",
      "bc1q65v48necseqseqm7dggtz5wf6clvwj8t8a0wswucgy8664uad7ysyf705a",
      "bc1q8hnvhz3kdpxv7p7nzh2pm5qn95kfp0ff8sfk435ega90cxae374sgd8658",
      "bc1qwqtm4d9x4fa7lvc88xl0autp42lkqgmp6pdpw9hpsvt9ac8k2xvq83dkz4",
      "bc1qsrdlqttu69x44z9ch4r2e4t9x099rpf3p7rtu3yzpufrz4dsse0qcpqxjn",
      "bc1q0peyk5wv6uathf6jlal3sqd4s66y5hfux2vh5x9z47kkt6cu4dxq05t57u",
      "bc1qnp7julzx0qyyz7dapdjjyuvlhd696frj0puu9gptwdutvhryyvcsuvc3na",
      "bc1qyc54t9mc7rh0srk5ctyshykqmz793y30r6jrn372v8wx76gydgwqafugxu",
      "bc1qx0v26ajsfq07j4l9c60eqa7putpcvakz2u234ywh9yk3lsrd5u0s8zh9hr",
      "bc1qmsdxj3j3fq9mw2733dhpvc5d79u3nhekt6fqz4y3h40gqzq7kvgq0fwjku",
      "bc1qxty7nz6zwk6lfxtzsldksfsgfpvem2hewn72mc9dm09y3xq7dh7qcnyul9",
      "bc1q6pgpwufv42jrq724waqdhsv9vg3wrgrcw93mj0kpdpy3d622uyyspfc9nr",
      "bc1qvc6tmyr9pas29d09hu7l0n8q5eqmcepptls3lrdkhxvdc4jhatzsa6wfls",
      "bc1qlaltsl05swgtvweq9uc9qmy94n2l8t92y2rxy0wnxz72jdt3qugschn0rt",
      "bc1qy3s7efla47m9s32pqwg220p3a4de4f2uqe0rfmqhdfh30h52rguspl52g6",
      "bc1q0708h4g2g35xfwujrrgxj6e0j2et6qkfr3a85dc2lzmyyezg4eeszmkrae",
      "35EyyC2Q7UTTzmcWeuVd7b96cjkR2ykadT",
      "36igHhLGsmCt4Qh1TZTgzinEjU3AQipVDi",
      "36j6PzEU83pmM1PbHCP3uBH9HcuwYX1igb",
      "361SutatvucBNkTBZvmNPaXThLbDm1XK5i",
      "38xvfmxwR81ZtdQRw8j5XLwP38J2AioW6i",
      "33qUcf4RyoysAn1TxQgzEBodvq22pDT32H",
      "3HPQGA5BDsfk2Wxy4jjkg9bNpxKz33kN5o",
      "3FJ6vkm44vwPQz7X82S2q9poh55tTgECM7",
      "3EunnmL6LhqcB9u3PVbUAdtj1vZdGQgFBP",
      "3JnxnGXVn1iSkjhsAtNRq2GGgZaDXz9SZv",
      "3BiJA1srAFWoaoCPAjvNiwSmgFGGnRXCQA",
      "3Mn6GnHRtA5S9HWgKdJnTfGyCgj5r8a7d8",
      "bc1q2s3rjwvam9dt2ftt4sqxqjf3twav0gdx0k0q2etxflx38c3x8tnssdmnjq",
      "3DekqjWw33GGZi6ER4QLTsyDZV8gEycLnt",
      "3DFiiWYGszd44qADZFMae4vSwVkzKH9D1J",
      "3BQ2ZssxxTpkDhSC1kanGpQ2ofNfZHfqdE",
      "3L8Jow9gos1tewxYKvhxUeE43dzxFP7jfw",
      "3Jcus23RVs6iyCLS4x67o64wZJuxyLJPEy",
      "3EsXfkx4hdLdX6GhzthGw4G4QJSPymGyqY",
      "39yNTRaotoLsGtUWrJQ2FTg4uT9i8jETNs",
      "34Hx5KffA1mUQG23ZdcZ7zhpPj1jdHRPB7",
      "336RCi69KyksFvfd5K8nVgv2V6L4TzPo5e",
      "33Us9LTox4pPCyDRucWAeAgv5HFJ3F8QEY",
      "33Miwhfghqp2fPre272zM6bBPjU6fFBjdP",
      "3JrDVvApcDrJvYUhGoSXAkwCxJkxH37uRY",
      "3ARVBKq7MESv4aKXeXZVjhMxmBBC7Uohvt",
      "37jUoYXzKb5M2kvdXRxGnwmRrHLXuBPkGR",
      "358DzMfBG2fzVMYTZjktqUQaDMR5WpYFGJ",
      "35tt48ioWimAbPLxk4MfWkp6La2B7gRbRd",
      "3MWUMsGmx3y1iBDCwjkZp1XdUxEHYNzUq2",
      "3L39V5WF9422tHSjK7joFPnriioCrPim7j",
      "35PTstw2PqGrquLnUhmye3A2nMZJzeK5MF",
      "39uKss4GEpj7F8Z39tSThmatWivVW9N3cV",
      "bc1qngnta9lvmht9z6y4nq5kc8x57pzan0e5daxrxtg3llgpd2jfumts8056hj",
      "bc1q73cqllektyf7wgkfl9ar85sr56vuz7w8lre75ux8m0r3vcplqjmq6d8jkd",
      "3Bbyo51FEEM8jzw2JQEwu7DQmBPMJzWRj4",
      "3Kib3E62NKnL4bAy425G14BPofYH5qMgMF",
      "3H36uhmRugEN9ySYSh4ZftP1GerUfvseXP",
      "3EXXcxmcfAtMG5SeUshEZMGD3NEuDZWSXg",
      "3PTcMGdNKYV5ZZDQorNYmMxoVDoghFcwWn",
      "3FmNm3byE5qwzfgQbQod3jHoKGy5r4Qapp",
      "36LdQB5Ae5BbnQv18R61qotgicbG1dTaBj",
      "3HWqMWUcDxFjyCKvSBSmYDpGXWNqPaYoW1",
      "3MxBjHLRhvV1jPLTtgUAdfDw8xJ4ww5R3z",
      "3GVHA98byHdxekZjBhHBWdHCMH4GRNC61e",
      "35t1TFTbUcTH5ZnZiMVqQUPUtfT4sRcTrC",
      "3AxGEYCt8Hq13E6LhENzL1q6ieP7fv9M8s",
      "bc1qp8gd6xakvqqg7qt9ktfpq4wrsfhp0jlyzy4npfk22xh5qk83fztqsuuspf",
      "3NMQ4igWQVAZq1NeUSd4a2NLJ65w8JqmFS",
      "33L5akK2tnaupkERpCndewo9hVNFkSuzFw",
      "37J1MywnA1NY1mmC9ny4EgmkKEFB8zmg33",
      "3Ad6D5e83PfTxZpdYQumYiMrFnc7S6hE1P",
      "35VhixfJ7PhxF12F6oCSnzm6Cgu5RZUoMu",
      "3FFyv1BR5r93YN8aVpmJ7JDeMH7TeccZw7",
      "32UxKDSVdSeaNyAQQd5UfHveJzAikbGLmT",
      "37HNTMRUGWFMzws1RF6fAp2sDP5m6tMwec",
      "3JeBScBZpYp4szgK1R8LCZvA2tzkXr9VRD",
      "38Tqph89kZ7pACYfB3QEWMmcqwT6iLYzsF",
      "38E56tLzMHxpmwfdgB6BaPgNkHFh5FzaTi",
      "3Kv5DCmHU64wN68hiD6hGyTgfEv3E7czDd",
      "377313tZcAthF8jq2Z7zsfYPAHTvA3mg9P"
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
module.exports.methodology = 'This wallets where collect from here https://www.okcoin.com/proof-of-reserves/download Audit ID 500509486 , 06/08/2023, 19:00:00. We are only tracking BTC wallets with more than 0.1 BTC. We are only tracking ETH wallets with more than 100$.'

