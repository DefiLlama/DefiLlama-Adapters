const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
const wstRoseAbi = require("./wstrose_abi.json");

const wstRose = "0x3cAbbe76Ea8B4e7a2c0a69812CBe671800379eC8";
const wstRoseTrove = "0x57D51c99b7EB39c978c9E4493D74Ea79495999b0";

const balanceChecker = "0x44dD373cfB2ccbF13Eff83558Eec46BdefC7265a";
const roseTrove = "0x9be6f065aFC34ca99e82af0f0BfB9a01E3f919eE";

const abi = {
  "tokenList": "address[]:tokenList",
  "tokenParameters": "function tokenParameters(address) view returns (address rewarder, address strategy, uint256 lastRewardTime, uint256 lastCumulativeReward, uint256 storedPrice, uint256 accSKANVASPerShare, uint256 totalShares, uint256 totalTokens, uint128 multiplier, uint16 withdrawFeeBP)",
  "wstROSE": "function convertToAssets(uint256 shares) public view returns (uint256)",
  "balanceCheck": "function getBalance(address _address) public view returns (uint256)"
};

const transform = {
wstRose:"oasis:" + ADDRESSES.oasis.WROSE
}

async function calcTvl(block, chain, pool2, api) {

  const wstROSEBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: wstRose,
    params: [wstRoseTrove],
    chain: "sapphire",
  });

  const wstROSEConvertedValue = await api.call({
    abi: abi.wstROSE,
    target: wstRose,
    params: [wstROSEBalance],
    chain: chain,
  });
    
  api.add(ADDRESSES.null, wstROSEConvertedValue);

  const ROSEValue = await api.call({
    abi: abi.balanceCheck,
    target: balanceChecker,
    params: [roseTrove],
    chain: chain,
  });                       

  api.add(ADDRESSES.null, ROSEValue);
}

//For reference
async function tokenExportsInermediary() {
    return await sumTokensExport({ owner: '0x9be6f065aFC34ca99e82af0f0BfB9a01E3f919eE', tokens: [nullAddress] }, 
                         { owner: '0x57D51c99b7EB39c978c9E4493D74Ea79495999b0', tokens: [nullAddress] },
                         { owner: '0xa16ed0B92a27E8F7fFf1aB513c607115636cb63f', tokens: [nullAddress] });
}

async function tvl(timestamp, block, chainBlocks, api) {
    await calcTvl(chainBlocks.sapphire, "sapphire", false, api);
}

module.exports = {
  start: '2024-11-30',
  sapphire: {
    tvl,
  },
  
}
