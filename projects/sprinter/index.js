const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const ADDRESSES = require('../helper/coreAssets.json')

const HUB_CONTRACT_ADDRESS = "0xa593A9bBBc65be342FF610a01e96da2EB8539FF2";
const STAKING_CONTRACT_ADDRESS = "0x479d158959b59328e89f0fbf7dfebb198c313c21";
const LP_TOKEN_ADDRESS = "0xfa89929b30bC3132f9907CBCe3F2f6f4AC0903b6";
const USDC_ADDRESS = ADDRESSES.base.USDC;

const abi = {
    hub: {
        convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256)",
    }
};

const tvl = sumERC4626VaultsExport2({ vaults: [HUB_CONTRACT_ADDRESS] })

async function staking(api) {
    const stakedShares = await api.call({
        abi: 'erc20:balanceOf',
        target: LP_TOKEN_ADDRESS,
        params: [STAKING_CONTRACT_ADDRESS],
    });
    const stakedInUSDC = await api.call({
        abi: abi.hub.convertToAssets,
        target: HUB_CONTRACT_ADDRESS,
        params: [stakedShares],
    });
    api.add(USDC_ADDRESS, stakedInUSDC)
}

module.exports = {
    doublecounted: true,
    methodology: 'TVL reads total hub vault assets (USDC). Staking separately tracks the LP shares held in the mining/staking contract converted to USDC via the hub. Assets are double-counted as staked shares are included in both TVL and staking.',
    base: {
        tvl,
        staking,
    }
};
