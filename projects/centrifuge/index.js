const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const contractAbis = {
  getVault: "function vault(address asset) external view returns (address)",
  totalAssets: "function totalAssets() external view returns (uint256)",
};


const config = {
  ethereum: {
    factories: [
      {
        START_BLOCK: 20432393,
        TOKEN_FACTORY: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29'
      }
    ],
    assets: {
      USDC: ADDRESSES.ethereum.USDC
    }
  },
  base: {
    factories: [
      {
        START_BLOCK: 17854404,
        TOKEN_FACTORY: '0x7f192F34499DdB2bE06c4754CFf2a21c4B056994'
      }
    ],
    assets: {
      USDC: ADDRESSES.base.USDC
    }
  },
  arbitrum: {
    factories: [
      {
        START_BLOCK: 238245701,
        TOKEN_FACTORY: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29'
      }
    ],
    assets: {
      USDC: ADDRESSES.arbitrum.USDC_CIRCLE
    }
  },
}

async function tvl(api) {
  if (config[api.chain]) {
    const targets = await getTokens(api);

    const vaults = await api.multiCall({
      abi: contractAbis.getVault,
      calls: targets.map(i => ({ target: i, params: [config[api.chain].assets.USDC] })),
      permitFailure: true
    });

    const totalAssets = await api.multiCall({
      abi: contractAbis.totalAssets,
      calls: vaults.map(i => ({ target: i })),
      permitFailure: true
    });

    const decimals = await api.multiCall({
      abi: "erc20:decimals",
      calls: targets.map(i => ({ target: i })),
      permitFailure: true
    });

    for (let i = 0; i <= targets.length; i++) {
      if (totalAssets[i] > 0 && decimals[i] > 0) {
        let value = totalAssets[i] / 10 ** (decimals[i]);
        api.addUSDValue(value);
      }
    }
  }
}

async function getTokens(api) {
  const chain = api.chain;
  let logs = [];
  let tokenAddresses = [];
  if (config[chain]) {
    for (let factory of config[chain].factories) {
      const { TOKEN_FACTORY, START_BLOCK } = factory;
      let logChunk = await getLogs({
        api,
        target: TOKEN_FACTORY,
        fromBlock: START_BLOCK,
        eventAbi: 'event DeployTranche(uint64 indexed poolId, bytes16 indexed trancheId, address indexed tranche)',
      });
      logs = [...logs, ...logChunk];
    }

    tokenAddresses = logs.map((log) => log.args[2]);

  }
  return tokenAddresses;
}


module.exports = {
  methodology: `TVL corresponds to the total USD value of tokens minted on Centrifuge across Ethereum, Base, and Arbitrum.`,
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
}