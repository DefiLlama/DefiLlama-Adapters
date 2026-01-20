const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const ADA_ADDRESSES = [
  "addr1qyn4lcv64v40a4667j7x3gjmc4wt32dejakwnwxx2geyemp8tlse42e2lmt44a9udz39h32uhz5mn9mvaxuvv53jfnkqc00vz5",
  "addr1vx6h5wyagdu70ecth9xmcnlnq9jct42nj4mm4ej3fmrcmvgaycmzh",
  "addr1vxwzm0hd3vpsxg9p7mm386ahul8l08jvq2v6cm7v5gg9p3cx8al02"
];

module.exports = {
  methodology: "ADA collateral backing CBADA https://www.coinbase.com/cbada/proof-of-reserves",
  cardano: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: ADA_ADDRESSES }),
    ]),
  },
};