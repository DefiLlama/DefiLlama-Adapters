const ADDRESSES = require('../helper/coreAssets.json')
const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { mergeExports, getStakedEthTVL } = require("../helper/utils");

const config = {
  ethereum: {
    ownTokens: ['0xf34960d9d60be18cC1D5Afc1A6F012A723a28811'], // KCS
    owners: [
      "0x061f7937b7b2bc7596539959804f86538b6368dc",
      "0x1692e170361cefd1eb7240ec13d048fd9af6d667",
      "0x41e29c02713929f800419abe5770faa8a5b4dadc",
      "0x441454b3d857fe365b7defe8cb3e4f498ec91eac",
      "0x446b86a33e2a438f569b15855189e3da28d027ba",
      "0x45300136662dd4e58fc0df61e6290dffd992b785",
      "0x58edf78281334335effa23101bbe3371b6a36a51",
      "0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea",
      "0x7491f26a0fcb459111b3a1db2fbfc4035d096933",
      "0x77f59b595cac829575e262b4c8bbcb17abadb33a",
      "0x7b915c27a0ed48e2ce726ee40f20b2bf8a88a1b3",
      "0x83c41363cbee0081dab75cb841fa24f3db46627e",
      "0x88bd4d3e2997371bceefe8d9386c6b5b4de60346",
      "0x9f4cf329f4cf376b7aded854d6054859dd102a2a",
      "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
      "0xa649ffc455ac7c5acc1bc35726fce54e25eb59f9",
      "0xaa99fc695eb1bbfb359fbad718c7c6dafc03a839",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xcad621da75a66c7a8f4ff86d30a2bf981bfc8fdd",
      "0xce0d2213a0eaff4176d90b39879b7b4f870fa428",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0xd89350284c7732163765b23338f2ff27449e0bf5",
      "0xd91efec7e42f80156d1d9f660a69847188950747",
      "0xec30d02f10353f8efc9601371f56e808751f396f",
      "0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91",
      "0xf8da05c625a6e601281110cba52b156e714e1dc2",
      "0xf97deb1c0bb4536ff16617d29e5f4b340fe231df",
      "0x0c32131b67a9306a42e5b66f869bc213d40e43f0",
      "0x85cef5c097a4df05d27c9fa1a1c1fe16fe691e60",
      "0x2c73858225cfbf15fd1b71ff27d006cb96c57e27",
      "0x1136a49f3a1e3a3b6b2b6de30f8244d16f18509a",
      "0x04f2abb57b53122eb0306418f2220746d06af9fc",
      "0x4316e553902c3eab807663001d089fd6554a4566",
      "0x10c3d6ef33446e51b6d5c70970f7ad71cc1f42be",
      "0x0f75e66731ca8ab3471503562ff964cd40741f41",
      "0xe4507d13b059eaf66f7b509b6929f7295690d7cc",
      "0x10affefb7ce337348e0b258fffc6a1d5745c2be9",
      "0x7ebfa8b1161e66fffec05d7edbb55e1a2c2aebd6",
      "0x4a1dffc4e4168fd436dd9d9fb8edb223fa259a68",
      "0x0f1836312d18524368d05d537c0fabaff6ca6ccc",
      "0x06679e7b7f91487cc9d59779501c414a1b3eb89d",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xdd276dc5223d0120f9bf1776f38957cc8da23cb0",
      "0xE8C15AAD9D4CD3F59C9DFA18828B91A8B2C49596",
      "0x37e4d1cd3fe31edf473ebcf3b6a75f419c8839d1",
      "0xAA10DB8804D076601999C7CD769E02E44A99D5B2",
      "0x3B6D76719A4EA8C53A7A26B50175B8DE23C8E956",
      "0xB514C67824443868D3A70352398F524EF6AF6207",
      "0x189b24f3EB15dc71b4Fc57C5914e7e9B3246E449",
      "0x1B14376EE2D46AE5C27A43D902D96D4F3F264B83",
      "0xa2d69adf0b62fa32825d73f086cd4689743543db",
      "0x0669bcdc8ede4a973ed9b3480aff984de15d2d65",
      "0x175ce6204bfda2a509c7e9c786b74407f569c9cc",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x44f1b02d78ed39962600df6440cf8eed3e02a96b",
      "0x5b234aaab0f61d346a3ef8faca474c1c19f80c1f",
      "0x651f1d419c548125d7e5456fb61f3df47c29600d",
      "0x69be413d648ae00f0fbd9856f1355e22b36ee5e0",
      "0x6d6cc65e2060d0a280fcd47b6c22ec5636797fec",
      "0x8dac80ce96f69f9762bc450faa4d7fbd5891ae18",
      "0xbee64116bd2b1b6373273d01664fbc5532dad06d",
    ],
  },
  tron: {
    owners: [
      "TEWzF5ZsaWMh6sTNDPrYaPJrK8TTMGfwCC",
      "TQeNNo5zVarhdKm5EiJSekfNXg6H1tRN4n",
      "TRYL7PKCG4b4xRCM554Q5J6o8f1UjUmfnY",
      "TSGEXDSRMtzt9swPSgzr8MKefcgEawEdmb",
      "TUpHuDkiCCmwaTZBHZvQdwWzGNm5t8J2b9",
      "TEHcECc7JU4hudBDoWASXKpGkwQxVe5qUH",
      "TKpn4QSQ6Q1fKkF67Ljz2qmnskrLXGi9tP",
      "TCSN2TXGLi3KnLTtMY2ch3Hh8jwUtotkYF",
      "TGi6HhFtjvwUE2funC8DRvPxdunWSueoS6",
      "TJGv1jeHA8QxZ5jjwY8wc4PQ2GHg4772L8",
      "TNYEPjMiVJiggES7AYL7mtmuen2oXicbXk",
      "TDgzEwCrQr2dNtd16nbbeM3rv1X9mf5aRe",
      "TYX2XkYRwFhGX7yFj5vBTYL64LJKmrEyNU",
      "TFnRGp3qXe8UARoWxFeWNE9BtdfED5H9hh",
      "TXvsE5rsLcY6WcGHSBpw9TPjSN3wgQN3wY",
      "TR9QLsnupdJZ3rnR4wtLJ5TGjGgYcsauPv",
      "TBov1DfeF1r29p7P2LWQMrP6D9j5ej8wPs",
      "TJRu7dW92bmq8kDQyPZUDRTKmALTcJNXdD",
      "TGeCMTmmQKBrs8Vmx7YNGbPa2d3ZspDLNN",
      "TUpHuDkiCCmwaTZBHZvQdwWzGNm5t8J2b9",
      "THyqxuWrRPLZDdvSLVEWLofJ3qYvBhyc4R",
      "TGqfrS2feBuYhhAWKbE9wvhcfm39vy1e84",
      "TK1U4Hym23Jz9fP3p8oker4A8VQdoq88Ms",
      "TL17qUCWc9ZRjYvxyihC3uteUCYBn48S3S",
      "TUFhdQLH8MLCN9fVpiJ5pHVPbED3x8ZF5V",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.kucoin,
  },
  arbitrum: {
    owners: [
      "0x00f3e09abe73aec2d6ad7b8820049b60ebc73f94",
      "0x03e6fa590cadcf15a38e86158e9b3d06ff3399ba",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0xf3f094484ec6901ffc9681bcb808b96bafd0b8a8",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x84f022eda34826de97abdd25e459c541f4c01eea",
      "0x15bd3e3b616a90f2525b20cb8ad958c2a2b7b0a6",
      "0xbb36acf8c156f19e9550d1f66b1cdd2cb003b65d",
      "0x4358c3cddb2914d16ad3c170a9c17ec7365f9be1",
      "0x048ab5a572f86962caa64a98cd7b3da1a01a080a",
      "0x2560bcdbf4cb526ce1b8e8a4d5760eda8ec34498",
      "0xe4507d13b059eaf66f7b509b6929f7295690d7cc",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x3a152f8bbe26c1c64a38a02680005814857a63ae",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
    ],
  },
  algorand: {
    owners: [
      // added on 23/03/24
      "2X2GV36S66B64URLMRZ4O4IGLWSM5MEKIE6J5VREIZC62GVKCSH25IG4PM",
      "IMGMVBZEPMM36AIMWI7FZHG2G44KEESC5ALZHWX7B7SBNBDY6Z7COYMO6U",
      "NDVDIGWEP77WQDDU5M6F7AAS77AOFXLML7DNNPUEVLQMKTIFHYTTMAG6OU",
      "WBI5LT2BQ7FFYBXW2PEDVB6KBX2F3C77WXBJ2FPVERBXXBUV6SC7XXPGWM",
      "YXDKDH5XHXL6OYMH2HYCJCXOZWPOBEUNK5ICFVJRFW3JVQXZ6HQ6QPVQVA",
      "T6MXHXMGXURKJ7AD5NCB4IYPLWXYXKKFLLO5KAPJ56GKS7BFXHNHOODZCM",
      "W2UJN6OSBIKS6KZSUWAEEUTVIFE6Z7WWQU2EX5NGXQL6HFJCTWQG57DKZM",
      "3CIPOIS4KLKSA3XOCIRKX2TVUJ2V3F5A4P525VGMFCPGN7QFKDDYUABYOY",
      "VRMYO3NMIQSYZZPLMIL4RRC6GTKGPGTE5N52LJ3VNUNHE64BPFZJUYGBBM",
    ],
  },
  kcc: {
    ownTokens: [ADDRESSES.null], // KCS (native)
    owners: [
      "0x14ea40648fc8c1781d19363f5b9cc9a877ac2469",
      "0x2a8c8b09bd77c13980495a959b26c1305166a57f",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  near: {
    owners: [
      "kucoinc.near",
      "e589457354361489a89039b8be6737cbc2db4d13919b6ccf23889a60f3b0d8f3",
      "7b865db190b966fe6ea30d0e7cc44ce42c4ea4f159a4b0b937122f166fc3ae28",
      "403c128749a4cec73405adff535426c783ee65b1a2e4eac4965d0ae81ce51413",
    ],
  },
  eos: {
    owners: [
      "qlwzviixzm1h",
      "kucoinrise11",
      "kucoinatwarm",
      "kucoinrise12",
      "kucoinsscwc1",
      "kucoinstake1",
    ],
  },
  optimism: {
    owners: [
      "0xa3f45e619cE3AAe2Fa5f8244439a66B203b78bCc",
      "0xebb8ea128bbdff9a1780a4902a9380022371d466",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xc1274c580c5653cdf8246695c2e0112492a99d6f",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  solana: {
    owners: [
      "BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6",
      "EkUy8BB574iEVAQE9dywEiMhp9f2mFBuFu6TBKAkQxFY",
      "HVh6wHNBAsG3pq1Bj5oCzRjoWKVogEDHwUHkRz3ekFgt",
      "3VRJ7acLUS9RYLLgRMenM6BqBVVQpY7xFXa7jKDdYw6M",
      "EEnu7YoRDnZ1EHHggnnQoFk7fUjNQrXQw33vgFWwMJn",
      "57vSaRTqN9iXaemgh4AoDsZ63mcaoshfMK8NP3Z5QNbs",
      "EfwJn8cXCYhcGrsavxWSDbUFHPrCK9gvdCr6AVywFBPg",
      "DBmae92YTQKLsNzXcPscxiwPqMcz9stQr2prB5ZCAHPd",
      "FZ1t8TZtx7VSCQdBsxvFJiezj9paUBF6Ub7RKA2eTGyE",
      "GL8T72PKygWaYrLKtSteN9UUvYYnuC8azNDunk4eaqqQ",
      "6BhBoBB47wSGjK5uzcGWNcTf2oNRPQNuv6GVdkNyj9PB",
      "7gQ1CfjdysJkSEVSDXNjJHnzrqvP2zQYQDJHJP67o1bb",
      "AGVhmrhDi3RKLu9nxnRqp3CUpaG3SVeYXWkWcygHAk8N",
      "CAxKWUpSbsNsWu2gEFjed64jrNxiNYfRMVEMahshHotb",
      "FPRFLszBJFHCThF2yWvkGkfvtwyFPRGX9MFHnDGP6UYp",
    ],
  },
  ripple: {
    owners: [
      "rLpvuHZFE46NUyZH5XaMvmYRJZF7aory7t",
      "rBxszqhQkhPALtkSpGuVeqR6hNtZ8xTH3T",
      "rBXAyXMwp2WVPg13nKxUz8iCVn5RjihueQ",
      "raxYwsodnM9NjTTc4mFsKMEb8eCn3UH9ZZ",
      "rfZ1kn1AUwD8bVMnDsD6ifzw7y2zMRp1Ci",
      "rPjmhP2WK4mfTZX9Ywoqz3eMPzfWj2vezU",
      "rAnqRGVpsS6XaUbQjwpQmoE4y1MthZhT9",
      "rp73u3gCNorHW3AmNtvDok8WWFA9BsFptW",
      "rsf5FAyMDnTiA5Rm63xvEKnSy5MxHUnZvA",
    ],
  },
  bsc: {
    owners: [
      "0x1692e170361cefd1eb7240ec13d048fd9af6d667",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x3ad7d43702bc2177cc9ec655b6ee724136891ef4",
      "0x53f78a071d04224b8e254e243fffc6d9f2f3fa23",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0xf8ba3ec49212ca45325a2335a8ab1279770df6c0",
      "0x2933782B5A8D72F2754103D1489614F29BFA4625",
      "0x175ce6204bfda2a509c7e9c786b74407f569c9cc",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x69be413d648ae00f0fbd9856f1355e22b36ee5e0",
      "0x6d6cc65e2060d0a280fcd47b6c22ec5636797fec",
      "0x8dac80ce96f69f9762bc450faa4d7fbd5891ae18",
      "0xcded3bb9d2dc98f6e4e772095b48051acfb84df9",
      "0x635308e731a878741bfec299e67f5fd28c7553d9",
      "0x2d964ee844c35a72c6a9d498d54c8a9910cf6914",
      "0x46d85c2e20c4eaa7f60c5e64f8134091cb1b9679",
      "0xdc1ffc87ec47736d6211295d7468e335d226b2b8",
      "0x32f29dc6d8da9d264f2f4ee270bafb5321e1f224",
      "0x7b403c20adb5674e31fbbc040945999739a874c8",
    ],
  },
  kava: {
    owners: [
      "0x1dd9319a115d36bd0f71c276844f67171678e17b",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0xfb6a733bf7ec9ce047c1c5199f18401052eb062d",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x2db219b373f3513d3bedc49bbf73e0bfaa07eba7",
      "0x1e427a44864acee6bac9b1b56235a7a0aac755a8",
      "0x168f3952620abdb1074cf0f23caab7bc9a1c0a3e",
    ],
  },
  starknet: {
    owners: [
      "0x0566ec9d06c79b1ca32970519715a27f066e76fac8971bbd21b96a50db826d90",
      "0x06262a22f80cc8b4fa73f7a38c5ea437c0a6d2f0c24ea27061ff032386ea294f",
      "0x04c19907a16f39d242ec1297e67fab4e76bfdbdb161078c846e5bbc5b4a70dab",
      "0x01b2bb0e7b4821d4dec4201056262a748bcb4fa5ee3d44105f0901dfbc8d7c11",
    ],
  },
  aptos: {
    owners: [
      "0xaa0090c74e4976834ff1b9b9ef945e1c4b6cdb49cccf37c2554ef026081312f1",
      "0x7cab5cb050630b957e54f0a9e757cd57fac5b64f64860559930f22e008560cfd",
      "0xbb74f7a3f369c84e7d9bf60aeb778c91be8e63d08ad91583340cc8f46d313f72",
      "0xb95a4e7393a621b9dc19a255651cebec45b5deb257a81416a253100b67e3209d",
      "0xc52580799129af2ff331a808b19be7189a209100e0fa8027a00b3e639560fcd4",
    ],
  },
  base: {
    owners: [
      "0x26c8e06590f73c2571d68a41ebccec38e12ddd9f",
      "0xcfdb97872667c55c15c255b9af5c715cc4bd8a69",
      "0x18b0f4547a89fe4c5fe84f258bea3601fa281e9f",
      "0xd2cb829848f8857a589b03fa8b567c5ff0742e18",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x69be413d648ae00f0fbd9856f1355e22b36ee5e0",
    ],
  },
  cardano: {
    owners: [
      // "addr1q87n2sy2n3k844h98wxt530rr70vhkrg05prkqls60qtpeqq38w20v22ed8lufl5llnz6h3yl0mgcm9h8jsx406t6qssu03",
      // "addr1q9vespgxm3dk5kfgg9zgkfae8j5f8r3gnz405tm83tfwgj6enqzsdhzmdfvjss2y3vnmj09gjw8z3x92lghk0zkju39spn4",
      // "addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66",
      // "addr1q9h4f2vhh5vnqgnsejan3psw6mj3a504fxlqm2eh3262qufesdvfs83ulr22vprsv9mwnt0vgkfwxlflxkns32twqzdqjpq",
      // "addr1x9qy3qeu59ngqfwe2uv4qz7n8y2wzzk0n5h3t0r2sdmflrzqfzpnegtxsqjaj4ce2q9axwg5uy9vl8f0zk7x4qmkn7xq27p",
      // "addr1x99gcg9us9jfp6gtsrgsenjjreg9ytevv7ha8nvyzuz4ef623ssteqtyjr5shqx3pn89y8js2ghjcea060xcg9c9tjnspxv",
      "addr1q87n2sy2n3k844h98wxt530rr70vhkrg05prkqls60qtpeqq38w20v22ed8lufl5llnz6h3yl0mgcm9h8jsx406t6qssu03ga8",
      "addr1q9vespgxm3dk5kfgg9zgkfae8j5f8r3gnz405tm83tfwgj6enqzsdhzmdfvjss2y3vnmj09gjw8z3x92lghk0zkju39spn42mj",
      "addr1x99gcg9us9jfp6gtsrgsenjjreg9ytevv7ha8nvyzuz4ef623ssteqtyjr5shqx3pn89y8js2ghjcea060xcg9c9tjnspxv0pn",
      "addr1x9qy3qeu59ngqfwe2uv4qz7n8y2wzzk0n5h3t0r2sdmflrzqfzpnegtxsqjaj4ce2q9axwg5uy9vl8f0zk7x4qmkn7xq27ppet",
      "addr1q9h4f2vhh5vnqgnsejan3psw6mj3a504fxlqm2eh3262qufesdvfs83ulr22vprsv9mwnt0vgkfwxlflxkns32twqzdqjpq2na",
      "addr1x86wkztx2pqvvh9nlqclpfn3lc43gh8gjgqe258hp7fflr05avykv5zqcewt87p37zn8rl3tz3ww3yspj4g0wrujn7xsn3ekxy",
      "addr1x8z7n429sfah3edwj5cgle7hjur5ge6z20shr644lrxe9l79a825tqnm0rj6a9fs3lna09c8g3n5y5lpw84tt7xdjtlslelrez",
      "addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg",
    ],
  },
  sui: {
    owners: [
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0x13c075644dad21bf10cb12447b825b535c24ddae428e27abc5858d1511e24c6d",
      "0xf3bfda04092a842d4c57c61f9d8fb99058792ab2622b2a0c0d83a6ea41de325f",
      "0xf3bfda04092a842d4c57c61f9d8fb99058792ab2622b2a0c0d83a6ea41de325f",
      "0x13c075644dad21bf10cb12447b825b535c24ddae428e27abc5858d1511e24c6d",
      "0x2de3bc906d1fa9c85e44cf9b0642447126879cb776f5ee3749bd2e32247ba52e",
      "0xd5ccdf77cab59778ad6c6d599af3819b0281c3fe434f7df4b82290620331bb01",
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0x2de3bc906d1fa9c85e44cf9b0642447126879cb776f5ee3749bd2e32247ba52e",
      "0xd5ccdf77cab59778ad6c6d599af3819b0281c3fe434f7df4b82290620331bb01",
      "0x2de3bc906d1fa9c85e44cf9b0642447126879cb776f5ee3749bd2e32247ba52e",
      "0xf3bfda04092a842d4c57c61f9d8fb99058792ab2622b2a0c0d83a6ea41de325f",
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0xf3bfda04092a842d4c57c61f9d8fb99058792ab2622b2a0c0d83a6ea41de325f",
      "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
      "0xdc46d78750022e3b9b6c3a9e96c4ce046344eb876192f5c6bca2ca68bca261a9",
      "0xe53c0bb62fd140bb87055c6c838089badaf217f812d989f9c105f16e177c7505",
      "0xdc46d78750022e3b9b6c3a9e96c4ce046344eb8761929cd005e86415de46a5b4",
      "0xe53c0bb62fd140bb87055c6c838089badaf217f812d9515b8d8e2f7efb77a932",
      "0x69c6fe69c6a68a8c001157b9ef807dc0ef9f929e1214928390d78df06f46628e",
      "0xff93d227e7a8022201889c8e8528ca27d4eeb841f557efe708b7e2422ea4ffd0",
    ],
  },
  ton: {
    owners: [
      // "EQD6_ynJFOsM1qwy1j_oeqD-ISboE-Lk4rr49dZ4CfvwFosp",
      // "EQCzflcDPbIdELlQ5hQ7ZYwQw79CW9GTAllgrvfyLbz0_OZs",
      // "EQCIjq_nM67Yg2NOzUO6_M-U4VyY4kOUVl0Bt3MiPEEgeYOS",
      // "EQAIboOe0Q8hOTSLd2dosjcp0sRPKUyev24zKL5j4t2zdUh7",
      // "EQBQdl9SYUJPRwmAbtsYsS2mkgVTCt_V-YHqT-FV60ODr5R-",
      // "EQAzmKQhU3Tari2Nu_V71doQmw-kNkXYYRJbQkrWUorGo37z",
      // "EQD8ASb2Df-cl2aetHDdAxlCnH2nfIPSx96pmSfZ2guymVQN",
      // "EQA8dTRjMrOlgTsBY28tnNnD46gobuMoq03ZE41iPBlZcyg4",
      // "EQAt4evTuE0lMe4a7KJIQK7aCAdblI2KsRNT91PCasZYuXVy",
      // "EQA1XTRs9vj1Gq7QQX63bm7c1Tv-w4H3XxF8w4qY5Wq6Md5K",
      // "EQBA2dHA_GTyN0SelRxTc4BiKcyRrVk2cKbWbQILMcEi3IXK",
      // "EQBIE0_RmGpCnoUat8QXld8WaMGLZhGT2ceFJ-WMTmt4j4Ok",
      // "EQDhbl3yxSyR_8qdukqF80SCil2PvhAZzZiTBUUw3MclP7mF",
      // "EQCRkVC0uUvKIc_AcxsshIoOTpPcAr47aH6r9k75drIrIiqT",
      // "EQDf5iNrozngVM3E19nPseH5uf-f6IYXKeEDpEcGzmmG0E8x",
      "EQC9N5BK-44oeyiwhC0q4apnRrTswnXDhTETbhhgLALvXUIu",
      "EQBvU8pjfThN23s-OOEZXXre2PeNBsvJbnlZ3RaczBZRNSyg",
      "EQAOFVD6NvK-2_Oe9RZO1Q-g7r1UdHO7l3rerFqG9uJwG_id",
      "EQBzACE3K2aEM-t07gWqwWm1QGPD2MPSeo1ZQsKn6yzhW-wx",
      "EQAHzmC35fJVqIw3B_P7x54s-STta0t9CcYyTwuiM4pI-oPB",
      "EQDts21W-HlG_4De-hV_4UH3R8g4Mh4ElGuNmIY_du-7ubEe",
      // "EQCFFCKVa1zFxPK7G6wvT85RkExkRSj-O_mBm9uaRpVxZf8E",
      // "EQCEftTyGnG8LRFQhc7PBO2OcUdy5vq-wri1rGXHYw1QyJbu",
      // "EQATx1sxm1gf9RLtsoZcnTrCDRmcMeWU3WQ2vulZDNBLFWNk",
      // "EQBysKw2y2jUpOAaUNEmxM9BqUg4iScsiOGgdTZvodwaP-jq",
      // "EQC8K85OC_wxIpFTlW98Z2_z-zV86cB-GcKMnGaSMSsfokto",
      // "EQDNH6P8W4f68LRScjwuqhee5SgP9btMzoESFu8ewzRuDVCt",
      // "EQBPyemREQAlSxBJdWArlJCXtjzcOPBnKiwWz8sw9_8L_1Ee",
      "EQAu9AtAct-rFOMumbUh3zLaE9FQMnmYWRi0C--7UIODe4mJ",
      // "EQBL9dDz3zQv6eD5Aucrm0qioOjF2zX9SAQtg_z5sKhiWEsl",
      "EQDtbfZPcagP_SQqS2_dlgmsKR-QGfAJeOH_EA2pUBCeKUSu",
      "EQAFbW09or7s-CYKsLrKcvAC9LoDfqom_f5jEIHilQ8gvA4g",
      // "EQC3TvP0xyKgkrU0ugz4k-MgymahgzsWlsEz_ohNPtL6MaCU",
      // "EQB4tenLXVbU58tFHcXEWY4UCldJBYx2hRa9aioMvLP74isO",
      // "EQCoXkxpimacDL-4KgoxVlc4cRzga3M1_oTapjTGO80S9MXC",
      "EQDyoucGvxKV-mOI4wqZxDHOKUrvACcnlG0BOoXfwVVDF57R",
      "EQA7hl8xdtMpwYKAuzZHei7OSnJpVaznO7JwFLVYjY4At9Ol",
      "EQBbQJe23kk5H77ruxpwPNbnZRArUiWTNt8Qorqti_ICFdsi",
    ],
  },
  polygon: {
    owners: [
      "0x2933782B5A8D72F2754103D1489614F29BFA4625",
      "0xfe5bf6a8beb26d9cfbce4c5ad3fec8ea844b5bc9",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x9ac5637d295fea4f51e086c329d791cc157b1c84",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xe58c8d45477d894bb9a1501bb0d0a32af8419eda",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  polkadot: {
    owners: ["165tzcxR1o2EUkpZVr17DxQsdJwtEkB6HAh69hQubmKGL93f"],
  },
  doge: {
    owners: [
      "A4pFXcvnZdCm7Z3iZR1u12NozWTHk1avAg", 
      "AEn5XzY4vpLfqGTouwsB33BHnhxURWzrg4",
      "9y6mxqRstcQ9pdFupqwFGGajEEsq8BxtwK",
      "9rgFNXJnwN9Zfq1EU7z9gMDDTQMXjarFoA",
      "DEthb6RcyXPRwhfzWhmE3FngsXzctSHxkT",
      "DAXQys85qfyeccsQY3zoseQGDHp31rvMQQ",
      "AEwDT5YDwbx7wNGddDc9hWXyFamkpz1PRw",
      "DEZpQPv5E9fPQhZDVuWtL2aB3y2e1iojiR",
      "DN5Hp2kCkvCsdwr5SPmwHpiJgjKnC5wcT7",
    ],
  },
  avax: {
    owners: [
      "0xD6216FC19DB775DF9774A6E33526131DA7D19A2C",
      "0x2933782B5A8D72F2754103D1489614F29BFA4625",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x4e75e27e5aa74f0c7a9d4897dc10ef651f3a3995",
      "0x58a1c909c5ec6cbf9c1df9ab3e9e2301ff707b6b",
      "X-avax1pnpgcx4asflpjc0zphfn62hxdf34kc6w8csetz",
      "X-avax1pjnumf4drnej0ckzx3vn48m3alr4cf5sq44xc2",
      "X-avax1qva4ag025lkgfd8yv4ggvykg84l70ayl32emt7",
    ],
  },
  "0g": {
    owners: [
      "0xf5c1603357290383dbdc8626ef6e17327e0e9cd1",
      "0x8c720d168270f31baa7124598bc1c9c0900e798c",
    ],
  },
  akash: {
    owners: [
      "akash1n55cksydqdza62cm8v5m2k9mgyvcq52x8g0thx",
      "akash1d5rp4gj69wc8fa458m76vt8eyneuf25ayn4sr5",
      "akash1mdqlr9kcmd4hlg7nktqcyyelypg75kcyseznnu",
      "akash1kcqwyej33fwzl03pflvf0qlvjmmtt0aaqz69fl",
      "akash10fkghnsujk99ppjy69pcjwrzt4c5pencpsxx7x",
      "akash15y4gsk32lxm934j8gp65qte0juygd248tetjvd",
    ],
  },
  allora: {
    owners: [
      "allo19ft78008cd9qazuy330wr4fwswzk6vxsrt0z23",
      "allo16lzzcl3v8crnny2c9784ns0jcpumsrx352k70p",
    ],
  },
  arc: {
    owners: [
      "0x68d1efc18975bd2bb295904470864b1b2b59586e",
      "0x220c2d49baa852bb884b97b09b07a6fe724f8e6d",
    ],
  },
  arweave: {
    owners: [
      "z4JRWSHoznLO5IFO7Lj4r5cQy7sfoicVas7saN2juAo",
      "gYGBLqKXosHnTeJ0s3dIOjFDvrxM94O1fi8bAc7lAUk",
      "fOi4a7qPXPfYySObiJxJGp_rsHk6FAow98WTJpHT9Yc",
    ],
  },
  astar: {
    owners: [
      "bMfFyiKK1RKNjPDXjP6g8jiqvvApWzwtVUTZJkU4TzeZ72k",
      "b1rL5BjqJLmjuaVLfVejaVoZLw2qPYLibtX7TLECdZcmAap",
      "b2CHafRwFPsG3qt2WQE7TjzrjfMWfKhDsTkE7dQv3Hhjzct",
    ],
  },
  aurora: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x14122052dcc241a94d547a363392033640165663",
      "0x82e4b25d83aab29b3ecea80e8589944583ca8437",
    ],
  },
  babylon: {
    owners: [
      "bbn1x2gksg2ejkrkmpxqqxtrshwpv234c37dqckhpq",
      "bbn1jdnhn4g3lff2gu08wrsq92x92wpf997kep8wsv",
    ],
  },
  band: {
    owners: [
      "band18u5p25k7lx42uh3aym07jlu3rs6rmktk3kcg05",
      "band1upv4l7res8y85egh7h9nuvl328wakqpugay4en",
      "band18wpvqfu9g0n8x3ysu72fcdtwz025tvg7q0s7x5",
    ],
  },
  berachain: {
    owners: [
      "0x38285671612d6f0ef7c3483f500d39fa71d66a1c",
      "0xf8f36a4eeba637982c2881a4ec2b7e37b842da00",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  bifrost: {
    owners: [
      "eq3o5bWjjWQuuYQeyTanCyfUFJLkiNpjrfpLNc6nA5u1QhV",
      "eGEwXgAJx7gRVY8CuFZJc13DRCkzPftzsoPcAeW1C5AXCMh",
      "byJbeggQ1YZ1pmamJbeXJjnEDMz5Kr9CLWWCdyX9pTR6P8D",
      "gxjdLbmSp51ZxpdiX7LXyFGUfL3hpBZ4YmX3j3h5TxYzNPL",
      "hFuy2wokwKCKKrEstGaB8equAYfE5kj1K3Ua167tN4xckjW",
      "cBuLbnTyhs4f7Di9PB9vJ5Buo3UsjxDbw7TTYJSy2CC5tmj",
      "gorYaCqKYGbR7FLw3HFVN1RWDoeZqxDQp1sqoGiNttC2FHL",
    ],
  },
  bitcoincash: {
    owners: [
      "bitcoincash:pqdr4k2ys7z553d47fj7nuwgsc52drxmlqpxs0adc8",
      "bitcoincash:pz2vdhznjsxcsn45jq32298lz027c5ddjsv6a56rp5",
      "bitcoincash:qr5ahla9trzyl8l7l8tlcsc24d5lhcxj6ywnemc6ye",
      "bitcoincash:qzd9yxl925kqyc9ymcnxrqjyvpcqnnsjwc5dz6q6uz",
      "bitcoincash:pr8yw0v8c79h8sv2csd4cevjjdupynkwrgh88hk30r",
      "bitcoincash:qq3df5p96lhcp9hudgpl382d5ylpzgtwnsrdc7x3l0",
    ],
  },
  bitgert: {
    owners: [
      "0x2c1ef88eb06a617b14d0c30248543004748da672",
      "0x4413e5043d4dc332b28cf80ada3d18dd2a1c5ebd",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  bittensor: {
    owners: [
      "5H9brHhMA1km3Dp3YCx75oaimgxEYScxCfxbzQRZ3gHk9x3L",
      "5FZiuxCBt8p6PFDisJ9ZEbBaKNVKy6TeemVJd1Z6jscsdjib",
      "5DxcqzHjknv1gUReoRVYg1R6XjGgPMRD1ww4koTQND7ZLJsP",
      "5FpKrxHg1CAFcNRkK1fZPWJUQJP5xCh9CcWVMYYKbLwSBq5X",
    ],
  },
  bsv: {
    owners: [
      "1P4t7z8SwnajLpSap3eRpWMXtYBPpnjW9t",
      "17d6fvZv5j34htM1LnWUVjJuKR4uEkkzuS",
      "1A6QakGTRESTadCMGvPfLMiMf7ioVAMbWN",
    ],
  },
  btr: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x5d9b0341ea8d57f9bf877521fb2f97fc152158b5",
      "0x4c7e754f2276af250e4f622ea5a72985e37df0c9",
    ],
  },
  canton: {
    owners: [
      "kucoin-rise-2::1220c1e463ef7c6bc238ac966e74b954529bf97803305ad8ade8b17211fedd638529",
      "kucoin-rise-1::122036691a90ef385785ec9bd5308ff16e34eb90b4228d788dc5ca45b23aee0945ab",
      "kucoin-rise-3::122051dc4fbea0ac2e7e06952e79761ad7225e38c3c1e08300a040117c8015ca3e5b",
    ],
  },
  casper: {
    owners: [
      "020213b8c1def10e37107576a2372b378532d19329548ba885e853b29868ed15349b",
      "0202ed20f3a93b5386bc41b6945722b2bd4250c48f5fa0632adf546e2f3ff6f4ddee",
      "02028db941961b1366bc0e625afa51d1c9720cd1c53d2b300b3e96cd1806295e29fc",
    ],
  },
  celestia: {
    owners: [
      "celestia15uvuxtjgr0s9e6yf02j4zuhfsm5ds52s8hplkk",
      "celestia1ytrpc9lqtzrfsjye9r6lvj9nlfp0n3t36z9kem",
      "celestia14jl20hdhyd6hy7ew069jggdq37w93jd9xc0k07",
      "celestia19ntz0ned39k7uvx0w5an5lnukf2fnptuer0xq4",
      "celestia1wzgak3rd4euyuujssp8lm7mkv6jylsjutahsmz",
      "celestia18wpvqfu9g0n8x3ysu72fcdtwz025tvg7g2pvy3",
    ],
  },
  celo: {
    owners: [
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0xa5c739df3d8e58ca79a77ec34cfd4d7bea0b8e25",
      "0x1e32760a3285550278aeafa776e5641bc581c845",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  conflux: {
    owners: [
      "0x2403384a45edc33582ca845867828f2394987bde",
      "0xa53c3dff4c95553da9b1aff70a6e15665024501b",
      "0xde2b78f72de0bb6fa13b0f4e92ad4deadafbe2f7",
      "cfx:aaprbgcd6ycy6rnavxj6nc3f3eyn9a5bja10t8s1ec",
      "0x30fd9bf1c778bae95429b06ef490d86f34f3cd1a",
      "cfx:aarupjjhhw4r59x9tccz8wc0k4y5jhy7c26ufnggxv",
      "0xfe8f89b5c47685158c194352cd3aa84dda8a5ece",
      "cfx:aampx35e3hf4ujyxb81n59wxy2nsdhn0zy6khw503n",
      "0x9ad374b9d8db33eca4a511ba6bf90ca1643ba22f",
      "0x0e87a7a093dc68af8599fa851ec138b47becc30d",
      "cfx:aajjvc8v4hkfxppenvcpxezvmrptp5b9xpx7yjdtdr",
    ],
  },
  constellation: {
    owners: [
      "DAG6cStT1VYZdUhpoME23U5zbTveYq78tj7EihFV",
      "DAG5yqn4JRkW5oAMthhBayBtkZzfAvRQnkH1dCG4",
      "DAG3WnpWbwnnKBLtu8FvBp3VUkmxJgdcs41dTHg5",
      "DAG8xxL12vUzgeiCXkH8uC76spbRuVofaAkovyL2",
    ],
  },
  cosmos: {
    owners: [
      "cosmos1nx33kngg9e4w50zl623wc8zp2gwfvnlrqjsylt",
      "cosmos1zysr0j5j4cawn05mxw8xhesjq0fl599mej6ncg",
      "cosmos1xam9ddvyj9fxertqq5kg2avdum882pqzrlmgzm",
      "cosmos1uer4mwcq2vlt8l23ncwyjj70mug5pzx82cvlyw",
      "cosmos1qml5yxnfgdhcywp2w2lpvuj9fazzeylg2gdaeq",
      "cosmos1epr6n0xr4z9tjlh5z04nec9hs9rwrtclpqxy2f",
      "cosmos1605flsh03s9gkep660797z30m49le90ypgvd3a",
      "cosmos15jcsvlsh7wpegkv4eaypxv30zmwn07g54u96ww",
    ],
  },
  coti: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x6f32781172e339c529067bc3f2219532041612a8",
      "0x1c020941d0963187819b162c149141f95a3978fc",
      "0x2c0ab7bc8316bd02dd8898ad1b6216041996cc9f",
      "0x59e9f9bfdf84e0745aaa30193117e4f87fc3679e",
      "0x4d9fb15de9188f0b170282a8f61b8ebd189cbbaa",
    ],
  },
  dash: {
    owners: [
      "7UU2TWnsSr4BQvPE3ARdzHiYA8GsfXJ1dV",
      "7k3jd6bjB7MrUetyoNH5mACspUTfu9tMfX",
      "XpKrCFXtEezuWD4NT2qZajxVPnhJkhdEiE",
      "XvkxruHxW7pyHauVyfMakD6HWTECPLP1qv",
      "XcyX5zusdQcLgcB984nMrHKuNBck7RZHtY",
      "7cKSWUMGAAt2jLN19WKskb92TUZ5gqEkMW",
    ],
  },
  decred: {
    owners: [
      "Dsd9B1PvFteME2kfADfNyGtksLxuVpZ12ay",
      "DsYUjT7d83oQTdMTTc9KpcHJkDd392pqi7g",
    ],
  },
  dydx: {
    owners: [
      "dydx10fjf0cutvhexg78g8pd4ufppe6fggchwptvdhs",
      "dydx1h9umhaefhu3k4dvrynyjf2mcz33fhdxsmfx2cc",
      "dydx10hda3xyelp2js0am8z6xaeu2ut4lgndppwl4ha",
      "dydx1fwupmm5uh7qnvnlnjyq462ynfnkz9tw8s3ldl0",
      "dydx1sdtq905q4apjvjue5te0chefdzdj8q40wgkdjy",
      "dydx1m0p3yg04c9tx8s490xtcvd0ywwn7q2uxlu8ugd",
    ],
  },
  eclipse: {
    owners: ["FKE1Ui8Zkd8u2nJ9NefcmUrCYZ4WFZq3VeFEtjQxaxZ9"],
  },
  etn: {
    owners: [
      "0x92f0bac0f513ccafc2b4101365e2d1afcf9874e4",
      "0x9c3c93bdf307a3bb531f69395614bbbc959b2265",
      "0x3267162a6fc09196d15626181b7bc00166bf0afb",
      "0x4c012b57902363589f2cd271c528aa6e489c0122",
      "0x3dd39bb9846eb18fa3cbe419f10734157e40fb28",
    ],
  },
  elrond: {
    owners: [
      "erd1ty4pvmjtl3mnsjvnsxgcpedd08fsn83f05tu0v5j23wnfce9p86snlkdyy",
      "erd15ku2r2j6smlwumftumlpw0mfpqxy32wyt4ewxzyhs3ugsjee8stq2xh84e",
    ],
  },
  era: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xf3977e6307eb0220e7ea9c54bc557136a49b19af",
      "0xd65103d6a92a591bab6919bb02f945f1316a5e9f",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  ergo: {
    owners: [
      "9how9k2dp67jXDnCM6TeRPKtQrToCs5MYL2JoSgyGHLXm1eHxWs",
      "9fpUtN7d22jS3cMWeZxBbzkdnHCB46YRJ8qiiaVo2wRCkaBar1Z",
    ],
  },
  ethereumclassic: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xfa63926440fb35fe899cd433a0456230de2cf0fa",
      "0xa7ef184c8095ee633d508fa36dc3f43012a0e87d",
    ],
  },
  ethpow: {
    owners: [
      "0x88bd4d3e2997371bceefe8d9386c6b5b4de60346",
      "0xa649ffc455ac7c5acc1bc35726fce54e25eb59f9",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  etlk: {
    owners: [
      "0x5fd02ec3949dab9965f91cca6dcd5a1b8b846b10",
      "0x69caf8339852cc43198dcebbe64d2cd72f1e1a72",
    ],
  },
  filecoin: {
    owners: [
      "f1jkvf3b6hirnonrmfzgjs4rmqsh2wrk75amd63oa",
      "f1yunaigmcwiksxr6jipl4xwtga2fcxvb5ibtzrqq",
      "f1f7cvdtqshczlrb4r6s3dcnfoyp76sz2e4nblyoa",
    ],
  },
  flare: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x22dc53fc2ed383e4bf849b1054f1b86c127fde3e",
      "0xf9ed457b149ad27fe2ad2eb734482a425fd6faae",
      "0x761fff168e8eb498b0df381240c2f3178a043903",
      "0x0e6d0c14f90cf7f3e3559cdf1f7652b8cd4cf503",
      "0xeaafa733f774fbdd8776ba8fac6cc79eb0cb497c",
    ],
  },
  flow: {
    owners: [
      "0x180de7e1789d4e4a",
      "0xa75dc99389b28584",
      "0x63ba653df2dcba51",
    ],
  },
  flux: {
    owners: [
      "t1bVAMF4KUxcyVZa3X3sPB4Tx5jmdgS876X",
      "t1g7QCktktwReoHgwWtAgNBVvzzboQVZy19",
      "t1gorwQHhWsvfgSEE3YzBZFnyewfGaimUbF",
    ],
  },
  fogo: {
    owners: ["DoXaGk7gxKXkVrSuicCAQL8g8M86hJHAT3tEc1pCxurw"],
  },
  hedera: {
    owners: [
      "0.0.7315658",
      "0.0.1686716",
      "0.0.1686714",
      "0.0.10962820",
    ],
  },
  hsk: {
    owners: [
      "0xa55b695fc61da177fafd81986be2998df2049561",
      "0xb5560ce9d76590165e21035cbd982d50a25ce45a",
    ],
  },
  hyperliquid: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xd0a8fc7f6e08691b39bea04ac01538d4c9eaaa91",
      "0x156fdf14cdb80c9623b5eb06a164a799aa719119",
      "0x716bd8d3337972db99995dda5c4b34d954a61d95",
      "0xd6e34467c052563cd773ad20ad36be7b61f96e90",
      "0x2db219b373f3513d3bedc49bbf73e0bfaa07eba7",
      "0xbadb123089fe03787f907a9ffea7707278bd61f0",
      "0x628b72cceb9df77e8a845aa35a7d75ca4b0ec6c4",
      "0xd18d7ec1c12b8a88f1cc3c7d7b7f4af6f8a94e4a",
      "0xf447ff9a69a5df096669a4369d43ecf2a2ed45ac",
    ],
  },
  icon: {
    owners: ["hxbb984f278abd66ae2155edbd91f8c87ce98411c8"],
  },
  icp: {
    owners: [
      "195a08e392e6f6694a43ea535d676822ce95e212ad4cd15bca6c9bcee080b5b6",
      "00c3df112e62ad353b7cc7bf8ad8ce2fec8f5e633f1733834bf71e40b250c685",
    ],
  },
  initia: {
    owners: ["init1xt4ggu8tqvzj5mt0xlftdnuq6cw8ax8lp593zf"],
  },
  injective: {
    owners: [
      "inj1tuqc6yft0ac3m62g4ruwqc28gjg36hmz4xpfnw",
      "inj1s6wmtyl66g2jp87ye407mdeh22gdwgahg4rt4y",
      "inj1n9cztn8x5m8mwk0kckrvaj9m7rmkrk6nhd47t5",
      "inj1ts6zpkyfpgq4yfd2846qnkn0rnsj7hms9syl6p",
      "inj19kgkz9hugys7y3swssmtvrfrdz6lgp2gty3stz",
      "inj1umfy44dhenpyjsgnpkp08wz8yld30u5gvfyu2l",
    ],
  },
  iota: {
    owners: [
      "0xf1b15744168d00661fe0ca19095b5b79405a6dcf2414896fdb5f11d7d1327e61",
      "0x96af1639b31210ff22641fb2e19085a4fae0a5c6d8a282b9452208427cd04f9f",
      "0xc2e0c96a5d1139af04516650328b4b087522c1f6c2d51f665a45967d4c2caee1",
    ],
  },
  iotex: {
    owners: ["0x9b54d815deb1d4eb3fc2e564277c061b9cb7fddd"],
  },
  kaspa: {
    owners: [
      "kaspa:qzadxjufntvckxrvy76pyhvtkuu8lg5ryz252aglmhlyv27pxqplksshzuu9m",
      "kaspa:qq3k4du6wf2g26j7ds6fqmgtgavgm3zy676wntp2e52nsuns2n4s6xkndmx0y",
      "kaspa:qpq94ntnvy8p9q6wrdwtn37xtspgashrydc0kuu8ctpyxulmh0wlxh2807zdh",
    ],
  },
  klaytn: {
    owners: [
      "0xc1cd6702480632349d6e9da4c3d4a13e1a65b972",
      "0x8f644e25016077d0552d31288d45ae47de0813b6",
      "0xc1fecb8bd82bceef9d2b55fee5f4e0e644ea2e9a",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  linea: {
    owners: [
      "0xe73d4b73eff834fef9a0276298c996c5f3b08274",
      "0x5a7899599709686e38e65a5e94aadf9edf40e57a",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  litecoin: {
    owners: [
      "MJQXeUK6vdzwmPiCCjpcbaEJggkJrMBHNw",
      "MPHYdgqmdxn3au7SCDuEEKc1Bh4ba24bmN",
      "ltc1qv7wsvsmx6tqxjz9l750n0pj524na4lmqrjhyz9",
      "ltc1qwuz760c95wq5faj0z0dtdy6j2mvt6z2hmuretl",
      "ltc1q902mja788zak65ev9qw8zre7fnrj6rvc0z8yme",
      "MDvws4C5uM1r6QBbJDj9y7yhhEhR4SF6t5",
      "MV1mxEj3zh1kuFcPE4JZCUCSki4eH3SLwL",
    ],
  },
  lukso: {
    owners: [
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x0ee651e673092610cbca44e532178d74de57818c",
      "0x418f7dd598c53a6a3a5d94cf93548ab66619da6e",
      "0xae09e2cd52fdf645c8357d65ffbd464648d5808c",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  manta: {
    owners: [
      "0xd7991e8d7db089f26017eb2046496bc7b6d6b454",
      "0x446e4acf5ffee9ce9facbbe5b78f8e6f5fde1b76",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  mantle: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x7345b723e174e57eb76b85b155ccc362bd9e25dd",
      "0xae09e2cd52fdf645c8357d65ffbd464648d5808c",
      "0x168f3952620abdb1074cf0f23caab7bc9a1c0a3e",
      "0xab7ac8b30e93ad72766f12090bdc4e639d77ae73",
    ],
  },
  mantra: {
    owners: [
      "mantra1jvs3gf3ym28w7pt6mgdjfcyq9c7mc7z6zmytju",
      "mantra1am0v3rtkf7c4z9fsptapu26wy0w3cm468kp5k2",
      "mantra18wpvqfu9g0n8x3ysu72fcdtwz025tvg7jt6cax",
      "mantra1z6wlzxmga6esclstc08uj5gz22q9keh6zzw3sv",
      "mantra10xx0vxfmfwkndrghtp3src0xv2tfdmfqzdmzhg",
    ],
  },
  matchain: {
    owners: [
      "0x00589d0b7e7b7f9b44076cd2de422818a2c674b5",
      "0x9ee56b1f9686b6b1b6747069fe8ba96c63957815",
    ],
  },
  megaeth: {
    owners: [
      "0xc2cc15728b677343b7c330ca147b8b635d9b08c4",
      "0xedf1f15771bcdb9154e52128ddb9360b1e440667",
    ],
  },
  merlin: {
    owners: [
      "0x656c6c7ed2363b0be8878b2e329be50f987e8721",
      "0x9a447c495426d64cb77832c30cd7c8d4a3f306f1",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  metis: {
    owners: [
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0xe7f7f1e591c198a394335a4905d931457faf9332",
      "0xc519c75cf9de75311e6797cb3a3c641a01bdb1d5",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  mina: {
    owners: [
      "B62qk9CasT3zwAUnTXYxjAaPcrn4Byx4zAC6Sjib3u3inPBALtENkme",
      "B62qmVNxJomFScVmeE4WaiBunJsGJPboHTrDTwZNqvQTWHUyLunLbyj",
      "B62qp9vk2jHCqKotH8j9kJeHL56tB2n2bfMMiyqn5RAqwLLugMU53jG",
    ],
  },
  monad: {
    owners: [
      "0x52f107c0d956c0e417dd8814455984c45cfe1a18",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0xdb2ac3b16f3877b478ad0bfb3d265d9c9be3f254",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  neo3: {
    owners: [
      "NdtNKmNHWPsMRj6utkWkpn1KR1VM8BWQQu",
      "NdMAf2ASVvS1LHnsQE8uLefWvVRSNeb6fA",
      "NWKquhHc1uwjr97jZrY2Jnar7mBa3otVbN",
      "NQs33i3SrPLmsSCTM63mFFJkhdU6iG2t7C",
    ],
  },
  nervos: {
    owners: [
      "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq238c5e34lfkzag3r9mnzxkw2j5kv3dd9qm83gxr",
      "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqgzgak4nyyfjzlcnx6lel86kkl9wmn8cmqg5mv52",
      "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqg7amrm9saduc4acdzlerezh8x02rnlhpgctv0fh",
    ],
  },
  nibiru: {
    owners: [
      "nibi1chy0rqw3zrj47ghzrydy5e9szlp7hwe00e9k6t",
      "nibi1n3xqlxxrc4kj4gle2qya9466je64jf3ya4sdqw",
      "nibi18wpvqfu9g0n8x3ysu72fcdtwz025tvg7w959h0",
    ],
  },
  oasis: {
    owners: [
      "oasis1qp7qc2fvaj6h5x5mca9zqlmpuczz6n02xs0rle3k",
      "oasis1qq03n9m557tsulxpdlknrhlvtm6wunhj0vzv0jnx",
      "oasis1qqfj6vsvfq8mlwlluzhx4lctwgw6ny4l3vgcqn9h",
    ],
  },
  ontology: {
    owners: [
      "AJQ1XhE349gvkAtdYrACmhAzcAw37Vc7n7",
      "AddKsL9koDSgK76KwrKz91bxmratLqUVND",
    ],
  },
  orai: {
    owners: [
      "orai1qgk2pw8kd2u5rup4zszej2rk6kng4lendgvkn8",
      "orai1sksdw8qx0xmgllfha0rzgjw8qy3jrkegvqr568",
      "orai18wpvqfu9g0n8x3ysu72fcdtwz025tvg72nxll0",
      "orai1pqe2j4znxd5c3hy56cc6hskt4kejrp43td5ja0",
      "orai1906ngejrrhxlj4fygj2pr233hv573h7n92wt0e",
    ],
  },
  osmosis: {
    owners: [
      "osmo12320efq3ns5sms0dq8wh0ljf6kzq57076xc9kk",
      "osmo10p7dg5nh8kwjhfucq0uxjppg6wkevzmg67c4hx",
      "osmo18wpvqfu9g0n8x3ysu72fcdtwz025tvg73mrvgw",
    ],
  },
  peaq: {
    owners: [
      "0x706145b9639e4f3d5cf8b851ec36fdfda103579e",
      "0xbc7dbbd20b5416967bcea28bf4f09d4c66107175",
      "0x48d61d92e23c22a77131558470716831346d92d7",
      "0xeb98a1e0059c89bf5938e87b14c6cc92269feadc",
    ],
  },
  persistence: {
    owners: [
      "persistence14nqzsy36gua04ye2qdyvx2eyrgzd3f5vmrxwar",
      "persistence16uazp0svz66y32pddvvxf2aj29x2js93xyaz28",
      "persistence18wpvqfu9g0n8x3ysu72fcdtwz025tvg7hvk0sc",
      "persistence1lctnzd6gky9eq0rkzvtr6anuy7p8tpysckczv9",
    ],
  },
  plasma: {
    owners: [
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x99594065a27ce2905fef66d12dc09ea41e364f9e",
      "0xc9586c986649c3b5722724a239965b4bdd92744e",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  proton: {
    owners: [
      "kucoinrise21",
      "kucoinrise15",
      "kucoinrise25",
      "kucoinrise23",
      "kucoinsscwc1",
      "kucoinwarm1",
    ],
  },
  radixdlt: {
    owners: [
      "account_rdx168m6px4dqaqtpyqhgr35f2zw54f80mtmxpzggvr2gwpx6l38uxlpge",
      "account_rdx16x4ryh2tnlfxw3ezwuuktczgp7wekhy89szxgkqanqvf4ygpy0rley",
      "account_rdx16xvsegdgs5u7jggrvekcmcle7mrcxntlk879qwntvw525dww0qnpnx",
      "account_rdx169z44u9avlmqfkshpeav32p8sg955zsa4d8vs2qsy3ruey2p3xer7g",
    ],
  },
  robinhood: {
    owners: [
      "0x88d25c861938a91af4ad57ad964a8fcc6c6351d3",
      "0xd0a1f16bf2010985d861671293420d61f1d9130a",
    ],
  },
  ronin: {
    owners: ["0xc5d17e2ce4f4abf69b4459a76c29b53039ddd3af"],
  },
  rvn: {
    owners: [
      "RTacWkAJvtvq9bZ6b1qopgCTkQJG9KS4Kq",
      "RMKd7jAm9y682pLc6QiHSUFTxZReSRKZfe",
      "RL5kW97jQnDkSMTgvK2RgFwvqJXCdh5XaP",
    ],
  },
  scroll: {
    owners: [
      "0xc968424cc26ba4e4a72f5754b17dac2474e42a6c",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  secret: {
    owners: [
      "secret1vn87zv6qwmxmqpf6mzlskp9pkp8dh0zxd23sj7",
      "secret1n2y70u8za3gl505zlsjavdve88xr5ehdfkkhre",
      "secret18mtxm24tr3puw2jug2xw75xag9c4zdk6pk7ttp",
      "secret18wpvqfu9g0n8x3ysu72fcdtwz025tvg7m9y4rq",
      "secret1uer4mwcq2vlt8l23ncwyjj70mug5pzx8gackej",
    ],
  },
  sei: {
    owners: [
      "0x40c1d64abc82a57c744bc501a9e1ed6053723d4e",
      "0xd25b428933ee92223e54fa53fbc87c7079efa5cd",
      "0x2403384a45edc33582ca845867828f2394987bde",
      "0x151a38d1cbbd06656c01d15d40c6c99d68ea0624",
      "0xe11aea8b65b5b8b381fde8131b074fc6cf7c60cc",
    ],
  },
  somnia: {
    owners: [
      "0xdb8aeaaca68689bdbb78419810788a3efc596e53",
      "0x1f083d6648a5d8e10bde3d3c4a864f7449e82915",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  sonic: {
    owners: [
      "0x2677c4c8757da1857cc7cc4071e0e0dd32ccb975",
      "0x17a30350771d02409046a683b18fe1c13ccfc4a8",
      "0xfad35b5b1fc6733c78a0899623dd5951bf35b8e3",
      "0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  stable: {
    owners: [
      "0x7989056f8d7572548718ad9ed948ca6b32fa7255",
      "0xa88efc5803b68fc619267bd300feeb777728cbcc",
      "0x86f015821e62e954d75786bf19de585dcf9cf2d9",
      "0xfb5b76d76d11a88497cc58d539e384c8a7a5748c",
      "0xc88b2bd041809a79abbecd04037f3c0570cffb1e",
    ],
  },
  stacks: {
    owners: [
      "SM35H18GNE8MEB1TS3QS09Y2ESQY6GM2219GG670S",
      "SP2KC7WYC3JF2DAE4NE3SWZBMTYGZC35WREHAGTQM",
      "SM24DPG06S2Y51E95X3PH0VXN5TRT3C5Y32YVRZ4E",
      "SP307BHDXSX759Z2XFAM405REWVFJK05HKG7BWRQB",
      "SPGZRPG97X81CZE5AJAN4PYS4NFDG1Z1K4Z2RXNT",
      "SP3VQ46Q89ASA5994CES2P0SQDK4BQZ6EKG0845CX",
      "SP2G4JFB3WWBWPVGEDNBTMEVJB6DNDR468G0S03AX",
    ],
  },
  stellar: {
    owners: [
      "GCUAZB7ELECT4IVTNXYIDL4BVTJCNBAMX7MZLV4SOQ52Y6XOFVMOHBTB",
      "GDD6POABV35RYNBQJK2CPJV2XZR6VXZ2F3KSRGVKIKQOKZO4NIRZP226",
      "GCXZDLDI4BO3RHIYBS22RZXB5LGRRLTZUSPG6ANQQ36TVL2ASHC4ONZO",
      "GA7DVZITWRP3RE2FC42H4WGJKOF6JF2PZIDNCRFS62CB6JJRWFFUNDH5",
      "GCI6IKZN5OK64U5J5CC3A3QGILRROJIOK3LTQS7V2UHT7PKJ2NJSFCDB",
      "GBBTDPPE5K7PHVAZZQOT6JME4AYZ4UQM2QK2UJTDIANC6EDPACWBHIU6",
    ],
  },
  stratis: {
    owners: [
      "0xd6cfb64017339cb97c4b931586da506854826661",
      "0xc02b236723c8d4883804fc961db3740c7d562947",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  sty: {
    owners: [
      "0x5ba37d2e7fc5e408726a29c7373d5eb0e7095bb0",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  supra: {
    owners: [
      "0xa1e2b590380d05d419fa5780dcc9ec3b4f6c5c1f4569178d2e66a84ac6576fb7",
      "0x1a8340ee9c1cff5a061142b35faa7014e9890f4ab7122b175f457be56754f924",
    ],
  },
  taiko: {
    owners: [
      "0xe8f41d2b3ef5216db410ddefdeeec6fcb20fcaff",
      "0x89611a78176571bad8081159a2e048f91cf7ac83",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
    ],
  },
  telos: {
    owners: [
      "0xe66ed8d0709f6a3481b40293b03c9512464c2481",
      "0x48db238b9ceb0a030ad8c0b8ac159cf4565fe586",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  terra: {
    owners: [
      "terra1chq5ps8yya004gsw4xz62pd4psr5hafe7kdt6d",
      "terra1xv8sr6u5pxpqq5pw6k0w34cn8gsqdr2k9svg67",
      "terra1v74a5u6qsjuj4gu6at9yn4p35uctcz82f02fau",
      "terra1zeu0zc22mssqtd9jp9cxrr8du8tuulxjearh5v",
      "terra1hmlj3nx00ntk8ja0lj6et9uxq2mxnzzvasrg3p",
    ],
  },
  terra2: {
    owners: [
      "terra1wkzypd82gk7azdrxrj7xml0gr8sf3lzwlsja37",
      "terra172frnpllrra3855emkrmdusmravgr3mvp290ca",
      "terra1hkax4gqc4jx95ukafnsyyw720c26p82cmrmgny",
      "terra1zwu8mhagk935ad9pfqnqrggrrt26mmqspj7rxz",
      "terra1tr2l367x265yl8weqakdkjvgpwdpm69zv2xpnl",
      "terra1chq5ps8yya004gsw4xz62pd4psr5hafe7kdt6d",
      "terra1ew8srns90g9lnqm3kf2u9zgn5jzunwz9ulgmx0",
    ],
  },
  tezos: {
    owners: [
      "tz1bysy7fby4rdaptXPYc7XP3C7EpqVVVWo5",
      "tz1Q7RpsRvbozbY5zuhv5AaXuoqeXrcFAtgF",
      "tz1csYsqZ6Bp3PFuuPvd1kSdtw7zNM2TWhbQ",
    ],
  },
  theta: {
    owners: [
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
      "0x5a722d3c43e5e5cec5dd91391594309829ae0a24",
      "0x019f29ad016ae793607a3dff0f1b9f01fb793378",
    ],
  },
  thorchain: {
    owners: [
      "thor1xngk03ck0u960nlepy9256e0q7r7l43mnd5thk",
      "thor17nswsvke389v582ec9navcpyylfdssds67u6ul",
      "thor1q4p5gq9xp52jyqma0tvgn5dt47trs8um8zcr35",
      "thor13zye660dphuvcnuwwwjwcdx9mz83peteek7s75",
      "thor1vm7duapvw48hcat699858sykmsk9dxltjdqyly",
    ],
  },
  vana: {
    owners: ["0x68a0e55a076bcdbcbf38ee70b4e6f6f6f45d7c31"],
  },
  vechain: {
    owners: [
      "0x1729b0db1bb51bc568a6a8d53711abfb2cdc4716",
      "0x930f4c41078e0bde990073a1d6b1e4c09145870f",
      "0x0452042e4f2f41ca85cc463ea9a9e452214f2beb",
      "0x3fb604a9b40e4c1abf0eb91a67bb90fc06dfb27e",
    ],
  },
  waves: {
    owners: [
      "3P3L9SrRCGbJxxtTdVrzoDL78pk2cqDc2Jz",
      "3PMc2KUpP1owXEDo4hsdMGgtt5G6mgLTVv6",
      "3P3R4whZjPMjLPwdTwSLWEvA7ofPvDsQgfb",
    ],
  },
  wc: {
    owners: [
      "0x1ab66b75cf4a326168f2780bd354222faef9b9a2",
      "0x538f4c206853212c5681512957018a153578ab42",
    ],
  },
  wemix: {
    owners: [
      "0x5b389714c274c2c1fe0aaf9760f9415fedc3eb36",
      "0x0d55f8d93c69aaf5bd361ec75f1ac53180d19609",
      "0xd6216fc19db775df9774a6e33526131da7d19a2c",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  xdc: {
    owners: [
      "0xdab9de282d519165326fad804f6acf6fd0e61840",
      "0xbc7dbbd20b5416967bcea28bf4f09d4c66107175",
      "0xf418bc9c19a1d78fb0a7a26935c2068cce50d7fd",
      "0x4e5d2ddf1c5060a64d70eec1731710f49a76d2bf",
      "0x68aeda45a5c9307b8fcb6919dd17ff64840c1e94",
    ],
  },
  xion: {
    owners: ["xion1gfv29l274e8dy9dkur6aqh9ert96gfxqwdexp0"],
  },
  zcash: {
    owners: [
      "t3U4CFPtnLoAjL9fSsQE2PMc49RAGbmfn5n",
      "t1YjihZAttWbUQJYGgwhEvdGJLbTVcVGGez",
      "t1YQV51DKzKP63xJcynXuRfryMjfmgTJ7Jc",
      "t1f4ohjSbYLpXHGMVs5hyPrNXkU8aCaRXf4",
    ],
  },
  zeta: {
    owners: [
      "0x1870897f168ec0acdbd326cc6a76b1bdc4b6b670",
      "0x2933782b5a8d72f2754103d1489614f29bfa4625",
    ],
  },
  zigchain: {
    owners: [
      "zig1455xp0cwksuug8jclrajrt3x0yzf6v08dpx0nf",
      "zig1lg7n0dh387mcv8zvhyyuaha4dm47fnq34vpz40",
    ],
  },
  zilliqa: {
    owners: [
      "0xc59b1517779c68776e5b126ccfc8738ab409a29f",
      "0xcfd030ef4c58fc573a61668fa3c8e295738c9a1b",
    ],
  },
};

module.exports = mergeExports([
  cexExports(config),
  {
    ethereum: {
      tvl: getStakedEthTVL({
        withdrawalAddress: "0x9f4cf329f4cf376b7aded854d6054859dd102a2a",
        size: 200,
        sleepTime: 20_000,
        proxy: true,
      }),
    },
  },
]);
Object.defineProperty(module.exports, '_rawConfig', { value: config, enumerable: false })
