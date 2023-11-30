const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");

const abiNXMVault = require("./abiNXMVault.json");
const { staking } = require("../helper/staking");

const POOL_BUYCOVER_ACTION = "0xcafea35cE5a2fc4CED4464DA4349f81A122fd12b";
const NXM_VAULT = "0x1337DEF1FC06783D4b03CB8C1Bf3EBf7D0593FC4";
const DAI = ADDRESSES.ethereum.DAI;
const NXM = "0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b";
const stETH = ADDRESSES.ethereum.STETH;

const ethTvl = async (timestamp, block) => {
  let balances = {};
  const toa = []

  // --- Grab the tokens bal which are being deposited in pool via buyCover ---
  toa.push([nullAddress, POOL_BUYCOVER_ACTION])

  /*
     Apparently certain portion of the ETH deposited for buying covers are used to be swapped for stETH
     likely for yield
  */
  toa.push([stETH, POOL_BUYCOVER_ACTION])
  toa.push([DAI, POOL_BUYCOVER_ACTION])
     
  // --- AUM by the arNXM vault (wNXM bal + stake deposit) ---
  const aum = (
    await sdk.api.abi.call({
      abi: abiNXMVault.aum,
      target: NXM_VAULT,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, NXM, aum);

  return sumTokens2({ block, tokensAndOwners: toa, balances, })
}

module.exports = {
  ethereum: {
    tvl: () =>  ({}), // Project rebranded. arNXM is now being managed by EASE.
    staking: staking('0x5afedef11aa9cd7dae4023807810d97c20791dec', '0x1337def16f9b486faed0293eb623dc8395dfe46a')
  },
  hallmarks: [
    [Math.floor(new Date('2022-10-31')/1e3), 'Project rebranded as Ease. Stopped doublecounting Nexus Mutual tvl'],
  ],
};
