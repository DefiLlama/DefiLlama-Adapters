const _ = require('underscore');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const liquidityAbi = require('./abi/liquidity.json');

const ETH = '0x0000000000000000000000000000000000000000';

const LIQUIDITY_POOL_CONTRACTS = {
  liquidityPoolContractV3: '0x35fFd6E268610E764fF6944d07760D0EFe5E40E5',
  liquidityPoolContractV4: '0x4F868C1aa37fCf307ab38D215382e88FCA6275E2'
}
const HIDING_VAULT_START_BLOCK_NUMBER = 12690306;
const HIDING_VAULT_CONTRACT = '0xE2aD581Fc01434ee426BB3F471C4cB0317Ee672E';
const COMPOUND_COMPTROLLER_ADDRESS = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

// cache some data
let markets = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': {
    symbol: 'ETH',
    decimals: 18,
    kToken: '0xC4c43C78fb32F2c7F8417AF5af3B85f090F1d327',
  },
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
    symbol: 'WETH',
    decimals: 18,
    kToken: '0xac19815455C2c438af8A8b4623F65f091364be10',
  },
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
    symbol: 'USDC',
    decimals: 6,
    kToken: '0xac826952bc30504359a099c3a486d44E97415c77',
  },
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
    symbol: 'DAI',
    decimals: 18,
    kToken: '0x0314b6CC36Ea9b48f34a350828Ce98F17B76bC44',
  },
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
    symbol: 'WBTC',
    decimals: 8,
    kToken: '0xDfd1B73e7635D8bDA4EF16D5f364c6B6333769C8',
  },
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': {
    symbol: 'renBTC',
    decimals: 8,
    kToken: '0xDcAF89b0937c15eAb969Ea01f57AAacc92A21995',
  },
};

async function getToken(block, index, liquidityPool) {
  for (let i = 0; i < 5; i++) {
    try {
      return (await sdk.api.abi.call({
        block,
        target: liquidityPool,
        params: [index],
        abi: liquidityAbi['registeredTokens'],
      })).output
    } catch (e) {
    }
  }
  return null
}

async function getAllTokens(block, liquidityPool) {
  let tokens = []
  for (let i = 0; ; i++) {
    const token = await getToken(block, i, liquidityPool)

    if (!token) {
      break;
    }

    tokens.push(token)
  }

  return tokens;
}

async function getKToken(block, token, liquidityPool) {
  return (await sdk.api.abi.call({
    block,
    target: liquidityPool,
    params: [token],
    abi: liquidityAbi['kToken'],
  })).output;
}

// returns {[underlying]: {kToken, decimals, symbol}}
async function getMarkets(block, liquidityPool) {
  if (block < 11908288) {
    // the allMarkets getter was only added in this block.
    return markets;
  } else {
    let allTokens = await getAllTokens(block, liquidityPool);
    // if not in cache, get from the blockchain
    for (token of allTokens) {
      let kToken = await getKToken(block, token, liquidityPool);

      if (!markets[token]) {
        let info = await sdk.api.erc20.info(token);
        markets[token] = { kToken, decimals: info.output.decimals, symbol: info.output.symbol };
      }
    }

    return markets;
  }
}

