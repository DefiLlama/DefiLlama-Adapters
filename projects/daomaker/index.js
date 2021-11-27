const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const daoMakerStakingContract = "0xEfEE3763000Afbffb8551dF16800e571b9B66188";
const DAO = "0x0f51bb10119727a7e5ea3538074fb341f56b09ad";

const vaultsFarmsPool2Addresses = [
    //convergence-finance
    "0x218023631d37715Adf7C2f6CA3C40360E266ABdD",
    //dao maker
    "0xf91c7c211dB969aaFcB1cfC6CbBdCa048074EE07",
    //evolution
    "0x17d2974960005Ba5176A872cE63e53bB214D4856",
    //openocean
    "0x329420649604a57c616692c51106196a4712ea24",
    //yield protocol
    "0x2909122ea182368A4ba7bC5Eed2D2D536B3e25Ae"
];

const DAO_USDC_UNIV2 = "0x4cd36d6F32586177e36179a810595a33163a20BF";

const vaultFarmsAddresses = [
    //derace
    "0x7C27bC15dee9BfFF50AA8C9FFd75e52367d1a9fF",
    //dinox
    "0x141Ba88B17442F4Fe305871c9642E3c1C6307346",
    //gamestarter
    "0x30E8dEf41D8c70De900Dd673c08238f77C2747bd",
];

const vaultlp = [
    //DERC-USDC UNISWAP
    "0xc88aC988A655B91b70DEF427c8778B4D43f2048D",
    //DNXC-USDC UNISWAP
    "0xa39d7a85553a46faeb3ba5e0c49d6a5db67df30f",
    //GAME-USDT UNISWAP
    "0x0cFB06414C6d9790Bc661230DbA0b24060808bF4",
]

async function ethTvl(block) {
  const balances = {};

  for (let i = 0; i < vaultFarmsAddresses.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[vaultlp[i], true]],
      [vaultFarmsAddresses[i]]
    );
  }

  return balances;
}

module.exports = {
  ethereum: {
    staking: staking(daoMakerStakingContract, DAO),
    pool2: pool2s(vaultsFarmsPool2Addresses, [DAO_USDC_UNIV2]),
    tvl: ethTvl,
  },
  methodology: "Counts liquidity on the vaults through their Contracts",
};
