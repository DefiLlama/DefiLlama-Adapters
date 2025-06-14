const methodologies = require('../helper/methodologies');
const { compoundExports2 } = require('../helper/compound');

const qoreComptroller = "0xf70314eb9c7fe7d88e6af5aa7f898b3a162dcd48";

const qTokensKlaytn = [
  "0xf6FB6Ce9dcc5Dac5BE99503B44630FfF1f24b1EC", // qKLAY
  "0xE61688286f169A88189E6Fbe5478B5164723B14A", // qKUSDT
  "0xb3e0030557CeC1CEf43062F71c2bE3b5f92f1B7b", // qKETH
  "0x19e1e58d9EdFdDc35D11bEa53BCcf8Eb1425Bf0D", // qKWBTC
  "0x0EaAAEB0623f6E263d020390e01d00a334EB531E", // QKDAI
  "0xC1c3a6b591a493c01B1330ee744d2aF01F70EA32", // QKSP
  "0x99dac5dF97eB189Cd244c5bfC8984f916f0eb4B0", // qWEMIX
  "0x3dB032090A06e3dEaC905543C0AcC92B8f827a70", // qKQBT
];

async function tvlKlaytn(api) {
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: qTokensKlaytn })
  return api.sumTokens({ tokensAndOwners2: [tokens, qTokensKlaytn], })
}

module.exports = {
  // hallmarks: [
  //   [1643241600, "tokenAddress hack"]
  // ],
  methodology: methodologies.lendingMarket,
  bsc: {
    tvl: compoundExports2({ comptroller: qoreComptroller, abis: { getAllMarkets: 'address[]:allMarkets' } }).tvl,
    //borrowed: tvl(true), // hacked
  },
  klaytn: {
    tvl: tvlKlaytn,
  },
};
