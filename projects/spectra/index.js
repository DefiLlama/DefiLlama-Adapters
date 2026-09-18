const { getLogs } = require("../helper/cache/getLogs");
const abi = {
    "markets": {
      "balances": "function balances(uint256 index) view returns (uint256)"
    },
    "pt": {
      "getIBT": "function getIBT() view returns (address)",
      "balanceOf": "function balanceOf(address account) view returns (uint256)"
    },
    "vault": {
      "convertToAsset": "function convertToAssets(uint256 shares) view returns (uint256 assets)",
      "asset": "function asset() view returns (address assetTokenAddress)"
    }
  };
const config = {
  "ethereum": [
    {
      "factory": "0xae4d5d5199265512B2a77Ad675107735B891aBc8",
      "fromBlock": 19727256
    },
    {
      "factory": "0xDBE5B6AaC70EeA77C5b59B6c54D8F21DffAA8D84",
      "fromBlock": 22345842
    }
  ],
  "arbitrum": [
    {
      "factory": "0x51100574E1CF11ee9fcC96D70ED146250b0Fdb60",
      "fromBlock": 204418891
    },
    {
      "factory": "0x9055eBE4E01040c0c4a6D9Bb84a13188981c62D4",
      "fromBlock": 330060717
    }
  ],
  "optimism": [
    {
      "factory": "0x9c594C2e2e2e5aa300be12596215188C324c3E7c",
      "fromBlock": 122132149
    },
    {
      "factory": "0x3945ce79F528906c232c6834D00c8F6A218b8BF5",
      "fromBlock": 134991788
    }
  ],
  "base": [
    {
      "factory": "0x51100574E1CF11ee9fcC96D70ED146250b0Fdb60",
      "fromBlock": 16537568
    },
    {
      "factory": "0xDBE5B6AaC70EeA77C5b59B6c54D8F21DffAA8D84",
      "fromBlock": 29396708
    }
  ],
  "sonic": [
    {
      "factory": "0xC9092777bF098e74B23B66c4140064eB3FcCD0F1",
      "fromBlock": 1856411
    },
    {
      "factory": "0x100F22121d8c86367B14bA67968DCA8001C9FA79",
      "fromBlock": 22214752
    }
  ],
  "hemi": [
    {
      "factory": "0x51100574E1CF11ee9fcC96D70ED146250b0Fdb60",
      "fromBlock": 1289435
    },
    {
      "factory": "0x2c06c9D02a3455F1B22B9365EB76Bf558dB1B947",
      "fromBlock": 1658441
    }
  ],
  "avax": [
    {
      "factory": "0x64FCC3A02eeEba05Ef701b7eed066c6ebD5d4E51",
      "fromBlock": 62814000
    }
  ],
  "bsc": [
    {
      "factory": "0x64FCC3A02eeEba05Ef701b7eed066c6ebD5d4E51",
      "fromBlock": 50421500
    }
  ],
  "hyperliquid": [
    {
      "factory": "0xd187cb71fe8201935e6676ff872239fff552d4a5",
      "fromBlock": 6375000
    }
  ],
  "katana": [
    {
      "factory": "0xac61e44816160028474fd9f5baae492b5620f370",
      "fromBlock": 4715236
    }
  ],
  "flare": [
    {
      "factory": "0x5c86800dfc65ca3e3a062feeee4d867c92771b95",
      "fromBlock": 46466744
    }
  ],
  "monad": [
    {
      "factory": "0x6cba8213deeafe86ffb38f295edd5625cae4dd05",
      "fromBlock": 37910245
    }
  ]
};
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js")

// staking - SPECTRA token
const SPECTRA = "0x64fcc3a02eeeba05ef701b7eed066c6ebd5d4e51"
const veSPECTRA = "0x6a89228055c7c28430692e342f149f37462b478b"

module.exports = {
  methodology: `All deposited underlying in Spectra Principal Tokens and all underlying supplied as liquidity in Spectra Markets`,
  hallmarks: [['2024-05-30', "V2 Launch"]],
};

const curvePoolDeployedTopic = "0x3c7b686d948efcba31c9cfd1aeae78faac70fe0c1ed90d151d49c75e85027a91";
const ptDeployedTopic = "0xcf50c3e7162cc35f5befd4f0379ddd760d499ca96330c9ae8faa4059919caaee";

const getMarkets = async (api, factory, fromBlock) => {
  const logs = await getLogs({
    api,
    target: factory,
    topic: curvePoolDeployedTopic,
    eventAbi: "event CurvePoolDeployed(address indexed poolAddress, address indexed ibt, address indexed pt)",
    onlyArgs: true,
    fromBlock: fromBlock,
    extraKey: "markets",
  });

  return logs.map((i) => [i.poolAddress, i.ibt]);
}

const getPTs = async (api, factory, fromBlock) => {
  const logs = await getLogs({
    api,
    target: factory,
    topic: ptDeployedTopic,
    eventAbi: "event PTDeployed(address indexed pt, address indexed poolCreator)",
    onlyArgs: true,
    fromBlock: fromBlock,
    extraKey: "pts",
  });
  
  return logs.map((i) => i.pt);
}

const tvl = async (api) => {
  const sources = config[api.chain]
  const [marketDatas, pts] = await Promise.all([
    Promise.all(sources.map(({ factory, fromBlock }) => getMarkets(api, factory, fromBlock))).then(data => data.flat()),
    Promise.all(sources.map(({ factory, fromBlock }) => getPTs(api, factory, fromBlock))).then(data => data.flat())
  ])

  const marketsBalances = await api.multiCall({ calls: marketDatas.map(([market]) => ({ target: market, params: [0] })), abi: abi.markets.balances })
  const ptIBTs = await api.multiCall({ calls: pts, abi: abi.pt.getIBT })
  const ptIBTbals = await api.multiCall({ calls: pts.map((pt, i) => ({ target: ptIBTs[i], params: [pt] })), abi: 'erc20:balanceOf' })

  const poolIBTBalances = marketDatas.reduce((acc, market, i) => {
    const ibt = market[1];
    const balance = (+marketsBalances[i]);
    acc[ibt] = (acc[ibt] || 0) + balance;
    return acc;
  }, {});

  const ptIBTBalances = ptIBTs.reduce((acc, ibt, i) => {
    const balance = (+ptIBTbals[i]);
    acc[ibt] = (acc[ibt] || 0) + balance;
    return acc;
  }, {});
  
  const allIBTBalances = { ...poolIBTBalances };
  for (const [ibt, balance] of Object.entries(ptIBTBalances)) {
    allIBTBalances[ibt] = (allIBTBalances[ibt] || 0) + balance;
  }

  const assets = await api.multiCall({ calls: Object.keys(allIBTBalances).map((ibt) => ({ target: ibt })), abi: abi.vault.asset })
  const assetsBalances = await api.multiCall({ calls: Object.entries(allIBTBalances).map(([ibt, balance]) => ({ target: ibt, params: [BigInt(balance)] })), abi: abi.vault.convertToAsset, permitFailure :true })

  assets.forEach((asset, i) => {
    const assetsBalance = assetsBalances[i]
    if (!assetsBalance) return;
    api.add(asset, assetsBalance)
  })
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.base.staking = staking(veSPECTRA, SPECTRA)