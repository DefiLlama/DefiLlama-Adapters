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

const MNTMantle = ADDRESSES.metis.Metis
const wrappedmantleonmantle = ADDRESSES.mantle.WMNT

const ecspWallets = [
'0x87c185bEFFfb36a42b741d10601A007e997a63bA',
'0x8AA6a67e96850e070B0c8E94E3a35C5f9f01809C',
'0x50f6e426fdefb3f994d3fe9fa4e1ee715f85de7f',
'0x7427b4Fd78974Ba1C3B5d69e2F1B8ACF654fEB44',
'0x7fe2bAffD481a8776A9eaD15a8eD17Fe37107903',
'0x15Bb5D31048381c84a157526cEF9513531b8BE1e',
'0xdD1c2483056fF46153249bd903401ae7bF6360D1',
'0x565F603D583F9199487923775114ae8c0D17D044',
'0x650aD9e7EfCD34B7d050c22a6A8dFFAFe3B4A22E',
'0x607105cE5bf13e70B49E949a3DdFaD694d19374F',
'0x131C7f3461A6696317ddfEdfed3BCdc10A2062B2',
'0xa1F7D91Bf121f4940d96c5C52Bc577011B95B51b',
'0x911169AA285f5D18fC3567d150616d4B0869d3a5',
'0x3f946F00A00eB2A66A4BD1AeAF137E05dB6CAEc6',
'0x9fe09b3ed1A407162876fEB1995048A620552fD0',
'0xd4338fC8Dc9d2FDcb99604d3cFc80019EBE01058',
'0x71Fb53Afc7E36C3f11BC1bdBBAB7B6FC3E552eb6',
'0x92A9e359d72F934a5d7c1251201f9855A381B23c',
'0xb118d4B94B0D4ce38F0D15d88f1dC09580a60b7A',
'0xaA42736947d1fdcc5d93F459A6D1dC0d7b9a92a4',
'0xF366eC9FA2DCE0ee7A6bdae4Aaa5c076E8391AFC',
'0x5DA939F5e2bC3C7159ac16f98BbFb23759000cd5',
'0x60F6ce1965D99EEffDF63B5303664f25fCb0347F',
'0xC784F3aEA5ce3daBA6907ee5d6Ce321a204Eb3A8',
'0xDCA65E2DFEe70991374eD47EfB4aD6B4FCD0c612',
'0x4ea7b4D10a01c93509BaA0CBb128c89344A1F578',
'0x4dF3d780Af7cbD51d9c76f236477edF417c7B554',
'0xA38e519b12D9CE133396a3E4EB92aac0934AB351',
'0x6d9755211D627fe0EA02D94C23C6110af16a8882',
'0x43c0f24E84e6d45b021d18C982beAbFA969577c8',
'0xB82C91bB7e8696a4A057192ED61aFcD1F9121722',
'0x15FFBf5730FA9eF271B2E9b4a1a6c90F2288155B',
'0xCef70f66e50CF016BB932De6425AA6f7286A3886',
'0x50165383783124232B9e4367D59815947012Ac27',
'0x97D50c7d14E68bEBC0f81B4FdCed89a1122330A6'
]

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
        ADDRESSES.ethereum.sUSDe, //sUSDe
     ],
    owners: [mTreasuryL1, mTreasuryL1SC,mTreasuryL1O1,mTreasuryL1E1, mTreasuryL1RB1, mTreasuryL1LPE1, ...ecspWallets ],
    ownTokens: [BIT, MNT],
    resolveLP: true,
    resolveUniV3: true
  },
  mantle: {
    tokens: [ 
        nullAddress,
        "0x5bE26527e817998A7206475496fDE1E68957c5A6", //ondo usd
        "0xcda86a272531e8640cd7f1a92c01839911b90bb0", //mantle staked eth
        ADDRESSES.mantle.WETH, //eth
        ADDRESSES.mantle.USDC, //usdc
        ADDRESSES.mantle.USDT, //tether
        "0xf52b354ffdb323e0667e87a0136040e3e4d9df33", //lp meth
     ],
    owners: [mTreasuryL2, mTreasuryL2RB2, mTreasuryL2LPM1, mTreasuryL2FF1, ...ecspWallets],
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
    ownTokens: tokenTreasuries.ethereum.ownTokens
  },
  mantle: tokenTreasuries.mantle
}