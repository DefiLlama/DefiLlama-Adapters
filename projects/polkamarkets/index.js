const sdk = require("@defillama/sdk");

const stakingContracts = {
  "moonriver": [
    "0x60d7956805ec5a698173def4d0e1ecdefb06cc57", // realitio v1
    "0x9aB1213d360bEa3edA75D88D81D7fbfc9fd37F2b", // realitio v2
  ],
  "moonbeam": [
    "0x83d3f4769a19f1b43337888b0290f5473cf508b2", // realitio v1
    "0xf5872382381cc1a37993d185abb6281fe47f5380", // realitio v2
  ],
  "ethereum": [
    "0xfa443f0ec4aed3e87c6d608ecf737a83d950427b", // realitio v1
  ],
  "polygon": [
    "0x83d3f4769a19f1b43337888b0290f5473cf508b2", // realitio v2
  ],
  "xdai": [
    "0x537dc41fbb4f9faa4b9d6f8e6c2eb9071274f72b", // predictionMarketV3Manager
    "0xBC39fa757886E8A56422Abc460b1FFfc70bbaeC6", // predictionMarketV3Factory
  ],
  "celo": [
    "0x1f021be85d6b4d1867c43ef98d30ccc5a44791de", // predictionMarketV3Manager
    "0x0ec82449555efbe9a67cc51de3ef23a56dd79352", // predictionMarketV3Factory
  ]
};

// polkamarkets token address in each chain
const stakingToken = {
  "moonriver": "0x8b29344f368b5fa35595325903fe0eaab70c8e1f",
  "moonbeam": "0x8b29344f368b5fa35595325903fe0eaab70c8e1f",
  "ethereum": "0xd478161c952357f05f0292b56012cd8457f1cfbf",
  "polygon": "0x996F19d4b1cE6D5AD72CEaaa53152CEB1B187fD0",
  "xdai": "0x9a2a80c38abb1fdc3cb0fbf94fefe88bef828e00",
  "celo": "0xb4d8a602fff7790eec3f2c0c1a51a475ee399b2d"
};

const v1TvlContracts = {
  "moonriver": {
    "address": "0xdcbe79f74c98368141798ea0b7b979b9ba54b026", // predictionMarketV1
  },
  "moonbeam": {
    "address": "0x21DFb0a12D77f4e0D2cF9008d0C2643d1e36DA41", // predictionMarketV1
  },
  "ethereum": {
    "address": "0xc24a02d81dee67fd52cc95b0d04172032971ea10", // predictionMarketV1
  },
};

const v2TvlContracts = {
  "moonriver": {
    "address": "0x6413734f92248D4B29ae35883290BD93212654Dc", // predictionMarketV2,
    "tokens": {
      "moonriver": "0x98878b06940ae243284ca214f92bb71a2b032b8a",
      "polkamarkets": "0x8b29344f368b5fa35595325903fe0eaab70c8e1f"
    }
  },
  "moonbeam": {
    "address": "0xaaC0068EbE0BFff0FE5E3819af0c46850dC4Cc05", // predictionMarketV2,
    "tokens": {
      "moonbeam": "0xacc15dc74880c9944775448304b263d191c6077f",
      "polkamarkets": '0x8b29344f368b5fa35595325903fe0eaab70c8e1f'
    }
  },
  "polygon": {
    "address": "0x60d7956805ec5a698173def4d0e1ecdefb06cc57", // predictionMarketV2,
    "tokens": {
      "matic-network": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      "polkamarkets": "0x996F19d4b1cE6D5AD72CEaaa53152CEB1B187fD0",
      "usdc": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      "tether": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    }
  }
};

function chainTvl(chain) {
  return async function tvl({timestamp}, ethBlock, chainBlocks) {
    const balances = {};
    const v1Contract = v1TvlContracts[chain];
    const v2Contract = v2TvlContracts[chain];
    const block = chainBlocks[chain];

    if (v1Contract) {
      const balance = (
        await sdk.api.eth.getBalance({
          target: v1Contract.address,
          params: timestamp,
          chain,
          block,
        })
      ).output;

      sdk.util.sumSingleBalance(balances, chain, Number(balance) / 1e18);
    }

    if (v2Contract) {
      for (const token in v2Contract.tokens) {
        const tokenAddress = v2Contract.tokens[token];

        const { output: decimals } = await sdk.api.abi.call({
          abi: 'erc20:decimals',
          block,
          target: tokenAddress,
          chain
        });

        const erc20Balance = (
          await sdk.api.erc20.balanceOf({
            target: tokenAddress,
            owner: v2Contract.address,
            params: timestamp,
            chain,
            block,
          })
        ).output;

        sdk.util.sumSingleBalance(
          balances,
          token,
          Number(erc20Balance) / 10 ** Number(decimals)
        );
      }
    }

    return balances;
  }
}

function chainStaking(chain) {
  return async function staking(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const block = chainBlocks[chain];

    const contracts = stakingContracts[chain];

    for (const address of contracts) {
      const polkBalance = (
        await sdk.api.erc20.balanceOf({
          target: stakingToken[chain],
          owner: address,
          params: timestamp,
          chain,
          block,
        })
      ).output;

      sdk.util.sumSingleBalance(
        balances,
        "polkamarkets",
        Number(polkBalance) / 1e18
      );
    }

    return balances;
  }
}

module.exports = {
  methodology:
    "Polkamarkets TVL equals the V1 contracts' EVM balance + V2 contracts tokens balance.\n Polkamarkets staking TVL is the POLK balance of the V1+V2 bonds contracts, plus the POLK balance of V3 predictionMarketManager and predictionMarketFactory contracts.",
  moonriver: {
    tvl: chainTvl('moonriver'),
    staking: chainStaking('moonriver')
  },
  moonbeam: {
    tvl: chainTvl('moonbeam'),
    staking: chainStaking('moonbeam')
  },
  ethereum: {
    tvl: chainTvl('ethereum'),
    staking: chainStaking('ethereum')
  },
  polygon: {
    tvl: chainTvl('polygon'),
    staking: chainStaking('polygon')
  },
  xdai: {
    tvl: chainTvl('xdai'),
    staking: chainStaking('xdai')
  },
  celo: {
    tvl: chainTvl('celo'),
    staking: chainStaking('celo')
  }
};
