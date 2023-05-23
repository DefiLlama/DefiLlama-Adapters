const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const readerAbi = require("./reader.json");
const mvlpManagerAbi = require("./mvlpManager.json");
const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { default: BigNumber } = require("bignumber.js");

const DAI_ADDRESS = ADDRESSES.ethereum.DAI;
const USDC_ADDRESS = ADDRESSES.ethereum.USDC;
const MVLP_ADDRESS = "0x9F4f8bc00F48663B7C204c96b932C29ccc43A2E8";
const MVLP_DECIMALS = 18;

const REDEEM_CONTRACT = "0xd15C4677A81Ac9d744a01ecaAad684E6d296b8f3";
const GOV_CLUB_CONTRACT = "0x12fc8b560925166c39E85c70E9fD4058Ca9e11c9";

const MVD_DAO_MULTI_SIG_WALLET = "0x4876e4303dad975effe107ba84598ce4a24724ed";
const MVLP_TRACKER_CONTRACT = "0xA6ca41Bbf555074ed4d041c1F4551eF48116D59A";

const MVLP_MANAGER_CONTRACT = "0x13E733dDD6725a8133bec31b2Fc5994FA5c26Ea9"; // getAums
const READER_CONTRACT = "0x01dd8B434A83cbdDFa24f2ef1fe2D6920ca03734"; // getTokenBalancesWithSupplies --> ( [3] => get these value )

const stakingAddress = "0x42162457006DB4DA3a7af5B53DFee5A891243b4D"; // Governance Staking
const stakingTokenAddress = "0x788B6D2B37Aa51D916F2837Ae25b05f0e61339d1"; // MVD
const ADDRESS_ZERO = ADDRESSES.null;

async function getTvl(timestamp, block) {
  const toa = [
    [DAI_ADDRESS, REDEEM_CONTRACT,],
    [USDC_ADDRESS, GOV_CLUB_CONTRACT,],
  ]

  return sumTokens2({ tokensAndOwners: toa, block })
}

async function polygon(_, _b, { polygon: block }) {
  const chain = 'polygon'

  // Metavault DAO MVLP Holdings
  const aums = (
    await sdk.api.abi.call({
      target: MVLP_MANAGER_CONTRACT,
      abi: mvlpManagerAbi.getAums,
      chain, block,
    })
  ).output;

  const averageAums = (+aums[0] + +aums[1]) / 2

  const supplies = (
    await sdk.api.abi.call({
      target: READER_CONTRACT,
      params: [ADDRESS_ZERO, [MVLP_ADDRESS]],
      chain, block,
      abi: readerAbi.getTokenBalancesWithSupplies,
    })
  ).output;

  const mvlpSupply = supplies[1];

  const mvlpPrice = averageAums / mvlpSupply

  const metavaultDaoMvlpHoldings = (
    await sdk.api.erc20.balanceOf({
      chain, block,
      target: MVLP_TRACKER_CONTRACT,
      owner: MVD_DAO_MULTI_SIG_WALLET,
    })
  ).output;

  const daoMvlpHoldingsValue = metavaultDaoMvlpHoldings * mvlpPrice;

  const sum = BigNumber(daoMvlpHoldingsValue / 1e24).toFixed(0);

  return {
    [USDC_ADDRESS]: sum,
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getTvl,
    staking: staking(stakingAddress, stakingTokenAddress,),
  },
  polygon: {
    tvl: polygon,
  }
};
