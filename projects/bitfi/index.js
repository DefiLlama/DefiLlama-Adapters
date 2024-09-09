const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const owners = [
'1JA46eiDpfx589wawn5RvtEXgwc518QfhZ',
'368vZZKUWDFZRLWMFNRJzHo1HnibNeAJir',
'33hE9Wq65kjbiLsGD1NYwwNatP6hbsZv5H',
'32GU8Jux7SbsEbaAaLUnEQmc6JemLF6BUb',
'3CP5WJ2JSLCew7SETWUe5FxpBGrekMBiwk',
'39Fvw2Ho1fEkyDsos5sNTN5iMJZKzTL526',
'3Kptt4TZZRcjuGH8ikoQ8mV1TVxq45dnuS',
'335DRGzLLG2tu4H4PnFBHYAwcj5pvV8zei',
'3G4sMXWAAVTvTXTksr8u9zuu7W8RKsicEz',
'bc1qu4ru2sph5jatscx5xuf0ttka36yvuql7hl5h4c',
'bc1q3smt9ut40eld6tgn42sdlp9yrx98s90unqw3pl',
'bc1q3q7afjarz7l6v49538qs2prffhtawf38ss85k8',
'bc1qw4vp94e9egkaxc04qsu5z9aq5pqpku2p6pzer8',
'bc1qqg3cdyadq25zn99sdprr4lgpsxg2za998eygy8',
'bc1q6dtp7ayaj5k2zv0z5ayhkdsvmtvdqgyaa9zs53',
'bc1qaajdlp5yrj5f77wq2ndtfqnmsamvvxhpy95662zkzykn9qhvdgys580hcs',
'bc1qcmmkxfp2rawrp6yx55rez9jcqdnxtam8jhu2v2d9kz46upf948wq2usauv',
]

module.exports = {
  methodology: "BTC on btc chain",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
    ]),
  },
};
