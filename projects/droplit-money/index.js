const { tombTvl } = require("../helper/tomb");

const lit = "0x79B2bc95344eFe31cb6a7B0Cf8A843a5eE125dFf";
const gds = "0x5Abf65C1d152244c6Bd4ad0a5eB92DB00e403BdB";
const boardroom = "0x9D76Db596D281897F3ce842475b7BD6Ea2580b4b";
const rewardPool = "0x79D7c1a12c4dE91C487A87602478C5bc19b3aa7c";
const lps = [
  "0xa1E137dED898058af3a09caC599D50D1D3ac0ABc", // GDS-BUSD LP
  "0x4F8b3ee2421cac4743356e8207209eFf34B51ebe", // LIT-BUSD LP
  "0x851b0a2514A56dD780480ab47268794E3d3D947D", // LIT-GDS LP
  "0x7661D626b4c588157960724528a8f3C4a1de5F36", // LIT-WBNB LP
];

module.exports = {
  misrepresentedTokens: true,
  ...tombTvl(lit, gds, rewardPool, boardroom,lps,"bsc",undefined,false , "0xa1E137dED898058af3a09caC599D50D1D3ac0ABc"
  ),
};
