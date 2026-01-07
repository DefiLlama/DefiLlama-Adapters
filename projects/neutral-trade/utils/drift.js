const ADDRESSES = require('../../helper/coreAssets.json')
const { PublicKey } = require("@solana/web3.js");
const anchor = require('@coral-xyz/anchor');
const { getConfig } = require('../../helper/cache');
const { getMultipleAccounts } = require('../../helper/solana');
const { DRIFT_PROGRAM_ID } = require("../constants");
const { LAMPORTS_PER_SOL } = require('@solana/web3.js');


// copied from https://github.com/drift-labs/protocol-v2/blob/master/sdk/src/constants/
const QUOTE_PRECISION_EXP = 6;
const QUOTE_PRECISION = Math.pow(10, QUOTE_PRECISION_EXP);
const LAMPORTS_PRECISION = LAMPORTS_PER_SOL;
const LAMPORTS_EXP = Math.log10(LAMPORTS_PER_SOL);
const WRAPPED_SOL_MINT = ADDRESSES.solana.SOL;
const OracleSource = {}; // mock

const MainnetSpotMarkets = [
  {
    symbol: 'USDC',
    marketIndex: 0,
    poolId: 0,
    oracle: new PublicKey('9VCioxmni2gDLv11qufWzT3RDERhQE4iY5Gf7NTfYyAV'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.USDC),
    precision: QUOTE_PRECISION,
    precisionExp: QUOTE_PRECISION_EXP,
    pythFeedId:
      '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    pythLazerId: 7,
  },
  {
    symbol: 'SOL',
    marketIndex: 1,
    poolId: 0,
    oracle: new PublicKey('3m6i4RFWEDw2Ft4tFHPJtYgmpPe21k56M3FHeWYrgGBz'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey(WRAPPED_SOL_MINT),
    precision: LAMPORTS_PRECISION,
    precisionExp: LAMPORTS_EXP,
    serumMarket: new PublicKey('8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6'),
    phoenixMarket: new PublicKey(
      '4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg'
    ),
    openbookMarket: new PublicKey(
      'AFgkED1FUVfBe2trPUDqSqK9QKd4stJrfzq5q1RwAFTa'
    ),
    pythFeedId:
      '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    pythLazerId: 6,
  },
  {
    symbol: 'mSOL',
    marketIndex: 2,
    poolId: 0,
    oracle: new PublicKey('FAq7hqjn7FWGXKDwJHzsXGgBcydGTcK4kziJpAGWXjDb'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    serumMarket: new PublicKey('9Lyhks5bQQxb9EyyX55NtgKQzpM4WK7JCmeaWuQ5MoXD'),
    pythFeedId:
      '0xc2289a6a43d2ce91c6f55caec370f4acc38a2ed477f58813334c6d03749ff2a4',
  },
  {
    symbol: 'wBTC',
    marketIndex: 3,
    poolId: 0,
    oracle: new PublicKey('fqPfDa6uQr9ndMvwaFp4mUBeUrHmLop8Jxfb1XJNmVm'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh'),
    precision: Math.pow(10, 8),
    precisionExp: 8,
    serumMarket: new PublicKey('3BAKsQd3RuhZKES2DGysMhjBdwjZYKYmxRqnSMtZ4KSN'),
    pythFeedId:
      '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
    pythLazerId: 103,
  },
  {
    symbol: 'wETH',
    marketIndex: 4,
    poolId: 0,
    oracle: new PublicKey('6bEp2MiyoiiiDxcVqE8rUHQWwHirXUXtKfAEATTVqNzT'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
    precision: Math.pow(10, 8),
    precisionExp: 8,
    serumMarket: new PublicKey('BbJgE7HZMaDp5NTYvRh5jZSkQPVDTU8ubPFtpogUkEj4'),
    phoenixMarket: new PublicKey(
      'Ew3vFDdtdGrknJAVVfraxCA37uNJtimXYPY4QjnfhFHH'
    ),
    openbookMarket: new PublicKey(
      'AT1R2jUNb9iTo4EaRfKSTPiNTX4Jb64KSwnVmig6Hu4t'
    ),
    pythFeedId:
      '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  {
    symbol: 'USDT',
    marketIndex: 5,
    poolId: 0,
    oracle: new PublicKey('JDKJSkxjasBGL3ce1pkrN6tqDzuVUZPWzzkGuyX8m9yN'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.USDT),
    precision: QUOTE_PRECISION,
    precisionExp: QUOTE_PRECISION_EXP,
    serumMarket: new PublicKey('B2na8Awyd7cpC59iEU43FagJAPLigr3AP3s38KM982bu'),
    pythFeedId:
      '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
    pythLazerId: 8,
  },
  {
    symbol: 'jitoSOL',
    marketIndex: 6,
    poolId: 0,
    oracle: new PublicKey('9QE1P5EfzthYDgoQ9oPeTByCEKaRJeZbVVqKJfgU9iau'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey(ADDRESSES.solana.JitoSOL),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    serumMarket: new PublicKey('DkbVbMhFxswS32xnn1K2UY4aoBugXooBTxdzkWWDWRkH'),
    phoenixMarket: new PublicKey(
      '5LQLfGtqcC5rm2WuGxJf4tjqYmDjsQAbKo2AMLQ8KB7p'
    ),
    pythFeedId:
      '0x67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb',
  },
  {
    symbol: 'PYTH',
    marketIndex: 7,
    poolId: 0,
    oracle: new PublicKey('6Sfx8ZAt6xaEgMXTahR6GrT7oYB6nFBMoVyCmMyHmeJV'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    serumMarket: new PublicKey('4E17F3BxtNVqzVsirxguuqkpYLtFgCR6NfTpccPh82WE'),
    phoenixMarket: new PublicKey(
      '2sTMN9A1D1qeZLF95XQgJCUPiKe5DiV52jLfZGqMP46m'
    ),
    pythFeedId:
      '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
    pythLazerId: 3,
  },
  {
    symbol: 'bSOL',
    marketIndex: 8,
    poolId: 0,
    oracle: new PublicKey('BmDWPMsytWmYkh9n6o7m79eVshVYf2B5GVaqQ2EWKnGH'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey(ADDRESSES.solana.bSOL),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    serumMarket: new PublicKey('ARjaHVxGCQfTvvKjLd7U7srvk6orthZSE6uqWchCczZc'),
    pythFeedId:
      '0x89875379e70f8fbadc17aef315adf3a8d5d160b811435537e03c97e8aac97d9c',
  },
  {
    symbol: 'JTO',
    marketIndex: 9,
    poolId: 0,
    oracle: new PublicKey('CGCz4mB8NsDddCq6BZToRUDUuktzsAfpKYh6ATgyyCGF'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    serumMarket: new PublicKey('H87FfmHABiZLRGrDsXRZtqq25YpARzaokCzL1vMYGiep'),
    phoenixMarket: new PublicKey(
      'BRLLmdtPGuuFn3BU6orYw4KHaohAEptBToi3dwRUnHQZ'
    ),
    pythFeedId:
      '0xb43660a5f790c69354b0729a5ef9d50d68f1df92107540210b9cccba1f947cc2',
    pythLazerId: 91,
  },
  {
    symbol: 'WIF',
    marketIndex: 10,
    poolId: 0,
    oracle: new PublicKey('4QXWStoyEErTZFVsvKrvxuNa6QT8zpeA8jddZunSGvYE'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    serumMarket: new PublicKey('2BtDHBTCTUxvdur498ZEcMgimasaFrY5GzLv8wS8XgCb'),
    phoenixMarket: new PublicKey(
      '6ojSigXF7nDPyhFRgmn3V9ywhYseKF9J32ZrranMGVSX'
    ),
    openbookMarket: new PublicKey(
      'CwGmEwYFo7u5D7vghGwtcCbRToWosytaZa3Ys3JAto6J'
    ),
    pythFeedId:
      '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
    pythLazerId: 10,
  },
  {
    symbol: 'JUP',
    marketIndex: 11,
    poolId: 0,
    oracle: new PublicKey('DXqKSHyhTBKEW4qgnL7ycbf3Jca5hCvUgWHFYWsh4KJa'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey(ADDRESSES.solana.JUP),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    phoenixMarket: new PublicKey(
      '2pspvjWWaf3dNgt3jsgSzFCNvMGPb7t8FrEYvLGjvcCe'
    ),
    launchTs: 1706731200000,
    pythFeedId:
      '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
    pythLazerId: 92,
  },
  {
    symbol: 'RENDER',
    marketIndex: 12,
    poolId: 0,
    oracle: new PublicKey('97EqsAGbTnShB7oYWAFFCVVAx8PWXgDYDhcpm99izNQ4'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof'),
    precision: Math.pow(10, 8),
    precisionExp: 8,
    serumMarket: new PublicKey('2m7ZLEKtxWF29727DSb5D91erpXPUY1bqhRWRC3wQX7u'),
    launchTs: 1708964021000,
    pythFeedId:
      '0x3d4a2bd9535be6ce8059d75eadeba507b043257321aa544717c56fa19b49e35d',
    pythLazerId: 34,
  },
  {
    symbol: 'W',
    marketIndex: 13,
    poolId: 0,
    oracle: new PublicKey('CsFUXiA5dM4eCKjVBBy8tXhXzDkDRNoYjU5rjpHyfNEZ'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    phoenixMarket: new PublicKey(
      '8dFTCTAbtGuHsdDL8WEPrTU6pXFDrU1QSjBTutw8fwZk'
    ),
    launchTs: 1712149014000,
    pythFeedId:
      '0xeff7446475e218517566ea99e72a4abec2e1bd8498b43b7d8331e29dcb059389',
    pythLazerId: 102,
  },
  {
    symbol: 'TNSR',
    marketIndex: 14,
    poolId: 0,
    oracle: new PublicKey('EX6r1GdfsgcUsY6cQ6YsToV4RGsb4HKpjrkokK2DrmsS'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    phoenixMarket: new PublicKey(
      'AbJCZ9TAJiby5AY3cHcXS2gUdENC6mtsm6m7XpC2ZMvE'
    ),
    launchTs: 1712593532000,
    pythFeedId:
      '0x05ecd4597cd48fe13d6cc3596c62af4f9675aee06e2e0b94c06d8bee2b659e05',
    pythLazerId: 99,
  },
  {
    symbol: 'DRIFT',
    marketIndex: 15,
    poolId: 0,
    oracle: new PublicKey('5VJou4ufN2vE11zyZUaLsKLTXhyzCTgiq6QDsts2YnnD'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    phoenixMarket: new PublicKey(
      '8BV6rrWsUabnTDA3dE6A69oUDJAj3hMhtBHTJyXB7czp'
    ),
    launchTs: 1715860800000,
    pythFeedId:
      '0x5c1690b27bb02446db17cdda13ccc2c1d609ad6d2ef5bf4983a85ea8b6f19d07',
    pythLazerId: 249,
  },
  {
    symbol: 'INF',
    marketIndex: 16,
    poolId: 0,
    oracle: new PublicKey('B7RUYg2zF6UdUSHv2RmpnriPVJccYWojgFydNS1NY5F8'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    launchTs: 1716595200000,
    pythFeedId:
      '0xf51570985c642c49c2d6e50156390fdba80bb6d5f7fa389d2f012ced4f7d208f',
  },
  {
    symbol: 'dSOL',
    marketIndex: 17,
    poolId: 0,
    oracle: new PublicKey('4YstsHafLyDbYFxmJbgoEr33iJJEp6rNPgLTQRgXDkG2'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey(ADDRESSES.solana.dSOL),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    launchTs: 1716595200000,
    pythFeedId:
      '0x41f858bae36e7ee3f4a3a6d4f176f0893d4a261460a52763350d00f8648195ee',
  },
  {
    symbol: 'USDY',
    marketIndex: 18,
    poolId: 0,
    oracle: new PublicKey('9PgHM68FNGDK6nHb29ERDBcFrV6gNMD8LyUqwxbyyeb2'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    launchTs: 1718811089000,
    pythFeedId:
      '0xe393449f6aff8a4b6d3e1165a7c9ebec103685f3b41e60db4277b5b6d10e7326',
    pythLazerId: 276,
  },
  {
    symbol: 'JLP',
    marketIndex: 19,
    poolId: 0,
    oracle: new PublicKey('5Mb11e5rt1Sp6A286B145E4TmgMzsM2UX9nCF2vas5bs'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    launchTs: 1719415157000,
    pythFeedId:
      '0xc811abc82b4bad1f9bd711a2773ccaa935b03ecef974236942cec5e0eb845a3a',
  },
  {
    symbol: 'POPCAT',
    marketIndex: 20,
    poolId: 0,
    oracle: new PublicKey('C5fiAmQyjdfDR4EGepZqnEL3fJwMBav5yoAk6XyKMF6u'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    launchTs: 1720013054000,
    phoenixMarket: new PublicKey(
      '31XgvAQ1HgFQEk31KdszbPkVXKaQqB1bgYZPoDrFpSR2'
    ),
    pythFeedId:
      '0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce',
    pythLazerId: 130,
  },
  {
    symbol: 'CLOUD',
    marketIndex: 21,
    poolId: 0,
    oracle: new PublicKey('9Ennia27iT83kNAk3JtRKxSMzuCzsVtT4MzuxpE7anME'),
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x7358313661dcd4f842a1423aa4f7a05f009001c9113201c719621d3f1aa80a73',
    mint: new PublicKey('CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    launchTs: 1721316817000,
    pythLazerId: 404,
  },
  {
    symbol: 'PYUSD',
    marketIndex: 22,
    poolId: 0,
    oracle: new PublicKey('5QZMnsyndmphvZF4BNgoMHwVZaREXeE2rpBoCPMxgCCd'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.PYUSD),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0xc1da1b73d7f01e7ddd54b3766cf7fcd644395ad14f70aa706ec5384c59e76692',
    pythLazerId: 156,
  },
  {
    symbol: 'USDe',
    marketIndex: 23,
    poolId: 0,
    oracle: new PublicKey('5uR6oza6teuMRpjsbMi9fDhCDid2hoYdRBiLW7WzcK54'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey('DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    pythFeedId:
      '0x6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d',
    pythLazerId: 204,
  },
  {
    symbol: 'sUSDe',
    marketIndex: 24,
    poolId: 0,
    oracle: new PublicKey('BRuNuzLAPHHGSSVAJPKMcmJMdgDfrekvnSxkxPDGdeqp'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('Eh6XEPhSwoLv5wFApukmnaVSHQ6sAnoD9BmgmwQoN2sN'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    pythFeedId:
      '0xca3ba9a619a4b3755c10ac7d5e760275aa95e9823d38a84fedd416856cdba37c',
  },
  {
    symbol: 'BNSOL',
    marketIndex: 25,
    poolId: 0,
    oracle: new PublicKey('8DmXTfhhtb9kTcpTVfb6Ygx8WhZ8wexGqcpxfn23zooe'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey(ADDRESSES.solana.BNSOL),
    precision: LAMPORTS_PRECISION,
    precisionExp: LAMPORTS_EXP,
    pythFeedId:
      '0x55f8289be7450f1ae564dd9798e49e7d797d89adbc54fe4f8c906b1fcb94b0c3',
  },
  {
    symbol: 'MOTHER',
    marketIndex: 26,
    poolId: 0,
    oracle: new PublicKey('469WQgfJ6AJ3eJ8FUcdhiZawf7yNChA3hseTSyhFatHZ'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x62742a997d01f7524f791fdb2dd43aaf0e567d765ebf8fd0406a994239e874d4',
    pythLazerId: 501,
  },
  {
    symbol: 'cbBTC',
    marketIndex: 27,
    poolId: 0,
    oracle: new PublicKey('9jPy6EHpLkXaMdvfkoVnRnSdJoQysQDKKj3bW5Amz4Ci'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij'),
    precision: Math.pow(10, 8),
    precisionExp: 8,
    openbookMarket: new PublicKey(
      '2HXgKaXKsMUEzQaSBZiXSd54eMHaS3roiefyGWtkW97W'
    ),
    pythFeedId:
      '0x2817d7bfe5c64b8ea956e9a26f573ef64e72e4d7891f2d6af9bcc93f7aff9a97',
  },
  {
    symbol: 'USDS',
    marketIndex: 28,
    poolId: 0,
    oracle: new PublicKey('7pT9mxKXyvfaZKeKy1oe2oV2K1RFtF7tPEJHUY3h2vVV'),
    oracleSource: OracleSource.PYTH_STABLE_COIN_PULL,
    mint: new PublicKey('USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x77f0971af11cc8bac224917275c1bf55f2319ed5c654a1ca955c82fa2d297ea1',
  },
  {
    symbol: 'META',
    marketIndex: 29,
    poolId: 0,
    oracle: new PublicKey('DwYF1yveo8XTF1oqfsqykj332rjSxAd7bR6Gu6i4iUET'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'ME',
    marketIndex: 30,
    poolId: 0,
    oracle: new PublicKey('BboTg1yT114FQkqT6MM3P3G3CcCktuM2RePgU8Gr3K4A'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x91519e3e48571e1232a85a938e714da19fe5ce05107f3eebb8a870b2e8020169',
    pythLazerId: 93,
  },
  {
    symbol: 'PENGU',
    marketIndex: 31,
    poolId: 0,
    oracle: new PublicKey('4A3KroGPjZxPAeBNF287V3NyRwV2q8iBi1vX7kHxTCh7'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0xbed3097008b9b5e3c93bec20be79cb43986b85a996475589351a21e67bae9b61',
    pythLazerId: 97,
  },
  {
    symbol: 'BONK',
    marketIndex: 32,
    poolId: 0,
    oracle: new PublicKey('BERaNi6cpEresbq6HC1EQGaB1H1UjvEo4NGnmYSSJof4'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey(ADDRESSES.solana.BONK),
    precision: Math.pow(10, 5),
    precisionExp: 5,
    pythFeedId:
      '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
    openbookMarket: new PublicKey(
      'D3gZwng2MgZGjktYcKpbR8Bz8653i4qCgzHCf5E4TcZb'
    ),
    launchTs: 1734717937000,
    pythLazerId: 9,
  },
  {
    symbol: 'JLP-1',
    marketIndex: 33,
    poolId: 1,
    oracle: new PublicKey('3ZLn5XDgSLWhTk2NjqAU44cPkSeC5JAhW5o6w5Nz4p8R'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x6704952e00b6a088b6dcdb8170dcd591eaf64cff9e996ca75ae0ca55bfb96687',
    launchTs: 1735255852000,
  },
  {
    symbol: 'USDC-1',
    marketIndex: 34,
    poolId: 1,
    oracle: new PublicKey('9VCioxmni2gDLv11qufWzT3RDERhQE4iY5Gf7NTfYyAV'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.USDC),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    launchTs: 1735255852000,
    pythLazerId: 7,
  },
  {
    symbol: 'AI16Z',
    marketIndex: 35,
    poolId: 0,
    oracle: new PublicKey('3BGheQVvYtBNpBKSUXSTjpyKQc3dh8iiwT91Aiq7KYCU'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    pythFeedId:
      '0x2551eca7784671173def2c41e6f3e51e11cd87494863f1d208fdd8c64a1f85ae',
    launchTs: 1736384970000,
    pythLazerId: 171,
  },
  {
    symbol: 'TRUMP',
    marketIndex: 36,
    poolId: 0,
    oracle: new PublicKey('FPQjZYvHRGy51guJ77p7n9u9b8eo1ktKRc2D2g5Vysth'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x879551021853eec7a7dc827578e8e69da7e4fa8148339aa0d3d5296405be4b1a',
    launchTs: 1737219250000,
    pythLazerId: 203,
  },
  {
    symbol: 'MELANIA',
    marketIndex: 37,
    poolId: 0,
    oracle: new PublicKey('3RgNWYYcZCKf5uZfriK8ASUbGQErhH6YbpdvZQ7ZKDCf'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x8fef7d52c7f4e3a6258d663f9d27e64a1b6fd95ab5f7d545dbf9a515353d0064',
    launchTs: 1737360280000,
    pythLazerId: 145,
  },
  {
    symbol: 'AUSD',
    marketIndex: 38,
    poolId: 0,
    oracle: new PublicKey('8FZhpiM8n3mpgvENWLcEvHsKB1bBhYBAyL4Ypr4gptLZ'),
    oracleSource: OracleSource.PYTH_STABLE_COIN_PULL,
    mint: new PublicKey('AUSD1jCcCyPLybk1YnvPWsHQSrZ46dxwoMniN4N2UEB9'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0xd9912df360b5b7f21a122f15bdd5e27f62ce5e72bd316c291f7c86620e07fb2a',
    launchTs: 1738255943000,
  },
  {
    symbol: 'FARTCOIN',
    marketIndex: 39,
    poolId: 0,
    oracle: new PublicKey('2sZomfWMDuQLcFak3nuharXorHrZ3hK8iaML6ZGSHtso'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythLazerId: 182,
    launchTs: 1743086746000,
  },
  {
    symbol: 'JitoSOL-3',
    marketIndex: 40,
    poolId: 3,
    oracle: new PublicKey('Fqv8vT5fdjvBbHd5k4B4ZvnXLH6bbdKP8cMv93ybCP8W'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey(ADDRESSES.solana.JitoSOL),
    precision: Math.pow(10, 9),
    precisionExp: 9,
    serumMarket: new PublicKey('DkbVbMhFxswS32xnn1K2UY4aoBugXooBTxdzkWWDWRkH'),
    phoenixMarket: new PublicKey(
      '5LQLfGtqcC5rm2WuGxJf4tjqYmDjsQAbKo2AMLQ8KB7p'
    ),
    pythFeedId:
      '0x67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb',
  },
  {
    symbol: 'PT-fragSOL-10JUL25-3',
    marketIndex: 41,
    poolId: 3,
    oracle: new PublicKey('CLjvwowzQ2L9PrmXA6zqbamxLVeDY9vE87aBxMZLJLoY'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('8adRViFUNTe3yexj2gbQtx929zBJtWJRM8TeTzYbQBgx'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'PT-kySOL-15JUN25-3',
    marketIndex: 42,
    poolId: 3,
    oracle: new PublicKey('G4FdLzuezfaJxBd8eChuw1NU4Sq3n1rasGTwSh7dXegN'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('FxT7bPGvkS5jKF2vgnJ16MciHqtsNqxbcWTfFg7L136h'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'PT-dSOL-30JUN25-3',
    marketIndex: 43,
    poolId: 3,
    oracle: new PublicKey('BR4NCRe2R8shvDAskUt6HE3n8Ej8HdMnVqshLz97BMm9'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('8H3tZ7WcgYPKEQ7fCCAFQuaNqKdMH1EtBp2ovUPpRK3k'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'JTO-3',
    marketIndex: 44,
    poolId: 3,
    oracle: new PublicKey('DPvVSQYhZXQ2ygfT2Qjdg6iyeQVAyiz8okj88YRjy6NN'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'zBTC',
    marketIndex: 45,
    poolId: 0,
    oracle: new PublicKey('CN9QvvbGQzMnN8vJaSek2so4vFnTqgJDFrdJB8Y4tQfB'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('zBTCug3er3tLyffELcvDNrKkCymbPWysGcWihESYfLg'),
    precision: Math.pow(10, 8),
    precisionExp: 8,
    pythFeedId:
      '0x3d824c7f7c26ed1c85421ecec8c754e6b52d66a4e45de20a9c9ea91de8b396f9',
    launchTs: 1747155600000,
  },
  {
    symbol: 'ZEUS',
    marketIndex: 46,
    poolId: 0,
    oracle: new PublicKey('8cH72H3vqYPArV9QvkYJkwzTdsdNPPgVPrusz9sMmgNN'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x31558e9ccb18c151af6c52bf78afd03098a7aca1b9cf171a65b693b464c2f066',
    launchTs: 1747155600000,
    pythLazerId: 643,
  },
  {
    symbol: 'USDC-4',
    marketIndex: 47,
    poolId: 4,
    oracle: new PublicKey('9VCioxmni2gDLv11qufWzT3RDERhQE4iY5Gf7NTfYyAV'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.USDC),
    precision: QUOTE_PRECISION,
    precisionExp: QUOTE_PRECISION_EXP,
    pythFeedId:
      '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    pythLazerId: 7,
    launchTs: 1747494165000,
  },
  {
    symbol: 'USDT-4',
    marketIndex: 48,
    poolId: 4,
    oracle: new PublicKey('JDKJSkxjasBGL3ce1pkrN6tqDzuVUZPWzzkGuyX8m9yN'),
    oracleSource: OracleSource.PYTH_LAZER_STABLE_COIN,
    mint: new PublicKey(ADDRESSES.solana.USDT),
    precision: QUOTE_PRECISION,
    precisionExp: QUOTE_PRECISION_EXP,
    serumMarket: new PublicKey('B2na8Awyd7cpC59iEU43FagJAPLigr3AP3s38KM982bu'),
    pythFeedId:
      '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
    pythLazerId: 8,
  },
  {
    symbol: 'SOL-2',
    marketIndex: 49,
    poolId: 2,
    oracle: new PublicKey('3PiwrLLyiuWaxS7zJL5znGR9iYD3KWubZThdQzsCdg2e'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey(WRAPPED_SOL_MINT),
    precision: LAMPORTS_PRECISION,
    precisionExp: LAMPORTS_EXP,
  },
  {
    symbol: 'JitoSOL-2',
    marketIndex: 50,
    poolId: 2,
    oracle: new PublicKey('Fqv8vT5fdjvBbHd5k4B4ZvnXLH6bbdKP8cMv93ybCP8W'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey(ADDRESSES.solana.JitoSOL),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'JTO-2',
    marketIndex: 51,
    poolId: 2,
    oracle: new PublicKey('DPvVSQYhZXQ2ygfT2Qjdg6iyeQVAyiz8okj88YRjy6NN'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'dfdvSOL',
    marketIndex: 52,
    poolId: 0,
    oracle: new PublicKey('EUQQD2fNN7h7su5TbWpUnf22zeGtF3RjEX2hgX2YPfLd'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('sctmB7GPi5L2Q5G9tUSzXvhZ4YiDMEGcRov9KfArQpx'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'sACRED',
    marketIndex: 53,
    poolId: 4,
    oracle: new PublicKey('GheMfcCB49SuVCWrFReQDD2tLkcPDMG3qZEZWU44mHu'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('59CwZq5b6drmDizgGfxECG7f16hxDpG1nXrxPoQx4y8g'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
  },
  {
    symbol: 'EURC',
    marketIndex: 54,
    poolId: 0,
    oracle: new PublicKey('BkdSPLmw4W6twrJjAePw2bJAwDTBtxJ9t6LvNHfcBKg1'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey('HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x76fa85158bf14ede77087fe3ae472f66213f6ea2f5b411cb2de472794990fa5c',
    pythLazerId: 240,
  },
  {
    symbol: 'PT-fragSOL-31OCT25-3',
    marketIndex: 55,
    poolId: 3,
    oracle: new PublicKey('C41YpBLZfERAbV1p8DD48vDwbYhRQCbiryMx8Vp5sfo4'),
    oracleSource: OracleSource.SWITCHBOARD_ON_DEMAND,
    mint: new PublicKey('Aby6y5DYtTrhQD8i7JXLs4H3jdUTwSXDraYqnwn5tKbt'),
    precision: Math.pow(10, 9),
    precisionExp: 9,
  },
  {
    symbol: 'PUMP',
    marketIndex: 56,
    poolId: 0,
    oracle: new PublicKey('5r8RWTaRiMgr9Lph3FTUE3sGb1vymhpCrm83Bovjfcps'),
    oracleSource: OracleSource.PYTH_LAZER,
    mint: new PublicKey(ADDRESSES.solana.PUMP),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x7a01fca212788bba7c5bf8c9efd576a8a722f070d2c17596ff7bb609b8d5c3b9',
    pythLazerId: 1578,
  },
  {
    symbol: 'syrupUSDC',
    marketIndex: 57,
    poolId: 0,
    oracle: new PublicKey('GqqkoqHU5pqgTvL88xSCipH9txbPETyzvAvybQ3zRpzw'),
    oracleSource: OracleSource.PYTH_PULL,
    mint: new PublicKey('AvZZF1YaZDziPY2RCK4oJrRVrbN3mTD9NL24hPeaZeUj'),
    precision: Math.pow(10, 6),
    precisionExp: 6,
    pythFeedId:
      '0x2ad31d1c4a85fbf2156ce57fab4104124c5ef76a6386375ecfc8da1ed5ce1486',
  },
];

const MainnetPerpMarkets = [
  {
    fullName: 'Solana',
    category: ['L1', 'Infra', 'Solana'],
    symbol: 'SOL-PERP',
    baseAssetSymbol: 'SOL',
    marketIndex: 0,
    oracle: new PublicKey('3m6i4RFWEDw2Ft4tFHPJtYgmpPe21k56M3FHeWYrgGBz'),
    launchTs: 1667560505000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    pythLazerId: 6,
  },
  {
    fullName: 'Bitcoin',
    category: ['L1', 'Payment'],
    symbol: 'BTC-PERP',
    baseAssetSymbol: 'BTC',
    marketIndex: 1,
    oracle: new PublicKey('35MbvS1Juz2wf7GsyHrkCw8yfKciRLxVpEhfZDZFrB4R'),
    launchTs: 1670347281000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    pythLazerId: 1,
  },
  {
    fullName: 'Ethereum',
    category: ['L1', 'Infra'],
    symbol: 'ETH-PERP',
    baseAssetSymbol: 'ETH',
    marketIndex: 2,
    oracle: new PublicKey('93FG52TzNKCnMiasV14Ba34BYcHDb9p4zK4GjZnLwqWR'),
    launchTs: 1670347281000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    pythLazerId: 2,
  },
  {
    fullName: 'Aptos',
    category: ['L1', 'Infra'],
    symbol: 'APT-PERP',
    baseAssetSymbol: 'APT',
    marketIndex: 3,
    oracle: new PublicKey('CXZhzKePYajrZgZyrzgvHYFKK3c5tNgDrRobAgySo8Nb'),
    launchTs: 1675802661000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
    pythLazerId: 28,
  },
  {
    fullName: 'Bonk',
    category: ['Meme', 'Solana'],
    symbol: '1MBONK-PERP',
    baseAssetSymbol: '1MBONK',
    marketIndex: 4,
    oracle: new PublicKey('BERaNi6cpEresbq6HC1EQGaB1H1UjvEo4NGnmYSSJof4'),
    launchTs: 1677690149000,
    oracleSource: OracleSource.PYTH_LAZER_1M,
    pythFeedId:
      '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
    pythLazerId: 9,
  },
  {
    fullName: 'Polygon',
    category: ['L2', 'Infra'],
    symbol: 'POL-PERP',
    baseAssetSymbol: 'POL',
    marketIndex: 5,
    oracle: new PublicKey('HDveCibToLf157NtUqShCEWX3GcF4Aq8Ngt2bst1s1cc'),
    launchTs: 1677690149000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xffd11c5a1cfd42f80afb2df4d9f264c15f956d68153335374ec10722edd70472',
    pythLazerId: 32,
  },
  {
    fullName: 'Arbitrum',
    category: ['L2', 'Infra'],
    symbol: 'ARB-PERP',
    baseAssetSymbol: 'ARB',
    marketIndex: 6,
    oracle: new PublicKey('5DYEjGpr28q3EsLKAnLXiDq6UeaFgDFZ5Gdwgp5RmPAp'),
    launchTs: 1679501812000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
    pythLazerId: 37,
  },
  {
    fullName: 'Doge',
    category: ['Meme', 'Dog'],
    symbol: 'DOGE-PERP',
    baseAssetSymbol: 'DOGE',
    marketIndex: 7,
    oracle: new PublicKey('GqjDJZu9bNCebq5PTUbjRrgw1LK84GEexVjrfYJ76YXc'),
    launchTs: 1680808053000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    pythLazerId: 13,
  },
  {
    fullName: 'Binance Coin',
    category: ['Exchange'],
    symbol: 'BNB-PERP',
    baseAssetSymbol: 'BNB',
    marketIndex: 8,
    oracle: new PublicKey('A9J2j1pRB2aPqAbjUTtKy94niSCTuPUrpimfzvpZHKG1'),
    launchTs: 1680808053000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    pythLazerId: 15,
  },
  {
    fullName: 'Sui',
    category: ['L1'],
    symbol: 'SUI-PERP',
    baseAssetSymbol: 'SUI',
    marketIndex: 9,
    oracle: new PublicKey('HmeJeBKgceqvSBd5XBXZUYECLabnbS1SefLkeJKH8ERK'),
    launchTs: 1683125906000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
    pythLazerId: 11,
  },
  {
    fullName: 'Pepe',
    category: ['Meme'],
    symbol: '1MPEPE-PERP',
    baseAssetSymbol: '1MPEPE',
    marketIndex: 10,
    oracle: new PublicKey('Eo8x9Y1289GvsuYVwRS2R8HfiWRXxYofL1KYvHK2ZM2o'),
    launchTs: 1683781239000,
    oracleSource: OracleSource.PYTH_LAZER_1M,
    pythFeedId:
      '0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4',
    pythLazerId: 4,
  },
  {
    fullName: 'OP',
    category: ['L2', 'Infra'],
    symbol: 'OP-PERP',
    baseAssetSymbol: 'OP',
    marketIndex: 11,
    oracle: new PublicKey('7GPbmQee2T4jMsJg99GuzWyMuzr8c2Uk7rAR9qvvQkzf'),
    launchTs: 1686091480000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
    pythLazerId: 41,
  },
  {
    fullName: 'RENDER',
    category: ['Infra', 'Solana'],
    symbol: 'RENDER-PERP',
    baseAssetSymbol: 'RENDER',
    marketIndex: 12,
    oracle: new PublicKey('97EqsAGbTnShB7oYWAFFCVVAx8PWXgDYDhcpm99izNQ4'),
    launchTs: 1687201081000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x3d4a2bd9535be6ce8059d75eadeba507b043257321aa544717c56fa19b49e35d',
    pythLazerId: 34,
  },
  {
    fullName: 'XRP',
    category: ['Payments'],
    symbol: 'XRP-PERP',
    baseAssetSymbol: 'XRP',
    marketIndex: 13,
    oracle: new PublicKey('92VexDMsSzYvVq7eiEoodEzZxCLqYnfGKpVTqpkX12FY'),
    launchTs: 1689270550000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    pythLazerId: 14,
  },
  {
    fullName: 'HNT',
    category: ['IoT', 'Solana'],
    symbol: 'HNT-PERP',
    baseAssetSymbol: 'HNT',
    marketIndex: 14,
    oracle: new PublicKey('AEPgc6qUTCT8AwdckPcGbJXtcM9bj8mGYAyHE4BscJtm'),
    launchTs: 1692294955000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x649fdd7ec08e8e2a20f425729854e90293dcbe2376abc47197a14da6ff339756',
    pythLazerId: 168,
  },
  {
    fullName: 'INJ',
    category: ['L1', 'Exchange'],
    symbol: 'INJ-PERP',
    baseAssetSymbol: 'INJ',
    marketIndex: 15,
    oracle: new PublicKey('Ac442xcU276nb6gJFUCsNYAwAo6KWuw4xocxmG3nvDym'),
    launchTs: 1698074659000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
    pythLazerId: 46,
  },
  {
    fullName: 'LINK',
    category: ['Oracle'],
    symbol: 'LINK-PERP',
    baseAssetSymbol: 'LINK',
    marketIndex: 16,
    oracle: new PublicKey('rwyPmfH5xsHdjPf6XsVxvyQEZogX2k4pmhaKEVvgseW'),
    launchTs: 1698074659000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    pythLazerId: 19,
  },
  {
    fullName: 'Rollbit',
    category: ['Exchange'],
    symbol: 'RLB-PERP',
    baseAssetSymbol: 'RLB',
    marketIndex: 17,
    oracle: new PublicKey('4CyhPqyVK3UQHFWhEpk91Aw4WbBsN3JtyosXH6zjoRqG'),
    launchTs: 1699265968000,
    oracleSource: OracleSource.PYTH_PULL,
    pythFeedId:
      '0x2f2d17abbc1e781bd87b4a5d52c8b2856886f5c482fa3593cebf6795040ab0b6',
  },
  {
    fullName: 'Pyth',
    category: ['Oracle', 'Solana'],
    symbol: 'PYTH-PERP',
    baseAssetSymbol: 'PYTH',
    marketIndex: 18,
    oracle: new PublicKey('6Sfx8ZAt6xaEgMXTahR6GrT7oYB6nFBMoVyCmMyHmeJV'),
    launchTs: 1700542800000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
    pythLazerId: 3,
  },
  {
    fullName: 'Celestia',
    category: ['Data'],
    symbol: 'TIA-PERP',
    baseAssetSymbol: 'TIA',
    marketIndex: 19,
    oracle: new PublicKey('2rDfWydvqvMQjDuf7vQsgfpa6dLMZehrWrpoXitn6gPx'),
    launchTs: 1701880540000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723',
    pythLazerId: 48,
  },
  {
    fullName: 'Jito',
    category: ['MEV', 'Solana'],
    symbol: 'JTO-PERP',
    baseAssetSymbol: 'JTO',
    marketIndex: 20,
    oracle: new PublicKey('CGCz4mB8NsDddCq6BZToRUDUuktzsAfpKYh6ATgyyCGF'),
    launchTs: 1701967240000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xb43660a5f790c69354b0729a5ef9d50d68f1df92107540210b9cccba1f947cc2',
    pythLazerId: 91,
  },
  {
    fullName: 'SEI',
    category: ['L1'],
    symbol: 'SEI-PERP',
    baseAssetSymbol: 'SEI',
    marketIndex: 21,
    oracle: new PublicKey('Edk1TWipQtsaD8nnBXYQV1CEAiQb1GFtEAKeFZCi2A4C'),
    launchTs: 1703173331000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb',
    pythLazerId: 51,
  },
  {
    fullName: 'AVAX',
    category: ['Rollup', 'Infra'],
    symbol: 'AVAX-PERP',
    baseAssetSymbol: 'AVAX',
    marketIndex: 22,
    oracle: new PublicKey('5ASZLwk3GFCwZiDQ3XpmduRqNPEUGHXjELMX85u8McK3'),
    launchTs: 1704209558000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    pythLazerId: 18,
  },
  {
    fullName: 'WIF',
    category: ['Meme', 'Dog', 'Solana'],
    symbol: 'WIF-PERP',
    baseAssetSymbol: 'WIF',
    marketIndex: 23,
    oracle: new PublicKey('4QXWStoyEErTZFVsvKrvxuNa6QT8zpeA8jddZunSGvYE'),
    launchTs: 1706219971000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
    pythLazerId: 10,
  },
  {
    fullName: 'JUP',
    category: ['Exchange', 'Infra', 'Solana'],
    symbol: 'JUP-PERP',
    baseAssetSymbol: 'JUP',
    marketIndex: 24,
    oracle: new PublicKey('DXqKSHyhTBKEW4qgnL7ycbf3Jca5hCvUgWHFYWsh4KJa'),
    launchTs: 1706713201000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
    pythLazerId: 92,
  },
  {
    fullName: 'Dymension',
    category: ['Rollup', 'Infra'],
    symbol: 'DYM-PERP',
    baseAssetSymbol: 'DYM',
    marketIndex: 25,
    oracle: new PublicKey('HWDqaKbbNrEsgWPLMeKG39AguefMbHsWcvNSthToXG2t'),
    launchTs: 1708448765000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xa9f3b2a89c6f85a6c20a9518abde39b944e839ca49a0c92307c65974d3f14a57',
    pythLazerId: 83,
  },
  {
    fullName: 'BITTENSOR',
    category: ['AI', 'Infra'],
    symbol: 'TAO-PERP',
    baseAssetSymbol: 'TAO',
    marketIndex: 26,
    oracle: new PublicKey('44fqbLqAkKK5kEj1FFvuEPYq56XoQQL3ABzCPrqsW3Cv'),
    launchTs: 1709136669000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x410f41de235f2db824e562ea7ab2d3d3d4ff048316c61d629c0b93f58584e1af',
    pythLazerId: 36,
  },
  {
    fullName: 'Wormhole',
    category: ['Bridge'],
    symbol: 'W-PERP',
    baseAssetSymbol: 'W',
    marketIndex: 27,
    oracle: new PublicKey('CsFUXiA5dM4eCKjVBBy8tXhXzDkDRNoYjU5rjpHyfNEZ'),
    launchTs: 1710418343000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xeff7446475e218517566ea99e72a4abec2e1bd8498b43b7d8331e29dcb059389',
    pythLazerId: 102,
  },
  {
    fullName: 'Kamino',
    category: ['Lending', 'Solana'],
    symbol: 'KMNO-PERP',
    baseAssetSymbol: 'KMNO',
    marketIndex: 28,
    oracle: new PublicKey('6ua3DK1sHoYyNi15dsxy6RYwUcZPDDXfyChzaRMaheQF'),
    launchTs: 1712240681000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xb17e5bc5de742a8a378b54c9c75442b7d51e30ada63f28d9bd28d3c0e26511a0',
    pythLazerId: 464,
  },
  {
    fullName: 'Tensor',
    category: ['NFT', 'Solana'],
    symbol: 'TNSR-PERP',
    baseAssetSymbol: 'TNSR',
    marketIndex: 29,
    oracle: new PublicKey('EX6r1GdfsgcUsY6cQ6YsToV4RGsb4HKpjrkokK2DrmsS'),
    launchTs: 1712593532000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x05ecd4597cd48fe13d6cc3596c62af4f9675aee06e2e0b94c06d8bee2b659e05',
    pythLazerId: 99,
  },
  {
    fullName: 'Drift',
    category: ['DEX', 'Solana'],
    symbol: 'DRIFT-PERP',
    baseAssetSymbol: 'DRIFT',
    marketIndex: 30,
    oracle: new PublicKey('5VJou4ufN2vE11zyZUaLsKLTXhyzCTgiq6QDsts2YnnD'),
    launchTs: 1716595200000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x5c1690b27bb02446db17cdda13ccc2c1d609ad6d2ef5bf4983a85ea8b6f19d07',
    pythLazerId: 249,
  },
  {
    fullName: 'Sanctum',
    category: ['LST', 'Solana'],
    symbol: 'CLOUD-PERP',
    baseAssetSymbol: 'CLOUD',
    marketIndex: 31,
    oracle: new PublicKey('9Ennia27iT83kNAk3JtRKxSMzuCzsVtT4MzuxpE7anME'),
    launchTs: 1717597648000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x7358313661dcd4f842a1423aa4f7a05f009001c9113201c719621d3f1aa80a73',
    pythLazerId: 404,
  },
  {
    fullName: 'IO',
    category: ['DePIN', 'Solana'],
    symbol: 'IO-PERP',
    baseAssetSymbol: 'IO',
    marketIndex: 32,
    oracle: new PublicKey('8x84eFZVGD9C8vmQqnB9P8UDPMdDWduFaULspKUYGthP'),
    launchTs: 1718021389000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x82595d1509b770fa52681e260af4dda9752b87316d7c048535d8ead3fa856eb1',
    pythLazerId: 90,
  },
  {
    fullName: 'ZEX',
    category: ['DEX', 'Solana'],
    symbol: 'ZEX-PERP',
    baseAssetSymbol: 'ZEX',
    marketIndex: 33,
    oracle: new PublicKey('HVwBCaR4GEB1fHrp7xCTzbYoZXL3V8b1aek2swPrmGx3'),
    launchTs: 1719415157000,
    oracleSource: OracleSource.PYTH_PULL,
    pythFeedId:
      '0x3d63be09d1b88f6dffe6585d0170670592124fd9fa4e0fe8a09ff18464f05e3a',
  },
  {
    fullName: 'POPCAT',
    category: ['Meme', 'Solana'],
    symbol: 'POPCAT-PERP',
    baseAssetSymbol: 'POPCAT',
    marketIndex: 34,
    oracle: new PublicKey('C5fiAmQyjdfDR4EGepZqnEL3fJwMBav5yoAk6XyKMF6u'),
    launchTs: 1720013054000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce',
    pythLazerId: 130,
  },
  {
    fullName: 'Wen',
    category: ['Solana', 'Meme'],
    symbol: '1KWEN-PERP',
    baseAssetSymbol: '1KWEN',
    marketIndex: 35,
    oracle: new PublicKey('F47c7aJgYkfKXQ9gzrJaEpsNwUKHprysregTWXrtYLFp'),
    launchTs: 1720633344000,
    oracleSource: OracleSource.PYTH_1K_PULL,
    pythFeedId:
      '0x5169491cd7e2a44c98353b779d5eb612e4ac32e073f5cc534303d86307c2f1bc',
  },
  {
    fullName: 'TRUMP-WIN-2024-BET',
    category: ['Prediction', 'Election'],
    symbol: 'TRUMP-WIN-2024-BET',
    baseAssetSymbol: 'TRUMP-WIN-2024',
    marketIndex: 36,
    oracle: new PublicKey('7YrQUxmxGdbk8pvns9KcL5ojbZSL2eHj62hxRqggtEUR'),
    launchTs: 1723996800000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'KAMALA-POPULAR-VOTE-2024-BET',
    category: ['Prediction', 'Election'],
    symbol: 'KAMALA-POPULAR-VOTE-2024-BET',
    baseAssetSymbol: 'KAMALA-POPULAR-VOTE-2024',
    marketIndex: 37,
    oracle: new PublicKey('AowFw1dCVjS8kngvTCoT3oshiUyL69k7P1uxqXwteWH4'),
    launchTs: 1723996800000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'FED-CUT-50-SEPT-2024-BET',
    category: ['Prediction', 'Election'],
    symbol: 'FED-CUT-50-SEPT-2024-BET',
    baseAssetSymbol: 'FED-CUT-50-SEPT-2024',
    marketIndex: 38,
    oracle: new PublicKey('5QzgqAbEhJ1cPnLX4tSZEXezmW7sz7PPVVg2VanGi8QQ'),
    launchTs: 1724250126000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'REPUBLICAN-POPULAR-AND-WIN-BET',
    category: ['Prediction', 'Election'],
    symbol: 'REPUBLICAN-POPULAR-AND-WIN-BET',
    baseAssetSymbol: 'REPUBLICAN-POPULAR-AND-WIN',
    marketIndex: 39,
    oracle: new PublicKey('BtUUSUc9rZSzBmmKhQq4no65zHQTzMFeVYss7xcMRD53'),
    launchTs: 1724250126000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'BREAKPOINT-IGGYERIC-BET',
    category: ['Prediction', 'Solana'],
    symbol: 'BREAKPOINT-IGGYERIC-BET',
    baseAssetSymbol: 'BREAKPOINT-IGGYERIC',
    marketIndex: 40,
    oracle: new PublicKey('2ftYxoSupperd4ULxy9xyS2Az38wfAe7Lm8FCAPwjjVV'),
    launchTs: 1724250126000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'DEMOCRATS-WIN-MICHIGAN-BET',
    category: ['Prediction', 'Election'],
    symbol: 'DEMOCRATS-WIN-MICHIGAN-BET',
    baseAssetSymbol: 'DEMOCRATS-WIN-MICHIGAN',
    marketIndex: 41,
    oracle: new PublicKey('8HTDLjhb2esGU5mu11v3pq3eWeFqmvKPkQNCnTTwKAyB'),
    launchTs: 1725551484000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'TON',
    category: ['L1'],
    symbol: 'TON-PERP',
    baseAssetSymbol: 'TON',
    marketIndex: 42,
    oracle: new PublicKey('Cbhiaky9kxDsviokcQaS9qc4HmpAzLaGjfmdSah1qakL'),
    launchTs: 1725551484000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x8963217838ab4cf5cadc172203c1f0b763fbaa45f346d8ee50ba994bbcac3026',
    pythLazerId: 12,
  },
  {
    fullName: 'LANDO-F1-SGP-WIN-BET',
    category: ['Prediction', 'Sports'],
    symbol: 'LANDO-F1-SGP-WIN-BET',
    baseAssetSymbol: 'LANDO-F1-SGP-WIN',
    marketIndex: 43,
    oracle: new PublicKey('DpJz7rjTJLxxnuqrqZTUjMWtnaMFAEfZUv5ATdb9HTh1'),
    launchTs: 1726646453000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'MOTHER',
    category: ['Solana', 'Meme'],
    symbol: 'MOTHER-PERP',
    baseAssetSymbol: 'MOTHER',
    marketIndex: 44,
    oracle: new PublicKey('469WQgfJ6AJ3eJ8FUcdhiZawf7yNChA3hseTSyhFatHZ'),
    launchTs: 1727291859000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x62742a997d01f7524f791fdb2dd43aaf0e567d765ebf8fd0406a994239e874d4',
    pythLazerId: 501,
  },
  {
    fullName: 'MOODENG',
    category: ['Solana', 'Meme'],
    symbol: 'MOODENG-PERP',
    baseAssetSymbol: 'MOODENG',
    marketIndex: 45,
    oracle: new PublicKey('CVy5m6JqhEdjbz11idgVeb2KnH5NpFowKnYPVMdfc7FC'),
    launchTs: 1727965864000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xffff73128917a90950cd0473fd2551d7cd274fd5a6cc45641881bbcc6ee73417',
    pythLazerId: 500,
  },
  {
    fullName: 'WARWICK-FIGHT-WIN-BET',
    category: ['Prediction', 'Sport'],
    symbol: 'WARWICK-FIGHT-WIN-BET',
    baseAssetSymbol: 'WARWICK-FIGHT-WIN',
    marketIndex: 46,
    oracle: new PublicKey('Dz5Nvxo1hv7Zfyu11hy8e97twLMRKk6heTWCDGXytj7N'),
    launchTs: 1727965864000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'DeBridge',
    category: ['Bridge'],
    symbol: 'DBR-PERP',
    baseAssetSymbol: 'DBR',
    marketIndex: 47,
    oracle: new PublicKey('53j4mz7cQV7mAZekKbV3n2L4bY7jY6eXdgaTkWDLYxq4'),
    launchTs: 1728574493000,
    oracleSource: OracleSource.PYTH_PULL,
    pythFeedId:
      '0xf788488fe2df341b10a498e0a789f03209c0938d9ed04bc521f8224748d6d236',
  },
  {
    fullName: 'WLF-5B-1W',
    category: ['Prediction'],
    symbol: 'WLF-5B-1W-BET',
    baseAssetSymbol: 'WLF-5B-1W',
    marketIndex: 48,
    oracle: new PublicKey('7LpRfPaWR7cQqN7CMkCmZjEQpWyqso5LGuKCvDXH5ZAr'),
    launchTs: 1728574493000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'VRSTPN-WIN-F1-24-DRVRS-CHMP',
    category: ['Prediction', 'Sport'],
    symbol: 'VRSTPN-WIN-F1-24-DRVRS-CHMP-BET',
    baseAssetSymbol: 'VRSTPN-WIN-F1-24-DRVRS-CHMP',
    marketIndex: 49,
    oracle: new PublicKey('E36rvXEwysWeiToXCpWfHVADd8bzzyR4w83ZSSwxAxqG'),
    launchTs: 1729209600000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'LNDO-WIN-F1-24-US-GP',
    category: ['Prediction', 'Sport'],
    symbol: 'LNDO-WIN-F1-24-US-GP-BET',
    baseAssetSymbol: 'LNDO-WIN-F1-24-US-GP',
    marketIndex: 50,
    oracle: new PublicKey('6AVy1y9SnJECnosQaiK2uY1kcT4ZEBf1F4DMvhxgvhUo'),
    launchTs: 1729209600000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: '1KMEW',
    category: ['Meme'],
    symbol: '1KMEW-PERP',
    baseAssetSymbol: '1KMEW',
    marketIndex: 51,
    oracle: new PublicKey('138RQdT1frDTnEp989V7gUWoQ5yg382ns4ihjvgJLcz7'),
    launchTs: 1729702915000,
    oracleSource: OracleSource.PYTH_LAZER_1K,
    pythFeedId:
      '0x514aed52ca5294177f20187ae883cec4a018619772ddce41efcc36a6448f5d5d',
    pythLazerId: 137,
  },
  {
    fullName: 'MICHI',
    category: ['Meme'],
    symbol: 'MICHI-PERP',
    baseAssetSymbol: 'MICHI',
    marketIndex: 52,
    oracle: new PublicKey('GHzvsMDMSiuyZoWhEAuM27MKFdN2Y4fA4wSDuSd6dLMA'),
    launchTs: 1730402722000,
    oracleSource: OracleSource.PYTH_PULL,
    pythFeedId:
      '0x63a45218d6b13ffd28ca04748615511bf70eff80a3411c97d96b8ed74a6decab',
  },
  {
    fullName: 'GOAT',
    category: ['Meme'],
    symbol: 'GOAT-PERP',
    baseAssetSymbol: 'GOAT',
    marketIndex: 53,
    oracle: new PublicKey('4uBrnNZyD2wUkpzytuyfiEYp2eWA3WdxXSbWEQbZzs45'),
    launchTs: 1731443152000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xf7731dc812590214d3eb4343bfb13d1b4cfa9b1d4e020644b5d5d8e07d60c66c',
    pythLazerId: 437,
  },
  {
    fullName: 'FWOG',
    category: ['Meme'],
    symbol: 'FWOG-PERP',
    baseAssetSymbol: 'FWOG',
    marketIndex: 54,
    oracle: new PublicKey('5Z7uvkAsHNN6qqkQkwcKcEPYZqiMbFE9E24p7SpvfSrv'),
    launchTs: 1731443152000,
    oracleSource: OracleSource.PYTH_PULL,
    pythFeedId:
      '0x656cc2a39dd795bdecb59de810d4f4d1e74c25fe4c42d0bf1c65a38d74df48e9',
  },
  {
    fullName: 'PNUT',
    category: ['Meme'],
    symbol: 'PNUT-PERP',
    baseAssetSymbol: 'PNUT',
    marketIndex: 55,
    oracle: new PublicKey('Fbd2hz8Uz26gLm2Jrj7WSrhxusrh9VuSEWVpLBPJgMYX'),
    launchTs: 1731443152000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x116da895807f81f6b5c5f01b109376e7f6834dc8b51365ab7cdfa66634340e54',
    pythLazerId: 77,
  },
  {
    fullName: 'RAY',
    category: ['DEX'],
    symbol: 'RAY-PERP',
    baseAssetSymbol: 'RAY',
    marketIndex: 56,
    oracle: new PublicKey('6VXU2P9BJkuPkfA7FJVonBtAo1c2pGnHoV9rxsdZKZyb'),
    launchTs: 1732721897000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x91568baa8beb53db23eb3fb7f22c6e8bd303d103919e19733f2bb642d3e7987a',
    pythLazerId: 54,
  },
  {
    fullName: 'SUPERBOWL-LIX-LIONS',
    category: ['Prediction', 'Sport'],
    symbol: 'SUPERBOWL-LIX-LIONS-BET',
    baseAssetSymbol: 'SUPERBOWL-LIX-LIONS',
    marketIndex: 57,
    oracle: new PublicKey('GfTeKKnBxeLSB1Hm24ArjduQM4yqaAgoGgiC99gq5E2P'),
    launchTs: 1732721897000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'SUPERBOWL-LIX-CHIEFS',
    category: ['Prediction', 'Sport'],
    symbol: 'SUPERBOWL-LIX-CHIEFS-BET',
    baseAssetSymbol: 'SUPERBOWL-LIX-CHIEFS',
    marketIndex: 58,
    oracle: new PublicKey('EdB17Nyu4bnEBiSEfFrwvp4VCUvtq9eDJHc6Ujys3Jwd'),
    launchTs: 1732721897000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'Hyperliquid',
    category: ['DEX'],
    symbol: 'HYPE-PERP',
    baseAssetSymbol: 'HYPE',
    marketIndex: 59,
    oracle: new PublicKey('3ivZ5AnnUhocgmjiWjT8kDV87S6PpEL3CEHcd3vn2itM'),
    launchTs: 1733374800000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b',
    pythLazerId: 110,
  },
  {
    fullName: 'LiteCoin',
    category: ['Payment'],
    symbol: 'LTC-PERP',
    baseAssetSymbol: 'LTC',
    marketIndex: 60,
    oracle: new PublicKey('CrW8rga5bEZP1KBnqoQmPUcnYjrCPYQFbrMja99QKxsK'),
    launchTs: 1733374800000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
    pythLazerId: 26,
  },
  {
    fullName: 'Magic Eden',
    category: ['DEX'],
    symbol: 'ME-PERP',
    baseAssetSymbol: 'ME',
    marketIndex: 61,
    oracle: new PublicKey('BboTg1yT114FQkqT6MM3P3G3CcCktuM2RePgU8Gr3K4A'),
    launchTs: 1733839936000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x91519e3e48571e1232a85a938e714da19fe5ce05107f3eebb8a870b2e8020169',
    pythLazerId: 93,
  },
  {
    fullName: 'PENGU',
    category: ['Meme'],
    symbol: 'PENGU-PERP',
    baseAssetSymbol: 'PENGU',
    marketIndex: 62,
    oracle: new PublicKey('4A3KroGPjZxPAeBNF287V3NyRwV2q8iBi1vX7kHxTCh7'),
    launchTs: 1734444000000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xbed3097008b9b5e3c93bec20be79cb43986b85a996475589351a21e67bae9b61',
    pythLazerId: 97,
  },
  {
    fullName: 'AI16Z',
    category: ['AI'],
    symbol: 'AI16Z-PERP',
    baseAssetSymbol: 'AI16Z',
    marketIndex: 63,
    oracle: new PublicKey('3BGheQVvYtBNpBKSUXSTjpyKQc3dh8iiwT91Aiq7KYCU'),
    launchTs: 1736384970000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x2551eca7784671173def2c41e6f3e51e11cd87494863f1d208fdd8c64a1f85ae',
    pythLazerId: 171,
  },
  {
    fullName: 'TRUMP',
    category: ['Meme'],
    symbol: 'TRUMP-PERP',
    baseAssetSymbol: 'TRUMP',
    marketIndex: 64,
    oracle: new PublicKey('FPQjZYvHRGy51guJ77p7n9u9b8eo1ktKRc2D2g5Vysth'),
    launchTs: 1737219250000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x879551021853eec7a7dc827578e8e69da7e4fa8148339aa0d3d5296405be4b1a',
    pythLazerId: 203,
  },
  {
    fullName: 'MELANIA',
    category: ['Meme'],
    symbol: 'MELANIA-PERP',
    baseAssetSymbol: 'MELANIA',
    marketIndex: 65,
    oracle: new PublicKey('3RgNWYYcZCKf5uZfriK8ASUbGQErhH6YbpdvZQ7ZKDCf'),
    launchTs: 1737360280000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x8fef7d52c7f4e3a6258d663f9d27e64a1b6fd95ab5f7d545dbf9a515353d0064',
    pythLazerId: 145,
  },
  {
    fullName: 'BERA',
    category: ['L1', 'EVM'],
    symbol: 'BERA-PERP',
    baseAssetSymbol: 'BERA',
    marketIndex: 66,
    oracle: new PublicKey('r8eNLQ8jysUyk9rrWXuicwAoKZ7V3YngAB6737zfxmv'),
    launchTs: 1738850177000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x962088abcfdbdb6e30db2e340c8cf887d9efb311b1f2f17b155a63dbb6d40265',
    pythLazerId: 308,
  },
  {
    fullName: 'NBAFINALS25-OKC',
    category: ['Prediction', 'Sport'],
    symbol: 'NBAFINALS25-OKC-BET',
    baseAssetSymbol: 'NBAFINALS25-OKC',
    marketIndex: 67,
    oracle: new PublicKey('HieNNSAy9tjtU2mLEcGtgCMViCeZ1881fX7tfezL7wdV'),
    launchTs: 1739463226000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'NBAFINALS25-BOS',
    category: ['Prediction', 'Sport'],
    symbol: 'NBAFINALS25-BOS-BET',
    baseAssetSymbol: 'NBAFINALS25-BOS',
    marketIndex: 68,
    oracle: new PublicKey('HorrnsG8RBMv7dhzbgPX4wqcWbUTV5NwV8r59UwTu4CJ'),
    launchTs: 1739463226000,
    oracleSource: OracleSource.Prelaunch,
  },
  {
    fullName: 'KAITO',
    category: ['AI'],
    symbol: 'KAITO-PERP',
    baseAssetSymbol: 'KAITO',
    marketIndex: 69,
    oracle: new PublicKey('8M8mjNJ42k2Xi12Q1zRnQRC3xhggu3WGuftiu5VZZmsF'),
    launchTs: 1739545901000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x7302dee641a08507c297a7b0c8b3efa74a48a3baa6c040acab1e5209692b7e59',
    pythLazerId: 306,
  },
  {
    fullName: 'Story Protocol',
    category: ['L1'],
    symbol: 'IP-PERP',
    baseAssetSymbol: 'IP',
    marketIndex: 70,
    oracle: new PublicKey('AZVVDFve8ijzLAm9z6W53GFsoWbcycFsdxCL7WUjMz8S'),
    launchTs: 1740150623000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0xb620ba83044577029da7e4ded7a2abccf8e6afc2a0d4d26d89ccdd39ec109025',
    pythLazerId: 309,
  },
  {
    fullName: 'Fart Coin',
    category: ['Meme'],
    symbol: 'FARTCOIN-PERP',
    baseAssetSymbol: 'FARTCOIN',
    marketIndex: 71,
    oracle: new PublicKey('2sZomfWMDuQLcFak3nuharXorHrZ3hK8iaML6ZGSHtso'),
    launchTs: 1743086746000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythLazerId: 182,
  },
  {
    fullName: 'Cardano',
    category: ['L1'],
    symbol: 'ADA-PERP',
    baseAssetSymbol: 'ADA',
    marketIndex: 72,
    oracle: new PublicKey('55722FS8VeAxRghz5h2ARJvNjkFiHyzkZ9BF7CEQWN6E'),
    launchTs: 1743708559000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythLazerId: 16,
  },
  {
    fullName: 'Pax Gold',
    category: ['RWA'],
    symbol: 'PAXG-PERP',
    baseAssetSymbol: 'PAXG',
    marketIndex: 73,
    oracle: new PublicKey('8FauFNbX2gvjkPLH8w2kntXCcSGCwZL2prZjHBpvq6aE'),
    launchTs: 1744402932000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythLazerId: 163,
  },
  {
    fullName: 'LAUNCHCOIN',
    category: ['Meme'],
    symbol: 'LAUNCHCOIN-PERP',
    baseAssetSymbol: 'LAUNCHCOIN',
    marketIndex: 74,
    oracle: new PublicKey('GAzR3C5cn7gGVvuqJB57wSYTPWP3n2Lw4mRJRxvTvqYy'),
    launchTs: 1747318237000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythFeedId:
      '0x6d74813ee17291d5be18a355fe4d43fd300d625caea6554d49f740e7d112141e',
    pythLazerId: 1571,
  },
  {
    fullName: 'PUMP',
    category: ['Launchpad'],
    symbol: 'PUMP-PERP',
    baseAssetSymbol: 'PUMP',
    marketIndex: 75,
    oracle: new PublicKey('5r8RWTaRiMgr9Lph3FTUE3sGb1vymhpCrm83Bovjfcps'),
    launchTs: 1747318237000,
    oracleSource: OracleSource.PYTH_LAZER,
    pythLazerId: 1578,
  },
];

// ---------- helpers (BN-free) ----------
function toMintString(pk) {
  if (pk == null) return null;
  if (typeof pk === 'string') return pk;
  if (typeof pk.toBase58 === 'function') return pk.toBase58();
  if (typeof pk.toString === 'function') return pk.toString();
  return String(pk);
}

function toNum(x) {
  if (x == null) return undefined;
  if (typeof x === 'number') return x;
  if (typeof x === 'bigint') return Number(x);
  if (typeof x.toNumber === 'function') return x.toNumber();
  if (typeof x.toString === 'function') {
    const n = Number(x.toString(10));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function inferDecimals(entry) {
  const exp = toNum(entry.precisionExp);
  if (Number.isFinite(exp)) return exp;

  const p = entry.precision;
  if (typeof p === 'number' && p > 0) {
    const guess = Math.log10(p);
    if (Number.isFinite(guess)) return Math.round(guess);
  }
  if (p && typeof p.toString === 'function') {
    const s = p.toString(10);
    if (/^10*$/.test(s)) return s.length - 1;
  }
  return undefined;
}

function makeSpotSymbolMap() {
  const map = {};
  for (const s of MainnetSpotMarkets) {
    const mint = toMintString(s.mint);
    const decimals = inferDecimals(s);
    if (!mint || decimals == null) continue;
    map[String(s.symbol).toUpperCase()] = { mint, decimals };
  }
  return map;
}

// alias baseAssetSymbol -> spot symbol (when spot uses wrapped tickers)
const BASE_TO_SPOT_ALIAS = {
  BTC: 'WBTC',
  ETH: 'WETH',
  SOL: 'SOL',
};

function resolveBaseToSpot(base, spotBySymbol) {
  const upper = String(base).toUpperCase();

  if (spotBySymbol[upper]) return spotBySymbol[upper];

  const stripped = upper.replace(/^(1M|1K)/, '');
  if (spotBySymbol[stripped]) return spotBySymbol[stripped];

  const alias = BASE_TO_SPOT_ALIAS[upper];
  if (alias && spotBySymbol[alias]) return spotBySymbol[alias];

  const wrapped = `W${upper}`;
  if (spotBySymbol[wrapped]) return spotBySymbol[wrapped];

  return null;
}

// --- required functions (simple & efficient) ---
function buildSpotMarkets() {
  const out = {};
  for (const s of MainnetSpotMarkets) {
    const mint = toMintString(s.mint);
    const decimals = inferDecimals(s);
    if (mint && decimals != null && s.marketIndex != null) {
      out[s.marketIndex] = { name: s.symbol, mint, decimals };
    }
  }
  return out;
}

function buildPerpMarkets() {
  const spotBySymbol = makeSpotSymbolMap();
  const quoteDecimals = QUOTE_PRECISION_EXP ?? 6;

  const out = {};
  for (const p of MainnetPerpMarkets) {
    if (p.marketIndex == null || !p.symbol || !p.baseAssetSymbol) continue;

    const resolved = resolveBaseToSpot(p.baseAssetSymbol, spotBySymbol);
    out[p.marketIndex] = {
      name: p.symbol,
      mint: resolved ? resolved.mint : null,
      baseDecimals: resolved ? resolved.decimals : null,
      quoteDecimals,
    };
  }
  return out;
}


const SPOT_MARKETS = buildSpotMarkets();
const PERP_MARKETS = buildPerpMarkets();


function getVaultPublicKey(seed, marketIndex) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(seed)),
      new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
    ], new PublicKey(DRIFT_PROGRAM_ID))[0];
}


function getTokenMintFromMarketIndex(marketIndex) {
  if (!SPOT_MARKETS[marketIndex]) {
    throw new Error(`Market index ${marketIndex} not found`);
  }
  return SPOT_MARKETS[marketIndex].mint;
}


function getPerpTokenMintFromMarketIndex(marketIndex) {
  if (!PERP_MARKETS[marketIndex]) {
    throw new Error(`Perp market index ${marketIndex} not found`);
  }
  return PERP_MARKETS[marketIndex].mint;
}


function getDecimalsByMarketIndex(marketIndex, isPerp = false) {
  if (isPerp) {
    if (!PERP_MARKETS[marketIndex]) {
      throw new Error(`Perp market index ${marketIndex} not found`);
    }
    return PERP_MARKETS[marketIndex].baseDecimals;
  }

  if (!SPOT_MARKETS[marketIndex]) {
    throw new Error(`Spot market index ${marketIndex} not found`);
  }
  return SPOT_MARKETS[marketIndex].decimals;
}


function processSpotPosition(position, spotMarketAccountInfo) {
  const decimals = getDecimalsByMarketIndex(position.market_index);
  const decimalAdjustment = 9 - decimals;
  let balance = position.scaled_balance;

  // Apply decimal adjustment
  if (decimalAdjustment > 0) {
    balance /= BigInt(10 ** decimalAdjustment);
  }

  // For borrowed positions (balance_type === 1), apply interest rate
  if (position.balance_type === 1) {
    const cumulativeBorrowInterest = getSpotMarketCumulativeBorrowInterest(spotMarketAccountInfo);
    // Apply interest rate to the balance
    balance = (balance * cumulativeBorrowInterest) / BigInt(10 ** 10);
    return -balance;  // Return negative for borrows
  }

  return balance;  // Return positive for deposits
}


function getSpotMarketCumulativeBorrowInterest(accountInfo) {
  if (!accountInfo) {
    throw new Error(`No account info found for market`);
  }
  const CUMULATIVE_BORROW_INTEREST_OFFSET = 8 + 48 + 32 + 256 + (16 * 8) + 8;
  const lower64Bits = accountInfo.data.readBigInt64LE(CUMULATIVE_BORROW_INTEREST_OFFSET);
  const upper64Bits = accountInfo.data.readBigInt64LE(CUMULATIVE_BORROW_INTEREST_OFFSET + 8);
  return (upper64Bits << 64n) + lower64Bits;
}


function processPerpPosition(position) {
  let baseBalance = position.market_index === 0 ? position.base_asset_amount : position.base_asset_amount / BigInt(10);
  let quoteBalance = position.quote_asset_amount;
  return { baseBalance, quoteBalance };
}


function getPerpMarketFundingRates(accountInfo) {
  if (!accountInfo) {
    throw new Error(`No account info found for market`);
  }
  let factorToPrecision = 1n;
  const CUMULATIVE_FUNDING_OFFSET = 8 + 48 + 32 + 256 + (16 * 15) + 24;
  const cumulativeFundingRateLong = accountInfo.data.readBigInt64LE(CUMULATIVE_FUNDING_OFFSET);
  const cumulativeFundingRateShort = accountInfo.data.readBigInt64LE(CUMULATIVE_FUNDING_OFFSET + 16);
  return {
    cumulativeFundingRateLong,
    cumulativeFundingRateShort,
    factorToPrecision
  };
}


function deserializeUserPositions(accountInfo) {
  if (!accountInfo) {
    throw new Error('User account not found');
  }

  const buffer = accountInfo.data;

  // Deserialize spot positions
  const spotPositions = [];
  let offset = 104; // Anchor discriminator (8) + Skip authority(32) + delegate(32) + name(32) 

  for (let i = 0; i < 8; i++) {
    const spotPosition = {
      scaled_balance: buffer.readBigUInt64LE(offset),
      market_index: buffer.readUInt16LE(offset + 32),
      balance_type: buffer.readUInt8(offset + 34),
    };

    // Only push non-empty positions
    if (spotPosition.scaled_balance > 0n) {
      spotPositions.push(spotPosition);
    }
    offset += 40; // Size of SpotPosition struct
  }

  // Deserialize perp positions
  const perpPositions = [];
  for (let i = 0; i < 8; i++) {
    const lastCumulativeFundingRate = buffer.readBigInt64LE(offset);
    const baseAssetAmount = buffer.readBigInt64LE(offset + 8);
    const quoteAssetAmount = buffer.readBigInt64LE(offset + 16);

    // Skip empty positions
    if (baseAssetAmount === 0n && quoteAssetAmount === 0n) {
      offset += 96;
      continue;
    }

    const perpPosition = {
      last_cumulative_funding_rate: lastCumulativeFundingRate,
      base_asset_amount: baseAssetAmount,
      quote_asset_amount: quoteAssetAmount,
      market_index: buffer.readUInt16LE(offset + 92)
    };

    perpPositions.push(perpPosition);
    offset += 96; // Size of PerpPosition struct
  }

  return {
    spotPositions,
    perpPositions
  };
}


function readPublicKeyFromBuffer(buffer, offset) {
  if (!buffer || buffer.length < offset + 32) {
    throw new Error('Buffer is too small to contain a public key at the specified offset');
  }
  const publicKeyBytes = buffer.slice(offset, offset + 32);
  return new PublicKey(publicKeyBytes);
}


async function fetchVaultUserAddressesWithOffset(addresses, offset) {
  const accounts = await getMultipleAccounts(addresses.map(address => new PublicKey(address)));
  const vaultUserAddresses = [];
  accounts.forEach((account, index) => {
    const address = addresses[index];
    try {
      const userPublicKey = readPublicKeyFromBuffer(account.data, offset);
      vaultUserAddresses.push(userPublicKey);
    } catch (error) {
      console.error(`Error processing address ${address}:`, error);
    }
  });
  return { vaultUserAddresses };
}


/**
 * Vault Equity Calculation Formula:
 * VaultEquity = NetSpotValue + UnrealizedPnL
 * 
 * Where:
 * 1. NetSpotValue = Σ(spotPosition.scaledBalance * spotMarketPrice * direction)
 *    - spotPosition.scaledBalance: The size of the spot position
 *    - spotMarketPrice: Current market price of the asset
 *    - direction: 1 for deposits (longs), -1 for borrows (shorts)
 * 
 * 2. UnrealizedPnL = Σ(perpPosition.baseAssetAmount * oraclePrice + perpPosition.quoteAssetAmount + fundingPnL)
 *    For each perpetual position:
 *    - baseAssetAmount * oraclePrice: Current value of the base asset position (e.g., BTC, ETH, SOL)
 *    - quoteAssetAmount: Amount of quote currency (USDC) in the position
 *    - fundingPnL: (market.amm.cumulativeFundingRate - position.lastCumulativeFundingRate) * position.baseAssetAmount / FUNDING_RATE_PRECISION
 * 
 */
async function getTvl(api, driftVaultAddresses) {
  const { vaultUserAddresses } = await fetchVaultUserAddressesWithOffset(driftVaultAddresses, 168);

  // Get all vault accounts first
  const accounts = await getMultipleAccounts(vaultUserAddresses);

  const deserializedData = accounts.filter((accountInfo) => !!accountInfo).map(deserializeUserPositions);

  // Collect unique market indices upfront
  const allSpotIndices = new Set();
  const allPerpIndices = new Set();

  deserializedData.forEach(({ spotPositions, perpPositions }) => {
    spotPositions?.forEach(pos => allSpotIndices.add(pos.market_index));
    perpPositions?.forEach(pos => allPerpIndices.add(pos.market_index));
  });

  // Batch fetch 
  const allKeys = [
    ...[...allSpotIndices].map(index => getVaultPublicKey('spot_market', index)),
    ...[...allPerpIndices].map(index => getVaultPublicKey('perp_market', index)),
  ];

  const allAccounts = await getMultipleAccounts(allKeys);

  // Create lookup maps
  const spotAccountMap = {};
  const perpAccountMap = {};

  let offset = 0
    ;[...allSpotIndices].forEach((index, i) => {
      spotAccountMap[index] = allAccounts[i];
      offset = i + 1;
    })
    ;[...allPerpIndices].forEach((index, i) => {
      perpAccountMap[index] = allAccounts[i + offset];
    });

  // Process positions using the cached account data
  for (const { spotPositions, perpPositions } of deserializedData) {
    if (spotPositions?.length) {
      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index);
        const adjustedBalance = processSpotPosition(position, spotAccountMap[position.market_index]);
        api.add(tokenMint, adjustedBalance);
      });
    }

    if (perpPositions?.length) {
      perpPositions.forEach(async position => {
        const meta = PERP_MARKETS[position.market_index];
        const baseTokenMint = meta?.mint ?? null;

        const { baseBalance, quoteBalance } = processPerpPosition(position);
        if (baseTokenMint) {
          api.add(baseTokenMint, baseBalance);
        } else {
          // e.g. HYPE-PERP: no SPL spot mint; skip base leg to avoid "missing token"
          // console.log(`No spot mint for perp market ${position.market_index} (${meta?.name}); skipping base leg`);
          // TODO: find usd price and api.add(getTokenMintFromMarketIndex(0), usdValue); 
        }

        const quoteTokenMint = getTokenMintFromMarketIndex(0);
        api.add(quoteTokenMint, quoteBalance);

        const { cumulativeFundingRateLong, cumulativeFundingRateShort } = getPerpMarketFundingRates(perpAccountMap[position.market_index]);
        const currentCumulativeFundingRate = position.base_asset_amount > 0n ? cumulativeFundingRateLong : cumulativeFundingRateShort;
        const difference = (currentCumulativeFundingRate - BigInt(position.last_cumulative_funding_rate)) / BigInt(10 ** 6);
        const fundingRatePnl = (difference * (position.base_asset_amount) / BigInt(10 ** 6));
        api.add(quoteTokenMint, fundingRatePnl);
      });
    }
  }
}

module.exports = {
  getTvl
};
