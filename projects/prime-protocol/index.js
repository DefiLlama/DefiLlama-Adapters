const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2, } = require('../helper/unwrapLPs')

const MASTER_VIEW_CONTRACT = {
  v1_4_6: {
    address: '0x47ecFB57deD0160d66103A6A201C5f30f7CC7d13',
    abi: {
      calculateAssetTVL: 'function calculateRawAssetTVL(uint256 chainId, address pToken) view returns (uint256)'
    }
  }
};

const MOONBEAM_MARKETS = {
  xcDOT_v0_v1_2_0: {
    pTokenMarketAddress: '0x156F5c70a157A381610F1DbaAE4f336a2DB70E7E',
    pTokenUnderlyingAddress: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080'
  },
  GLMR_v1_v1_4_6: {
    pTokenMarketAddress: '0x53d5a47bb874eE688acb479676aD133d47CB9B25',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  whUSDC_v1_v1_4_6: {
    pTokenMarketAddress: '0x5f8d500ec32dB09aa3115a852f30e9C756867d5A',
    pTokenUnderlyingAddress: '0x931715FEE2d06333043d11F658C8CE934aC61D0c',
  },
  xcUSDT_v1_v1_4_6: {
    pTokenMarketAddress: '0x1D5CC7840a05BA39Db0AAd21e14dF1ff09b599ED',
    pTokenUnderlyingAddress: ADDRESSES.moonbeam.xcUSDT,
  },
  xcDOT_v1_v1_4_6: {
    pTokenMarketAddress: '0x8f7F208F38A4362e6Fe6112b720630f93bb608aA',
    pTokenUnderlyingAddress: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
  },
  GLMR_v2_v1_6_0: {
    pTokenMarketAddress: '0xdC427cDB81E1532747BEDeB8077a4AEcDbfB585e',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  whUSDC_v2_v1_6_0: {
    pTokenMarketAddress: '0x227EEB717a3Ec78025bE51c87b3A7160192613D2',
    pTokenUnderlyingAddress: '0x931715FEE2d06333043d11F658C8CE934aC61D0c',
  },
  xcUSDT_v2_v1_6_0: {
    pTokenMarketAddress: '0x8ef25FAC30DeD9A210151C1d27e58F71f2142e2f',
    pTokenUnderlyingAddress: ADDRESSES.moonbeam.xcUSDT,
  },
  xcDOT_v2_v1_6_0: {
    pTokenMarketAddress: '0x525c6B3D27B6b1Fc28bca7dc04964247c1a942B1',
    pTokenUnderlyingAddress: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
  },
  whWBTC_v2_v1_10_2: {
    pTokenMarketAddress: '0x2A104E502480b4e3C1D13EA2EC657C08f4578a7a',
    pTokenUnderlyingAddress: ADDRESSES.moonbeam.WBTC,
  }
};

const AVALANCHE_MARKETS = {
  ETH_v1_v1_4_6: {
    pTokenMarketAddress: '0x94ebF80b33120a1AbE370E56192db39f4944b6ca',
    pTokenUnderlyingAddress: ADDRESSES.avax.WETH_e,
  },
  USDC_v1_v1_4_6: {
    pTokenMarketAddress: '0x6Cce9601CA44a9049A761C22b70D5849662c2C0a',
    pTokenUnderlyingAddress: ADDRESSES.avax.USDC,
  },
  USDT_v1_v1_4_6: {
    pTokenMarketAddress: '0xe06F55FB6c6C62b74AAD7eb77f00b06920FB176e',
    pTokenUnderlyingAddress: ADDRESSES.avax.USDt,
  },
  ETH_v2_v1_6_0: {
    pTokenMarketAddress: '0x4Ebba16380fEb2083938c008aEDD4b5EBeA80f72',
    pTokenUnderlyingAddress: ADDRESSES.avax.WETH_e,
  },
  USDC_v2_v1_6_0: {
    pTokenMarketAddress: '0x73c5c93E78cB8CA4939307e0D95e032631fB9eEe',
    pTokenUnderlyingAddress: ADDRESSES.avax.USDC,
  },
  USDT_v2_v1_6_0: {
    pTokenMarketAddress: '0x1BF6752282039ee82C06DE64D094C9E35578A1a0',
    pTokenUnderlyingAddress: ADDRESSES.avax.USDt,
  },
  DAI_v2_v1_10_2: {
    pTokenMarketAddress: '0x05f2B8EAc42c9Cc771B8ECF6448481A3802e08c6',
    pTokenUnderlyingAddress: ADDRESSES.avax.DAI,
  },
  bBTC_v2_v1_10_2: {
    pTokenMarketAddress: '0xA5c74A10B60f276F806468c6E2f83D490dCfA89A',
    pTokenUnderlyingAddress: ADDRESSES.avax.BTC_b,
  },
};

const ARBITRUM_MARKETS = {
  ETH_v1_v1_4_6: {
    pTokenMarketAddress: '0x2E9F73aA3F16748C9c1E8243D204d60F87dEC872',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  USDC_v1_v1_4_6: {
    pTokenMarketAddress: '0x1b0509D8CC044805F54D132ccDa7b4A4ED88261A',
    pTokenUnderlyingAddress: ADDRESSES.arbitrum.USDC,
  },
  ETH_v2_v1_6_0: {
    pTokenMarketAddress: '0xc01683398fFCc86264ba17bC36977f51A1d25e06',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  USDC_v2_v1_6_0: {
    pTokenMarketAddress: '0xddC6Df52F9749ED80966Fb6a9D4C87264cC1e6C1',
    pTokenUnderlyingAddress: ADDRESSES.arbitrum.USDC,
  },
  DAI_v2_v1_10_2: {
    pTokenMarketAddress: '0x3e1C8203B8D36E8E427Ee181A65549fd86AE3907',
    pTokenUnderlyingAddress: ADDRESSES.optimism.DAI,
  },
  WBTC_v2_v1_10_2: {
    pTokenMarketAddress: '0x51Ff97d92683992AD091E04470069bB942219D71',
    pTokenUnderlyingAddress: ADDRESSES.arbitrum.WBTC,
  },
  nativeUSDC_v1_v1_10_2: {
    pTokenMarketAddress: '0xA44C28Bd4Fd4fc307f23B2E6e9cC07BC03571798',
    pTokenUnderlyingAddress: ADDRESSES.arbitrum.USDC_CIRCLE,
  },
};

const ETHEREUM_MARKETS = {
  ETH_v1_v1_4_6: {
    pTokenMarketAddress: '0xD15a15C0b6d79D9E59F4fcC0D17912219f6b470C',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  USDC_v1_v1_4_6: {
    pTokenMarketAddress: '0x8F0Ba37DAC51a8102b1203C9D9ac26724DC684Ac',
    pTokenUnderlyingAddress: ADDRESSES.ethereum.USDC,
  },
  USDT_v1_v1_4_6: {
    pTokenMarketAddress: '0x373bb8bE40Ee6f704576CDC815372ff71d6825c5',
    pTokenUnderlyingAddress: ADDRESSES.ethereum.USDT,
  },
  ETH_v2_v1_6_0: {
    pTokenMarketAddress: '0xd833F882ca07F69C4C5a069675B6B65C235325C3',
    pTokenUnderlyingAddress: ADDRESSES.null,
  },
  USDC_v2_v1_6_0: {
    pTokenMarketAddress: '0x67CeC45eB8d9f059D4c974a4BdEA357b68Ad80Ef',
    pTokenUnderlyingAddress: ADDRESSES.ethereum.USDC,
  },
  USDT_v2_v1_6_0: {
    pTokenMarketAddress: '0xDC313B592949E8F4bB91A22c6DC9f7BE11b74Ea7',
    pTokenUnderlyingAddress: ADDRESSES.ethereum.USDT,
  },
};

const BSC_MARKETS = {
    USDC_v2_v1_10_2: {
      pTokenMarketAddress: '0xc01683398fFCc86264ba17bC36977f51A1d25e06',
      pTokenUnderlyingAddress: ADDRESSES.bsc.USDC,
    },
    USDT_v2_v1_10_2: {
      pTokenMarketAddress: '0xddC6Df52F9749ED80966Fb6a9D4C87264cC1e6C1',
      pTokenUnderlyingAddress: ADDRESSES.bsc.USDT,
    },
    BNB_v2_v1_10_2: {
      pTokenMarketAddress: '0xaCD7a2991f3514E215034Ace732Bafe005185C94',
      pTokenUnderlyingAddress: ADDRESSES.null,
    },
    BTCB_v2_v1_10_2: {
      pTokenMarketAddress: '0xA7BCF4433e044e454c43fe596C9eE8DDAF5776aC',
      pTokenUnderlyingAddress: ADDRESSES.bsc.BTCB,
    },
    ETH_v2_v1_10_2: {
      pTokenMarketAddress: '0xBdDc67911C63f63e6720A8EEfCAF08a573Fd9AE4',
      pTokenUnderlyingAddress: ADDRESSES.bsc.ETH,
    },
};

const POLYGON_POS_MARKETS = {
    USDC_v1_v1_10_2: {
      pTokenMarketAddress: '0x45913B2088E2910C3Dd168c2f08eaf2274D7bf6c',
      pTokenUnderlyingAddress: ADDRESSES.polygon.USDC,
    },
    USDT_v1_v1_10_2: {
      pTokenMarketAddress: '0x2ce0Ac2FD666a93b70fbE731C9Fe6581f410F73B',
      pTokenUnderlyingAddress: ADDRESSES.polygon.USDT,
    },
    WBTC_v1_v1_10_2: {
      pTokenMarketAddress: '0x786D8B5d16171f441BC5F2047bDf0Ea54268a735',
      pTokenUnderlyingAddress: ADDRESSES.polygon.WBTC,
    },
};

const PRIME_MARKETS = {
  moonbeam: {
    networkMarkets: MOONBEAM_MARKETS
  },
  avax: {
    networkMarkets: AVALANCHE_MARKETS
  },
  arbitrum: {
    networkMarkets: ARBITRUM_MARKETS
  },
  ethereum: {
    networkMarkets: ETHEREUM_MARKETS
  },
  bsc: {
    networkMarkets: BSC_MARKETS
  },
  polygon: {
    networkMarkets: POLYGON_POS_MARKETS
  },
};

async function borrowed(_, _1, _2, { api }) {
  const moonbeamApi = new sdk.ChainApi({ chain: 'moonbeam' });

  const markets = Object.values(PRIME_MARKETS[api.chain].networkMarkets)
  let uDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: markets.map(i => i.pTokenUnderlyingAddress), permitFailure: true, })
  uDecimals = uDecimals.map(i => i ?? 18)
  let rawTvls = await moonbeamApi.multiCall({
    abi: MASTER_VIEW_CONTRACT.v1_4_6.abi.calculateAssetTVL,
    target: MASTER_VIEW_CONTRACT.v1_4_6.address,
    calls: markets.map(i => ({ params: [api.getChainId(), i.pTokenMarketAddress] })),
  })
  rawTvls.forEach((v, i) => api.add(markets[i].pTokenUnderlyingAddress, v * (10 ** uDecimals[i] / 1e18)))
  const tvlBal = await sumTokens2({ balances: {}, api, tokensAndOwners: markets.map(i => [i.pTokenUnderlyingAddress, i.pTokenMarketAddress]) })
  Object.entries(tvlBal).forEach(([token, bal]) => {
    api.add(token, bal * -1, { skipChain: true })
  })
}

async function tvl(_, _b, _cb, { api, }) {
  return sumTokens2({ api, tokensAndOwners: Object.values(PRIME_MARKETS[api.chain].networkMarkets).map(i => [i.pTokenUnderlyingAddress, i.pTokenMarketAddress]) })
}

module.exports = {
  timetravel: false,
  methodology: 'Adds the deposits of each market to the borrows that were not redeposited into that market.',
};

Object.keys(PRIME_MARKETS).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})