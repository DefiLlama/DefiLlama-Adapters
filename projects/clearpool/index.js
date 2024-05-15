//  npm i -f
//  node test.js projects/clearpool/index.js

const abi = require("./abi.json");

const { stakings } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");

const singleStakingContracts = ["0x629E39da1Db5654fe59cAE31d48CAEBB8dC2A9c6"];
const CPOOL = "0x66761fa41377003622aee3c7675fc7b5c1c2fac5";

module.exports = {
  methodology: "We count liquidity by Stables deposited on the pools contracts",
};

const CHAIN = {
  ARBITRUM: "arbitrum",
  AVAX: "avax",
  ETHEREUM: "ethereum",
  OPTIMISM: "optimism",
  POLYGON: "polygon",
  POLYGON_ZKEVM: "polygon_zkevm",
  FLARE: "flare",
  BASE: "base",
  MANTLE: 'mantle'
};

const config = {
  dynamic: {
    [CHAIN.ETHEREUM]: {
      factory: "0xde204e5a060ba5d3b63c7a4099712959114c2d48",
      fromBlock: 14443222,
    },
    [CHAIN.POLYGON_ZKEVM]: {
      factory: "0xCE3Fec90A05992dF1357651FEF6D143FeeC7Ca16",
      fromBlock: 302970,
    },
    [CHAIN.POLYGON]: {
      factory: "0x215CCa938dF02c9814BE2D39A285B941FbdA79bA",
      fromBlock: 31128013,
    },
    [CHAIN.OPTIMISM]: {
      factory: "0x99C10A7aBd93b2db6d1a2271e69F268a2c356b80",
      fromBlock: 107128813,
    },
    [CHAIN.ARBITRUM]: {
      factory: "0x99C10A7aBd93b2db6d1a2271e69F268a2c356b80",
      fromBlock: 113112037,
    },
    [CHAIN.MANTLE]: {
       factory: '0xB217D93a8f6A4b7861bB2C865a8C22105FbCdE41', 
       fromBlock: 49691965 ,
    }
  },
  vaults: {
    [CHAIN.BASE]: {
      factory: "0x199A016FFbe14781365bCaED9Cc52598B205DfAd",
      fromBlock: 12634153,
    },
    [CHAIN.AVAX]: {
      factory: "0x8E557363AC9E5cbf09A2616A302CA3c8f6ab2b7A",
      fromBlock: 42597808,
    },
  },
  treasury: {
    [CHAIN.FLARE]: {
      factory: "0x8E557363AC9E5cbf09A2616A302CA3c8f6ab2b7A",
      fromBlock: 23711495,
    },
  },
};

const getEventAndABI = (protocol) => {
  let borrowFn = "";
  let abi = "";
  switch (protocol) {
    case "dynamic":
      (abi =
        "event PoolCreated(address indexed pool, address indexed owner, address indexed token)"),
        (borrowFn = "uint256:borrows");
      break;
    case "vaults":
      (abi =
        "event PoolCreated(uint256 depositCap, uint256 repaymentFrequency, uint256 minimumNoticePeriod, uint256 minDeposit, uint256 lendAPR, address indexed asset, address indexed borrower, address pool, address bondNft, bool indexed kycRequired)"),
        (borrowFn = "uint256:poolSize");
      break;
    case "treasury":
      (abi =
        "event PoolCreated(address asset, address treasuryYieldAddress, address manager, bool kycRequired)"),
        (borrowFn = "uint256:cash");
      break;
  }
  return { borrowFn, abi };
};

Object.keys(config).forEach((protocol) => {
  const networks = Object.keys(config[protocol]);
  networks.forEach((chain) => {
    const { fromBlock, factory } = config[protocol][chain];
    const { abi, borrowFn } = getEventAndABI(protocol);

    const tvl = async (api) => {
      const { pools, tokens } = await _getLogs(api);
      return api.sumTokens({ tokensAndOwners2: [tokens, pools] });
    };

    async function _getLogs(api) {
      const logs = await getLogs({
        api,
        target: factory,
        fromBlock,
        eventAbi: abi,
        onlyArgs: true,
      });

      const pools = logs.map((log) =>
        protocol == "treasury" ? log.treasuryYieldAddress : log.pool
      );
      const tokens = logs.map((log) =>
        protocol == "dynamic" ? log.token : log.asset
      );
      return { pools, tokens };
    }

    const borrowed = async (api) => {
      const { pools, tokens } = await _getLogs(api);
      const bals = await api.multiCall({ abi: borrowFn, calls: pools });
      api.addTokens(tokens, bals);
    };

    module.exports[chain] = { tvl, borrowed };
  });
});

module.exports.ethereum.staking = stakings(singleStakingContracts, CPOOL);
