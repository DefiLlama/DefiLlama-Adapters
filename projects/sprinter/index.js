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

async function tvl(api) {
    const [totalShares, stakedShares] = await Promise.all([
        api.call({ abi: 'erc20:totalSupply', target: LP_TOKEN_ADDRESS }),
        api.call({ abi: 'erc20:balanceOf', target: LP_TOKEN_ADDRESS, params: [STAKING_CONTRACT_ADDRESS] }),
    ])
    const unstakedShares = BigInt(totalShares.toString()) - BigInt(stakedShares.toString());
    const unstakedInUSDC = await api.call({
        abi: abi.hub.convertToAssets,
        target: HUB_CONTRACT_ADDRESS,
        params: [unstakedShares],
    })
    api.add(USDC_ADDRESS, unstakedInUSDC)
}

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
    methodology: 'TVL reads the total amount of USDC in the vault, deducting staked. Staking TVL reads the amount of shares converted to USDC that is currently staked in the vault.',
    base: {
        tvl,
        staking,
    }
};