// Calculates all the token balances in Hiding Vault NFTs minted till the given block
async function getHidingVaultBalances(timestamp, block) {
  let hidingVaultBalances = {}

  // Track TVL of Hiding Vaults after it went live
  if (block > HIDING_VAULT_START_BLOCK_NUMBER) {
    // Get total Hiding Vault NFT count by calling totalSupply on Hiding Vault Contract
    // Using erc20 lib as erc721 lib isn't supported yet.
    let noOfHidingVaults = (await sdk.api.erc20.totalSupply({
      target: HIDING_VAULT_CONTRACT,
      block: block
    })).output;

    // numberRange to iterate over indexes of NFTs. Can migrate to any supported util func of erc721 when it is supported.
    const indexRange = _.range(0, parseInt(noOfHidingVaults));

    // Query Hiding Vault Contract's 'tokenByIndex' with index to get individual HidingVaultNFTs
    let totalHidingVaultNFTs = (await sdk.api.abi.multiCall({
      target: HIDING_VAULT_CONTRACT,
      calls: _.map(indexRange, (index) => ({
        params: [index],
      })),
      abi: liquidityAbi['tokenByIndex'],
      block: block
    })).output;

    totalHidingVaultNFTs = totalHidingVaultNFTs.map(hidingVaultNFT => hidingVaultNFT.output);

    // all of Compound's supply & borrow assets adresses
    const { output: cTokens } = await sdk.api.abi.call(
      {
        block,
        target: COMPOUND_COMPTROLLER_ADDRESS,
        params: [],
        abi: liquidityAbi["getAllMarkets"]
      }
    )

    // for each of Compound's cTokens get all of hidingVaultNFT balance and the underlying token address
    await Promise.all(cTokens.map(async (cTokenAddress) => {
      // get the underlying token address
      const isCEth = cTokenAddress.toLowerCase() === "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5"
      const { output: token } = isCEth
        ? { output: '0x0000000000000000000000000000000000000000' } // ETH has no underlying asset on Compound
        : await sdk.api.abi.call(
          {
            block,
            target: cTokenAddress,
            params: [],
            abi: liquidityAbi["underlying"]
          }
        )

      // making a call to get the asset balance for each hidingVaultNFT
      const calls = []

      totalHidingVaultNFTs.forEach(hidingVaultNFT => {
        calls.push({
          target: cTokenAddress,
          params: [hidingVaultNFT]
        })
      })

      const underlyingBalances = await sdk.api.abi.multiCall({
        abi: liquidityAbi["balanceOfUnderlying"],
        calls,
        block,
      });

      // accumulating all our hidingVaultNFT balances to calculate the TVL for this cToken
      const sumTotal = underlyingBalances.output.map(({ output }) => output).reduce((acc, val) => {
        return (new BigNumber(acc).plus(new BigNumber(val))).toString(10)
      }, "0")

      hidingVaultBalances[token] = (new BigNumber(hidingVaultBalances[token] || "0").plus(new BigNumber(sumTotal))).toString(10);
    }));
  }

  return hidingVaultBalances;
}

// Calculates the token balances in Liquidity Pool Contracts till the given block
async function getLiquidityPoolBalances(timestamp, block) {
  let liquidityPoolBalances = {};

  // Cumulative token balances from all liqudity pool contracts
  for (let liquidityPool of Object.values(LIQUIDITY_POOL_CONTRACTS)) {
    let markets = await getMarkets(block, liquidityPool);
    // Get token balances
    let balances = await sdk.api.abi.multiCall({
      block,
      calls: _.map(markets, (data, token) => ({
        target: token,
        params: liquidityPool,
      })).filter(m => m.target !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"),
      abi: 'erc20:balanceOf',
    });

    sdk.util.sumMultiBalanceOf(liquidityPoolBalances, balances);

    let ethBalance = (await sdk.api.eth.getBalance({ target: liquidityPool, block })).output;
    sdk.util.sumSingleBalance(liquidityPoolBalances, ETH, ethBalance)
  }

  return liquidityPoolBalances;
}

async function tvl(timestamp, block) {
  const liquidityPoolBalances = await getLiquidityPoolBalances(timestamp, block);
  const hidingVaultBalances = await getHidingVaultBalances(timestamp, block);

  const totalBalances = {};

  _.uniq(Object.keys(hidingVaultBalances).concat(Object.keys(liquidityPoolBalances))).forEach(asset => {
    totalBalances[asset] = new BigNumber(hidingVaultBalances[asset] || "0").plus(new BigNumber(liquidityPoolBalances[asset] || "0")).toString(10);
  });

  return totalBalances;
}

module.exports = {
  start: 1611991703, // 01/30/2021 @ 07:28:23 AM +UTC
  ethereum: {
    tvl
  }
};
