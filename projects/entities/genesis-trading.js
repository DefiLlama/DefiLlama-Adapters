const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x35b517039f75df2469Af8A329b75DfE215b33790",
        "0x16ADa39D140699D9a1934F05DdCf78612f342b3e",
        "0x7a59384e2bD2D75fb3e83c486b61921fa517EB27",
        "0x2095feFc0cf268E58087A43DBf9733532eD51B25",
        "0xF65D8e83396e66340743D852db8eb116BeC0027a",
        "0xBF4731191af7029f7D669D3e337a0063D1E008a3",
        "0x6d21266DfcF5541BEE9F67c4837AAa72b3BF9303",
        "0xd628f7c481c7Dd87F674870BEc5D7A311Fb1D9A2",
        "0xaF641E29C4730530d9428A37C5934B00a73624A9",
        "0x7DC47f4C227e22DA6C81fCB4c253d1DC18BeC4A3"
    ],
  },
  avax: {
    owners: [
        "0xd628f7c481c7dd87f674870bec5d7a311fb1d9a2",
    ],
  },
}

module.exports = treasuryExports(config)