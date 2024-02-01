const ADDRESSES = require('../helper/coreAssets.json')
const { tombTvl } = require("../helper/tomb");
const FUSE_ON_ETH = "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d";
const FUSE_ON_FUSE = ADDRESSES.fuse.WFUSE;
const AMP = "0x2b09179D26FdDB27a24ee25328890791c7A984c2".toLowerCase();
const CURRENT = "0x3B1292FEf70C3F9Fb933DD2e2F4B734DcB35648d".toLowerCase();

const fuseLPs = [
  "0x48515f859e44161bf67ae610a7c83f53b0048713",
  "0xaa33219a463635097fa8d603e5436ad08dd948fc",
];

const rewardPool = "0x8Cdc3584B455b49634b9272247AD2AccEef58c98".toLowerCase();
const masonry = "0x335C392DB4F0AD43f782B0646959E41FC1134350".toLowerCase();
const genesisBlock = 1650700800;

const transform = (addr) => {
  if (addr.toLowerCase() === FUSE_ON_FUSE.toLowerCase()) return FUSE_ON_ETH;
  return "fuse:" + addr;
};

module.exports = {
  methodology: "Pool2 deposits consist of AMP/FUSE and CURRENT/FUSE LP tokens deposits while the staking TVL consists of the CURRENT tokens locked within the Masonry contract, priced using Fuse on Ethereum mainnet.",
  start: genesisBlock,
  ...tombTvl(
    AMP,
    CURRENT,
    rewardPool,
    masonry,
    fuseLPs,
    "fuse",
    transform,
    false,
    fuseLPs[1]
  ),
};
