const { cexExports } = require("../helper/cex");

const config = {
  ethereum: {
    owners: [
      "0x4200BDaD267F9280beBc1F4dFa30B7B094BfdBAa",
      "0xf2067abfab8bc621211935431519d41825d2f344",
    ],
  },
  bsc: {
    owners: [
      "0x20664cacdcfeb318c8e145a03c75e34bc2cc4a3b",
      "0x40C847f59600286cFEE8d6De6640E967a7824d57",
    ],
  },
  tron: {
    owners: [
      "TEvxwK7ddcYvwfm4R7MBA6p4h8rzicWCz1",
    ],
  },
  bitcoin: {
    owners: ["bc1qln4vr73lt3828awfw5aj0ssvtwlnsamj2e4c26"],
  },
  polygon: {
    owners: ["0x65e1615eFC11c63E15c00aC4447C56aF294135a9"],
  },
  solana: {
    owners: ["DVoATqaFVS98WwbGAYvBxUAX88bWTrW9Ej2mgFJ8Gm64"],
  },
  arbitrum: {
    owners: ["0x2A6e62f040a7f0B830847Da101539A7EEf7bB040"],
  },
  avax: {
    owners: ["0x1e14f71C96262C45167465Ab380b684d652377D9"],
  },
  doge: {
    owners: ["DHqeB3crF4UCdoQcsCWv93x5m3VmM1CFJd"],
  },
};

module.exports = cexExports(config);
