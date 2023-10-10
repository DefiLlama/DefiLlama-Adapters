const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({
    chain: 'base',
    masterchef: '0x3eAB0C9716b0aA98CdC4c3ae317d69dE301ef247',
    useDefaultCoreAssets: true,
    tokens: ['0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E'],
    lps: ['0xeAA13b4f85A98E6CcaF65606361BD590e98DE2Cb']
})