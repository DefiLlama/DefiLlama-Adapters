const BN = require("bignumber.js");

const bscPools = [
  // pool, token, representation

  [
    "0x0158aF415642A0879802cdb2e1347f0Af1b47eF9",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //2-Month Vault
  [
    "0x1240F9904c02d7e48FF03a7C71894bF2530838EB",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //4-Month Vault
  [
    "0x50D888179581D540753Aa6E2B6fe5EDCa594158a",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //6-Month Vault
  [
    "0xB634a7f635C6367C7F07485363750C09184Fd3F4",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //3-Month Vault
  [
    "0x45994757C035892AE66b91925a4Cf561D6aa66f6",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //5-Month Vault
  [
    "0x1b5A0D734786ef666abCDfD4153f3EaB9062a1F8",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //4-Month Vest Vault
  [
    "0x1386FdB83a0Ce87E146E8BCF807F2B969D29A97a",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //6-Month Vest Vault
  [
    "0x3a154b615447CD79D5617CD864d693e9CdD95685",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //12-Month Vest Vault
  [
    "0x44D86d4DE4bAe10c85Da7C7D2CDC3333b4b515C8",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //Tiers
  [
    "0xC5d72B45C09d2509e66F78D19BfA3B5DD7C04f5a",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //6-Month LOTT Vault
  [
    "0x3213F00f2aa67BdC6eCF1502C99cCA044C87690F",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //3-Month LOTT Vault
  [
    "0x3746ff9590A1ca9bC9a2067481324a75d3C528Ef",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //1-Month LOTT Vault
  [
    "0x01ba0f95Ca1Ba5Dd9981398fE79103F058381B12",
    "0x22168882276e5d5e1da694343b41dd7726eeb288",
  ], //6-Month WSB Vault
  [
    "0x83ed2A12943c67e66f4084368A07F2B51CbF5e51",
    "0x22168882276e5d5e1da694343b41dd7726eeb288",
  ], //3-Month WSB Vault
  [
    "0x3314CfD1c5538c7521790347FA129ec23FEDED4E",
    "0x22168882276e5d5e1da694343b41dd7726eeb288",
  ], //1-Month WSB Vault
  [
    "0x40F75a74D725e31aD2E609c11068931B64e30b8D",
    "0xE69cAef10A488D7AF31Da46c89154d025546e990",
  ], //6-Month DPT Vault
  [
    "0x8040ddeAf7f5F961e1F7B82d434541EA4215c42E",
    "0xE69cAef10A488D7AF31Da46c89154d025546e990",
  ], //3-Month DPT Vault
  [
    "0xe88933A9F3aeBf01eB2EEb6E77040DbB924f2698",
    "0xE69cAef10A488D7AF31Da46c89154d025546e990",
  ], //1-Month DPT Vault
  [
    "0xD260D4Ca6d00386a23acA47ACE37217b23F37582",
    "0x205f93cd558aac99c4609d0511829194b5405533",
  ], //6-Month ANGEL Vault
  [
    "0x1Aa2E43Ff8591865b0575E905331da2Bb6C0FfEE",
    "0x205f93cd558aac99c4609d0511829194b5405533",
  ], //3-Month ANGEL Vault
  [
    "0x4915B0b43a0B8ccbec1cB8EE4112EF3644F75Df6",
    "0x205f93cd558aac99c4609d0511829194b5405533",
  ], //1-Month ANGEL Vault
];

async function bsc(api) {
  return api.sumTokens({ tokensAndOwners:  bscPools.map(pool=>[pool[1], pool[0]]), })
}

module.exports = {
  methodology: `TVL comes from the Staking Vaults and Launchpad Tiers`,
    tvl: bsc,
  },
};
