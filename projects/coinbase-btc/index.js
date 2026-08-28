const { sumTokensExport } = require('../helper/sumTokens');
const { getConfig } = require('../helper/cache');
const bitcoinBook = require('../helper/bitcoin-book');
const sdk = require("@defillama/sdk");

// temp fallback incase dynamic fetch is blocked
const STATIC = {
  cbada: [
    "addr1q8mntdk8kj96azn9h3vz8e055m2q0sxqaajnlmq0jpes420hxkmv0dyt469xt0zcy0jlffk5qlqvpmm98lkqlyrnp25svfrqm4",
    "addr1qyn4lcv64v40a4667j7x3gjmc4wt32dejakwnwxx2geyemp8tlse42e2lmt44a9udz39h32uhz5mn9mvaxuvv53jfnkqc00vz5",
    "addr1vxwzm0hd3vpsxg9p7mm386ahul8l08jvq2v6cm7v5gg9p3cx8al02",
    "addr1q82hhrzay4jkayh3vaxhfzhxq0pzru4wjukr3x4xpthp83k40wx96ft9d6f0ze6dwj9wvq7zy8e2a9ev8zd2vzhwz0rq672htr",
    "addr1q870atfl35k7gk6nyx5l4wk6hz3y4c69dhvq89g7euph43lul6knlrfdu3d4xgdfl2ad4w9zft352mwcqw23ancr0trssd9x2v",
  ],
  cbxrp: [
    "rKopBmtBSMmUD6NCFNwGTG3b9ZxNzf7Tt4", "rU1DGbMWhrFSJLPcrtKuV5iPyD1wrVgeaU",
    "rMbVVXFHaBpSpJhdR1xvy7dkQL1gtnkopg", "rGsMk4nK4M8MtcjVbjUeaJBppjjKpXyJ7F",
    "rKif7H93DSSCn8gKEdjRWHUeJDM4b6vurN", "rU7N8Xzf9EJWXUG6sjAy5ZWMJcUjdyiUma",
    "rKCoXM19TiWLaqGAsri3bDFWc94iHtaJpD", "rKPDtetbuPAPbDyyaVht9MBQPCrFN65Qo5",
    "r3YxGciPmY3HyobVEN8gfmMHDxqHFmU3wU", "r41Jx7vxzTaXH7nK3P53zUjm4owTdPE2CR",
    "rGpqh1aMFFhuB6fsUuvPXjmgvthFtaM8fQ", "rUf5QkXtwVr9XxCdVhn1pFN7ZyMwGhN5Ng",
    "rpqziPCuAHQ6taD1qghQqgZWv9K513iRnX", "rajKGWBnMMPMVWFEeA8KJXWbha9YCBQsG2",
    "rK67ipQVbZ5EUywDa4BDE7bVnkxBiVYXu", "rPLrMQu2RozGABz6FHNaBHkrNLeTThKwNd",
    "rGoZhmTeMo4Ew7aKQyJaHCA4LbcDo83fRK", "rscyTNHsx52vxVVNb3CvCFyRQMfLtEPYRt",
    "rJUkgjvo3P7qXw8nh6ctHJfGwEoBrRyqhx", "rLRDoTHU6sAdXR7HA1iYdBAvWYcHXn4GBW",
    "rhYmSnmT5XLNWZzXZAfD1ZNDXeggnDMHuR",
  ],
  cbdoge: [
    "DP5ybeBBddbQsGXtMGPmjp8vpWPcnjgfzF",
    "DLuceb7v8vHknepvYRTzz5bSMUAqax8vTN",
    "DNhLqkURqaQDW4f4J9wxtVzRw1XxhkjZ6m",
    "D7pZ4gWhePpgU2kayimxm2J7EgGWQK7KBU",
    "D6SCuJkGB7V7CY13GH6nEq9q1nLcLpaMXh",
  ],
  coinbaseltc: [
    "LYDDw547mquuQGEVG3LAeSPSVGrPH1vsHT",
    "LTbMyvoyfSuQNqG5cGihin6BCbiZay11rU",
    "ltc1qhac8t52gdh8fzeft4ygzxn05nluwwecjrzel99",
    "LP3k3DmN21xmCay3b5yReLKQKvViCnDPhi",
    "Lf25HisuLyPF33K4r2p53SxV6zKvRWGQfV",
  ],
  coinbasebtc: [
    "bc1qfszruqaal85d88qvgx25e2ttq7zf6ze6kpc5h7", "bc1q9e83uh7etgzmfrmjd389p7yjv5etsa6k3dq808",
    "bc1qsefydr2r5ysjep7z4zelvz0ulmj29vlvarraqg", "bc1qwfkngwsl3n2yrnttsmv3q849arwjlxzay34v7e",
    "bc1qt8cewcxp50ywvwperagdr9xgn9zw8up9dq35j8", "bc1q26umumjl7ha0acmyx5h64sdjqc4hnlg040yz6a",
    "bc1qxhue44m9hw6gkf7szn6pk907lmaevnrptu923c", "bc1q059cgrlumrmzd3jat4wmlz7ng3jcg9wc6j04ak",
    "bc1q8lx6xnvasdthhh07fvd9py55t3gftpz6ujztl2", "bc1qm4kfqrzzkjsvvqm95qsvx7g4rfumfaqrr4t6z7",
    "bc1qy43uuskm60v805ey8up2gh5kw23exp2gqrht0v", "bc1q2z2kfsq70tygeegpk8vqgaepwc3tvj59xyu0ge",
    "bc1qepvxyw6wfr3jrsmh7t2xmyyqmmtvtwandnlrry", "bc1q7m6whydduwncrtuy6p6jmu9yejghqer2du9rl4",
    "bc1q8xmrw58we56y4hegw9q6548ua8a05n9u2cdrqv", "bc1q0kcvhdhajd0vd8p66ssc8crg97ahf7x2c2zn5r",
    "bc1qgf263kwygczp5v06umslgpdq9qcswv3ewesxfe", "bc1qv4ex9zyhcs385mqzc9whrnhjjmw2xqhhy3dah2",
    "bc1qv7pjljug2y3zvahdu025e4mcq6f5m6cn0w9rt4", "bc1qyyfjmtl9s8s6wn3llt2ltzze978l5szfj7hr79",
    "bc1qdvp374duyd755p8wkk0qg4tphwq5qyjavjmj5p", "bc1qfm0gdkd483hfhuu78xy3chx0wdll5kqysgu070",
    "bc1qhhh607cyqc8hza9dzxy2lqtze4md8yzttcuama", "bc1qu5twxzks0qzzdklysvysunvd6srj7n3gcgkgu5",
    "bc1q35mpmu5ueq6g7yz2y7pxyau2xczz5nujqjdfg6", "bc1qupmktle0fctwa4xsanrwwqzxxa5pjef943e220",
    "bc1qksjja8l90jd95zzk05jme857ejs5rx6hmn5mdd", "bc1q833au4seakl479uxhffvg3ymq9zcvn0m7scnts",
    "bc1qd38acwh6pc44tpuz3me77d8pjtf3qvgmvkqg9z", "bc1qlmqufhte3lc2uypt3f63xv4xlccfkrld2qkkc5",
    "bc1q4j5m5a8jvm8hhpfm9mk3t22eq2e6twuynlk5p5", "bc1qcc9t3raepdkr0kjgnk94m0vd7wrfug8vpkdgh6",
    "bc1q99jztuwgtcmxen0mpvjj23sjcjwp4d7eey5u3x", "bc1q5lcesvszrlt9rcxawxu2m50vnan43c000lmyuu",
    "bc1qkq2ykxhf8rwsev53s0ue69l8dpldx7q0g5szuk", "12DezRFkKToAiLTDNru1g7FuvtAWMwCZ7N",
    "bc1q0d3k8zue8z5ztqt0r35rsd7gua5z4ser6gt46c", "1HTdN2Bn59URMNyfZiFWhmRbeTXHSp3Z54",
    "17u3Hp3jFB15P9yYC9o4SXyRUdfyHnUfVK", "1GccU6z9yvu3r1agruqBqj7VFwbc79SiCM",
    "1AhSUKzbqyfvu6wi74fyN1zoioraVvR6do", "19pZvfe5ytiPB6w2QBK5n8yrnzStWisLq2",
    "12AVMvu7EUH9weeS19h67W6sYM34NsAHU7", "1PtCAz6JsQZ61FUDxWHixCqeN4vrcxAPuG",
    "1HyzPvCHzwGGYAfYgSrYvSLYhTBNgmZYnp", "1MJLWCneHUgswuysdygkAAuHTzN5nzWUxs",
    "1CtCVztmq8gKJtPpcSPhkUqujpshygCU3X", "12REWGeFkYw5bouibpXndu2oRLjrd6d3mh",
    "13gARQQzhejPDmkeUNqPjRvZTAaedsieEp", "1JNoPvhh79LKvwu1JfaQk7AuiZZsJ7CYUd",
    "16MBo1VsD5yTX1fiPzQ4xaJUoKNHL2i4jn", "1AwJJECEXzn439gERjD6S1wKSTD4qF2V6N",
  ],
};

