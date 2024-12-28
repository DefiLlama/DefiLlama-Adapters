const ADDRESSES = require("../helper/coreAssets.json");

const stFIL = "0x3C3501E6c353DbaEDDFA90376975Ce7aCe4Ac7a8";
const WFIL = ADDRESSES.filecoin.WFIL;

const tvl = async (api) => {
    const stFILSupply = await api.call({ target: stFIL, abi: 'erc20:totalSupply' })
    api.add(WFIL, stFILSupply)
};

module.exports = {
  methodology: 'stFIL tokens are minted upon filecoin deposit at 1:1 ratio',
  filecoin: {
    tvl,
  },
};
