const ADDRESSES = require('../helper/coreAssets.json')
const { getMultipleAccounts, getProvider, sumTokens2, } = require('../helper/solana')
const { Program, BN, utils } = require("@project-serum/anchor")
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
const provider = getProvider()

async function tvlJupiter(api, jupiterVaults) {

  // /**
  //  * Jupiter perp Lend
  // */
  const JUP_PERP_PROGRAM_ID = "PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu";
  const idl = await Program.fetchIdl(JUP_PERP_PROGRAM_ID, provider);
  const perpProgram = new Program(idl, JUP_PERP_PROGRAM_ID, provider);

  for (const walletAddress of jupiterVaults) {
    const walletPubkey = new PublicKey(walletAddress);
    const accounts = await perpProgram.account.borrowPosition.all([
      {
        memcmp: {
          offset: 8, // Adjust based on your account structure
          bytes: walletPubkey.toBase58(),
        },
      },
    ]);

    if (accounts.length === 0) continue;
    const account = accounts[0].account;
    api.add(TOKEN_INFO['JLP'].mint, account.lockedCollateral);
    const BORROW_SIZE_PRECISION = 1000;
    api.add(ADDRESSES.solana.USDC, -account.borrowSize / BORROW_SIZE_PRECISION);
  }

  // /**
  //  * Jupiter Earn
  // */
  /* 
    added price support for jupiter earn tokens here: https://github.com/DefiLlama/defillama-server/commit/e496acfb4bec2f8da309da1d18b0f0f9e10cbc3f   
    */
}

async function getDriftTvl(api, vaults) {
  const vaultUserAddresses = [
    '3Wg1GaW4Szame9bzKScxM56DHgDAKTq4c9674LPEuNNP', // DeltaNeutral-JLP-USDC-SOL-KT1
    'FmrEVTqKUG9npwaQBbrHKt1VXL5LJPPhzQazjCh1fwwB', // DeltaNeutral-JLP-USDC-EVM-KT4
    'J5VbheCue9U4hW7u9DZzwgo5h7BhnBqL8rF9c71MDsfC', // DeltaNeutral-JLP-USDC-SVM-KT5
    'AcN9Mct9dLYQVDsyQinbbHKbsXYB4Tnaq5DgKwzrWaY4', // DeltaNeutral-JLP-SOL-SVM-KT6
    'B84ppdVLsqk8L2rGPYkV1R3w1UxL71RCmuDQJHNLZGHT', // DeltaNeutral-JLP-USDC-KT9
  ];

  const idl = require("./drift_idl.json")
  const programId = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH')
  const program = new Program(idl, programId, provider)


  for (const account of vaults) {
    const authorityPk = new PublicKey(account);
    const userPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from(utils.bytes.utf8.encode('user')),
        authorityPk.toBuffer(),
        new BN(0).toArrayLike(Buffer, 'le', 2),
      ],
      programId,
    )[0];
    vaultUserAddresses.push(userPda)
  }

  const accounts = await getMultipleAccounts(vaultUserAddresses)
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

async function tvlSolana(api) {
  const vaults = [
    'BKVWqzbwXGFqQvnNVfGiM2kSrWiR88fYhFNmJDX5ccyv',
    "GYfHKWyvYN6DLHxZeptq6Drnb6hxqKgaKteMBsMG7u8Q"
  ]

  await getDriftTvl(api, vaults);
  await tvlJupiter(api, vaults);

  // add wallet balance 
  return sumTokens2({ api, owners: vaults, })
}

