const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');

const getAllOwnedAssetsAbi = "function getAllOwnedAssets() view returns (bytes32[] result)";
const getLoansAbi = "function getLoans(uint256 _from, uint256 _count) view returns (address[] _loans)";
const getPrimeAccountsLengthAbi = "uint256:getLoansLength";

// const ggAVAXBalancerBalanceAbi = "function balancerGgAvaxBalance() view returns (uint256)";
// const yyAVAXBalancerBalanceAbi = "function balancerYyAvaxBalance() view returns (uint256)";
// const sAVAXBalancerBalanceAbi = "function balancerSAvaxBalance() view returns (uint256)";

// const yieldYakWombatAvaxBalanceInWombatAvaxSavaxLP = "function avaxBalanceAvaxSavaxYY() view returns (uint256)";
// const yieldYakWombatSAvaxBalanceInWombatAvaxSavaxLP = "function sAvaxBalanceAvaxSavaxYY() view returns (uint256)";
// const yieldYakWombatsAvaxBalanceInWombatAvaxGgavaxLP = "function avaxBalanceAvaxGgavaxYY() view returns (uint256)";
// const yieldYakWombatsGgavaxBalanceInWombatAvaxGgavaxLP = "function ggAvaxBalanceAvaxGgavaxYY() view returns (uint256)";

const assetToAddressMappingAvalanche = require('./mappings/assetToAddressMappingAvalanche.json');
const assetToAddressMappingArbitrum = require('./mappings/assetToAddressMappingArbitrum.json');

// Avalanche
const USDC_POOL_TUP_CONTRACT = '0x8027e004d80274FB320e9b8f882C92196d779CE8';
const USDT_POOL_TUP_CONTRACT = '0x1b6D7A6044fB68163D8E249Bce86F3eFbb12368e';
const WAVAX_POOL_TUP_CONTRACT = '0xaa39f39802F8C44e48d4cc42E088C09EDF4daad4';
const BTC_POOL_TUP_CONTRACT = '0x70e80001bDbeC5b9e932cEe2FEcC8F123c98F738';
const ETH_POOL_TUP_CONTRACT = '0x2A84c101F3d45610595050a622684d5412bdf510';

const SMART_LOANS_FACTORY_TUP_AVALANCHE = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';

// Arbitrum
const USDC_POOL_TUP_ARBI_CONTRACT = '0x8Ac9Dc27a6174a1CC30873B367A60AcdFAb965cc';
const ETH_POOL_TUP_ARBI_CONTRACT = '0x788A8324943beb1a7A47B76959E6C1e6B87eD360';
const BTC_POOL_TUP_ARBI_CONTRACT = '0x0ed7B42B74F039eda928E1AE6F44Eed5EF195Fb5';
const ARB_POOL_TUP_ARBI_CONTRACT = '0xC629E8889350F1BBBf6eD1955095C2198dDC41c2';
const DAI_POOL_TUP_ARBI_CONTRACT = '0xFA354E4289db87bEB81034A3ABD6D465328378f1';

const SMART_LOANS_FACTORY_TUP_ARBITRUM = '0xFf5e3dDaefF411a1dC6CcE00014e4Bca39265c20';

const ACCOUNTS_BATCH_SIZE = 500;

async function getAllPrimeAccounts(api, factoryAddress) {
  const accounts = [];
  const numberOfAccounts = await api.call({ abi: getPrimeAccountsLengthAbi, target: factoryAddress });

  for (let from = 0; from < numberOfAccounts; from += ACCOUNTS_BATCH_SIZE) {
    const batchPrimeAccounts = await api.call({ abi: getLoansAbi, target: factoryAddress, params: [from, ACCOUNTS_BATCH_SIZE] });
    accounts.push(...batchPrimeAccounts);
  }

  sdk.log(`Found ${accounts.length} accounts on ${api.chain}`);
  return accounts;
}

async function addOwnedAssetsToTokensAndOwners({ api, accounts, assetMapping, tokensAndOwners }) {
  const ownedAssets = await api.multiCall({ abi: getAllOwnedAssetsAbi, calls: accounts });

  accounts.forEach((owner, i) => {
    ownedAssets[i].forEach((tokenBytes) => {
      const symbol = ethers.decodeBytes32String(tokenBytes);
      const token = assetMapping[symbol];

      if (!token) {
        sdk.log(`Missing asset mapping for: ${symbol} on ${api.chain}`);
        return;
      }

      tokensAndOwners.push([token, owner]);
    });
  });
}

async function addCustomLPBalances({ api, accounts, balances, assetMapping, configs}) {
  for (const { abi, key } of configs) {
    const tokenAddress = assetMapping[key];
    if (!tokenAddress) {
      sdk.log(`Missing asset mapping for LP key: ${key} on ${api.chain}`);
      continue;
    }

    const results = await api.multiCall({ abi, calls: accounts });
    results.forEach((amount) => {
      sdk.util.sumSingleBalance(balances, tokenAddress, amount, api.chain);
    });
  }
}


