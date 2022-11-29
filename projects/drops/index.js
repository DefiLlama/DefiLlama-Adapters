const { usdCompoundExports } = require("../helper/compound")
const { mergeExports, } = require("../helper/utils")
const { staking, } = require("../helper/staking")
const { pool2, } = require("../helper/pool2")

const tokensAddress = {
  masterchef: "0x8A78011bf2c42df82cC05F198109Ea024B554df9",
  drop: '0x6bB61215298F296C55b19Ad842D3Df69021DA2ef',
  ndr: '0x739763a258640919981F9bA610AE65492455bE53',
  lp: '0x00aa1c57e894c4010fe44cb840ae56432d7ea1d1',
};

module.exports = mergeExports([{
  ethereum: {
    staking: staking(tokensAddress.masterchef, tokensAddress.drop),
    pool2: pool2(tokensAddress.masterchef, tokensAddress.lp),
  }
}, {
  ethereum: {
    staking: staking(tokensAddress.masterchef, tokensAddress.ndr),
  }
},
{
  ethereum: usdCompoundExports("0x7312a3bc8733b068989ef44bac6344f07cfcde7f", undefined, '0x05231980914B702083B9Ac08002325654F6eb95B'),
},
{
  ethereum: usdCompoundExports("0x79b56CB219901DBF42bB5951a0eDF27465F96206", undefined, '0x4aE7413182849D062B72518928a4b2DE87F0e411'),
},
{
  ethereum: usdCompoundExports("0xB70FB69a522ed8D4613C4C720F91F93a836EE2f5", undefined, '0xD72929e284E8bc2f7458A6302bE961B91bccB339'),
},
{
  ethereum: usdCompoundExports("0x9dEb56b9DD04822924B90ad15d01EE50415f8bC7", undefined, '0x0a1EF7feD1B691253F9367daf682BA08A9D2fD9C'),
},
{
  ethereum: usdCompoundExports("0x3903E6EcD8bc610D5a01061B1Dc31affD21F81C6", undefined, '0x588C13e685e44B22DC6647937481C816E5FeE086'),
},
])