async function tvlArbitrum(api) {
  const vaults = [
    "0xd468808cc9e30f0ae5137805fff7ffb213984250",
    "0x148D779ABAD372C080844F3bF14002a5659858a7",
    "0xe15A7A5d2f1B7046af75e239a83d052B8fDb4230",
    "0xf13891426ecc002d9b3c9c293bcc176e3ceb04e7",
    "0xd51298f8eaf78943a67535a24f4bcb18b787ba0e",
    "0x5C83942B7919db30634f9Bc9e0e72aD778852FC8",
    "0x34931CeF6b414b08E04AA98b251fBA96B9Ec363c",
    "0xA163c206D11d888935f3203C27c4C876eD275fE9",
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
  const v2ReaderAbi = {
    "getAccountPositions": "function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (((address account, address market, address collateralToken) addresses, (uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtBlock, uint256 decreasedAtBlock) numbers, (bool isLong) flags)[])",
    "getMarkets": "function getMarkets(address dataStore, uint256 start, uint256 end) view returns ((address marketToken, address indexToken, address longToken, address shortToken)[])"
  };
  const v2ReaderAddress = '0xf60becbba223EEA9495Da3f606753867eC10d139';
  const dataStoreAddress = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';

  const markets = await api.call({
    abi: v2ReaderAbi.getMarkets,
    target: v2ReaderAddress,
    params: [dataStoreAddress, 0, 32]
  })

  const marketToTokenMap = {};
  for (const market of markets) {
    marketToTokenMap[market[0]] = market[1];
  }
  await api.sumTokens({
    tokens: [
      // Wallet
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.null,
      ADDRESSES.arbitrum.WBTC,
      // GMXv2 Earn
      addresses.gmWeth,
      addresses.gmBtc,
      // Aave
      addresses.aaveEthAToken,
      addresses.aaveBtcAToken,
      addresses.aaveUsdcAToken,
      addresses.aaveEthDebtToken,
      addresses.aaveBtcDebtToken,
      addresses.aaveUsdcDebtToken,
    ],
    owners: vaults
  })

  // GMXv2 Trade
  const calls = vaults.map(vault => ({ params: [dataStoreAddress, vault, 0, 999999999999], }))
  const positions = await api.multiCall({
    abi: v2ReaderAbi.getAccountPositions,
    target: v2ReaderAddress,
    calls,
  });
  for (const pos of positions) {
    if (!pos) continue;
    for (const p of pos) {
      if (!p.addresses || !p.numbers) continue;
      const flag = p.flags.isLong ? 1 : -1;
      // collateral
      api.add(p.addresses.collateralToken, p.numbers.collateralAmount);
      // pnl = sizeInTokens * tokenPrice - sizeInUsd
      api.add(marketToTokenMap[p.addresses.market], p.numbers.sizeInTokens * flag);
      api.add(ADDRESSES.arbitrum.USDC_CIRCLE, -p.numbers.sizeInUsd * 1e-24 * flag);
    }
  }

}

async function tvlEthereum(api) {
  const vaults = [
    "0x5C83942B7919db30634f9Bc9e0e72aD778852FC8",
  ];
  const addresses = {
    weth: ADDRESSES.ethereum.WETH,
    usdc: ADDRESSES.ethereum.USDC,
    usdt: ADDRESSES.ethereum.USDT,
    usde: ADDRESSES.ethereum.USDe,
    aaveWethAToken: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
    aaveUsdcAToken: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c',
    aaveUsdtAToken: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a',
    aaveUsdeAToken: '0x4F5923Fc5FD4a93352581b38B7cD26943012DECF',
    aaveWethDebtToken: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE',
    aaveUsdcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004',
    aaveUsdtDebtToken: '0x6df1C1E379bC5a00a7b4C6e67A203333772f45A8',
    aaveUsdeDebtToken: '0x015396E1F286289aE23a762088E863b3ec465145',
  };

  await api.sumTokens({
    tokens: [
      addresses.weth,
      addresses.usdc,
      addresses.usdt,
      addresses.usde,
      addresses.aaveWethAToken,
      addresses.aaveUsdcAToken,
      addresses.aaveUsdtAToken,
      addresses.aaveUsdeAToken,
      addresses.aaveWethDebtToken,
      addresses.aaveUsdcDebtToken,
      addresses.aaveUsdtDebtToken,
      addresses.aaveUsdeDebtToken,
    ],
    owners: vaults
  });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Solana: Drift | Arbitrum: Aave, GMX | Ethereum: Aave",
  solana: { tvl: tvlSolana },
  arbitrum: { tvl: tvlArbitrum },
  ethereum: { tvl: tvlEthereum },
};