const fetchPoR = (asset) => async () => {
  const { reserveAddresses = [] } = await getConfig(
    `coinbase-${asset}-proof-of-reserves`,
    `https://www.coinbase.com/${asset}/proof-of-reserves.json`
  );
  return reserveAddresses.map(r => r.address).filter(Boolean);
};

const tvl = (fetchOwners, staticKey) => async (api) => {
  let owners = await fetchOwners().catch(() => []);
  if (!owners.length) {
    sdk.log(`coinbase ${staticKey}: no live reserve addresses resolved, falling back to static snapshot`);
    owners = STATIC[staticKey] || [];
  }
  if (!owners.length) throw new Error(`coinbase ${staticKey}: no reserve addresses resolved`);
  return sumTokensExport({ owners })(api);
};

module.exports = {
  methodology:
    "TVL is the reserves backing Coinbase's wrapped assets (cbBTC/cbXRP/cbDOGE/cbADA/cbLTC), read from each asset's Coinbase proof-of-reserves and summed on-chain across the disclosed custody addresses.",
  bitcoin:  { tvl: tvl(bitcoinBook.coinbasebtc, 'coinbasebtc') },
  litecoin: { tvl: tvl(bitcoinBook.coinbaseltc, 'coinbaseltc') },
  ripple:   { tvl: tvl(fetchPoR('cbxrp'),  'cbxrp')  },
  doge:     { tvl: tvl(fetchPoR('cbdoge'), 'cbdoge') },
  cardano:  { tvl: tvl(fetchPoR('cbada'),  'cbada')  },
};
