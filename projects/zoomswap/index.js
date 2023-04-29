const ADDRESSES = require('../helper/coreAssets.json')
const { masterChefExports, } = require("../helper/masterchef")
const { mergeExports, } = require("../helper/utils")

const token1 = ADDRESSES.iotex.ZOOM;
const token2 = "0xf87aed04889a1dd0159d9C22B0D57b345Ab16dDD";
const masterchef1 = "0x92F1a54835436Ad1858018f11d017fCE31756C17";
const masterchef2 = "0x1ba725d2ba56482f11fee3642f1c739d25018e4d";

module.exports = mergeExports([
  masterChefExports(masterchef1, "iotex", token1),
  masterChefExports(masterchef2, "iotex", token2)
])
