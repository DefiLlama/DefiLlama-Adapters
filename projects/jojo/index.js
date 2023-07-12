//20230428 initial release: simple and clear
//20230606 update: add chain: zkSync Era
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

//zkSync Era
const ownerEra = '0x47eAD228547db8397398C1D3aAfd0847CBEbddeC'; // contract address
const tokensEra = [
    ADDRESSES.era.USDC, // USDC
];

module.exports = {
    methodology: "TVL of JOJO",
    start: 1687017600,
    era: {
        tvl: sumTokensExport({ owner:ownerEra, tokens:tokensEra })
    }
};
