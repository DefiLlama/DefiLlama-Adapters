const { ETHER_ADDRESS } = require('@defillama/sdk/build/general')
const ADDRESSES = require('../helper/coreAssets.json')
const { getMultipleAccounts, getProvider } = require('../helper/solana')
const { Program, BN } = require("@project-serum/anchor")
const { PublicKey } = require("@solana/web3.js")

const TOKEN_INFO = {
  USDC: {
    mint: ADDRESSES.solana.USDC,
    decimals: 6,
  },
  SOL: {
    mint: ADDRESSES.solana.SOL,
    decimals: 9,
  },
  JLP: {
    mint: '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
    decimals: 6,
  },
  BTC: {
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 8,
  },
  ETH: {
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 8,
  },
}

function getTokenInfo(isSpotMarket, marketIndex) {
  if (isSpotMarket) {
    switch (marketIndex) {
      case 0:
        return TOKEN_INFO['USDC']
      case 1:
        return TOKEN_INFO['SOL']
      case 19:
        return TOKEN_INFO['JLP']
    }
  }
  else {
    switch (marketIndex) {
      case 0:
        return TOKEN_INFO['SOL']
      case 1:
        return TOKEN_INFO['BTC']
      case 2:
        return TOKEN_INFO['ETH']
    }
  }
  return undefined
}

async function tvlSolana(api) {

  const vaultUserAddresses = [
    '3Wg1GaW4Szame9bzKScxM56DHgDAKTq4c9674LPEuNNP', // DeltaNeutral-JLP-USDC-SOL-KT1
    'FmrEVTqKUG9npwaQBbrHKt1VXL5LJPPhzQazjCh1fwwB', // DeltaNeutral-JLP-USDC-EVM-KT4
    'J5VbheCue9U4hW7u9DZzwgo5h7BhnBqL8rF9c71MDsfC', // DeltaNeutral-JLP-USDC-SVM-KT5
    'AcN9Mct9dLYQVDsyQinbbHKbsXYB4Tnaq5DgKwzrWaY4', // DeltaNeutral-JLP-SOL-SVM-KT6
    'B84ppdVLsqk8L2rGPYkV1R3w1UxL71RCmuDQJHNLZGHT', // DeltaNeutral-JLP-USDC-KT9
  ];

  const accounts = await getMultipleAccounts(vaultUserAddresses)

  const idl = require("./drift_idl.json")
  const programId = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH')
  const provider = getProvider()
  const program = new Program(idl, programId, provider)    

  for (const account of accounts) {
      const userData = program.coder.accounts.decode("User", account.data);
      for (const spotPosition of userData.spotPositions) {
        if (!new BN(spotPosition.scaledBalance).isZero()) {
          const marketIndex = spotPosition.marketIndex
          const balanceType = Object.keys(spotPosition.balanceType ?? {})?.[0]
          const scaledBalance = new BN(spotPosition.scaledBalance)
          const token = getTokenInfo(true, marketIndex)
          if (!token) continue;
          const balance = scaledBalance
            .mul(new BN(balanceType === 'deposit' ? 1 : -1))
            .div(new BN(10).pow(new BN(token.decimals - 9)));
  
          api.add(token.mint, balance.toString()) 
        }        
      }
      for (const perpPosition of userData.perpPositions) {
        if (!new BN(perpPosition.baseAssetAmount).isZero()) {
          const marketIndex = perpPosition.marketIndex
          const token = getTokenInfo(false, marketIndex)
          if (!token) continue;
          const baseAssetAmount = new BN(perpPosition.baseAssetAmount)
            .div(new BN(10).pow(new BN(token.decimals - 9))); 
          const quoteAssetAmount = new BN(perpPosition.quoteAssetAmount)
          api.add(TOKEN_INFO['USDC'].mint, quoteAssetAmount.toString())
          api.add(token.mint, baseAssetAmount.toString())
        }        
      }
  }
}

async function tvlArbitrum(api) {

  const vaults = [
    "0xd468808cc9e30f0ae5137805fff7ffb213984250",
    "0x148D779ABAD372C080844F3bF14002a5659858a7",
    "0xe15A7A5d2f1B7046af75e239a83d052B8fDb4230",
    "0xf13891426ecc002d9b3c9c293bcc176e3ceb04e7",
    "0xd51298f8eaf78943a67535a24f4bcb18b787ba0e",
  ];

  const addresses = {
    gmWeth: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
    gmBtc: "0x47c031236e19d024b42f8AE6780E44A573170703",
    aaveEthAToken: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    aaveEthDebtToken: "0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351",
    aaveBtcAToken: "0x078f358208685046a11C85e8ad32895DED33A249",
    aaveBtcDebtToken: "0x92b42c66840C7AD907b4BF74879FF3eF7c529473",
    aaveUsdcAToken: "0x724dc807b04555b71ed48a6896b6F41593b8C637",
    aaveUsdcDebtToken: "0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A6",
  };

  const v2ReaderAbi = require('./v2_reader_abi.json');
  const v2ReaderAddress = '0xf60becbba223EEA9495Da3f606753867eC10d139';
  const dataStoreAddress = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';
  
  const getAccountPositionsAbi = v2ReaderAbi.find(f => f.name === 'getAccountPositions');

  const getMarketsAbi = v2ReaderAbi.find(f => f.name === 'getMarkets');
  const markets = await api.call({
    abi: getMarketsAbi,
    target: v2ReaderAddress,
    params: [dataStoreAddress, 0, 32]
  });
  const marketToTokenMap = {};
  for (const market of markets) {
    marketToTokenMap[market[0]] = market[1];
  }
  for (const vault of vaults) {
    await api.sumTokens({
      tokensAndOwners: [
        // Wallet
        [ADDRESSES.arbitrum.USDC, vault],
        [ADDRESSES.arbitrum.USDT, vault],
        [ADDRESSES.arbitrum.USDC_CIRCLE, vault],
        [ADDRESSES.arbitrum.WETH, vault],
        [ETHER_ADDRESS, vault],        
        [ADDRESSES.arbitrum.WBTC, vault],
        // GMXv2 Earn
        [addresses.gmWeth, vault],
        [addresses.gmBtc, vault],
        // Aave
        [addresses.aaveEthAToken, vault],
        [addresses.aaveBtcAToken, vault],
        [addresses.aaveUsdcAToken, vault],
        [addresses.aaveEthDebtToken, vault],
        [addresses.aaveBtcDebtToken, vault],
        [addresses.aaveUsdcDebtToken, vault],
      ]
    });
    // GMXv2 Trade
    const positions = await api.call({
      abi: getAccountPositionsAbi,
      target: v2ReaderAddress,
      params: [dataStoreAddress, vault, 0, 999999999999]
    });
    for (const pos of positions) {
      // collateral
      await api.add(pos.addresses.collateralToken, pos.numbers.collateralAmount);
      // pnl = sizeInTokens * tokenPrice - sizeInUsd
      await api.add(marketToTokenMap[pos.addresses.market], pos.numbers.sizeInTokens);
      await api.add(ADDRESSES.arbitrum.USDC_CIRCLE, -pos.numbers.sizeInUsd * 1e-24);
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Solana: Drift | Arbitrum: Aave, GMX",
  solana: { tvl: tvlSolana },
  arbitrum: { tvl: tvlArbitrum },
};
