const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

/*** Ethereum Addresses ***/
    // Static Power Part
const staticPowerContract = "0xBaB61589f963534460E2764A1C0d840B745A9140";
const POWER_eth = "0xF2f9A7e93f845b3ce154EfbeB64fB9346FCCE509";

    // ETH Prime Part
const ethPrimeContract = "0xe40e1531a4B56fB65571AD2ca43Dc0048a316a2D";
const WETH = ADDRESSES.ethereum.WETH;

    // PowerDAO Part
const liquidityVaultContracts = [
    "0xC73bb871DBf66958242DeBA79E4dB19bc2934513",
    "0x101210a79e3e0620bCAfb771bCddf1B5EA72584D",
];
const WETH_POWER_UNIV2 = "0x49F9316EB22de90d9343C573fbD7Cc0B5ec6e19f";

/*** Polygon Addresses ***/
    // PolyShield Part
const stakingContract = "0x0Ec74989E6f0014D269132267cd7c5B901303306";
const POWER_polygon = "0x00D5149cDF7CEC8725bf50073c51c4fa58eCCa12";
const POWER_USDC_UNIV2 = "0x9af0c1eeb61dE5630899C224DB3D6f3F064da047";

async function ethTvl() {
    const balances = {};

    const balance_ETHPrime = (
        await sdk.api.eth.getBalance({
            target: ethPrimeContract,
        })
    ).output;

    sdk.util.sumSingleBalance(balances, WETH, balance_ETHPrime);

    return balances;
}

module.exports = {
    ethereum: {
        staking: staking(staticPowerContract, POWER_eth),
        pool2: staking(liquidityVaultContracts, [WETH_POWER_UNIV2]),
        tvl: ethTvl,
    },
    polygon: {
        tvl: async () => ({}),
        staking: staking(stakingContract, POWER_polygon),
        pool2: staking(stakingContract, POWER_USDC_UNIV2),
    },
    methodology:
        "Counts tvl of WETH deposited through ETH Prime Contract, also there are pool2 and staking part from different seccions. Polygon tvl consist of staked POWER and the POWER/USDC LP pool2",
};
