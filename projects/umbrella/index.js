const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const UMB_eth = "0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2";
const UMB_WETH_UNIV2 = "0xB1BbeEa2dA2905E6B0A30203aEf55c399C53D042";


const UMB_bsc = "0x846F52020749715F02AEf25b5d1d65e48945649D";
const UMB_WBNB_PCSV2 = "0xFfD8eEFb9F0Ba3C60282fd3E6567A2C78C994266";

const ethPools = [
  '0xDa9A63D77406faa09d265413F4E128B54b5057e0', '0x5A2697C772d6062Eb2005e84547Ec4a36cCb3B52', '0x2d9D79B3189377449aB2AA4bBD2cd2651e0b85BE',
];

const ethLpPools = [
  '0x885EbCF6C2918BEE4A2591dce76da70e724f9a8E', '0xa67cbdAd80C34e50F5DE96730f658910f52b2F8c', '0xB67D91E38fbA6CfCb693d3f4598F8bd1e6e68AE3',
];

const bscPools = [
  '0x1541A01c407dCf88f32659D2C4A21Bb5763Fd2B4', '0x53Fa13Fa6c803d5fF6bDAe06bf6Bc12EdF1e343d', '0x55881395d209397b0c00bCeBd88abC1386f7aBe7',
];

const bscLpPools = [
  '0x8c7e186ce08F1f2585193b1c10799F42966BD7FF', '0xdCbcDb9bFAD7B0A08306aF10Aa11c3c3b6470921', '0x6Ff6B943D20B611E81a581c1E7951A6Dc0AC3455',
];


module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(ethPools, UMB_eth),
    pool2: pool2(ethLpPools, UMB_WETH_UNIV2),
  },
  bsc: {
    staking: staking(bscPools, UMB_bsc,),
    pool2: pool2(bscLpPools, UMB_WBNB_PCSV2,),
  },
  methodology: "Counts liquidty on the staking pools (v1, v2 and v3) on Eth and BSC (https://staking.umb.network/)",
};