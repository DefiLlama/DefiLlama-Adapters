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

const tvl = sumERC4626VaultsExport2({ vaults: [HUB_CONTRACT_ADDRESS]})

async function staking(api) {
    const stakedBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: LP_TOKEN_ADDRESS,
        params: [STAKING_CONTRACT_ADDRESS],
    });
    const stakedBalanceInUSDC = await api.call({
        abi: abi.hub.convertToAssets,
        target: HUB_CONTRACT_ADDRESS,
        params: [stakedBalance],
    });
    api.add(USDC_ADDRESS, stakedBalanceInUSDC)
}

module.exports = {
    methodology: 'TVL reads hub vault shares converted to USDC. Staking tracks LP tokens held in mining contract converted to USDC via hub.',
    base: {
        tvl,
        staking,
    }
};
