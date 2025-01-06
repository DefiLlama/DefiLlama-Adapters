const dlend = require('../dlend');
const erc20Abi = require("../helper/abis/erc20.json");
const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
    fraxtal: {
        dUSDCollateralVault: "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC",
        dUSDAMOManager: "0x49a0c8030Ca199f6F246517aE689E3cC0775271a",
        dUSDCollaterals: [
            ADDRESSES.fraxtal.FRAX,
            ADDRESSES.fraxtal.sFRAX,
            ADDRESSES.fraxtal.DAI,
            ADDRESSES.fraxtal.sDAI,
            ADDRESSES.fraxtal.USDC
        ]
    }
}

const dUSDCollateralTvl = async (api) => {
    const chain = api.chain;
    const vault = CONFIG[chain].dUSDCollateralVault;
    const collaterals = CONFIG[chain].dUSDCollaterals;
    for (const token of collaterals) {
        const balance = await api.call({
            abi: erc20Abi.balanceOf,
            target: token,
            params: [vault] 
        });
        api.add(token, balance);
    }
}

const dUSDAMOTvl = async (api) => {
    const chain = api.chain;
    const dUSDAMOManager = CONFIG[chain].dUSDAMOManager;
    const totalAmoSupply = await api.call({
        abi: "function totalAmoSupply() public view returns (uint256)",
        target: dUSDAMOManager
    });
    api.add(ADDRESSES.fraxtal.dUSD, totalAmoSupply);
}

const tvl = async (api) => {
    const chain = api.chain;
    await Promise.all([
        dlend[chain].tvl(api),
        dUSDCollateralTvl(api),
        dUSDAMOTvl(api)
    ]);
    return api.getBalances();
}

const borrowed = async (api) => {
    const chain = api.chain;
    await dlend[chain].borrowed(api);
}

module.exports = {
    methodology: 'Includes TVL for dLEND and TVL for dUSD.',
    fraxtal: {
        tvl,
        borrowed
    }
};