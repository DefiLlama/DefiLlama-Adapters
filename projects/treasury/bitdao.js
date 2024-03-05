const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");
const sdk = require("@defillama/sdk");

//eth wallets
const mTreasuryL1 = "0x78605Df79524164911C144801f41e9811B7DB73D";
const mTreasuryL1SC = "0xCa264A4Adf80d3c390233de135468A914f99B6a5"
const mTreasuryL1O1 = "0xf0e91a74cb053d79b39837E1cfba947D0c98dd93"
const mTreasuryL1E1 = "0x1a743BD810dde05fa897Ec41FE4D42068F7fD6b2"
const mTreasuryL1RB1 = "0x164Cf077D3004bC1f26E7A46Ad8fA54df4449E3F"
const mTreasuryL1LPE1 = "0xA5b79541548ef2D48921F63ca72e4954e50a4a74"

//mantle wallets

const mTreasuryL2 = "0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"
const mTreasuryL2RB2 = "0x87C62C3F9BDFc09200bCF1cbb36F233A65CeF3e6"
const mTreasuryL2LPM1 = "0x992b65556d330219e7e75C43273535847fEee262"
const mTreasuryL2FF1 = "0xcD9Dab9Fa5B55EE4569EdC402d3206123B1285F4"

const BIT = "0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5";
const MNT = "0x3c3a81e81dc49a522a592e7622a7e711c06bf354"

const MNTMantle = "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000"
const wrappedmantleonmantle = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"

const tokenTreasuries = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9',//FTT
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',//xSUSHI
        "0x52A8845DF664D76C69d2EEa607CD793565aF42B8",
        "0x9d39a5de30e57443bff2a8307a4256c8797a3497", //sUSDe
     ],
    owners: [mTreasuryL1, mTreasuryL1SC,mTreasuryL1O1,mTreasuryL1E1, mTreasuryL1RB1, mTreasuryL1LPE1 ],
    ownTokens: [BIT, MNT],
    resolveLP: true,
    resolveUniV3: true,
  },
  mantle: {
    tokens: [ 
        nullAddress,
        "0x5bE26527e817998A7206475496fDE1E68957c5A6", //ondo usd
        "0xcda86a272531e8640cd7f1a92c01839911b90bb0", //mantle staked eth
        "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111", //eth
        "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9", //usdc
        "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE", //tether
        "0xf52b354ffdb323e0667e87a0136040e3e4d9df33", //lp meth
     ],
    owners: [mTreasuryL2, mTreasuryL2RB2, mTreasuryL2LPM1, mTreasuryL2FF1],
    ownTokens: [MNTMantle, wrappedmantleonmantle],
    resolveLP: true,
  },
})

async function otherTvl(_timestamp, _block, _chainBlocks, {api}){
  const shares = await api.call({  abi: 'function shares(address user) public view returns (uint256)', target: "0x298afb19a105d59e74658c4c334ff360bade6dd2", params:["0xca264a4adf80d3c390233de135468a914f99b6a5"]})
  const balances = {
    "ethereum:0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa": shares
  }
  return balances
}

module.exports={
  ethereum:{
    tvl: sdk.util.sumChainTvls([tokenTreasuries.ethereum.tvl, otherTvl]),
  },
  mantle: tokenTreasuries.mantle
}