const { compoundExports2 } = require("../helper/compound");

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  op_bnb: compoundExports2({ comptroller: "0x71ac0e9A7113130280040d0189d0556f45a8CBB5", cether: "0x7e844423510A5081DE839e600F7960C7cE84eb82", }),
  bsc: compoundExports2({ comptroller: "0x57E09c96DAEE58B77dc771B017de015C38060173", cether: "0x5fcea94b96858048433359bb5278a402363328c3", }),
  bob: compoundExports2({ 
    comptroller: "0xcD7C4F508652f33295F0aEd075936Cd95A4D2911",
    cether: '0xd7c6cc5aef7396182c5d7ebdac66ff674f3ddcf4',
    blacklistedTokens: [
      '0xecf21b335B41f9d5A89f6186A99c19a3c467871f',
    ],
  }),
  rsk:  compoundExports2({ comptroller: "0x2eea8fbA494d5008ba72f80E0091Cc74dB5f9926", cether: '0x8F9958ec0FeeccCf0feC871B7bBB3D8d0B7A4D3c' }),
  core: compoundExports2({ comptroller: "0xaba65b87eBEdB2D753b37AeCECD1E168341eE0DD", cether: '0xb57A4b3ccE8d999A1e6B0357c0a31C3808401B42' }),
  bsquared: compoundExports2({ comptroller: "0x69a6B3B96b26a15A588081Df17F46d61f625741c", cether: '0xEff5cD04B461247F5008b35074F45Ba0f0b11eFf' }),
};