async function addTraderJoeLPs({ api, accounts }) {
  const pairSet = new Set();

  const binsPerAccount = await api.multiCall({ abi: 'function getOwnedTraderJoeV2Bins() public view returns (tuple(address pair, uint24 bin)[])', calls: accounts });

  const calls = [];

  binsPerAccount.forEach((bins, i) => {
    const account = accounts[i];
    bins.forEach(({ pair, bin }) => {
      const lowerPair = pair.toLowerCase();
      pairSet.add(lowerPair);
      calls.push({ target: lowerPair, bin, account });
    });
  });

  const pairs = [...pairSet];

  const [tokenXs, tokenYs] = await Promise.all([
    api.multiCall({ abi: 'function getTokenX() view returns (address)', calls: pairs }),
    api.multiCall({ abi: 'function getTokenY() view returns (address)', calls: pairs }),
  ]);

  const pairInfos = {};
  pairs.forEach((pair, i) => {
    pairInfos[pair] = {
      tokenX: tokenXs[i],
      tokenY: tokenYs[i],
    };
  });

  const balanceCalls = calls.map(({ target, account, bin }) => ({ target, params: [account, bin] }));
  const binCalls = calls.map(({ target, bin }) => ({ target, params: [bin] }));

  const [bals, binBals, binSupplies] = await Promise.all([
    api.multiCall({ abi: 'function balanceOf(address, uint256) view returns (uint256)', calls: balanceCalls }),
    api.multiCall({ abi: 'function getBin(uint24) view returns (uint128 tokenXbal,uint128 tokenYBal)', calls: binCalls }),
    api.multiCall({ abi: 'function totalSupply(uint256) view returns (uint256)', calls: binCalls }),
  ]);

  binBals.forEach(({ tokenXbal, tokenYBal }, i) => {
    const { tokenX, tokenY } = pairInfos[calls[i].target];
    const userBalance = bals[i];
    const totalSupply = binSupplies[i];

    if (!totalSupply || totalSupply === '0') return;

    const ratio = Number(userBalance) / Number(totalSupply);

    if (ratio === 0) return;

    api.add(tokenX, Number(tokenXbal) * ratio);
    api.add(tokenY, Number(tokenYBal) * ratio);
  });
}

async function tvlAvalanche(api) {
  const tokensAndOwners = [
    [assetToAddressMappingAvalanche.USDC, USDC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.USDT, USDT_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.AVAX, WAVAX_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.BTC, BTC_POOL_TUP_CONTRACT],
    [assetToAddressMappingAvalanche.ETH, ETH_POOL_TUP_CONTRACT],
  ];

  const accounts = await getAllPrimeAccounts(api, SMART_LOANS_FACTORY_TUP_AVALANCHE);

  await addTraderJoeLPs({ api, accounts });

  await addOwnedAssetsToTokensAndOwners({ api, accounts, assetMapping: assetToAddressMappingAvalanche, tokensAndOwners });

  const balances = await sumTokens2({ api, tokensAndOwners });

  await addCustomLPBalances({
    api,
    accounts,
    balances,
    assetMapping: assetToAddressMappingAvalanche,
    configs: [
      // { abi: ggAVAXBalancerBalanceAbi, key: 'BAL_ggAVAX_AVAX' },
      // { abi: yyAVAXBalancerBalanceAbi, key: 'BAL_yyAVAX_AVAX' },
      // { abi: sAVAXBalancerBalanceAbi, key: 'BAL_sAVAX_AVAX' },
      // { abi: yieldYakWombatAvaxBalanceInWombatAvaxSavaxLP, key: 'WOMBAT_sAVAX_AVAX_LP_AVAX' },
      // { abi: yieldYakWombatSAvaxBalanceInWombatAvaxSavaxLP, key: 'WOMBAT_sAVAX_AVAX_LP_sAVAX' },
      // { abi: yieldYakWombatsAvaxBalanceInWombatAvaxGgavaxLP, key: 'WOMBAT_ggAVAX_AVAX_LP_AVAX' },
      // { abi: yieldYakWombatsGgavaxBalanceInWombatAvaxGgavaxLP, key: 'WOMBAT_ggAVAX_AVAX_LP_ggAVAX' },
    ],
  });

  return balances;
}

async function tvlArbitrum(api) {
  const tokensAndOwners = [
    [assetToAddressMappingArbitrum.USDC, USDC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ETH, ETH_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.BTC, BTC_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.ARB, ARB_POOL_TUP_ARBI_CONTRACT],
    [assetToAddressMappingArbitrum.DAI, DAI_POOL_TUP_ARBI_CONTRACT],
  ];

  const accounts = await getAllPrimeAccounts(api, SMART_LOANS_FACTORY_TUP_ARBITRUM);

  await addTraderJoeLPs({ api, accounts });

  await addOwnedAssetsToTokensAndOwners({ api, accounts, assetMapping: assetToAddressMappingArbitrum, tokensAndOwners });

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: "Counts TVL of DeltaPrime's lending pools and individual PrimeAccount contracts'",
  avax: { tvl: tvlAvalanche },
  arbitrum: { tvl: tvlArbitrum },
};
