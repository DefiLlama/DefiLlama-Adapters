const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  avax: {
    owners: [
      "0x55d440048abe8b75bfd286edcbe6de14fe9ffff9",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  bsc: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0x9A768eCB4aadd70A3AA4A0F9748D7c9A98f14e4D",
      "0xaBa3002AB1597433bA79aBc48eeAd54DC10A45F2",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.indodax,
  },
  arbitrum: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  algorand: {
    owners: [
      "AXKCE4MXLRGFTUBQY7PMQDBIDNNFRKBERZN2RCYL7RMH6NAEX5SWAERFYY",
      "E6X462WQOSYOTSJD7BKPESAZPYFQRTQEJVRP2AWF3QWGYDG2J3VWJMFR4E",
      "IAVWTKTCLQOGRGGNJ2DCWEASXD5K247OE3WKGIVTKGNPRURQXBZILTEXEU",
      "UIGJ7VRNBLCLLXH6VRVUJRSHWJVCCPK6UURXZAY5POJYAR43N75ZLKRD7M",
      "DXMMSEZGA2BLSV5H5KPMXLYEHQOYCRTFRYEBZW2ASK2PNT73GFEN3DFGMY"
    ],
  },
  base: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  cardano: {
    owners: [
      "addr1q8dgvzrpa385vgs3wr9p3r0ns66327gwpgk6u0y6qp3nzjj3a3hmh3hw4kjhyc2tr2pt6m6jcl2t90s8nkpn6hcx9rrsl9ydew",
      "addr1qxd2v6emtjaf53h8qywdux0jrdsny78djgkjvku6c2e3rk8d66hu9tv6g6ugspljr46mtytsyq7hsp8x80z3lcrvz7nq8lrr4x",
      "addr1q9nj5y9yuth0yauwjcgl5dws56m652c3hvxnwkhc0pmhuaulecprn0pq0jlf6jk3spp6aheq2m9fpvuj6ehxufjkpm2sk3apes",
      "DdzFFzCqrht2yRiXvv9szgN6PY1wbVtnvDRR4zzREgRCJJSChkXbaw2o133uVC29A7NgzXfd8deXpZRgjLvouvTa7R8gYKBDgXEW7JS9",
      "addr1qyuns2krdrf9w630ae6whdrwh6p4n0qq9hetk0ld6atr25whmelaqedvtfllmx64r0vngz2dwzkzhdjut4h8p78s7rxq67cw9m"
    ],
  },
  eos: {
    owners: ["indodaxaccnt", "indodaxwarm1", "ckolov1tdndk", "amckmpy2ei4x"],
  },
  ethereum: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x67f88fd04336a6c9f51e30e829689916b0b687f6",
      "0x7b8ffA4fE43d1B476cFf9D0787FC0019Ca54e421",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xa89aC9db17d4EA6da9f5C4bDFAe5454bf5B14A3f",
      "0xC07582a7d47AA748DE45b526839A4eD505C6C370",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0xFfB34a8e0F269073BD58659EBF1670B718f95F16",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  linea: {
    owners: ["0x26B137B3B7A308Ed812F3120E453521c3ce91d82", "0x91Dca37856240E5e1906222ec79278b16420Dc92"],
  },
  litecoin: {
    owners: [
      "ltc1qdtflxzvfem4ltwhn3l3zzajwgu6v8y9syrkm46",
      "ltc1qzpxlrscqdzlu0qgdwegkqyedmr4lv55kelcck3",
      "ltc1q8lsp224k25umn5h8thygqyvvunwgs7nv24ekxz",
      "ltc1qeum4r6y35hx5lttql2zp7vw7y0kg7cu7lcwaeh",
      "MMq4MoGWirr7GWbAwAY9weRjjJ4jJoMREe"
    ],
  },
  optimism: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
      "0x51836A753E344257B361519E948ffCAF5fb8d521"
    ],
  },
  polygon: {
    owners: [
      "0x3c02290922a3618a4646e3bbca65853ea45fe7c6",
      "0x51836a753e344257b361519e948ffcaf5fb8d521",
      "0x91Dca37856240E5e1906222ec79278b16420Dc92",
      "0xF077b0289016CDC8A9AE8196705A37f1AEFA5091",
      "0x26B137B3B7A308Ed812F3120E453521c3ce91d82",
      "0x442689F3F26cBcCc2E288DaEa986b9d67346149a",
    ],
  },
  solana: {
    owners: [
      "4QXXp184iMKjL1ZTLrGtjMFvR2n2YhpUS1WypmzGaYB3",
      "62D255w5Bg6Puq2fcJVdb9KLXAhqDQqQdMAbBRdxobLF",
      "EjtCjDWj3HyL1a4dRritZLTtZrwvD3E1AAzp6evMUmVB",
      "28RWPC6XPxSxUVjd27KiNRtcHVxKtd6cjms7eBcxiqdV",
      "4QuB7hY3H512CLG1orbVrA7HTeXbBYCPxBpNfQ6gs5ru",
      "4gKjjye5GDXR15s1VgB3ZMKVBf97H4DUfAZcst4KSRdW"
    ],
  },
  sui: {
    owners: [
      "0xf0fb50fc82f0468b8c3ab5d7d03e03dd98f7bb46ba8efa4239d8e647643dd58d",
    ],
  },
  stellar: {
    owners: [
      "GB6F7XAPRZYIW6PB6GXPXKTXQ6D6FYBXYUF3ZI7ASBVCZGRIFA26PW5L",
      "GBJ2CSDO755C6U6ZAUEXRARHEX27Q6GPQEMX5EH4DV66GN2SX54AJDYK",
      "GC4KAS6W2YCGJGLP633A6F6AKTCV4WSLMTMIQRSEQE5QRRVKSX7THV6S",
      "GAZQTIWVPRKR7ALBT7TTIBK75YEPEJGHO3VY3K6YOV4WQ5RQ2N3VJNKT",
      "GCCEW36L25SWYLNACCLR3IVV4R2EZ4GON5NQPPZ3UTIWAIQX6XTN4WMG",
    ],
  },
  tron: {
    owners: [
      "TNthBvygp9YYR6FYnYdULUHcpzPBoBa2Em",
      "TSZWxVKQbrZMzRKg7LLzrixF4eNesn7Gy7",
      "TWe5pEnPDetzxgJS4uN26VFg15wWtdcTXc",
      "THRtgADavi2epgFFTi129EYK6cgW1H7YbN",
      "TWQfKZHArjoQob6i7tBxzdtWGbAqRK1Z6x",
      "TWe5pEnPDetzxgJS4uN26VFg15wWtdcTXc"
    ],
  },
};

module.exports = cexExports(config);
