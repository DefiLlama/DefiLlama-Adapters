const ADDRESSES = require('../helper/coreAssets.json')

const readerAbi = require("./reader.json");
const mvlpManagerAbi = require("./mvlpManager.json");
const { staking } = require("../helper/staking");
const { sumTokensExport } = require('../helper/unwrapLPs');

const DAI_ADDRESS = ADDRESSES.ethereum.DAI;
const USDC_ADDRESS = ADDRESSES.ethereum.USDC;
const MVLP_ADDRESS = "0x9F4f8bc00F48663B7C204c96b932C29ccc43A2E8";

const REDEEM_CONTRACT = "0xd15C4677A81Ac9d744a01ecaAad684E6d296b8f3";
const GOV_CLUB_CONTRACT = "0x12fc8b560925166c39E85c70E9fD4058Ca9e11c9";

const MVD_DAO_MULTI_SIG_WALLET = "0x4876e4303dad975effe107ba84598ce4a24724ed";
const MVLP_TRACKER_CONTRACT = "0xA6ca41Bbf555074ed4d041c1F4551eF48116D59A";

const MVLP_MANAGER_CONTRACT = "0x13E733dDD6725a8133bec31b2Fc5994FA5c26Ea9"; // getAums
const READER_CONTRACT = "0x01dd8B434A83cbdDFa24f2ef1fe2D6920ca03734"; // getTokenBalancesWithSupplies --> ( [3] => get these value )

const stakingAddress = "0x42162457006DB4DA3a7af5B53DFee5A891243b4D"; // Governance Staking
const stakingTokenAddress = "0x788B6D2B37Aa51D916F2837Ae25b05f0e61339d1"; // MVD

const mvdStakingAddressArbitrum = "0xFA69292726A53d62111c9485C03ac551Ba05679b"; // gMVD Staking
const mvdTokenAddressArbitrum = "0x15a808ed3846D25e88AE868DE79F1bcB1Ac382B5"; // MVD

const ADDRESS_ZERO = ADDRESSES.null;


async function polygon(api) {
  // Metavault DAO MVLP Holdings
  const aums = await api.call({ target: MVLP_MANAGER_CONTRACT, abi: mvlpManagerAbi.getAums, })
  const supplies = await api.call({ target: READER_CONTRACT, params: [ADDRESS_ZERO, [MVLP_ADDRESS]], abi: readerAbi.getTokenBalancesWithSupplies, })
  const metavaultDaoMvlpHoldings = await api.call({ abi: 'erc20:balanceOf', target: MVLP_TRACKER_CONTRACT, params: MVD_DAO_MULTI_SIG_WALLET, })
  
  const mvlpSupply = supplies[1];
  const averageAums = (+aums[0] + +aums[1]) / 2
  const mvlpPrice = averageAums / mvlpSupply
  const daoMvlpHoldingsValue = metavaultDaoMvlpHoldings * mvlpPrice / 1e30
  api.addUSDValue(daoMvlpHoldingsValue)
}

module.exports = {
  hallmarks: [
    [1676592000, "Launch on Arbitrum"]
  ],
  misrepresentedTokens: true,
  arbitrum: {
    staking: staking(mvdStakingAddressArbitrum, mvdTokenAddressArbitrum,),
  },
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [DAI_ADDRESS, REDEEM_CONTRACT,],
        [USDC_ADDRESS, GOV_CLUB_CONTRACT,],
      ]
    }),
    staking: staking(stakingAddress, stakingTokenAddress,),
  },
  polygon: {
    tvl: polygon,
  }
};
