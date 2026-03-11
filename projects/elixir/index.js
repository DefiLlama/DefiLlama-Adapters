const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');

const MANAGER_ABI = {
  getPoolToken: "function getPoolToken(uint256 id, address token) view returns (address _address, uint256 amount, uint256, bool)",
  getPoolToken_2: "function pools(uint256 id) view returns (address router, uint8 poolType, address token, uint256 orderlyDepositFee, uint256 orderlyWithdrawalFee, uint256 activeAmount, uint256 hardcap)"
}

const DEUSD_LP_STAKING = "0xC7963974280261736868f962e3959Ee1E1B99712";
const COMMITS_CONTRACT = "0x4265f5D6c0cF127d733EeFA16D66d0df4b650D53";
const COMMITS_VAULT = "0x4B4EEC1DDC9420a5cc35a25F5899dC5993f9e586";
const COMMITS_VAULT_2 = "0x704377f719651C3eE6902Ff3C9D5522e5054d429";
const deUSD = ADDRESSES.ethereum.deUSD;

const LP_TOKENS = [
  "0xb478Bf40dD622086E0d0889eeBbAdCb63806ADde", // DEUSD/DAI Curve LP
  "0x88DFb9370fE350aA51ADE31C32549d4d3A24fAf2", // DEUSD/FRAX Curve LP
  "0x5F6c431AC417f0f430B84A666a563FAbe681Da94", // DEUSD/USDC Curve LP
  "0x7C4e143B23D72E6938E06291f705B5ae3D5c7c7C", // DEUSD/USDT Curve LP
];

const VERTEX_MANAGER = '0x052Ab3fd33cADF9D9f227254252da3f996431f75'
const ORDERLY_MANAGER = '0x79865208f5dc18a476f49e6dbfd7d79785cb8cd8'

// these addresses invoke in leverage borrowing to increase deUSD supply, TVL
// they use initial USDC, USDT to mint deUSD, stake deUSD to sdeUSD
// deposit sdeUSD to lending markets, borrow more USDC, USDT
// after that, they transfer tokens to Stream Finance team wallet and manipulate TVL on Stream Finance too
const BLACKLIST_MINTERS = [
  String('0x25E028A45a6012763A76145d7CEEa3587015e990').toLowerCase(),
  String('0x1bB3c7F27A9170194Dcc6B143c0FBC4ad162F123').toLowerCase(),
]
const DeUSDMinting = '0x69088d25a635D22dcbe7c4A5C7707B9cc64bD114';
const DeUSDMintingFromBlock = 20319826;
const MintEvent = 'event Mint(address minter, address benefactor, address beneficiary, address indexed collateral_asset, uint256 indexed collateral_amount,uint256 indexed deUSD_amount)';
const RedeemEvent = 'event Redeem(address redeemer, address benefactor, address beneficiary, address indexed collateral_asset, uint256 indexed collateral_amount,uint256 indexed deUSD_amount)';

const orderlyIntegration = async (api, manager, poolIds) => {
  const pools = await api.multiCall({ abi: MANAGER_ABI.getPoolToken_2, calls: poolIds, target: manager });
  pools.forEach(i => api.add(i.token, i.activeAmount));
}

const integration = async (api, manager, poolIds, tokens) => {
  if (manager === ORDERLY_MANAGER)
    return orderlyIntegration(api, manager, poolIds)
  const calls = poolIds.map(id => tokens.map(token => ({ params: [id, token] }))).flat();
  const pools = await api.multiCall({ abi: MANAGER_ABI.getPoolToken, calls, target: manager });
  pools.forEach((v, i) => api.add(calls[i].params[1], v.amount));
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const deusdSupply = Number(await api.call({ target: deUSD, abi: "erc20:totalSupply" }))
      
      await api.sumTokens({ owners: [COMMITS_CONTRACT, COMMITS_VAULT, COMMITS_VAULT_2], tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.null] })
      
      let teamMintedBalance = 0;
      const mintEvents = await getLogs2({ api, target: DeUSDMinting, fromBlock: DeUSDMintingFromBlock, eventAbi: MintEvent, extraKey: `deusd-mint-${api.chain}` });
      const redeemEvents = await getLogs2({ api, target: DeUSDMinting, fromBlock: DeUSDMintingFromBlock, eventAbi: RedeemEvent, extraKey: `deusd-redeem-${api.chain}` });
      for (const event of mintEvents) {
        if (BLACKLIST_MINTERS.includes(String(event.beneficiary).toLowerCase())) {
          teamMintedBalance += Number(event.deUSD_amount)
        }
      }
      for (const event of redeemEvents) {
        if (BLACKLIST_MINTERS.includes(String(event.beneficiary).toLowerCase())) {
          teamMintedBalance -= Number(event.deUSD_amount)
        }
      }
      
      teamMintedBalance = teamMintedBalance > 0 ? teamMintedBalance : 0;

      api.add(deUSD, Number(deusdSupply) - teamMintedBalance);
    },
    pool2: sumTokensExport({ owner: DEUSD_LP_STAKING, tokens: LP_TOKENS })
  },
  arbitrum: {
    tvl: async (api) => {
      await integration(api, VERTEX_MANAGER, [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 31, 34, 36, 38, 40, 41, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62], [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.ARB,
        '0x95146881b86B3ee99e63705eC87AfE29Fcc044D9',
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.WETH,
      ])
      await integration(api, ORDERLY_MANAGER, Array.from({ length: 10 }, (_, i) => i + 1))
    }
  },
  sei: {
    tvl: sumTokensExport({ tokensAndOwners: [
      ['0xBE574b6219C6D985d08712e90C21A88fd55f1ae8', '0x3490a00b308C5A1f0bBF67BA71361F543deBd08F']
    ], permitFailure: true })
  }
};
