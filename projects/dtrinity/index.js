const dlend = require('../dlend');
const erc20Abi = require("../helper/abis/erc20.json");
const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
    fraxtal: {
        dUSDCollateralVault: "0x624E12dE7a97B8cFc1AD1F050a1c9263b1f4FeBC",
        dUSDCollaterals: [
            ADDRESSES.fraxtal.FRAX,
            ADDRESSES.fraxtal.sFRAX,
            ADDRESSES.fraxtal.DAI,
            ADDRESSES.fraxtal.sDAI,
            ADDRESSES.fraxtal.USDC
        ],
        pools: {
            'sUSDe/dUSD': '0xf16f226baa419d9dc9d92c040ccbc8c0e25f36d7',
            'FRAX/dUSD': '0x9ca648d2f51098941688db9a0beb1dadc2d1b357'      
        }
    }
}

async function tvl(api) {
    const chain = api.chain;
    await dlend[chain].tvl(api);
    
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
    
    const poolAddresses = Object.values(CONFIG[chain].pools);
    const poolTokens = [
        ADDRESSES.fraxtal.FRAX,
        ADDRESSES.fraxtal.sUSDe
    ];

    for (const pool of poolAddresses) {
        for (const token of poolTokens) {
            const balance = await api.call({
                abi: "erc20:balanceOf",
                target: token,
                params: pool
            });
            api.add(token, balance);
        }
    }

    return api.getBalances();
}

module.exports = {
    methodology: 'TVL consists of TVL of dLEND protocol, total value of collateral backing dUSD stablecoin (FRAX, sFRAX, DAI, sDAI, USDC), and liquidity in Curve pools',
    fraxtal: {
        tvl
    }
};