const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

// Fantom
const vaultAddressFantom = "0x3CB54f0eB62C371065D739A34a775CC16f46563e";
const stakingAddressFantom = "0xa4157E273D88ff16B3d8Df68894e1fd809DbC007";
const tokenAddressMPXFantom = "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb";

// BNB Chain
const vaultAddressBSC = "0x46940Dc651bFe3F2CC3E04cf9dC5579B50Cf0765";
const stakingAddressBSC = "0x13d2bBAE955c54Ab99F71Ff70833dE64482519B1";
const tokenAddressMPXBSC = "0x94C6B279b5df54b335aE51866d6E2A56BF5Ef9b7";

module.exports = {
    methodology: "Morphex liquidity is calculated by the value of tokens in the MLP pool. TVL also includes MPX staked.",
    fantom: {
        staking: staking(stakingAddressFantom, tokenAddressMPXFantom, "fantom"),
        tvl: gmxExports({ vault: vaultAddressFantom })
    },
    bsc: {
        staking: staking(stakingAddressBSC, tokenAddressMPXBSC, "bsc"),
        tvl: gmxExports({ vault: vaultAddressBSC })
    },
};
