const { ohmTvl } = require("../helper/ohm");

const treasury = "0xfbAD41e4Dd040BC80c89FcC6E90d152A746139aF";
const dai = "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844";
const frax = "0x1a93b23281cc1cde4c4741353f3064709a16197d";
const mim = "0x0caE51e1032e8461f4806e26332c030E34De3aDb";

// https://rome.gitbook.io/romedao/contract-addresses/all-contracts
module.exports = ohmTvl(
  treasury,
  [
    [dai, false],
    [frax, false],
    [mim, false],
    ["0x069C2065100b4D3D982383f7Ef3EcD1b95C05894", true],
  ],
  "moonriver",
  "0x6f7D019502e17F1ef24AC67a260c65Dd23b759f1",
  "0x4a436073552044D5f2f49B176853ad3Ad473d9d6",
  (addr) => `moonriver:${addr}`
);
