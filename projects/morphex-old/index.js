const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

// Fantom (Multichain)
const vaultAddressFantom = "0x3CB54f0eB62C371065D739A34a775CC16f46563e";
const stakingAddressFantom = "0xa4157E273D88ff16B3d8Df68894e1fd809DbC007";
const tokenAddressMPXFantom = "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb";

module.exports = {
    methodology: "Morphex liquidity is calculated by the value of tokens in the MLP pool. TVL also includes MPX staked.",
    fantom: {
        staking: staking(stakingAddressFantom, tokenAddressMPXFantom),
        tvl: gmxExports({ vault: vaultAddressFantom })
    }
};
