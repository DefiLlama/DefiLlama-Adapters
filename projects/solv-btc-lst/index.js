const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/sumTokens");

const owners = [
  "bc1qpq80t9phhkducn2p2mgg4vrnsp8p5q3dm9t9hjyqe7unvu5t2fesvy4rzr", //Solv node
  "bc1qjg8234tdlsg3m5hm7fqtc5xe4vdv5fn353vh404qlz7s7q8drevqapsz67", //Dao Validator 2
  "bc1ql45htw479z2jxdhn3lwtcjp452hn2jtajyqc8ps6ac6jvgk563fq3sj3jp", //Satoshi App
  "bc1qwukfufwmq437kry9xcfxmv5sv7vnq9scqyhfcrudt3xghdwvqmuqennqpc", //Infstone
  "bc1q8dyhmkmzpug3c9dcj45ycy2sa4aetsh53ssd7wk24pzv7ufcar8qywhvxe", //Dao Validator 1
  "bc1qn95r70zlw4ylyp6luytg3j5hfnmpds8vcle6a4svwdghjqzahzssrqyzfw", //Dao Validator 6
  "bc1q7j4hlsyv7fcze74fa56g8nxpegynze03wmqrq6hwd83qg3vpz8xsv4u2y8", //Dao Mining Pool 4
];

module.exports = {
  methodology: "Staking tokens via Babylon counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owners })]),
  }}