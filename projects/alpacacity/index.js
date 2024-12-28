const { staking } = require("../helper/staking");

/*** Ethereum Addresss ***/
const stakingContracts = [
    //stakingContractAlpaFireChamber
    "0x741Cee6e4Bd99Df866ab0dD0D0C0b5ED7033344A",
    //stakingContract
    "0x232F030747008D3bA5d51526f5966d8985218Ff0",
    //StakingContractAlpacaSquadNFTFarm
    "0xE23A7741A5E9500f7a1dE4B246d1F7f29F81605F"
];
const ALPA = "0x7cA4408137eb639570F8E647d9bD7B7E8717514A";

const farmContract = "0x217a7D0Ac6573b0f013e12f92B6d5B250FA15D97";
const WETH_ALPA2_UNIV2 = "0x441f9e2c89a343cefb390a8954b3b562f8f91eca";

/*** BSC Addresss ***/
const stakingContractBSC = "0xa24FBFE379Ecb914c205BE4d9214592F64194059";
const ALPA_BSC = "0xc5E6689C9c8B02be7C49912Ef19e79cF24977f03";

const farmContractsBSC = [
    //V2
    "0x25B0dc84b62D7e2bd4eBba0Dda6C25E3e7c0D717",
    //V1
    "0x03625c4156A010065D135A18123a9e25FF5AEd12",
];
const lpPairContractsBSC = [
    //WBNB_ALPA_CakeLP V2
    "0x4cC442220BE1cE560C1f2573f8CA8f460B3E4172",
    //WBNB_ALPA_CakeLP V1
    "0x837cD42282801E340f1F17AAdf3166fEE99fb07c"
]

async function Staking(...params) {
    for (const contract of stakingContracts) {
        return staking(contract, ALPA)(...params)
    }

}

module.exports = {
    ethereum: {
        tvl: async => ({}),
        staking: Staking,
        pool2: staking(farmContract, WETH_ALPA2_UNIV2),
    },
    bsc: {
        staking: staking(stakingContractBSC, ALPA_BSC),
        pool2: staking(farmContractsBSC, lpPairContractsBSC),
    },
    methodology:
        "Counts liquidity on the Farms through AlpacaFarm Contracts; and there are Staking and Pool2 parts only. We export the comunity amount as Treasury Part",
};
