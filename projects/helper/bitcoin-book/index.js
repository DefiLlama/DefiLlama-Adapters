const imports = [
  ["wbtc", './wbtc.js'],
  ["bitmex", './bitmex.js'],
  ["kucoin", './kucoin.js'],
  ["okex", './okex.js'],
  ["chakra", './chakra.js'],
  ["bitkub", './bitkub-cex.js'],
  ["coinbasebtc", './coinbase-btc.js'],
]
const { sumTokensExport } = require('../sumTokens.js')
const fetchers = require('./fetchers.js')

const p2pb2b = ['39BFtTzZjj6o2s7eewefFQxqM4617VmhEK']

const ssiProtocol = [
  '1BH4rZH7ptWyjim6fLJDp9t8Jp2DgXiBDM'
]

const bitomato = [
  'bc1qgmtx3caf8rlxmzw703ga2sljv3rkkj39e4ysk9',
]

const lbank = [
  '1MZwhQkkt9wy8Mwm4rx5W3AYiDCJLasffn',
]

const stacksSBTC = [
  // https://docs.stacks.co/concepts/sbtc/clarity-contracts/sbtc-deposit
  'bc1pl033nz4lj7u7wz3l2k2ew3f7af4sdja8r25ernl00thflwempayswr5hvc',
  'bc1prcs82tvrz70jk8u79uekwdfjhd0qhs2mva6e526arycu7fu25zsqhyztuy',
  'bc1p6ys2ervatu00766eeqfmverzegg9fkprn3xjn0ppn70h53qu5vus3yzl0x'
]

const magpie = [
  '1FoGLbVfpN6e35J45vXSwqsTSajcSxXcYF',
  'bc1ppgxcpqq7vm5ckl3unryndeqheut8lanjtpng9jwxjdv6m53w9wuqx4fqy8'
]

function getBTCExport(key) {
  if (!module.exports[key])
    throw new Error(`No export found for ${key}`)
  const value = module.exports[key]

  if (Array.isArray(value))
    return sumTokensExport({ owners: value })

  if (typeof value === 'function')
    return async (api) => {
      let owners = await value()
      return sumTokensExport({ owners })(api)
    }

  throw new Error(`Unsupported BTC export type for ${key}`)
}

