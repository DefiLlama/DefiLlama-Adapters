const ADDRESSES = require("../helper/coreAssets.json");

const stFIL = "0x3C3501E6c353DbaEDDFA90376975Ce7aCe4Ac7a8";
const WFIL = ADDRESSES.filecoin.WFIL;

const tvl = async (api) => {
    const stFILSupply = await api.call({ target: stFIL, abi: 'erc20:totalSupply' })
    api.add(WFIL, stFILSupply)
};

module.exports = {
  methodology: 'stFIL tokens are minted upon filecoin deposit at 1:1 ratio',
  // The team was detained on 2024-04-02 and the pool's FIL was moved to an address under police
  // control from 2024-04-03; lessors have not been able to withdraw since. Depositors are being
  // repaid by the Hanshou police off-chain. See https://hub.fil.org/stfil-news
  deadFrom: '2024-04-03',
  hallmarks: [
    ['2024-04-03', 'Team detained, pool FIL moved to an address under police control'],
  ],
  filecoin: {
    tvl,
  },
};
