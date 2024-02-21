const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x12ca45FEd7998ba0E56f52D678823A508BA9A99E",
        "0x5789C571552b4820BfA64eFB6F0CaD80fD2A9Bca",
        "0x1a0EBB8B15c61879a8e8DA7817Bb94374A7c4007",
        "0x24DE2762ccC97e44CCeA68CaF8270dA1820b3aa6",
        "0x512218CB6120F45C15720F875d02fC0a07b4b1a6",
        "0xe523Fc253BcdEA8373E030ee66e00c6864776d70"
    ],
  },
}

module.exports = treasuryExports(config)