const ADDRESSES = require('../helper/coreAssets.json')

const PirexCVX = "0x35A398425d9f1029021A92bc3d2557D42C8588D7";
const pxGMX = "0x9a592b4539e22eeb8b2a3df679d572c7712ef999";
const pxGLP = "0x0eac365e4d7de0e293078bd771ba7d0ba9a4c892"
const GMX = ADDRESSES.arbitrum.GMX;
const GLP = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";
const BTRFLY = "0xc55126051B22eBb829D00368f4B12Bde432de5Da";
const pxBTRFLY = "0x10978Db3885bA79Bf1Bc823E108085FB88e6F02f";

async function ethereum(api) {
  const { locked: lockedCVX } = await api.call({
    abi: "function balances(address) view returns (uint112 locked, uint112 boosted, uint32 nextUnlockIndex)",
    target: ADDRESSES.ethereum.vlCVX,
    params: [PirexCVX],
  });
  const pxBTRFLYSupply = await api.call({ target: pxBTRFLY, abi: 'erc20:totalSupply', });
  api.add(ADDRESSES.ethereum.CVX, lockedCVX);
  api.add(BTRFLY, pxBTRFLYSupply);
}

async function arbitrum(api) {
  const [pxGMXSupply, pxGLPSupply] = await api.multiCall({ calls: [pxGMX, pxGLP], abi: 'erc20:totalSupply', })

  api.add(GMX, pxGMXSupply);
  api.add(GLP, pxGLPSupply);
}

module.exports = {
  methodology: "TVL = Total value of tokens locked in Pirex Vaults",
  ethereum: {
    tvl: ethereum,
  },
  arbitrum: {
    tvl: arbitrum,
  },
};
