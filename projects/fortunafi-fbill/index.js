const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    canto: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    }
}

const tvl = async (_, _1, _2, { api }) => {
    const nav = await api.call({ target: contracts[api.chain].token, abi: 'function nav() external view returns (uint256)' });

    api.add(ADDRESSES.canto.USDC, nav/1e12)
}

module.exports = {
    methodology: "Fortunafi is a leading onchain financial institution \
spearheading advancements in the Real World Assets (RWA) sector. Through key \
partnerships and integrations, Fortunafi delivers the tokenization of RWAs \
onchain to bring DeFi-structured yield products, alternative lending, and \
all-in-one liquidity solutions to financial institutions, startups, and \
investors.",
    canto: {
        tvl
    }
};
