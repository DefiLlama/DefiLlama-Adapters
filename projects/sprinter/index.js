const ADDRESSES = require('../helper/coreAssets.json')
const LP_TOKEN_ADDRESS = "0xfa89929b30bC3132f9907CBCe3F2f6f4AC0903b6";
const MINING_CONTRACT_ADDRESS = "0x479d158959b59328e89f0fbf7dfebb198c313c21";
const HUB_CONTRACT_ADDRESS = "0xa593A9bBBc65be342FF610a01e96da2EB8539FF2";

const USDC_ADDRESS = ADDRESSES.base.USDC;

const abi = {
    hub: {
        convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256)",
        totalAssets: "function totalAssets() view returns (uint256)",
    }
};

async function tvl(api) {
    const lpBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: LP_TOKEN_ADDRESS,
        params: [MINING_CONTRACT_ADDRESS],
    });
    const balanceInUSDC = await api.call({
        abi: abi.hub.convertToAssets,
        target: HUB_CONTRACT_ADDRESS,
        params: [lpBalance],
    });

    api.add(USDC_ADDRESS, balanceInUSDC)
}

module.exports = {
    methodology: 'Reads locked shares on-chain and converts to USDC.',
    base: {
        tvl,
    }
};
