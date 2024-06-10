const { sumTokensExport } = require("../helper/sumTokens");

const LorenzoOwners = [
    "bc1pzd6luyardlle9f7lul2y8fl72c22p6vxspc4k4g4gzgjf8975s0sr042yt",
    "bc1p7agkadaau66jtva9n8k5pg3lsctuyqur8a2l5y9hzwqkh5nlmd0skuhws3",
    "bc1qaf6laj9m7jteztyz4lulrtcjtpusfcfnd7r7xn",
    "bc1qf6cj2z2e2mzuvfrl80vgt53k7jc2vf36ckahgy",
    "bc1q5hc68n6krnzgzswf7rknha2aqxzrzup4vlhce8",
    "bc1qpxpmr3zdjulqnwa3jdvm83tpaek6dv3kc75ms7",
    "bc1qaml9d9mqgfhsfuaa2ymutdl4psj8c2undx9n72",
    "bc1qutgngqyrflxrfmk9k28ucvq0s2v8a43nwfwv02",
    "bc1qrx3fpr5j6sprxett45c2kl9p4pajyxep0mapfd",
    "bc1q00t2ntm46c2nfvcer6ukj6npaxjurujthse4qq",
    "bc1q3pzhncle68gct6me08kn5kf9awkevt6ettwrmg",
    "bc1qw6cvwx8ajprmp2lzkhrsps2qx4k9r2pj4xj98x"
];

module.exports = {
  methodology: "Lorenzo, As the Bitcoin Liquidity Finance Layer",
  bitcoin: {
      tvl: sumTokensExport({ owners : LorenzoOwners }),
  }
};