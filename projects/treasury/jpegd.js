const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const jpegd = "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3";

// Owners
const multisig = "0x51C2cEF9efa48e08557A361B52DB34061c025a1B";
const donationEvent = "0x3b7157E5E732863170597790b4c005436572570F";
const usdcVault = "0xFD110cf7985f6B7cAb4dc97dF1932495cADa9d08";
const usdtVault = "0x152DE634FF2f0A6eCBd05cB591cD1eEaCd2900Ed";
const pethVault = "0x548cAB89eBF34509Ae562BC8cE8D5Cdb4F08c3AD";

const treasuryTvl = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.CVX,
      ADDRESSES.ethereum.FRAX,
      ADDRESSES.ethereum.LINK,
      ADDRESSES.ethereum.cvxCRV,
      ADDRESSES.ethereum.SAFE,
      ADDRESSES.ethereum.vlCVX,
      ADDRESSES.ethereum.sfrxETH,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.RETH,
      "0x836A808d4828586A69364065A1e064609F5078c7", // pETH
      // Liquidity positions
      "0xC47EBd6c0f68fD5963005D28D0ba533750E5C11B", // pUSDFRAXBP3CRV-f
      "0x34eD182D0812D119c92907852D2B429f095A9b07", // JPEGETH-f
      "0x9848482da3Ee3076165ce6497eDA906E66bB85C5", // pETH-ETH-f
      "0xdB06a76733528761Eda47d356647297bC35a98BD", // JPEGWETH SLP
    ],
    owners: [multisig, donationEvent, usdcVault, usdtVault, pethVault],
    ownTokens: [jpegd],
    resolveUniV3: true,
  },
});

const liquidityTvl = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const troveManager = '0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2'
  const stabilityPool = '0x66017d22b0f8556afdd19fc67041899eb65a21bb'
  const troveData = await api.call({ abi: 'function Troves(address) view returns (uint256 debt, uint256 coll,uint256 stake ,uint8 status , uint128 arrayIndex )', target: troveManager, params: multisig })
  const stabilityData = await api.call({ abi: 'function deposits(address) view returns ( uint256 initialValue,   address  frontEndTag  )', target: stabilityPool, params: multisig })
  api.add(ADDRESSES.ethereum.LUSD, troveData.debt * -1)
  api.add(ADDRESSES.ethereum.LUSD, stabilityData.initialValue)
  api.add(ADDRESSES.null, troveData.coll)
  return api.getBalances()
}
treasuryTvl.ethereum.tvl = sdk.util.sumChainTvls([treasuryTvl.ethereum.tvl, liquidityTvl])

module.exports = treasuryTvl