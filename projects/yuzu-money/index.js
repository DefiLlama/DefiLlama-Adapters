const axios = require("axios");
const { formatUnits } = require("ethers");

const DECIMALS = 18;
const PLASMA_YZUSD_OFT = "0x9dcB0D17eDDE04D27F387c89fECb78654C373858";
const PLASMA_SYZUSD_OFT = "0x0CDdd7515586550f16DeC1732e0386109E1859E8";
const PLASMA_YZPP_OFT = "0x57B2690BdEE4740bCf40a9b52E7E5B8877baC5e5";

const CONFIG = {
    plasma: {
        yzUSD: '0x6695c0f8706c5ace3bdf8995073179cca47926dc',
        yzPP: '0xEbFC8C2Fe73C431Ef2A371AeA9132110aaB50DCa',
        syzUSD: '0xc8a8df9b210243c55d31c73090f06787ad0a1bf6',
    },
    ethereum: {
        yzUSD: '0x387167e5C088468906Bcd67C06746409a8E44abA',
        yzPP: '0xB2429bA2cfa6387C9A336Da127d34480C069F851',
        syzUSD: '0x6DFF69eb720986E98Bb3E8b26cb9E02Ec1a35D12'
    },
    monad: {
        yzUSD: '0x9dcB0D17eDDE04D27F387c89fECb78654C373858',
        yzPP: '0xb37476cB1F6111cC682b107B747b8652f90B0984',
        syzUSD: '0x484be0540aD49f351eaa04eeB35dF0f937D4E73f'
    },
};

const getUsdPrice = async (token) => {
    const priceKey = `plasma:${token}`;
    const { data } = await axios.get(
        `https://coins.llama.fi/prices/current/${priceKey}`,
    );

    const price = data.coins[priceKey]?.price;
    if (price === undefined) {
        throw new Error(`Price not found for ${priceKey}`);
    }

    return price;
}


async function tvl(api) {
    const chain = api.chain;
    const { yzUSD, yzPP, syzUSD } = CONFIG[chain];

    const [yzPPPrice, syzUSDPrice] = await Promise.all([
        getUsdPrice(CONFIG["plasma"].yzPP),
        getUsdPrice(CONFIG["plasma"].syzUSD)
    ]);

    const [yzUSDSupply, yzPPSupply, syzUSDSupply] = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: [yzUSD, yzPP, syzUSD]
    });

    const yzUSDTVL = formatUnits(yzUSDSupply, DECIMALS) * 1;
    const syzUSDTVL = formatUnits(syzUSDSupply, DECIMALS) * syzUSDPrice;
    const yzPPTVL = formatUnits(yzPPSupply, DECIMALS) * yzPPPrice;

    if (chain === "plasma") {
        const [bridgedYzPPAmount, bridgedYzUSDAmount, bridgedSyzUSDAmount] = await api.multiCall({
            calls: [
                { 
                    target: CONFIG["plasma"].yzPP, 
                    params: PLASMA_YZPP_OFT 
                }, 
                { 
                    target: CONFIG["plasma"].yzUSD, 
                    params: PLASMA_YZUSD_OFT 
                }, 
                { 
                    target: CONFIG["plasma"].syzUSD, 
                    params: PLASMA_SYZUSD_OFT 
                }
            ],
            abi: "erc20:balanceOf"
        });

        const bridgedYzPPValue = formatUnits(bridgedYzPPAmount, DECIMALS) * yzPPPrice;
        const bridgedYzUSDValue = formatUnits(bridgedYzUSDAmount, DECIMALS) * 1;
        const bridgedSyzUSDValue = formatUnits(bridgedSyzUSDAmount, DECIMALS) * syzUSDPrice;
        
        const plasmaTVL = yzUSDTVL + yzPPTVL - bridgedYzPPValue - bridgedYzUSDValue - bridgedSyzUSDValue;
        api.addUSDValue(plasmaTVL);
    } else {
        const tvl = yzUSDTVL + syzUSDTVL + yzPPTVL;
        api.addUSDValue(tvl);
    }
}

module.exports = {
    plasma: { tvl },
    ethereum: { tvl },
    monad: { tvl }
}
