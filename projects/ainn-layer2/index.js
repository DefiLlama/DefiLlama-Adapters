const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const BTCOwners = [
  "bc1q6dtp7ayaj5k2zv0z5ayhkdsvmtvdqgyaa9zs53",
  "3H8cmLndtkBs7kiHByhHAddTzy8taUwYPt",
  "bc1pepsapf26n8y2f4uftlmhy60ksghx6rqlxdcj4uacfqrkcg6pmncs52rzuu",
  "bc1qcmmkxfp2rawrp6yx55rez9jcqdnxtam8jhu2v2d9kz46upf948wq2usauv",
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
];


module.exports = {
  methodology: "Staking tokens via AINN Layer2 Dataset counts as TVL.",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: BTCOwners }),
    ]),
  },
  zklink: {
    tvl: sumTokensExport({
      owners: ["0xc698c23d7cDE4203EafD8F45d8bab8fA86D413d1"],
      tokens: ["0xEbc45Ef3B6D7E31573DAa9BE81825624725939f9"] //wbtc
    }),
  },
};