module.exports = {
  ...fetchers,
  getBTCExport,

  symbiosis: ['bc1qtnv5uqa5qt2jwftsj6667kpp8uvgt63p5k5hsn25wm6kjxzmxqnsyu79vc'],
  hemiBTC: ['16NuSCxDVCAXbKs9GRbjbHXbwGXu3tnPSo', '1GawhMSUVu3bgRiNmejbVTBjpwBygGWSqf', 'bc1q4lpa9d5zxehge7vx86784gcxy23hc3xwp3gl422venswe6pvhh5qpn9xfj'],
  p2pb2b,
  bitomato,
  lbank,
  stacksSBTC,
  magpie,
  ssiProtocol,
  'poloniex-cex': [
    "1LgW4RA5iE98khRJ58Bhx5RLABP3QGjn9y",
    "33Mz8zrWx6yei6itk2mjfCytdKJZEwKeM6",
    "1McbLy27nLVzJ4ubMnFm3jxnQ3nbq2mpr2",
    "1PrHfPbcLyHTUHxjizAgauCNXvjnh5LEex",
    "1NBX1UZE3EFPTnYNkDfVhRADvVc8v6pRYu",
    "17vH7EX655n5L4iPAfVXPn3rVzZbrgKYBC",
    "14XKsv8tT6tt8P8mfDQZgNF8wtN5erNu5D",
    "13hxUsGWnJgH2vzscAUrYm7pxgWzTvez7x",
    "1M3Y4dgeg8zVdQ41BXTaWyFUUmc2e6fF2b",
    "1QJt83Cb6S6Tm5chFwyn46XSBGYbS8unXB",
    "13r8PhQ9Gk1KavpJzjc8ELjEw3kBQKLRHq",
    "1NVuvqYpZPnWSd5Fvx15dq6u39ongzxLL2",
    "1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj",
    "1DMpkJ5QHu6rnWehZjVkZxsRTW7VRHk7yk",
  ],
  ainn: [
    "bc1q6dtp7ayaj5k2zv0z5ayhkdsvmtvdqgyaa9zs53",
    "3H8cmLndtkBs7kiHByhHAddTzy8taUwYPt",
    "bc1pepsapf26n8y2f4uftlmhy60ksghx6rqlxdcj4uacfqrkcg6pmncs52rzuu",
    "bc1qu4ru2sph5jatscx5xuf0ttka36yvuql7hl5h4c",
    "1JA46eiDpfx589wawn5RvtEXgwc518QfhZ",
    "bc1qaajdlp5yrj5f77wq2ndtfqnmsamvvxhpy95662zkzykn9qhvdgys580hcs",
    "368vZZKUWDFZRLWMFNRJzHo1HnibNeAJir",
    "33hE9Wq65kjbiLsGD1NYwwNatP6hbsZv5H",
    "32GU8Jux7SbsEbaAaLUnEQmc6JemLF6BUb",
    "3CP5WJ2JSLCew7SETWUe5FxpBGrekMBiwk",
    "39Fvw2Ho1fEkyDsos5sNTN5iMJZKzTL526",
    "3Kptt4TZZRcjuGH8ikoQ8mV1TVxq45dnuS",
    "3G4sMXWAAVTvTXTksr8u9zuu7W8RKsicEz",
    "335DRGzLLG2tu4H4PnFBHYAwcj5pvV8zei",
    "bc1qqg3cdyadq25zn99sdprr4lgpsxg2za998eygy8",
    "bc1qw4vp94e9egkaxc04qsu5z9aq5pqpku2p6pzer8",
    "bc1q3q7afjarz7l6v49538qs2prffhtawf38ss85k8",
    "bc1q3smt9ut40eld6tgn42sdlp9yrx98s90unqw3pl"
  ],
  allo: [
    "bc1pn87rjuhzl3sr9tffhgx3nrrq7rhyxg7y58dl0uk5kyhmkfj26ssqz76lfc",
    "bc1pu64y7m8hdekc5h4xtdl8ru9g3ct5n6mghmaqs8qtqecznccvy38s8tvdv4",
    "bc1pjgn7m39vu02el3xpk2rtgt5kww8g5tkhmc55zevjld4n6cc9tuyq6akrq0",
    "bc1pn29hejmt2mrslsa0ttfknp268qrpsmc7wqmw4ddxqytctzjl50ws2yrpmt",
    "bc1pkpddzz2px40f803qug3l28c7d99qvvjkccgzj7tc80xx29pkd2vq3lqrg3",
    "bc1p23su0d2sxwg95c7ny0p5vn4vf83jmvhyzacw3srjv84hmvynkacqe52r9d",
    "bc1pn6rqr5z8yu5z9qphs0ccmcnt2c8ye04e3f2590rdxsd2mga0harq9k4207"
  ],
  avalanche: [
    'bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',  // https://prnt.sc/unrBvLvw3z1t 
  ],
  bevm: [
    "bc1p43kqxnf7yxcz5gacmqu98cr2r5gndtauzrwpypdzmsgp7n3lssgs5wruvy",
    "bc1p2s98z85m7dwc7agceh58j54le0nedmqwxvuuj4ex4mwpsv52pjxqkczev9",
  ],
  binance: [
    '1PJiGp2yDLvUgqeBsuZVCBADArNsk6XEiw',
    '1Pzaqw98PeRfyHypfqyEgg5yycJRsENrE7',
    '32bhzEniykYRFADVaRM5PYswsjC23cxtes',
    '34GUzCVLbdkMQ2UdVTaA4nxPwoovVS7y2J',
    '34HpHYiyQwg69gFmCq2BGHjF1DZnZnBeBP',
    '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
    '36zSLdRv1jyewjaC12fqK5fptn7PqewunL',
    '38DN2uFMZPiHLHJigfv4kWC9JWJrNnhLcn',
    '38Xnrq8MZiKmYmwobbYdZQ5nnCbX1qvQfE',
    '395vnFScKQ1ay695C6v7gf89UzoFpx3WuJ',
    '39884E3j6KZj82FK4vcCrkUvWYL5MQaS3v',
    '3AQ8bAh88TQU7JV1H3ovXrwsuV6s3zYZuN',
    '3AeUiDpPPUrUBS377584sFCpx8KLfpX9Ry',
    '3CySuFKbBS29M7rE5iJakZRNqb3msMeFoN',
    '3E97AjYaCq9QYnfFMtBCYiCEsN956Rvpj2',
    '3FHNBLobJnbCTFTVakh5TXmEneyf5PT61B',
    '3HdGoUTbcztBnS7UzY4vSPYhwr424CiWAA',
    '3JFJPpH8Chwo7CDbyYQ4XcfgcjEP1FGRMJ',
    '3JJmF63ifcamPLiAmLgG96RA599yNtY3EQ',
    '3JqPhvKkAPcFB3oLELBT7z2tQdjpnxuDi9',
    '3Jy7A2rThtU9xm4o8gR3a9pvQuxXnRNuNF',
    '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a',
    '3LcgLHzTvjLKBixBvkKGiadtiw2GBSKKqH',
    '3LtrsjtyLsHoG8WQMe2RFw3de4pLTQZNcY',
    '3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6',
    '3Me9QACjioepv2L2oKTC9QQ87NH6vFe1Zj',
    '3NPL82eaehTFh4r3StpHqVQBTnZJFaGsyy',
    '3NXCvmLGz9SxYi6TnjbBQfQMcwiZ1iQETa',
    '3NjHh71XgjikBoTNYdWgXiNeZcLaKNThgb',
    '3Qxak1CZhLyZ7GVckKphLURdLBCjMfz9bA',
    'bc1qdtmav38lca8yu3rrcknnqx5242cckgxqws7m72',
    'bc1q32lyrhp9zpww22phqjwwmelta0c8a5q990ghs6',
    'bc1q78ufzeu8w8fwvxuphrdlg446xhyptf28fkatu5',
    'bc1q7t9fxfaakmtk8pj7tdxjvwsng6y9x76czuaf5h',
    'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
    // added on the 27/08/2024
    '3PXBET2GrTwCamkeDzKCx8DeGDyrbuGKoc',
    '3QK5vQ9hucSg8ZC8Vizq83qEWeHFLAWMud',
    '3F3HXxeNpmAovCMByiwC6MYHcogZCJtgRt',
    '32BgTv3NSYbMsBTwDbNNN2GKZPCTJSkqDv',
  ],
  binance2: [
    '3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb'
  ],
  bitstable: [
    "bc1p36wvtxursam9cq8zmc9ppvsqf9ulefm7grvlfc4tzc5j83rcggsqh6nxw5", // Native(BTC)
    "bc1p0uw83vg0h32v7kypyvjn9nextku2h7axjdeefy2ewstevnqffaksjzhrdf", // BRC20 deposit
    "bc1pvngqf24g3hhr5s4ptv472prz576uye8qmagy880ydq5gzpd30pdqtua3rd"  // BRC20 farm
  ],
  boringdao: [
    '33ZibwpiZe4bM5pwpAdQNqqs2RthLkpJer'
  ],
  bsquaredBTC: [
    "bc1qva5m5e7da2zm590z03tdnj42u9q2uye3hgrehwrzgg8j4kxq9seq9rvw0m", // Bitcoin Multisig Addresses
    "bc1qjv2lfrv672rqagycs5zdsggmury0cz2vufek46jj86ddqynyp2qsxm3qfs", // Bitcoin Multisig Addresses

    // Bitcoin Custodian Addresses
    "131fpYjELat58RVzPp2A9Bo8oNuKiP4vxg",
    "15G6tKbavXQ1ynipkZTPAMjEtuosN1Pkmg",
    "1Eyg5NRf5dTPeFGZ5CPJ5o6v1a3dYpeZsi",
    "155FvRapVDRbFYxaxGxJ9eCQjgr7X2yC6g",
    "bc1q745ywhqsssknaw8s5ycgkv0gulddnasn4tfsjwgm66tvgp2pqpys0zjzt8",
    "bc1q07er4xwsv209cfjsvsl3fjmpvcx462dvpjrjpj",
    "bc1pg05lsdyzx8j5wastzk0svu84hdrvkel2zfq560a7the5vvjyp27svxwgyx",
    "bc1qh6u403822hwm7mhncn2dw8pyaup2mwv4p4j8ckfe9p5zj3wdxyeszpsck8",
    "bc1qmvvnxu7739hk9xvgtk4evsx9ycm20ae25gfand",
    "bc1que9dvsgwlm6vr5chrxm2gu586c5alnq3uxa4e2",
    "bc1qnp5dfweymkfyl3wzmzqxjyq0ejf2cnpynnfkmr",
    "bc1qe0srwsmxx2z0mkksqxx72nsgc9m2lvj4777aq8"
  ],
  bsquaredBRC20: [
    "bc1q97ctqygjgj0ljxgge4q735ujxvlad8smass7f0axc6x3ggffr8xqwn69hc" // Bitcoin Multisig Addresses
  ],
  elSalvador: [
    '32ixEdVJWo3kmvJGMTZq5jAQVZZeuwnqzo'
  ],
  garden: [
    "bc1q4ysrrs8jr9dfcxxpq6gat9etjv88dvfa2z05v5",
    "bc1qkvtk6uerfmr9f6nv6u43lgjsjep02t589etk98",
    "bc1qucaqzk2gck97r8utx2mgrl5xmpczf6jcqlr8v9"
  ],
  hopeMoney: [
    '15PYHP5ZW29B3o19jFNKz6RyRdHCtzJj5H',
    '16BLcAyJR8unm8RpQT9PGTwh5uPpZEf2ut',
    '3JoCB8ifwhL4YKo9rCYMgVGbqxBqnpQpdS',
    '179fgM9yyTHj4ZCTfAcGhUFiQMXuPx5xrF',
    '1LaC3Xt8RZWYH1pjcvXxrWxLvXe7iR3ybe'
  ],
  krakenBTC: [
    "bc1qqwf6hexnnswmj6yuhz5xyj20frtp8exv7mclck",
    "bc1q56p075cgup705urqy2w8hwggcf7h7k039afh0g",
    "bc1q56p075cgup705urqy2w8hwggcf7h7k039afh0g"
  ],
  lorenzo: [
    "bc1qaf6laj9m7jteztyz4lulrtcjtpusfcfnd7r7xn",
    "bc1qf6cj2z2e2mzuvfrl80vgt53k7jc2vf36ckahgy",
    "bc1q5hc68n6krnzgzswf7rknha2aqxzrzup4vlhce8",
    "bc1qpxpmr3zdjulqnwa3jdvm83tpaek6dv3kc75ms7",
    "bc1qaml9d9mqgfhsfuaa2ymutdl4psj8c2undx9n72",
    "bc1qutgngqyrflxrfmk9k28ucvq0s2v8a43nwfwv02",
    "bc1qrx3fpr5j6sprxett45c2kl9p4pajyxep0mapfd",
    "bc1q00t2ntm46c2nfvcer6ukj6npaxjurujthse4qq",
    "bc1q3pzhncle68gct6me08kn5kf9awkevt6ettwrmg",
    "bc1qw6cvwx8ajprmp2lzkhrsps2qx4k9r2pj4xj98x",

    //btc script-address after lorenzo stake to babylon
    //cap 1, Delegate to Lorenzo FP(db9160428e401753dc1a9952ffd4fa3386c7609cf8411d2b6d79c42323ca9923)
    "bc1pjy5mq7vlqkq6nldxghauq0sqgh3hjdrp2adl7tcalkavt9ly5g8q3zkymk",
    "bc1pck8hnfa76k9gqtddyjvt0syzlxj5atfr5g0dk0ktmdr9u9h2gnesge0f5v",

    //cap2, Delegate to Lorenzo FP(db9160428e401753dc1a9952ffd4fa3386c7609cf8411d2b6d79c42323ca9923)
    "bc1pf2x7w0wwutvj5qznrxygpv5wcj3nvzq9dqhpmkyfk84nkg778q0qa605e8",
    "bc1pstunan5nv657dqx32tdup3y8uxq6eja6z3d4kukspjpq23gxf4zqdce4hn",

    //cap2, Delegate to BSquaredNetwork FP(2f8ec74d558fe7a97d10be230bf1485db9be675228abfbf957ba050c714b679a)
    "bc1py54xje6lxdd8ej9hqxdxnp5dyjwu2eda2rxa2yuaptv3lrw3t2tscly6y7",
    "bc1pydkry09hpqqv4hxrrlrgpddky4u39xrpqd0xvsf9smjpd65s49qqnq5zel",

    //cap2, Delegate to ChainUp FP(31287a9728f7b11863b9c56fc4cca103f0473dcgitdc6746ed7f79050d3adff644b)
    "bc1p6dltgypr57fc648txjj7zwk6k605ca9x2ul0pycld22x86jcvxmsg7547j",
    "bc1pw8za3k5upa565n0kv55e89a8l0hkzpnfenj767j0cwfu7rn83yhqvuehcd",

    //cap2, Delegate to Lombard FP(609b4b8e27e214fd830e69a83a8270a03f7af356f64dde433a7e4b81b2399806)
    "bc1pa56692v3hxguvu8vgu5d7dh9twlj7wm87qvzvxdru3rnluv8nmdqk58ewz",
    //other vault bitcoin address
    "bc1pu2e56xlz284s5lh9am2k2ys2lhtau5mgq6j9fgljxt7tegsgtp3spmvk0w",

    // cap3
    "bc1pd8z0x5a34w3s3nvyzfjn5z9qchg52wm2exktqev76uc5mjq9lsxq6wsf0m",
    "bc1pm3k5ssdpw7lyzqy4ndqvgs6mvanw046sktw79xfmw0znvrng2wps8qw6zy",

    // cap1, BBN target stake script address
    "bc1pzr98tfuzxxjwkk3fq9k86ar98ttnj6zpf4x62099avdupj443x9qv5xdax",
    // cap3, BBN target stake script address
    "bc1pcrqesnduvztc080dvu0wdm6jzjvuf24g0kamn6p2h2ru0jmssljq69n7mv",
    // cap3, BBN target stake script address
    "bc1prku5dse3ps3hkyjn5lpu0qcypcmqmhqhh8wfuztpck5h5unx5wjq9mpjjv",
    // cap3, BBN target stake script address
    "bc1p9yrhpkm6klag7r0xq8f93degehxc086tnv2lsckg54cl2yl5wyeqdhx8v6",

    // Babylon unstake relay address
    "bc1p9ta9m4h6z5hz5mvu2450qqrd5x507a25c4uper8nkxllhs94x7msv77l0s",
    "bc1plh54q8p2e870cc9yunza4509ulna54dara2vz38c44f0jdgce4rseupqy7",
    "bc1p8lqq8u7rlr38fgttp2hypz9t2vl4r486gkm67mkawyn769e7njmqhyz0tn",

    // Ceffu
    'bc1qjvvw0rur4jl503yu9umwpzlryyg6rr8j97nz80',

    // Cobo
    'bc1pj9r40wqjwscrqxma2a52sjt8c8pk975m4fjawekf43lk0v34e4qqt4xm9n',
    'bc1pxwcre508c6fkafuyt65utjv8enul2dmc79rhufq7u22tgtx26u0qajmflu',
    // staking gathering address
    'bc1p9mcc69rz8wdcc4yxxg0uj9qygpsepc6628pzq5l3a08u76d6f3pq246syk',
    // other
    '36tKXKVAUqEkMx9NyErJv4c3KVEJNnJJYT',

    // small balances left
    'bc1ppwfa95ug52ufc2azau5wn8qvlss8xkmf8jutydg0azkwegks7wfs7cd98n',
    'bc1q606v608m2nrpzlqjn9gfwlsaw4dwxhjp82mrps',
    '1FopykmQHhF51JwZ5co9nEDuQHHL6PqCTn',
    '1EVosahWYJKUj5b861eiHWvwZxfq5SuXqk',
    'bc1pzd6luyardlle9f7lul2y8fl72c22p6vxspc4k4g4gzgjf8975s0sr042yt',

    'bc1q4jnycjnu2322hjk20e56qymu4pwk0kpgds62y0',

    // babylon unstake transit address
    'bc1p754prt7xj5vh9vcrwsjv7aa0f60xlrmm8arcrxg7kcg0gxrtemdsnzlwvn'

  ],
  lorenzo2: [
    'bc1qndzgrwj3y2lhcklme4t72jxq3df2h05vjdgzpp',
    'bc1qa4yfx2meqadqwpmqznlct0t2j6pt5tw5xrpz06',
    'bc1qnvgmve5gs89ugf4n94jzqgan202dve5dtrj220',
    'bc1qrdnqpvyx5g40ta0wg9js7ky8qx5qglnxyf72qx',
    '19KdJBkptNL7RJYgsWFvGr8BqGaeV9xEpg',
    '14eK85UFbR74KADFXkPXKyEDrroiVVGmxX',

    'bc1pr6pga0d44xm3t8z36qnya6sfznsm8fwkn507x6gqt86xtnvm4h4sj2zqus',
    '19wFRSr3GYHmVQtnmbkx7Wkjw3jZdyYB9a',
    'bc1qyd4g2r0n0p9u775z7062rz8j88xxy27kmmh5aj',


    // new batched TVL
    'bc1q4cgxdkr6kypy4nxf24zy4l2rjuuavdnflnnfs0',
    'bc1qdkkv0aqfjqzfj4lszrwnl5ywlm2c8d6uvds26s',
    'bc1ql70zgt8lmnk2n7z8usdc2cv6kp39722rrj6u4p',
    'bc1q4kfty7afjs4yse4c3pqwah4eh082e4e0f8fdt4',
    'bc1q4zqnzrapnvcdye8cl4fymtyz0udk4t60rynx7j',

    'bc1q2y8q75u3v7y79ay93anmp069kt33tajfly2vv2',
    'bc1qxqyclhjklh2u6qjcf4h0yzt2nw2hf6ah4k7tmw',
    'bc1q6al9468v9tjyrrnu3ahzpt4dfdfaehfst2np05',
    'bc1qurmwjnqmwntzshpevcmpd7ul72hdsnj9wn6wpu',
    '3FChYicLZ7sD37f7NR2kGHwKCewSgdpzYd',
    'bc1qjasqm3y6uytk3xklqdzf72rjqan74hf5m7pv0f',
    'bc1qnaq02d5c94tvml8gn7634shtjr6adkp3g40vhjktl7j2yseu70zs2nmnyu',
    '1EFjtdZtgn6XyEgwTn5hbZGHxp8amJw38s',
    'bc1qaxe3lqg0ztsthfsjqwx23j8vgpwjd5750sq6st',
    'bc1qfx66vlxvmunep6eyyht4ahrer5premffmra86l',
    'bc1qq6py06647kvjctncmm8q4ctl4f4qmtk68fq4dc',
    'bc1qarjgfex5tk57jp4plwm03tf978pcxrr9vaqnxu',
    '3Gi3oLSASNzYLck4wNVRHzrYJGWwo7zdh9',
    'bc1pckv9jvpnwgw67p02jfuxxcr0ycmlyk5xaj7atwsfu08u87t5srvqannw34'
  ],
  merlin: [
    "bc1qtu66zfqxj6pam6e0zunwnggh87f5pjr7vdr5cd",
    "15zVuow5e9Zwj4nTrxSH3Rvupk32wiKEsr",
    "bc1q4gfsheqz7ll2wdgfwjh2l5hhr45ytc4ekgxaex",
    "bc1qua5y9yhknpysslxypd4dahagj9jamf90x4v90x",
    "bc1qm64dsdz853ntzwleqsrdt5p53w75zfrtnmyzcx",
    "1EEU18ZvWrbMxdXEuqdii6goDKbAbaXiA1",
    "bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702",
    "16LDby5cWxzQqTFJrA1DDmbwABumCQHteG",
    "bc1qq3c6kehun66sdek3q0wmu540n3vg0hgrekkjce",
    "124SzTv3bBXZVPz2Li9ADs9oz4zCfT3VmM",
    "bc1qyqt9zs42qmyf373k7yvy0t3askxd927v304xlv",
    "bc1qgxdqf7837dxe8xkhvctgc499kwh5xw7ap3uwhs", // add on 25/02/2024
    "bc1pruhkl5exjt0z824cafauf750f5g08azuvgcjctv0enz5csayaj7ss3j5wc", // add on 25/02/2024
    "bc1q97vmervc8x9hzr4z4yvzn3x4rk74se6e8x8sgy", // add on 25/02/2024
    "bc1q2lzqzjcq472x8v0kgdcn4m5y8cq95ysnxm6vemu0qsuqgzyge06sqmqdal", // add on 25/02/2024
    "bc1qcmj5lkumeycyn35lxc3yr32k3fzue87yrjrna6", //nft_vault_address;
    "bc1qq76dy32nnk5sha36etg6pdj94vl5zrskavux2f", // add on 12/05/2024
    "36n825H7orW1u8yWmvR4zs2CWfmkY2rkpK", // add on 12/05/2024
    "bc1p35l88j3ashhktg75tjctt6pacrgpyr93ldt7yw484dm4expq073qk4n0a0", // add on 12/05/2024
    "bc1pahkqca39mfcfay7nueczyhn9v8wq96x7mp4pjxpsdpsnurxzuwuqnhsdg3", // this wallet was provide by merlin team chain on the 14/08/2024
    "1A7oMBdQir24ESgk8LDccM4MUKJx6d2mCw", // this wallet was provide by merlin team chain on the 14/08/2024
    "bc1q0hgd38zjp2v2rahqverkmdaak4vc8fynyatqet",
    "3BN9ECDCAjgxaQUmJCBCM7JtJZaCeB6rL6",
    "17z6W1Eq1A7hWcWQiDxUcFTZBVCMsYrLye",
    "1McbLy27nLVzJ4ubMnFm3jxnQ3nbq2mpr2",
    "17vH7EX655n5L4iPAfVXPn3rVzZbrgKYBC",
    "3Qjmb6Z9i3ySgG7uHFyngRX96PJhYsFZv8",
    "17Wy2634mL7jsSxVjRQS8k2NexVwRh8jXA",
    "13hxUsGWnJgH2vzscAUrYm7pxgWzTvez7x" // LP MBTC Mint
  ],
  multibit: [
    'bc1p6r6hx759e3ulvggvd9x3df0rqh27jz59nvfjd2fzmh3wqyt6walq82u38z', // hot wallet
    'bc1pyyms2ssr0hagy5j50r5n689e6ye0626v3c98j5fw0jk6tz3vrgts7nt56g',  // cold wallet
    'bc1qmcrpqanjnrw58y0fvq08fqchgxv5aylctew7vxlkalfns3rpedxsx4hxpu',  // cold wallet
  ],
  obelisk: [
    'bc1p0tr3dgulgpx43dkktjxy8z2azz6yvx4j7s0lelj67tlwct0wnqtqeakfer',
    '14ejzLtUSMsjZE8Pp2LUhX3Pf7BbXPeZyP',
    'bc1qy4pkldj4dqxtqypz6awwj7y8vahkht8uqhdlw3',
    'bc1qjnhtrjgr4y0new266twr6x6703lshszuey8zwm',
    'bc1quxgdtm6n9zau50n6aptcyn55gm0r5xjhvl8399',
    'bc1qt887udazek8rl89ck43nar4397a8qkp9qe9qdp',
    'bc1qunzwmk6gkx3ugxd4kmult6vl8vlws0w2jfume8jhnyxmz47ucy4qkhqwu6',
  ],
  roup: [
    'bc1pv5lu5aklz64sye9f4zmnjkfg8j6s2tllu3fem4cs9t0hcrnz5e7qy0qw6e',
    'bc1p2tncs8egnj8e6qt46np3qla70mfx4telu92v4c9hp3pg8khqp37s9lvmfx',
    'bc1phnxqw4gfq349wm2xcqgqk77544ssqwa6ycuhjh7hdxks4mtjg33qrfenw5',
    'bc1pfsu3ts4equ7rdy63dgt7shkqlu2n5kw8p0z7p7c8lsrh2yqg40fsvz4ev3'
  ],
  tronBTC: [
    // On the 23/10/2024 , defillma receive a PoR from Tron/HTX team with the respective BTC collateral backing BTC on tron chain 
    "1NBX1UZE3EFPTnYNkDfVhRADvVc8v6pRYu",
    "14NEbSYdjumn9h4spMjbp3PdUpeXuM5PBZ"
  ],
  xlink: [
    "bc1pylrcm2ym9spaszyrwzhhzc2qf8c3xq65jgmd8udqtd5q73a2fulsztxqyy",
    "bc1qh604n2zey83dnlwt4p0m8j4rvetyersm0p6fts",
    "31wQsi1uV8h7mL3QvBXQ3gzkH9zXNTp5cF",
    "bc1q9hs56nskqsxmgend4w0823lmef33sux6p8rzlp",
    "32jbimS6dwSEebMb5RyjGxcmRoZEC5rFrS",
    "bc1qlhkfxlzzzcc25z95v7c0v7svlp5exegxn0tf58",
    "3MJ8mbu4sNseNeCprG85emwgG9G9SCort7",
    "bc1qeph95q50cq6y66elk3zzp48s9eg66g47cptpft",
    "bc1qfcwjrdjk3agmg50n4c7t4ew2kjqqxc09qgvu7d",
    "1882c4wfo2CzNo4Y4LCqxKGQvz7BsE7nqJ",
    "1KGnLjKyqiGSdTNH9s6okFk2t5J7R6CdWt",
    "bc1qt2kjf5guf4dvv4mvnswyk8ksaeuh5xyhc5gz64",
    "19GTEWTnVgenpDWSdQEAT9LJqMFQ7Yogsu",
    "bc1qxmwuugmcnn5k3hz22cxephy2vkevvt2knsd6u4",
    "1617Cf4qmjqVyiN5weQRo8sZvQvyDjshKP",
  ],
  xlinkLST: [
    "bc1p78mvfa550t7acg6wm9cl9543zf68ulhqkxex5pvhv8wnw4qpl3gqmpjy2s"
  ],
  xrgb: [
    "bc1ptm05s4f6f8j78zhx62lzx0dep07f2597nlgeltmm4sjn5stdu6gq4sxg2w"
  ],
  imbtc: [
    '3JMjHDTJjKPnrvS7DycPAgYcA6HrHRk8UG', '3GH4EhMi1MG8rxSiAWqfoiUCMLaWPTCxuy'
  ],
  twentyOneCo: [
    '1HTGi4tfXSEtcXD4pk6S3vBs3s64hWY1pW',
    '12WZhMFFLHQ4rCMSkeBfbJXRk7aGWyBh1M'
  ],
  // Avalon CeDefi Bitcoin addresses
  // Note: Bitcoin TVL tracking is currently disabled in avalon-finance-cedefi adapter
  // Previous addresses were FBTC reserves already tracked by the fbtc adapter
  avalonCedefi: [],
  pstakeBTC: [
    "bc1qajcp935tuvqakut95f0sc9qm09hxjj6egexl9d", "bc1pzq0ve6e7j6jt4ckx8uzdjyddrfda9ew8dxvrjmkxmfnj9yz68zeqgqh9cl", "bc1pjp9pg0d6wcejlg576st4s8d424zx443mdumdhvjcxx5ehnfk4xcqyru7ay", "bc1px92pntcj0wd5076nnymp787a7qczsaauuefgntxngdwvkd584xgsaagem2", "bc1pxhkczd3jq9nq50p2xll99edhxlx5dj6ztgw5pgtzszjtlvg7tl4s8ttf04", "bc1pxhe0dvtg7q06st7n7k0s6235ed4dhhawhhewpz7f4a0dmcrch09q2shl8y"
  ],
  biconomy: [
    "bc1qx70fn2550vhjetc748wmg4lzv5gy7t56ns92v8",
    '3PYizTwdQy34GbpzC2D5QmfatUeetc2sEE',
    'bc1q8pmj4kgvmg0yqpjhqwr9gqxhktlndzultkwaaz',
    'bc1qlz4as7vs8jr5glhxtee3a0vr40j56uslg24r0w',
  ],
  bigone: [
    'bc1qu02z43yduyjx6saeea4l54qqulvz568qnzgaes',
    '1L5D4Eq2RkEKuN717Gc817MH1Sxs5WwMQh'
  ],
  bingCex: [
    'bc1qr8e6kmev99jxnk7hpyhex434t59ke5tpvmnyd3',
    'bc1qzzn5tszxn3ha87xfke540k8pr4favsk9cusakq',
    'bc1q302u45q2hqafhdaehkkzqkf0l0vkz5l7exx307',
    'bc1q3h8dk28faa94e9gmw4p0lvywqkw2sazyt3pl05',
  ],
  bitfinex: [
    '1Kr6QSydW9bFQG1mXiPNNu6WpJGmUa9i1g',  // BTC hot wallet
    '3JZq4atUahhuA9rLhXLMhhTo133J9rF97j',  // BTC cold wallet
    'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97', // BTC cold wallet
  ],
  bitget: [
    '1FWQiwK27EnGXb6BiBMRLJvunJQZZPMcGd',
    '1GDn5X4R5vjdSvFPrq1MJubXFkMHVcFJZv',
    '3GbdoiTnQrJYatcr2nhq7MYASSCWEKmN6L',
    '3HcSp9sR23w6MxeRrLqqyDzLqThtSMaypQ',
    '3MdofQ2ouxom9MzC9kKazGUShoL5R3cVLG',
    '3Jxc4zsvEruEVAFpvwj818TfZXq5y2DLyF', //add on 12/01/2024
    '3KUwtHc5UhWQ76z6WrZRQHHVTZMuUWiZcU', // add on 27/05/2024
    '3H6JnFoz5jcoATKQ83BuQ3cUUCHswqfgtG', // add on 27/05/2024
    '3AZHcgLnJL5C5xKo33mspyHpQX7x4H5bBw', // add on 27/05/2024
    '3DSST4myyyRbiGzgCBE1RVHY7GRjDCh4n9', // add on 27/05/2024
    '3Nu84pbqfcfaFztQ74qc9ni2PH5HGM1bzS', // add on 27/05/2024
    '34hatYbZ27CLLoZWhuJHzBgoTCwXEv8GwT', // add on 27/05/2024
    '3Gm1h16ov9cH4o4mChapGUai61K1bAXL3c',
    '1PX5L73e5325fdrSwDHNTuq8RMM9JKR34q',
    '1PPyiSbdQeo83ezje6Yv8L3UWpDcx4NtSB',
    '1NZc5p5YQ21tGjVrurzczq56SVq2tiH6dt',
    '32qqF3w9W96S6br5x3cR75fgtFZwshjh4X',
    '3NnoMUQnURz29QLJcvQ5Xy6ztgJ4TYmqY3',
    '33orXrdG44b7uexFP7Yxdqy1m3FirNtdTE'
  ],
  bitmake: [
    // wallet provide by a bitmake team
    "3F12ncAyx4VkfpvnS7ZxdpggFx4p9RKfVe"
  ],
  bitmark: [
    "37RJkdkzPXCMYSTq74berJYj9FmNn7wFP5",
    "bc1qmzaf7207zp2mvm8f2f5qaa4va0hxpgpmpc2ryp"
  ],
  bitunixCex: [
    "bc1qxh9ruwejxz7ztzxejafd74tyxg4sgfeqxun42f",
    "bc1qhjfnumgcsqsx6grxa7mfl7rr5g3u8xl4gtt7tr",
    "bc1qkvrddql6hh00apslzsxnysl75hhnm5fpqdah37",
    "3D7pZri6kLqXDQMbf5G8De39K36eBaNKBG",
    "bc1qhx6x3c3nhyh4d2fsujjcaatc27xslyg6zju8p5",
  ],
  bitvenus: [
    //  '3FdoFGYYcD1EU7ekrt2x2u2mFrjmxouMJG',
    //  '358pjjkYRG8exw2BKZnn7Q9s6SCb7wZEWN',
    //  '3C1ykoWkHBMZwmY8PUUMVxtJJSBkZBCtN8',
    'bc1qrm2a7u9xyeffvulm6e589qvesmt0v0rjxqfkhv',
    'bc1qvht34dma2uy23l9j862nnqr38a42kjr66e6lec'
  ],
  blofinCex: [
    "1Jw4meLNYAaDcNxJwQdMTRVw74hGPcuV8W",
    "bc1q6377fdmkvkhgzpw8drgu76jxulsl5wmmgwtrxu",
    "1PM8huQVFSirUT7eAwNm3rBBYTsDRzCaf3",
    "1LNZ4tzv6FzQ3mUHBkuUqwb232Miu9541h",
    "bc1q2kvvk4dfp9g0z5v9cw5ajqnvt78gh4jwfyyn9s",
    "18obUe1Br36ZcY8GsPDTrrLSjhURpy5A3M",
    "bc1qxgdghfmmmxfsegpda7sw9kdj7h2qq8djgdee8m",
    "15Zvb1QArGReWEDc2PTHgaUodAkyRYNnA2",
    "bc1qje5d5esrgu03d80k0g4kwjn8kvektlcmvk8gk4",
    "1EiHy6dJRR9gbuyjNvTqg76aZtHG1Ao3PK",
    "bc1qtssyj8zfs6hzfvr67r86ptl7wykf352md0637r",
    "19Q7qteD5pKEGVA5ajoQ2bBRNn1MxiyEYb",
    "bc1q6pku29sx4fv5d4e6pt4yvfsc2ummmamud75mvn",
    "1L153qzyQdrnYuPDeGyyBEHmXyUqWXHzTn",
    "bc1qwyc5km9j23enhtfke96wt9ejqe9hwdpg222f7f",
    "1BKWQjCcRGjs9TozqbUEiPnehtzGVmHPXT",
  ],
  btse: [
    "bc1qaxyju6n2x2tednv8e7hgnhnz44vrfcmuhjxpfk"
  ],
  bybit: [
    "bc1q2qqqt87kh33s0er58akh7v9cwjgd83z5smh9rp",
    "bc1q9w4g79ndel72lygvwtqzem67z6uqv4yncvqjz3yn8my9swnwflxsutg4cx",
    "bc1qjysjfd9t9aspttpjqzv68k0ydpe7pvyd5vlyn37868473lell5tqkz456m",
    "1GrwDkr33gT6LuumniYjKEGjTLhsL5kmqC",
    "bc1qs5vdqkusz4v7qac8ynx0vt9jrekwuupx2fl5udp9jql3sr03z3gsr2mf0f",
    // added on the 15th of july 2024.
    "bc1qa2eu6p5rl9255e3xz7fcgm6snn4wl5kdfh7zpt05qp5fad9dmsys0qjg0e",
    "16jVbMCcqq1deKrMB3esL2HPso7kvqUsec",
    "1LrsskS2hmLvevKiqASDymS8xRmJ7Gp83u",
    "1Ko6Sbu8VgZaQNZMfRgNjR8zVzVN9wL7aX",
    "12rFmDggwCNrRL6vuPEjzCDSskTRPjDajP",
    "14ug9BVtGnxY8ezvd5cr1PXHeXBYXkpsdw",
    "139RYdfv7vNtbnK88juMR3s4pgwvB4db9Y",
    "1KHch51TT2eazxYkUXtr38GXtPTjf8Mue",
    "bc1qpz86ltanq6042k36rs0yl0wjpd6tgu8fwckan7",
    "bc1q7enk8z5gkuzk2sla4vnmzh5qq8jq6wptx0pty5",
    "bc1qmv30sf5tnlx52x6vszl0gmey7vae6elzpm2zxw",
    "bc1q59nmn5v9tz36talq7g090yue5kf7actqr62f96kakte70eu2948sw6ddxr",
    "12XZMdaAGmcHf4ocFSqpd8jFd1WH7RHUPs",
    "1DLeNApsHNNzUMNZJVoXeyEY5sdp8vzx3w",
    "bc1qr7dl0rtnfvzkfqrvctpk068c8zluknkzapwhe9",
    "bc1q0npwm7hphq4w3pn0m4nr5hmum2sdg725edylgn",
    "bc1qqc0h2sxt9lvrsqt90rtpjqnjj7qcwv457g28h2",
  ],
  cakeDefi: [
    "3GcSHxkKY8ADMWRam51T1WYxYSb2vH62VL"
  ],
  coindcx: [
    '12hGEyxk4zMLquxiMiFrkvYSohsXz2D3uZ',
    'bc1qz22hegkllltcydg3pz3an6h352mjmyp7n2vhd9',
    '1MzSJodjNmACPKyj9VUv9X55Pby87osLhc',
    'bc1qucl4n347qc6e48w85xdxcv86sm3an8fr250hhm',
    '1F6CrpEnHEZh6gQtJ7cf1MtK7Y8GYKoP4i',
    'bc1qn2xm6agnanuyuwfcfw92el7nvt2lpsqr5s5c0w',
    '17mxRZ9WeXigSwg3Cm62HxeATnuUphMxGL',
    'bc1qffg4ya27430vv5ymg2lhf4mj7tvtc3ur5qyyq3',
    '1JV3umtGC6H6tFUVoFyV5KwbJDscUwrtX7',
    'bc1qhlyrdhfqry06nj902p9dxdftm4pxkhdqeum8y8',
    '1KXxS6QnzpB8mSLm5kmXJXqvZF7wVvQDCw',
    'bc1qedxsgzuj8ga644gwlqw4nw7f3xncq4g2rskmzu',
    '12T8i8tpeczk5JGf8ppZf1w6SFBRwEa9y4',
    'bc1qpl5kqjkugyncr72a4fhxvm0360ehfdl27e00ja',
    '1PRwacjHVksLNTkSYNkiWkRgTm1yDSgLMG',
    'bc1q7c9ylgjsyc0yaxwm84jjh6avfajzfe7dhk6e0e',
    '1477uXZ1NfUaaZZdnztQ7h8ftGRpuWQPfA',
    'bc1qygg2x02cfy0e6r7798v4qrcjjkzm8tl5t0xkwf',
    'bc1qljm7vwdgdy6ca97stsyjyl3zdjtkdsdm8vnh8f',
    'bc1qqhwh3tcg5duwq7hdlnlr5n2tg2uq755cwmkjqn',
    'bc1qqe4g7sjxzk90nsgj0mwufwcdtd7kufg7k32xch',
    '1avi3SkWKGLis8dGCP9JUnFfVeheP8wkt',
    'bc1qmulc2ju4kykj24xuw0fu73h9h3usa897xhaucz', //
    '3Dm2TL1pt1VzeBCq9jgvQG81QPv19PyReh'
  ],
  coinex: [
    /* all empty addresses
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
    */
    'bc1qqz623jyqdsh2w5y5kdmzk2ws6mzr2mt2etv5gx',
    '31nXEifPqiUL3hqfTP5epd93s3ShNLnWL4'
  ],
  coinsquare: [
    '1P7cDFGeWm6ezez6XGXTAjvm8qcsGiMXe7',
    'bc1q0k5rpdwf7wnq3fuk7dfjqd59p3ke7ufqmlkfp4',
    'bc1qdstretw2uvhjen7hvgaya3nsjgr430x9jhqf4a',
    'bc1qez6ezccleuac4dnj5cpexz5mz3j0j3j655j6qn',
    'bc1qg6a9kpmge0fdwtrymjvq3cydfzgpcge7e05e7z',
    'bc1qg8fywv20ztsp0edtf53zpsnxeu5cqxrmdwmtjd',
    'bc1qm5mqpgtt2ufucfdvhu5xcdgs3vzehwu62wsyqy',
    'bc1qmkkejzrq7ayfjpy7w8gmkhd3uwcy7nryr5apch',
    'bc1qsjc50kf72r4q44ac28v3vrukaxjg4w30rh0cmm',
    'bc1qyz9mssutu8xxcgjvsucz38qvxt7hxwtnm5eh8k',
  ],
  coinw: [
    '14Z9KSmCo1UjvBiXj2j9er35GmGmaFxsmE',
    '1KYBKqRjGbRynSiyoiHndULssXrEeWhvU8',
  ],
  cryptoCom: [
    'bc1qpy4jwethqenp4r7hqls660wy8287vw0my32lmy',
    '3LhhDLBVWBZChNQv8Dn4nDKFnCyojG1FqN',
    '3QsGsAXQ4rqRNvh5pEW55hf3F9PEyb7rVq',
    'bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9',
    'bc1q4c8n5t00jmj8temxdgcc3t32nkg2wjwz24lywv',
    '14m3sd9HCCFJW4LymahJCKMabAxTK4DAqW',
    'bc1qjqy709gqpse60hdsm2d2v0dzzu7yp5dej7fdrpl2x3taccvujq4s0vzsyd',
    'bc1qcdqj2smprre85c78d942wx5tauw5n7uw92r7wr'
  ],
  deribit: [
    // from https://insights.deribit.com/exchange-updates/proof-of-reserves-deribit/
    "bc1qa3phj5uhnuauk6r62cku6r6fl9rawqx4n6d690",
    "bc1qtq5zfllw9fs9w6stnfgalf9v59fgrcxxyawuvm",
    "1MDq7zyLw6oKichbFiDDZ3aaK59byc6CT8",
    "1932eKraQ3Ad9MeNBHb14WFQbNrLaKeEpT",
    "13JJ1nxDeX5fMsDeyGHiLoK8rF2ayGq1cX",
    "1MdrdcEzfiJdvs6eVSwUx6bWboPX8if5U3",
    "35WHp4Hid61peyH4tuhNunwRj2gtNB41Lo",
    "34ZHV8dd6uucEUABUydWpKi6F4qKQntEUf",
    // added on the 26/06/2024 
    "bc1qzwhw94uldd3c8736lsxrda6t6x56030f8zk8nr",
    "bc1qrmuxak470z7zch5f3gz05dc6h4ngwqdq4wx80w",
    "bc1qf6lm99tp5p27hsmyskve236nsv32lnfwt4h8wk",
    "14HeA1YRUiJGb95HVpVTBuavMUBYGk6y7R",
    "bc1q78c4tk53hx28ladm3j7cn8x7yw6gnh38ur8j47",
    "bc1q2qkuk5hr6yjw2jshtrfqw29tyy3x62rqk3ep6x",
    "bc1qdk5y6mztxustg20zqgtfn88cec3f9u8la7dk4f",
    "bc1qws342rlkhszh58rtn35zrw7w076puz83gkcufy",
    "bc1qnecufhyxp2dlymcs63asygydjs9x2k55scuc5s",
  ],
  fbiDprk: [
    //source https://www.fbi.gov/news/press-releases/fbi-identifies-cryptocurrency-funds-stolen-by-dprk
    "3LU8wRu4ZnXP4UM8Yo6kkTiGHM9BubgyiG",
    "39idqitN9tYNmq3wYanwg3MitFB5TZCjWu",
    "3AAUBbKJorvNhEUFhKnep9YTwmZECxE4Nk",
    "3PjNaSeP8GzLjGeu51JR19Q2Lu8W2Te9oc",
    "3NbdrezMzAVVfXv5MTQJn4hWqKhYCTCJoB",
    "34VXKa5upLWVYMXmgid6bFM4BaQXHxSUoL"
  ],
  mtGoxEntities: [
    // https://www.reddit.com/r/CryptoCurrency/comments/li1fw7/btc_silkroad_stash_seized_nov_2020_by_the_feds/
    "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6",
    'bc1qmxjefnuy06v345v6vhwpwt05dztztmx4g3y7wp',
    'bc1qf2yvj48mzkj7uf8lc2a9sa7w983qe256l5c8fs',
    'bc1qe7nk2nlnjewghgw4sgm0r89zkjzsurda7z4rdg'
  ],
  silkroadFBIEntities: [
    // https://www.reddit.com/r/CryptoCurrency/comments/li1fw7/btc_silkroad_stash_seized_nov_2020_by_the_feds/
    "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6",
    'bc1qmxjefnuy06v345v6vhwpwt05dztztmx4g3y7wp',
    'bc1qf2yvj48mzkj7uf8lc2a9sa7w983qe256l5c8fs',
    'bc1qe7nk2nlnjewghgw4sgm0r89zkjzsurda7z4rdg'
  ],
  fastex: [
    'bc1qs7yen7ljpvyw7vn58ql6zfaddqf4rcjalsgmt5'
  ],
  fire: [
    'bc1q36c0rp4ydl6uvvguhw9nr7njm49addzkgftqev',
    'bc1q3z0khuld6nd7esv46nxj9ketteqw9qz86peyeh',
    'bc1q4hz59t7v0uxujuyrhp9679uppur7ke9u3vshvd',
    'bc1qdlrh7ycyqxe62vk5m70y353vmep9ullxx5j9ar',
  ],
  flipster: [
    "31iAUikiV7yKEYBzbA1iHPcanHNsLBFe8C"
  ],
  gateIo: [
    '14kmvhQrWrNEHbrSKBySj4qHGjemDtS3SF',
    '162bzZT2hJfv5Gm3ZmWfWfHJjCtMD6rHhw',
    '1EkkGXR7dTbZbrKFKoe6YEP4gj4GzMeKvw',
    '1G47mSr3oANXMafVrR8UC4pzV7FEAzo3r9',
    '1HpED69tpKSaEaWpY3Udt1DtcVcuCUoh2Y',
    '3HroDXv8hmzKRtaSfBffRgedKpru8fgy6M',
    '1ECeVF6wfbiihCRrrpRnkbwrWsZfYmixMG',
    '1FhncfokiSDagazXbuVqKQ6ew4oyDmAzhG',
    '1FLKsCiEsABS7LysfDA8R181TQ6eLjoxPv',
    '1L1SN3BxXaXEAzzGcWqjF9svxmN6F2mBoR',
  ],
  hashkey: [
    "bc1qyvppkaa74d9jvtz664a6uxmj09hf0eyg3uhx4h",
    "1DywJMqHHMWuP7xyfkRqJZCEe7GdEKFRcp"
  ],
  hashkeyExchange: [
    "bc1qqe394jlqq86muq23d4vrnhzzvcv8jnepgt8lx7",
    "bc1qvf35autwy0knhh3sj7suupmw3w94r4r9c2ry5z", // 2025-03-07
    "1NfJSiqBw4fb74KgVQrPsk5W5aqitAD1Xv",
    //    "bc1qlrawqecuwgpzzwh04pkhtfsqsk33kald22ds3c", // bosera funds https://www.bosera.com/english/index.html
    "18oxobhCNKnHjb7nEFDmPdXbCZthFWezrm",
    "bc1q9d5lq9psmkx9rtgewjgez7csg45faak2cccew8", // 2025-05-26
  ],
  hibt: [
    "bc1qpxntlx09kqvpwl7vmjw9f28yvytdqkdx8xh63w"
  ],
  hotbit: [
    "1MiFZMJkFMhMrubjjo6f5oEhh7XgSwXWgp"
  ],
  huobi: [
    "12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8",
    "143gLvWYUojXaWZRrxquRKpVNTkhmr415B",
    //   '1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj', this wallet is backing USDD acording here https://prnt.sc/i3cFaak7H9Y8. For that reason, it should not included as HTX.
    //These 3 addresses has 48,555 #Bitcoin. This is only less than 3% of the total high value assets we have, including btc, usd, stablecoins, T-bills.. According to Justin Sun https://twitter.com/justinsuntron/status/1590311559242612743
    "14XKsv8tT6tt8P8mfDQZgNF8wtN5erNu5D",
    "1LXzGrDQqKqVBqxfGDUyhC6rTRBN5s8Sbj",
    "1HckjUpRGcrrRAtFaaCAUaGjsPx9oYmLaZ", // add on 08/08/2023 (we defillama)
    "1L15W6b9vkxV81xW5HDtmMBycrdiettHEL", // add on 08/08/2023 (we defillama)
    "14o5ywJJmLPJe8egNo7a5fSdtEgarkus33", // add on 08/08/2023 (we defillama)
    "1BuiWj9wPbQwNY97xU53LRPhzqNQccSquM", // add on 08/08/2023 (we defillama)
    "1AQLXAB6aXSVbRMjbhSBudLf1kcsbWSEjg", // add on 23/02/2024 (we defillama)
    "1ENWYLQZJRAZGtwBmoWrhmTtDUtJ5LseVj",
  ],
  kleverExchange: [
    'bc1qze8pn5vywzk8enqdr9ve28lyas23kurzd37027',
    'bc1qgy5zyuvsw5wnt5lrx3m62tt2pmdl69avd5vw6n',
    'bc1qk4l4u3lh7rrufsw0z6vmkln5kesf0a9q0srnkr'
  ],
  korbit: [
    '1JtAupan5MSPXxSsWFiwA79bY9LD2Ga1je',
    '3E8BTrBB7jxAemyUqSnN4YFLMC22cShZJZ',
    '3GoBetHTvfnaRNQbR4yy5YNUjX4d8mTQKK',
    'bc1q09j44e0xxxusj3zsan20x7tuvtumxfv9smlq27t0nwp57gxf7htqq6m9lj',
    'bc1q0uffd8egas4w87dxq998ttfl6j3jtw6k7cafce9v4mvr5qc9tvfq9czqk9',
    'bc1q33m8td986p3vcnap9zqpx3d8v8zujtkvqacsya5xfvf945vmvxzqth4h4t',
    'bc1q3yn06lfl8ayjukya52ksff0uaveurfc8lm3ftdgu8ywvwanx8lqswj7w9u',
    'bc1q4sv2fxlp6w08wkq8ywmughxkm7n75d2fmrgnmvwun6rhepyknjxqm99v4x',
    'bc1q7fww9657ts2au45wh0ed39rjze6ja93z0498z4j89pqjky266wzs0sz8ka',
    'bc1q9pnwfyd4jtkulyk4w057wsdjhykaw6fftw06k2cn2m3y7jlsfe2qvxvm8e',
    'bc1qa8may4g0yzezjyesqcq0mwggy5wwzl0yhs0a8tk9ucej5qg6ujfqscv2jq',
    'bc1qgkx4ee8ac3as5y4ddhw6uedyk9adsywdzgc0fzxv304lcrh4qs9sn96agt',
    'bc1qku6z53kuyaj9r898kj6esqnwz7wke82mwgw43vhu33ld7sx3200s2u9p9x',
    'bc1ql0p3klhr2d8z07ja3t5d5dnxrenhp4gcjeszxpfflr08zaqqx5zqpkeqnl',
    'bc1qnerwvz93pcj653r5yd4hnd2d7np2drhdhyruj7qdvl3psc5wnf0q6x9me4',
    'bc1qs9ut74nue7vjknz2eqxegmtuzqhjzx9y8tzjymvlg05v8a5ffr5qz402cx',
    'bc1qsk6h7d2l7e7r2a8krlxjn6wdnhhszyrtzcugdsfa5zz4syajzl5spd52h5',
    'bc1qsmqvkwrsy5xw2hm885l5fv7s2hxzauz5fn9jayfmd86305wehrts2lztgs',
    'bc1qtlen0nuvln3aqcn2r3nljshdmzakq7z5z4rexpk23mj8u8lmc8ysc29jct',
    'bc1qzdt5z4f46jak59jku5jmvv3f2ru20htqs7jhy0whazgd5v4626eq4vkxqz',
    'bc1qzu4lnzfpskwsvnyvzud9a7ru4d2ft7whqvl5d3kskxxhgeupnjjquzvt97',
  ],
  kraken: [
    'bc1qnhmemsqfhycvp6g50v732h7wfwdt68el4ux5ttu8xwsrzngmxv0qr55aga',
    'bc1qa5aux0l2c3l99tpmd9c85770kqpksg3g6dxaw03jj6lphnwy4lqq68xfgc',
    'bc1q3gqqnn9hr0uachfk6rv3qhf3pp9z8a4z63ksc5qu0c2vvtykqd9qj3fyum',
    'bc1qplr053c80nzlqapuatfslyhmns6sfn32qzz3xkdn36jjryw8vsys8y7wlc',
    'bc1qhxv3pg2hsnw3m9jukuc6erjwwd03rzwhd2k6zh5uf6s2lwpuv3rq9zefru',
    'bc1q08n37tm63z3f0myqe6zjx7ymtng8c9qedpwpplq95qkmx0cpke7qyz4y8v',
    'bc1q02cq8du8r7ktuy5l0ltc4cv82xnaw4upaaw8y4rq6uycdp0k5nmquljtzk',
    'bc1qcf9qe8ytx5qlcq0ft4vm2xm3fyfvurrkende46hpmwwnzpctfu3szxpve2',
    'bc1qrj5vg73fxs6h6pmdjld387j5szkswc2y39rfutw8gl93h647wpksukyln9',
    'bc1q9hqaqzyf6zsd330pkvtq5uxcxprzr368zdsxx5srtep7kepx523q2gd0ef',
    'bc1q36l8mssxdlncj7njkqvayv3jumked9jdtjxete66cxnzluf4j0msjm4w80',
    'bc1qs8cyln26t2f5rwu2frnqvtltfxt0qqql0elmhrpsexlzveap82eqtyvsgu',
    'bc1qcds58swh4g6zsdmws9ltcdpqz4l44utu5wv9vfpmemps3whgdacqkakrk0',
    'bc1q75tsfq2c5cqp2ss32qksmnzd9yea2mjsjktdmrz900dcmg43ck4s66sgjx',
  ],
  latoken: [
    "bc1q48amr6l7dvacdppgucvnswwuyleaqh4dus8z8h",
    "bc1q2cgh9nxn7cqmqhk4hc5fu6mju8nzy9a20qqqh8", //cold
    "bc1qw5fc9ml9vm4xq5c6xkcdu3vtwyw4gdn8lw0uwq"
  ],
  maskex: [
    // this wallet was collected from https://blog.maskex.com/news/announcements/embracing-transparency-maskex-reveals-wallet-addresses
    "39DUz1NCkLu25GczWiAjjgZBu4mUjKbdNA"
  ],
  mento: [
    '38EPdP4SPshc5CiUCzKcLP9v7Vqo5u1HBL',
    '3KWX93e2zPPQ2eWCsUwPAB6VhAKKPLACou'
  ],
  mexcCex: [
    "13uZyaPbt4rTwYQ8xWFySVUzWH3pk2P5c7",
    "bc1qrlsks7xe755m05zfreyjdxn34rypc4lnghtcwc",
    "35C2L1pCgwzBHNcDcVL1a5RuoefeWqyjAR",
    "38RB6AuNgLjPyJqt92wJXoas7ZMYq12gHR",
    "3FSaQrzxXsVVynU9sqbVhSmmHtNp4DuEKD",
    "3MuqQRGgDn1DwHXhExNZ4aiNEDkHJfpo65",
    "384kSJVQVs7DVuHizHnhb25xkPJeTChSiU",
    "3Go5RsfBEhqCgQTRHvUqTgC9jm6piHpQ67",
    "32sg7eCLJDm6bYMj49uEMMojoa2rJz3Xij",
    "3E7TeLDsGvs2Yhuz3EGA5w4SfYoQk9sqJM",
    "3DCkL66zWKwg9qSc49UZ7FCU6aPyskqZsn",
    "3DbUS1RWT18D1S2okLnuiy2RBKLASMvMx2",
    "3EtNYH8gxvVAFLDK1PqDrvcdcBLiLAn1ZT",
    "33wTgptjsrcpfNKQf897rhfv4i2Y7aq4tD",
    "33dmPTwfA723fDhQTvUJgaHCWZNiMovpHC",
    "3J7284mQ9RKGvceLmNNvmMB8HTsZGkPyRY",
    "36HfdAQpCsLEfGf2ghpEh1DzYfB2ScP2Kb",
    "3JncVutg4VK229YuwPDEjM3YWoSiAYDUjN",
    "377LXrSqGXXSiajJwnPKPRA4pFUwqoqg66",
    '3Byv6jsis7uoRxeunwNAeTvoL8V5akjdK9',
    '3GvQX1J9VuAB9DyA8HZgZEoURwMZFQqDmK',
    'bc1qnzf53fl4a0lh00p9207c456xkk9fmgdnm6tyky',
    '1Euk9cnQm49axFr2sTMaytnYcmBz5oDhZ3',
    '1MDVjZdX8QD212pT8Z8EMP7DuFQHKqN3mx',
    '19KYQDpyssRUtpfa4pfAWiNQLeysThd1us',
    '1NEQFpjSqRMWuHLTrouSbmSgXuJr8zPCN7',
    '17wgJkQ8v66fXTUawQS3sohEfzP4CCD8Xu',
    '1Ak5Zk6P3Y7AbrdhWHif7GmEJhd6FqAS9J',
    'bc1qmklhudjcrz04kgqexwed35faehanvswqdg95k2',
    'bc1qtdptfrd0erwxsa7xrh97g2rxtm3wy7yetv4648',
    'bc1qar3hvdpfqy388pkrp95ukewuxsr600wvyf0lxt',
    'bc1qfs5qwymqcwtdtwjkac4z5h99r6dp4wwvvcfxyr',
    'bc1qdt0dgff2u8y5pyj525k3qt9zdqyzy4kzznjrl8',
  ],
  mtGox: [
    "17Tf4bVQaCzwWrDWGRPC97RLCHnU4LY8Qr",
    "1BzK87zuqidZn489Wb2oLSktrjKrX7TLKe",
    "1Drshi4RAuvxk4T6Bkq959ZvLbvy7b1wvD",
    "1EiiKCCnFgHjEvPZdu29qqgdBm8zTvpU3U",
    "14p4w3TRCd6NMRSnzTmgdvQhNnbrAmzXmy",
    "12KkeeRkiNS13GMbg7zos9KRn9ggvZtZgx",
    "12T4oSNd4t9ty9fodgNd47TWhK35pAxDYN",
    "15kNZcrhxeFZgVVLK2Yjzd69tRidbFdJEZ",
    "1LS5EFRRMDgMQusW6zokQUHjzNUfy6HHCQ",
    "1FrV9hv1AW34BGJvobJatyzUWYDWB9epRW",
    "1HdKXsNQtzDcfB6PGM7DWTgX9vhBWsz1ak",
    "1Fu4YgM3Y9CxvioGPqkSzkydAC8MVaPN1D",
    "1G23Uzwj55k2A9TRwaTknqGav66oDTkWCu",
    "1GkZQcDy8V6pmHFZqUBUBCnN9dc2hoWasD",
    "1Hm6XDmhKCHz68wDEYTapN9MEanke8iwUk",
    "15SeCwVCFx5cWyrcdD1Zp1D1zxjH2SELPg",
    "15U4VsmWG1cdXAtizvQsW4r7iMxzp64Tgu",
    "16jZZkMYqjUWUtQ9DfDvHdH5ko5BcnH9XQ",
    "16w6sZBDP58yyeyZAcvnxcEGJpwR9amM6g",
    "19Cr4zXpKw43xLJhFZW9iv4DDNtQk2TDeB",
    "1GyDutntMuYyA2vQGW5HFcKLfx4cbDdbJq",
    "17etv2L3nhk6SCcWSNW4eoZkBy84izAm17",
    "18ok25NTkdrUzdByFJCNVsqVYkujZ8aP45",
    "199Yxz2TJGtND3QKsHTptTJivqSaUZBvku",
    "1AZu7TQmKBAes2duNDctYwjAB9nhHczUnA",
    "17KcBp8g76Ue8pywgjta4q8Ds6wK4bEKp7",
    "1LLc8aA9C9LLULGbYCYSFKXgxKP2DXdCqP",
    "1CZsoJfkknbnW5fKrt1oR7N1ALE5WmDGP1",
    "1DedUxzgwErg4ipNi988wPgLk5thwciKcc",
    "1H4K3dGfNbAN4AUfyUrpkGpjrd83sntDpV",
    "13sXfpp2V16nnxYvW9FHHoBdMa3k98uJw8",
    "13Wv5hGhubAWgSPWtXYh6s1s7HX2N1psYg",
    "14mP6caC5dFhHdVAPCjPKM8Nm36MBDR5pM",
    "155FsTtEFq4eGCcBxDseuwLKPbmtWbyHJR",
    "156HpsWfgkWYLT63uhTAGUSUF3ZMnB9WWj",
    "15QcKCa84ZCHxbsqXDoKhi5XbmQB8jPEAd",
    "1EK8vW7UYaYHKiW4TZmYJKtwcZLM14VjvP",
    "1Hb8DmmvvtTYv5RBLuGtDxznkZwVpd5Vjy",
    "1HuPVqz2xvf1rdNFUqd62vRTyxP3jeX9Ch",
    "13xGCc4TPSYY9GYxBGVNox82KxyjkFnxMX",
    "13ahgw8sM95EDbugT3tdb8TYoMU46Uw7PX",
    "1439q4Na8v88kPBqoyg8F4ueL9SYr8ANWj",
    "13dXFMyG22EsUsvaWhCqUo7SXuX7rBPog6",
    "14USZ558Rr28AZwdJQyciSQkN4JT1cEoj2",
    "1FhRuUkk8Bfx8FJDemtxhKAR4F8GCNKrXG",
    "1Mm9brripN4RPTzkGnRrbt5uDWdqbfk2iX",
    "1LueUjEuBgc7cQhsWT8zAfTjcWmrNBZXaR",
    "1LXi3x7hyt17cxncscGE887WCrC6XDNZ4P",
    "19KiFrafXEyJCUDYFEv3B6tBUwyfFo7kNU",
    "18YDgRhxsomuBZ1g9d8Y1JuRmxDhF8Bvff",
    "18hcZVFPqDNAovJmb9vA6hEJrDz6uWXNGh",
    "1BDZBTb4KE5oq6wAgA6EvAe3uCFRrAbPao",
    "195HvmjXgoF3M5vFaBC8swZPhwrE7VhxRD",
    "18KDS3q6a4YV9Nn8jcyMvNoVPfcrfemeag",
    "19c8sUa54yQuRTVDfJa3iDkkCaFkzBJLPB",
    "1B6kJM75iu5ty1HAHMMz6tT1HhjoGNTCa9",
    "18M1Z337NqLtK9V69bssnQUYsvb7hmfSFS",
    "19eihBKk6e5YD2QXAe4SVUsxRLLnTDKsfv",
    "1C5aU4Xnpd3txbxehk46UZgiuNB8QdpHCH",
    "1BXyJc6BVuTFnHQCcjiWX2xmCPNVfaSZeb",
    "1Ar6meJQCkNoC9wnPcyRNNpzX5fBDaGcKd",
    "1CRjKZJu8LvTutnSKq4zTJ4yiqrzMAArYW",
    "1HweN9p41BY2RBunsPqyVuheEq7gVoxA9u",
    "1HX4s3JeFU3x1eQgPNQVAdx6FoCtbb1hr8",
    "1HzEPuenagLEWj68igDXBBXrzc293RuR5V",
    "1JtgU6Uo1RAt5eiMf34EehyatUezBQP36C",
    "1JVmoJT3471FjsX5H4hAeR1RyrDgpkHbpm",
    "1JVU43LNKXqa9W5fCh8tppxDDEWgfeNg46",
    "1JztCg7eKSkb1vi7NzGJynXpLZmoaFtYud",
    "1KFDUSZuapMv7YaDmL6cyrHTQhma1MtFYs",
    "1MkyfwJf7uhWTmVGGQXfcT5ip31DoHMxsz",
    "1LzwbLgdKd4eFLkpRdeajkH1YJkVCip2zj",
    "1MPJJzRaT8vLhowNB4dVyWRxxu79dq7WkB",
    "1MvpYtqgBH7CXbTutrSVCTNHPzm9vakuRy",
    "1N5X4kcZ56uRh24XrZoztS9Vb8G7j1Joop",
    "1Pq7hooZbEAz5y3QMnqFY8C5xqTdrjUwcA",
    "1PRXQEoL8vzEzoJJ9hbtAP6NaV2daccAUn",
    "1PxGTuJzDx1ceFHx4Z5CHaWuhiPBNovmZD",
    "1NA3Tj4b1jtx9eGELe31Jw4DrzTqKP3ayH" //https://www.cryptoground.com/mtgox-cold-wallet-monitor/
  ],
  nbx: [
    'bc1qd79ypayqr03lmvcqc40udn6yuq4mve34ychy6a',
    'bc1qgxrcuzn62qjk3e3echysa9srg87la26x0qn2sa',
  ],
  nonkyc: [
    // "bc1qy8xx8fcsmdlc447ls4wzw2tn3y6c6cy64wckhz"
  ],
  okcoin: [
    // we only added wallets with more than 0.1 BTC
    "bc1q2s3rjwvam9dt2ftt4sqxqjf3twav0gdx0k0q2etxflx38c3x8tnssdmnjq",
  ],
  phemex: [
    "3PiGxVdpMjWSsH8X8BypdwcsmPW5cmE4Ta",
    "bc1qw6mntl39vdtle2fczl8dzds43x02z556yp3249",
    "39rotuMW6jxjPrZ3Fn7DJJkPZZstWZh6ck",
  ],
  pionexCex: [
    "bc1qs0jdyydyd4kv7fwqre4suhz33mcuy3838xdsla",
    "1JkmFSbqijbrv6JdyVx2hNwyE8nzEy3Cs5",
    "bc1qctq0v0vecjxp4de66znkh0dcczkvuqjwwt0za4",
    "1KH7cEFwFvKfnx7KjMaQUescVSigz3FMaJ",
    "bc1qeplx7cy5xx37m9mtrh9qefeuswansr0c9mvewa",
    "1BgvqcFm2cYRg8HCrd4qWnC7iA6tQqoeme",
    "bc1qw5lxcrk7l2xsy2wx5mapdz58g29xde4x56le3s",
    "1A4Ag6y473avEbjVm5N4HAqiVCE6NxLRCS",
    "bc1qvdf8f85dn69csyka5tzjezsl66hdhmmfgwgfzz",
    "1PDgKsiQo8hkA5pxYBwS1ooXv9jFNJCFh5",
    "bc1q7wufvquhtmmd7eepjdu76lumj6efmfl2p6sgch",
    "1CNEXYtt6WYZuMwJF7AjNYr39nxbrUTRoh",
    "bc1q0jkkjr2qr4wl3v399algvsjuk8g7vlm3yaqufu",
    "17UcdCaVWpmgpuZsKfKdWRUUViAzoQFY3H",
    "bc1qguymjgurnywqac3rrplr2nmkl26cf5jyyq3vkv",
    "1D9YPYQevtEsk26exBjCY2pKfhDsXTxJEE",
    "bc1qs5lsnltqwdvledqvgrf82prja04ej4xk2z7ktu",
    "bc1qcc2h0dw6t79y4czk8newhazwgzlygyfawu7k30",
    "bc1q7d9lknwmc7tnwcemapkymggne2sv0hxkg84vg6",
    "bc1q9a67xl67smtue0ajutxttsla25a45x6fdpwccp",
    "bc1qtww74le5349we4ncvf9m7lpu5lpe9f4j9y39ey",
    "bc1qn47hrlrkjnm7fvlt250ah62y4vlx6vgtulx93k",
    "bc1q6vw4d86dvqe3jcldg8yxzc3c74hzve2w757mcl",
    "bc1q3fddfzf3kp4x2htd9ghhytz29vfnd6k066wl43",
    "bc1qzrxjhl47atjfc63tme0nzurc4d9hqpugvv80rs",
    "bc1q52rewzm8plc404uexqxp0kqtqzenmnz0u2ucf6",
    "bc1qqrmpk72h9d4jrx63vqzz88uf8qsue6m7wm23jf",
    "bc1qn8vnl94k2dsvgntqtrj4jttshqyxt95073s8x9",
    "bc1qxx3ehup2yet758ve8ft483tq9u5anw2k0trqps",
    "bc1qcwk60napcfcljv6phg69gfyfmp3emsgdj9cn5v",
    "bc1q4rtnrtnu829eet3m27huh6ld7x0xczjxd5dg5r",
    "bc1q7vfv3h99vxwu300qej6x2qdfsn58kq6nc9hec6"
  ],
  probit: [
    "19EgVpboqNjortWyhJSDAGRvHDtduqiSfr",
    "19AtrEvJv7UY75tvWkXMxLUAYibxpZhFfN",
    "17PpCEuQUT7xxP1ocfhvFdwQyrB5dG1dQP"
  ],
  robinhood: [
    "bc1qprdf80adfz7aekh5nejjfrp3jksc8r929svpxk",
    "bc1qmxcagqze2n4hr5rwflyfu35q90y22raxdgcp4p",
    "bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2"
  ],
  rosenBridge: [
    "bc1qs0852en99dfctv0egj2qxnmc79mhjgn9ap975t"
  ],
  rskBridge: [
    "3GQ87zLKyTygsRMZ1hfCHZSdBxujzKoCCU"
  ],
  silkroad: [
    // https://www.reddit.com/r/CryptoCurrency/comments/li1fw7/btc_silkroad_stash_seized_nov_2020_by_the_feds/
    "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6",
    'bc1qmxjefnuy06v345v6vhwpwt05dztztmx4g3y7wp',
    'bc1qf2yvj48mzkj7uf8lc2a9sa7w983qe256l5c8fs',
    'bc1qe7nk2nlnjewghgw4sgm0r89zkjzsurda7z4rdg'
  ],
  swissborg: [
    '18DowXoMUQT5EU8zPTDTrq4hrwmi8ddCcc',
    'bc1qfu6su3qz4tn0et634mv7p090a0cgameq6rdvuc',
    'bc1qutkfwnuq4v0zdkenqt5vyuxlrmsezldzue5znc',
    '1Mgs8zLJ7JyngcNRUscayyPHnnYJpJS5x2',
    'bc1qc8ee9860cdnkyej0ag5hf49pcx7uvz89lkwpr9',
    '1JgXCkk3gjmgfgjT2vvnjpvqfvNNTFCRpM',
    'bc1qkgrz5mgsvze06mkexdqghw8udkcv88mmuvaxzz',
    '1J2xea7M6N2XiQCuN4TuiLPV1TQ2eAwzoa',
    'bc1qhtvsrdu6a8jddqjnudugvzhqwdg8kdyjf2yfl6',
    'bc1qv20znwswjzrqffjdkfl2ydahs8439d57r8ctrd',
    '19zShA6yNj4xf6TF3kQLozfNW3dwEbFikY',
  ],
  toobit: [
    "3926KKKCqcLaWpAau73TMo19sNv23s1wji",
    "bc1qj89dz9wt08gp5745xgc0dtda2llrnwv2r2ysdcm9dslqllxwtn6qwlf2rj",
    "bc1q9weww8ec0pr96rdnehrskk6gyeuzynvn3wkv80",
    "bc1qfmg6286zvzes77359tnmvuqxftqxkz4l842yy5",
    "bc1qqdme8aca3xrpuy6y5nn2rxpyqwsm52sy89pup5",
    "bc1q6ln9rpknwmvaur2qrfeqztz7kjz003kzr3h30n",
    "bc1qzzr6f2yh649nytecxt8z9nlex0nxrkxletelf0eqdf56tfuzn3wshthqg9"
  ],
  indiaCovid: [
    "bc1q220k2449fau0pxu9hfn28q3w4k99ep9hwsa5fa"
  ],
  wooCEX: [
    'bc1qh78w4qq9v2dqntjtxne97kp9u2485jdqrfsghh',
    'bc1qm4hycszv0v0qel3swxqyp57nkpnnrda4rc55lm'
  ],
  bitlayerBridge: [
    "132Cka5Vdw9FcFX3eb28xikKAMvhuMJGwi",
    "bc1p87c2auxxj372evzhd5f5huddtrladtkn3z4p94ew32qvwcsgujestjj45r",
    "bc1puqn6dw6etk6yg8zruvf2s94cmhxkfncsaumwhtfhu5qy3e6m94sq37eq66",
    "bc1pvnh3zy48ml3nhzhqrtc7endhj9rrtrv5puy2775p3jwka8y99aqsz78uu2",
    "bc1pxpp82hc4t4flkyqtjdnzr3q72qh9st78gfge50vzlrjtp9c6yn4s5zq5vk",
    "bc1p7agkadaau66jtva9n8k5pg3lsctuyqur8a2l5y9hzwqkh5nlmd0skuhws3",
    "bc1q6are922g2ltnmdll0mesrmdzn5w2xguu7czred",
    "bc1qcpw6j7j72peplt0j34cd8uu5a886t6kkm57zgn",
    "bc1p4yc7cs24v5z5fxxdlj50zke0f3jwnngklswrpfcea9r3egmsmc6qvxjwpu"
  ],
  arkhamExchange: [
    'bc1qlnkyrrupehgw5evu43erlgkhhagv0uj3yyhacvc65n3ud6qeas0sa958ps'
  ],
  nerveNetworkBridge: [
    'bc1q7l4q8kqekyur4ak3tf4s2rr9rp4nhz6axejxjwrc3f28ywm4tl8smz5dpd',
    'bc1qzhwyexqzfz4d0mu7ktdad63wfssg08cek9sgjp'
  ],
  nexusbtc: [
    '31oxjGsmepoq2cipeGQ2zKZRRBCf1m3kAC',
    '15VcywQLk9bR7kXJR1xvA6U16GBJ6nzPm6',
    '116EytSxns3SaGU16YQLbw4P7bgbNvtpPk',
    'bc1qjav0ce3rc5n6espfjndrxck4s44sv66nagccsfqgu7yvwh539nlq6myyad',
    'bc1q39u0yxprsz6ucq93pgtxksk7ncr4900ypvkwcw',
    'bc1qy05dur0c4rk78r4mpl4r99glt9x6vs2w756gud',
  ],
  tapbit: [
    "1HSRxFoxC7HYbNutGyxCNXmGT1FG3M2Bt3",
    "1PUvhYpjgvgjzmiwSCuGNqKQjKde29eFbH"
  ],
  jbtc: [
    'bc1qmukuv7j57umsd5tgg9fw88eqap57rzphkfckyp',
  ],
  coin8: [
    '114atFBQoi2nWP5EQKUxmDyiY22Bs4SHkC',
    '13FTY8oRv6ccsQv4HxmTKSLLvhNBBy5F6x',
    '1HvVJPnwzHYoQsZyDYBBw1NiH5EuTFDzCB',
    '1JPkYurLo1CdXShwbUfc8C6LdrXBcYmBrp',
    '1KdC8jfRX6am6WCtqZP2UV98Czaxmtp6c',
    '1KxZyrF1SqfNw38fgzYSQhW22JKoJieVtU',
    'bc1q4w3drxrdhcsxlrhrqpl7kecesn53pf455muj30',
    '1NW9M4ExnX5DGmdnrp5c3iDU2WNt69RNL3'
  ],
  bitrue: [
    "18uhzy546Qz7CxRNkHohg4W9VSkfTkbSvY",
    "bc1pty75p9ejqvpzd3e9zg8eq973txu3eqxg2evmx7mm8wxxln72fyfqs2jass",
    "bc1pfwf7eszm57uqlnfuctxl688aypzpes2dyc6eekxzwyfytte7xtdsyug6xw" // babylon staked btc by users
  ],
  // https://drive.google.com/drive/folders/17sUsAkpTq_1TPw2uNSPEg1rIeqMN-zn4
  // https://wiki.cygnus.finance/whitepaper/cygnus-omnichain-liquidity-validation-system-lvs/cygnus-lvs-integration/clbtc/security-transparency-and-risk-management
  cygnus: [
    'bc1q54s2l5ky92fdsu0xscps0044je9nx2sh2mqss8',
    'bc1qvelcezj27u3m8s0l0a5rql56manc4t839hxzzv',
    'bc1qhze05vp40ywwpgw6sd7d3mgvc03hxa6l896k0z',
    'bc1q45n4al3rhlg5m3k54ue0nu9w4apaw9eyndtd3k',
    'bc1qmrvc9cqwgrez8vn4lyql696vsppymyhxat4eeg',
    'bc1qatjrpuhf4u7956yvpnt9txfvmtf73ee92hc3d4',
    'bc1qgv692f4xs0q0uxeaj7pfldw6a0tv39tltfl8yn',
    'bc1qs96nx6qunenlwcqs8yftd0ktqess85pu9dgq7n',
    'bc1qds987h4jvcxz6f6fvafjceme2gnn9ymejvxckj',
    'bc1que7nlpgp2ht9tufazsr336gx7manvwrllmq6my',
    'bc1qdrs2j8dklgrjtwve57p2aswzqspcwg0s03gja4',
    'bc1qqsydcxgylkddccq0m42ahun7gghwhtpxekmfa9',
    'bc1qldwk72rfel4022puypzp6a65vat2g7esncmqul',
    'bc1qh5f8dujvxx7h443j6myv9l0jaguw2n52nplxwa',
    'bc1qve59z5wkhg60wfmwyq23vxtyy2ytpk626x78nv',
    'bc1qhrswrm3kx996404yxudde8x353klfsmqet3dx4',
    'bc1qdu45tr94607y4935y8cgqgaa6w69am4qk32pqa',
    'bc1qcjmn5knawm8kf0s74488mz0psa7yrrvz5xzhq7',
    'bc1qkyekxghyh99kky9wt3ch2hn2uley2ld5ee0ng4',
  ],
  unitbtc: [
    'bc1pdwu79dady576y3fupmm82m3g7p2p9f6hgyeqy0tdg7ztxg7xrayqlkl8j9',
  ],
  backpack: [
    "bc1pmrsvpcv8k5m5ts5js4jl0z30wndv2j90f3gm08et0xueftpwhxesjzfyea",
    "bc1qhv0g0jmt9pp578hkx4w8vus62sgwuc22z0vjpftgcf34533h2dwsrxmxds",
    "bc1q0gw7fexuwthyf9wwzrjn4h0flj5veflwgzdxx0727gt9upfk0cfqfjv42k",
    "bc1qfpk3fj2u9kaw8qq96snm72dws5hyxxym5tf8tn",

  ],
  coinbaseltc: [
    "LTbMyvoyfSuQNqG5cGihin6BCbiZay11rU",
    "LVeXnSCw2ci7qq2EGcNwjZqhQ73KrJHNJE",
    "ltc1qhac8t52gdh8fzeft4ygzxn05nluwwecjrzel99",
    "LP3k3DmN21xmCay3b5yReLKQKvViCnDPhi",
  ],
  prosper: [
    "bc1qcrdvx3dvq35kawsp02033pwla244rr6hptg982" //https://app.prosper-fi.com/stats#dao-treasury
  ],
  hotcoin: [
    "1DTxysZCJYZuHse8cYjZLdgciUAAsX23fy"
  ],
  orangex: [
    "17k46YbLif28mDx56VK33zPxGN2B2oJFaW",
    "1C7bgas1p8Xp58EXLipn85j2VLG9FQX9Bv",
    "1Dbn3vrKwsMQfz1Wn4Gpz5nPW75k8LAqLM",
    "1DsLvEYefkTFyZCLfiSucJRjEL5Qm2Moic",
    "1EJ7W8ZTULqcacqrtgWxptRqyPwro9DVoi"
  ],
  exmo: [
    'bc1qa6ztklpcshk048mv5f2f877rudmyv2jaq05n5k',
    'bc1qgq64fzjjk4rsh008rdq542hve5vmz2uaep7lmx'
  ],
  esbtc: [
    "bc1qyyd3hmvtlfe7cu3z5gl8r6khkfsjclaure6pqp",
    "bc1qn6fmj0k4vvsg53ul7mna4uewl3dhf28n29fax9",
    "bc1qyxm20t8cu5j3f9nztulgj3dj4w3w50jw452paf",
    "19cDEYKy121uMe5aAmxkU7F3Szc4nTJofZ",
    "bc1pcrd8gxsawgkuvvugtj60h68l7d2s7jawmvx35agjtnqht7vxaqgswfcuz6",
    "3PhznGRAyDhRmGMuCeeDVnoBdheAVPgZRE",
    "bc1q82lh692mdaqk20v7yvjvqu37kqr0p4kkjts8u7",
    "bc1p8sxvyaggl7jncn7wepee7dhnrqd6cdm0s4lfj678zcv78vxanvtsep59pp",
    "bc1qng7d8tmppa93udc7vzycf5rgz4v7wqvyq9ejnu",
    "bc1q47f9adeejzem4v3l4ene9y8v3tdxdc8wgw86d5",
    "bc1qdm8nyz9t4944lxeq9zp2dzj5vt0hydl32rffqy",
    "bc1qrd4j46ul0mg0ct90edraq2ngl7v554xwhgssasprlw4clsqyezwslm6xme",
    "bc1qzuy2x4zdc5a355ffwwl6m008rp572t649dey2g",
    "bc1qukffcxw37j6fllq3ahqn85m3gjr6mqy6mswerf",
    "bc1p2xx7jtrg32ww2wjqrz809yvq562gtcw8g93qeg0yw4gfkgqagjhsds06rq",
    "bc1qcjfm6r689vldvrg0l2a2jq4n3kq9wnhxylvy58",
    "bc1q42uxazz20um9p994jrn5ep8sxs9zzl85fl5lkn",
    "bc1p5x4cngw6a3k7dgknc9cqt9u49yacf5u9jju00237eflv69auxezqzlk39a",
    "bc1q7vy874473j2a367cy29e6vyzlf7nclrudjrefy",
    "bc1qqec97tjj5k49pkcl2ge9kdcs5md0332fpp05q3",
    "bc1pd8uz60psy486dxl4rmqznrcgg422ql43qthu2qd9h8pdnwwk4yns6j2h0g",
    "1M3Y4dgeg8zVdQ41BXTaWyFUUmc2e6fF2b",
    "13r8PhQ9Gk1KavpJzjc8ELjEw3kBQKLRHq",
    "1NVuvqYpZPnWSd5Fvx15dq6u39ongzxLL2",
    "1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj",
    "1QJt83Cb6S6Tm5chFwyn46XSBGYbS8unXB",
    "39C7fxSzEACPjM78Z7xdPxhf7mKxJwvfMJ",
    "35KHekskDvZY9uSrBKkfvq9pa8njiNYrja",
    "1AfCc4F9c4VTYSE31PUe2kUEKs6ZxiDjxm",
    "bc1qxpae7fyhqj3886fn7scnn3ln3tp5qqll2g6yqq",
    "bc1q773em34zkr6ccvn5euam29tg2ct056ychpayrh",
    "bc1qf9nwqp05m85fdlt60c95mf8txtw5vk029ahela",
    "bc1qvz02c57tfxnpgxk029sz0cf6xmp0e94w53xdll"
  ],
  bimaCdp: [
    "bc1q8q5ngue8697flt8yc52xrfppecf47jghhlvq8v96ukeaqz694y7q2tzca9"
  ],
  tzbtc: [
    "3NKsqccxthpCaVwraPnCWrabRV5aCcTfNM",
    "bc1qfezcal3rf7azajs75c96qaelmuqkpsust6g0qs6jja578amw0lpq98vnd2",
    "bc1qn4xndkgx0df9jwv79uwrlreaq3luwh3thu5s2traqp3z9kufst6qqwh5tf"
  ],
  tothemoon: [
    "bc1q50uxvgu5paqj22fg27s352wggev70xs9f8lhnk"
  ],
  indodax: [
    "bc1q38fx9nxc0urh6dln2950j3eetedhwml0xhlfce",
    "bc1qvnk8xkw9esmujpjz00hs4706j3803s9nf5z2px",
    "bc1qxc0x4fvkzarw5xmazcly9j8qj7nyt30mk2f3dm",
    "bc1q6jt6s62d4hkw5gc5zmzgd6556e23k2xpanedsp",
    "bc1qcygfu0neqgne5ptet9ea4ktm64xh6qklvhwvef",
  ],
  river: [
    "bc1qnques8jtyh2t3egwxzjys7ct26sexnujsfsrjz",
  ],
  echoMBTC: [
    'bc1p2ecnyf8pgmq6u29h6csgvckj5mg6l36054p2vst0m0edxmg8dusquek4y9',
    'bc1pc5regkaavr8nwk3tt72snnnyj56shc4ss4xn7y60u6mh88vcp03qmg2p2q'
  ],
  xbtc: [
    'bc1q7mvqd5apnrngm36rwqlgk7nwkt5kwc37thzgd79puh55wscr42mqct7lss'
  ],
  leadbtc: [
    'bc1ps0es0ycqk5ljgmraku7cyh3h6ksuylxvqpfgd8ut4ce4vvjksukq6pcah7',
    'bc1qycv6pp9as73a5cm0quqwq70a0tuq4p8guyhuyk'
  ],
  bitgetBtc: [
    'bc1pvwjkr0724ckucdvrtxjzml9ka7jnzzjaejvwfnn8a2avvpnljthseg2a0e',
    'bc1pxw4gtelg3lkmatdjmjxsp2kx22t44wyk0snkszhvw4prpygz8ajqaw03fs'
  ],
  magicEden: [
    '3P4WqXDbSLRhzo2H6MT6YFbvBKBDPLbVtQ'
  ],
  gateBtc: [
    'bc1pjkxsx5sr9g6y2psjv680l40kewhf8xpnal96k9cncxgst7806kzqwxq9n4',
    'bc1puk7pamvpvy5g4ccw8l0dl368jf5apauu384036yud9n2waq2xqysz0g6w3',
    'bc1puglknm7e2hk5gdnu9rjx022g7rwc7xwegwdrgwspl07q55p6a3wq4y0rsj',
    'bc1pg6t68yfcum3d2pp98h3h7sypra2yml03sa00hl7eqxe9zu6z48aqmq8t0s',
    '1NwrvHiCFRnfkWsqX5yrWg6HK6GkM3gPWA',
    'bc1p9tw7swmqtfpe8gj7llhvuun86esqs0va9wepwsljva00s8cu25fq3tr775',
    'bc1p7p0re55adj45dacj83h2jyfz2ka0ghlph7ud8klgq0nc7c2a0d6sx3tcyv',
    'bc1psd5djk3g7u69upaww2ds44dcs7rlnht4k8yz7xv9wlk3j5sfjz2qg7hc2n',
    'bc1p6xexk4fmuzafc9ryflmn4ssfgtap0j3p0zrueyagfqnwfqc60mhsjrm0pd',
    '17KesGyx3sW4afkRp2YJRERNKarCRdfRTZ',
    '162jqywuy9wRtyyzVa5dbNnmnbuaz7YkAU',
    '14yyRRiEMJ5q5LmDCH4Nf6Emx7UKhoRfxR',
    '16pP3Pm2PEVZiMREQ6FJXieTWKE5ZMPfpU'
  ],
  sodex: [
    'bc1p6hclvynsavpzggt7qdadq3dcrlzhcregpys8r3tx5p03jvx0ve9qvc8tju',
  ],
  weex: [
    "bc1p3rynzzrpldcwmpqv5k7n98zxazrqm86arzsdzmmgkv4xvnjru3rqc2rs2g",
    "1KKXSMqYsuZPpmnEz2cx8tQAQ2ukFmyeBb"
  ],
  bydfi: [
    'bc1qan8q94rc3hl2jfc0vn8vtfsen0r6e58q80dqf0',
    '12F3fSv4zRmw7L1z5M1vFkdYabeETqxisp'
  ],
  bytedex: [
    '1EvrTWTxDqTSKBmsuRzyZAWbHC2zBxQThC',
    '1EovnsPsskU15rQhoJJiKpUxQzufryvpGm',
    '3AHghpZ5GAU7rjTXHv4Xmfe6BLavJxnzbo',
    '3Pr9uMzcEtmmCLShywSrsHq6Xqy9taEdXh'
  ],
}

imports.forEach(([key, file]) => {
  try {
    module.exports[key] = require(file)
  } catch (e) {
    console.error(`Error importing ${key} from ${file}:`, e)
  }
})
