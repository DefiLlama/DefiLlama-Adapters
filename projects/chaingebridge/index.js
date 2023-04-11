const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const evmOwner = "0x456325f2ac7067234dd71e01bebe032b0255e039";
const evmChains = {
  fusion: [
    {
      name: "CHNG",
      address: "0x05573124c64c69d85687152b2942bcb0a3b26d99",
      decimals: 18,
    },
    { name: "FSN", address: nullAddress, decimals: 18 },
    {
      name: "USDT",
      address: "0x9636d3294e45823ec924c8d89dd1f1dffcf044e6",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0x796d74a86db307b0b0e02fed9fa19ccb1906ce37",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x816f67ce73aeb099e894a55d135168dd501b55a6",
      decimals: 8,
    },
    {
      name: "TRX",
      address: "0xc028a0d24cdda8d488689556a02f9cb575e2df30",
      decimals: 6,
    },
    {
      name: "BNB",
      address: "0x95f35cc4bd9099f73019d03e0ae68df2b8a17961",
      decimals: 18,
    },
    {
      name: "HT",
      address: "0x702f82cd62b08dba4de0337ae5268f3c014031d5",
      decimals: 18,
    },
    {
      name: "JST",
      address: "0xcfb330a25543af6bfd21be643570f64e1968984d",
      decimals: 18,
    },
    {
      name: "UNI",
      address: "0x16429a7d7371e6c0552ddc7e46b94e6d9aed3d41",
      decimals: 18,
    },
    {
      name: "CAKE",
      address: "0xea8c6492ebcbb41e4455c58898a4f44a295e5b71",
      decimals: 18,
    },
    {
      name: "MDX",
      address: "0x606e5b69b203cd534964908a3970af4398126b2a",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x62d19aab3a055f9aad3ff0f9d90cbdb25aad4ed3",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0xbbc975313c78daa8995aa3968d4be2cee5ab0bee",
      decimals: 18,
    },
    {
      name: "ENJ",
      address: "0xc2d5f513a2ad737a99fe28ea30ed1bbd918d98e2",
      decimals: 18,
    },
    {
      name: "HOT",
      address: "0x3ad4c34f2d15e366b1d962ea99edee4a7908364e",
      decimals: 18,
    },
    {
      name: "ALPHA",
      address: "0x86b95e058c01637ec62de51855cfd09b928a5644",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0x4b1f7b98d7077d5834d1464014a2301063e5677f",
      decimals: 18,
    },
    {
      name: "LRC",
      address: "0xe6306f89f66b1093481e0fffb5ccfc2b908b1829",
      decimals: 18,
    },
    {
      name: "INCH",
      address: "0xf9fc8a8ba53e0e25ff07f6827207d55b6b3d16cb",
      decimals: 18,
    },
    {
      name: "DENT",
      address: "0x9a6fbbe71dbefd4f6ccac5b3da1d3bfdea94b7b9",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x1cb230e95d402d51ef0160498173f7f0fcee1916",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0xdb252989f94f9682720ff13e8c1fd258afbc7c03",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0xa5eb4245e04df121ead9f298a9b234f702756269",
      decimals: 18,
    },
    {
      name: "MANA",
      address: "0x61be5df5459573a7c25673e74281cef4cef81e7d",
      decimals: 18,
    },
    {
      name: "GRT",
      address: "0xba780bd56b4febf30cf28aa6c61ba07b2394861b",
      decimals: 18,
    },
    {
      name: "BAT",
      address: "0xa7357c06aa73558d5927a83f24fe7f9075fdf048",
      decimals: 18,
    },
    {
      name: "ZRX",
      address: "0x15b2b5e9dd39e30a5d72aed0f5bcb306a737505a",
      decimals: 18,
    },
    {
      name: "UMA",
      address: "0x05fc265085a3fc0a43e43842a8a43f245814b730",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0x98a1d0b0a6ae63d5d73db580e7cc24c2afb024b8",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0x62795f53f808ac283634c634138954fe82ed273d",
      decimals: 18,
    },
    {
      name: "SXP",
      address: "0x9d75080a7f85a235c9f9e501b8348e79d9585a66",
      decimals: 18,
    },
    {
      name: "KNC",
      address: "0x0fd4f2bd7604e9881301301450f120b0666ece05",
      decimals: 18,
    },
    {
      name: "BADGER",
      address: "0xafbd2b9f5e07d0af0379ec4fe2a799b83d302737",
      decimals: 18,
    },
    {
      name: "BAKE",
      address: "0x25b6e98470b58876305990fecda31c3f7fe514ec",
      decimals: 18,
    },
    {
      name: "DODO",
      address: "0x54b0896f1daad8edeac1eb66d36adef7fa7f9cdd",
      decimals: 18,
    },
    {
      name: "XVS",
      address: "0x974418ffdb7a51d298c64b9862b5861286581ddd",
      decimals: 18,
    },
    {
      name: "FILDA",
      address: "0x91db6598933b3d283a941b815a9cfaa0fbdc2bab",
      decimals: 18,
    },
    {
      name: "BAGS",
      address: "0xd4ff9f51bfb456f2b0f8690f20c90f62c736b814",
      decimals: 18,
    },
    {
      name: "FORTH",
      address: "0xde02ecb2dc977871be6edbf96c6da863c3192961",
      decimals: 18,
    },
    {
      name: "SHIB",
      address: "0xf32a6bb880adb728e46c2cc579221657f6eff540",
      decimals: 18,
    },
    {
      name: "OR",
      address: "0x3438d8fd2a003ea029de8ed086687669dc6c5df2",
      decimals: 6,
    },
    {
      name: "BabyDoge",
      address: "0x3b9ce8be0bdd59974257434914f3d2357daf0e41",
      decimals: 9,
    },
    {
      name: "CHNGgo",
      address: "0x2e0957e2d2a43db1160154d5dc3a603d019b9b00",
      decimals: 8,
    },
    {
      name: "ZNC",
      address: "0xb1b7106e97f173106154c078f0040f75fdda4d97",
      decimals: 9,
    },
    {
      name: "MOMAT",
      address: "0x48b0632d25dcd9e1cec9eaca7cd97b82c452304f",
      decimals: 18,
    },
    {
      name: "KSC",
      address: "0xe66afdcc339bf3d0b9877257714c3d2881bf7d73",
      decimals: 18,
    },
    {
      name: "LC",
      address: "0x11a8e0b37501a76dd25a414b5c7ff885695b0de3",
      decimals: 18,
    },
    {
      name: "SOL",
      address: "0x43710fd8fc2f25373c543c2056f3c7bb90a3bdb4",
      decimals: 9,
    },
    {
      name: "MATIC",
      address: "0x7cc83e910ffc974623c8e2e47cb80aca3a8e9e90",
      decimals: 18,
    },
    {
      name: "FIL",
      address: "0xdb1bcd33c562f14b68fdc0e9ef920d2e231a77f6",
      decimals: 18,
    },
    {
      name: "DOT",
      address: "0xe05646f5212fa02637ba0b92f9bba383d5745120",
      decimals: 10,
    },
    {
      name: "OKT",
      address: "0x6a15bb0c7963e8e89384a3b714633967de408dbd",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x6b52048a01c41d1625a6893c80fbe4aa2c22bb54",
      decimals: 6,
    },
    {
      name: "CHE",
      address: "0x2ba18b6889d7dcc891d354b218a3fc4dc53f84b4",
      decimals: 18,
    },
    {
      name: "KST",
      address: "0xa2abc6f491dda91f6418d27a45a44df4d80f5556",
      decimals: 18,
    },
    {
      name: "FREE",
      address: "0x466f16541685d5648184467f8f83835cbb837972",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x09ff628d21fcc0795e0de4aef178e3d43ee44328",
      decimals: 18,
    },
    {
      name: "O3",
      address: "0x7630e1f29d9880059620b5ba74b3930bedd4447f",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0xbd9749e4da1fb181ce6e413946cf760dec67b415",
      decimals: 18,
    },
    {
      name: "BIFI",
      address: "0xafaf20d7290a3205abd6d337cd411dd301cbb773",
      decimals: 18,
    },
    {
      name: "FTM",
      address: "0xa67ab7a54e6a44f410d464596c9c4ba78252466a",
      decimals: 18,
    },
    {
      name: "FIN",
      address: "0xc4b6999fd0a9d61553c3ebc44eb5e5dbc4ab4300",
      decimals: 18,
    },
    {
      name: "RNFT",
      address: "0x6d1ea3932e5b92f73664d4d285728e2ab4a3119f",
      decimals: 18,
    },
    {
      name: "LHB",
      address: "0x4cf8001708ee8c1f228c5813bb5bc5e8a7c9dda5",
      decimals: 18,
    },
    {
      name: "DEP",
      address: "0x092e46e226a0cd2957eec9fbad0c1c43e54d0a95",
      decimals: 18,
    },
    {
      name: "BXH",
      address: "0xd0cbae53e19b6272bd8001571c9d37f64db6f711",
      decimals: 18,
    },
    {
      name: "CAN",
      address: "0x610f13b28d649a084f10f4317ed3fbc70b6bca21",
      decimals: 18,
    },
    {
      name: "DYDX",
      address: "0x4493165bd9a64aedc2a20c66b3d80d09637a845e",
      decimals: 18,
    },
    {
      name: "SFC",
      address: "0xcc5cfdad07582a67bf6d45999dff255b5a7d3bc2",
      decimals: 6,
    },
    {
      name: "AVAX",
      address: "0x0c8982a2e0dcd2a60b6716a58bc45ae40c2371c7",
      decimals: 18,
    },
    {
      name: "PNG",
      address: "0x5992625889601622fc75b4e696adef6ededb5cf6",
      decimals: 18,
    },
    {
      name: "JOE",
      address: "0x535e2f24b936b4bb76e79540252255cc43d93bcc",
      decimals: 18,
    },
    {
      name: "BUSD",
      address: "0xd169bfa08ae2c9bea4123a8760ba058afd647ed2",
      decimals: 18,
    },
    {
      name: "ELA",
      address: "0x471a525f12804f3eb45573f60b7c4ac29b3460e2",
      decimals: 18,
    },
    {
      name: "NT",
      address: "0x2f09da1850c8d7f6f62dc68704e9039e3e81e890",
      decimals: 18,
    },
    {
      name: "CRO",
      address: "0x742bfb6cced26f5b7464537de60dc0c31881dd9b",
      decimals: 18,
    },
    {
      name: "HP",
      address: "0xa30c4ffe645ebcfc18cb9b53f016b9091e57d36b",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0x947250c8664600b7cb18b0de73e592ed78598b8f",
      decimals: 18,
    },
    {
      name: "LOVE",
      address: "0xf5c5edf98c47bfe3a1d29c7ffe9a93ffc09a9205",
      decimals: 0,
    },
    {
      name: "EGLD",
      address: "0xa1d443c8954cce93c39bda3aaedc7ab66c34a5c4",
      decimals: 18,
    },
    {
      name: "PEOPLE",
      address: "0xbc55229039ae446c027a013e844a78bff07bfc11",
      decimals: 18,
    },
    {
      name: "BABY",
      address: "0xc1f62400f2855242dd7ebbe740d196f1e41cba13",
      decimals: 18,
    },
    {
      name: "SRM",
      address: "0xee11a13eb90bd7ddcc3d8baff333331d31339a12",
      decimals: 6,
    },
    {
      name: "RAY",
      address: "0xe771a4a76288e66b7a934ec4be154bcae7d8df42",
      decimals: 6,
    },
    {
      name: "OXY",
      address: "0xc9995e476c2bbdea3177d21f09feec3f258ab202",
      decimals: 6,
    },
    {
      name: "DFL",
      address: "0xb67d16ef79d031fb717d176d3209f6a67fead962",
      decimals: 9,
    },
    {
      name: "KIN",
      address: "0x84b8451107b077fc3796b58b9d6f43d7ee745d39",
      decimals: 5,
    },
    {
      name: "ATLAS",
      address: "0xbf72772258e7bbf07ab59b04001df22105920c0a",
      decimals: 8,
    },
    {
      name: "FIDA",
      address: "0x8d6206fad3dff8b13bd084c6e00b04458cc38b0d",
      decimals: 6,
    },
    {
      name: "POLIS",
      address: "0x46cb1c2920912d10decd30fb942dd830e3dcb78c",
      decimals: 8,
    },
    {
      name: "ORCA",
      address: "0x38e3751e4785dafc8667bf16bcb93cf9fe44bf1e",
      decimals: 6,
    },
    {
      name: "ALGO",
      address: "0xa83229a75c5046ba29b26fe37b4bd815ebb1bd6b",
      decimals: 6,
    },
    {
      name: "QJI",
      address: "0xdb61eae5376a01b7109b6d35b37c511d22c1ca85",
      decimals: 6,
    },
    {
      name: "AURORA",
      address: "0x47e3c84bb3d77c6561d6332fecae47ab0d0baa70",
      decimals: 18,
    },
    {
      name: "NEAR",
      address: "0x8c10b27037b5bc25b7f04991227db6b528f3e396",
      decimals: 24,
    },
    {
      name: "KSM",
      address: "0x5b13465a82c9ea76e9764e76896cec8325057cbd",
      decimals: 12,
    },
    {
      name: "ATOM",
      address: "0x3e2fe7064917cba0d434932af6daa753cbddaab5",
      decimals: 6,
    },
    {
      name: "LUNC",
      address: "0x22bab8b3100342c16945185d8d2b8c7aa906c8f8",
      decimals: 6,
    },
    {
      name: "USTC",
      address: "0x70609c5934a3d809f36d11b42c751afcccc4f3a4",
      decimals: 6,
    },
    {
      name: "FACE",
      address: "0x41585aad29f17658aecfd75c10e3ca4f2cbe742c",
      decimals: 18,
    },
    {
      name: "KLAY",
      address: "0x43a934f6058fbeb24620070153267a5f8162207c",
      decimals: 18,
    },
    {
      name: "XLM",
      address: "0x259494f5f23184d04e086ab01c0113e7d2da13b9",
      decimals: 7,
    },
    {
      name: "WEMIX",
      address: "0x00d197d8cfe95498264eaceddb02c79bc0f26d67",
      decimals: 18,
    },
    {
      name: "KLEVA",
      address: "0x9a5331021455708851dd87a8759c82e1f152b09c",
      decimals: 18,
    },
    {
      name: "BORA",
      address: "0x08608ebf81ddab792cd3d75b78bd3e3771d49fa0",
      decimals: 18,
    },
    {
      name: "KSP",
      address: "0x6ee4e858e6167250756235df76db6da7c38d9f7e",
      decimals: 18,
    },
    {
      name: "KFI",
      address: "0x27775ba0673e6d27bf25696ce4087c0d41c48df1",
      decimals: 18,
    },
    {
      name: "LUNA",
      address: "0x933be5464398015bf2d4c809352bf31e932d458c",
      decimals: 6,
    },
    {
      name: "ALBT",
      address: "0xe5a0bd9db3d806a1413e9ff8feb067f1a4cd6c20",
      decimals: 18,
    },
    {
      name: "ALCX",
      address: "0x91226efa97b916e7065e413f5340cca544ab6d60",
      decimals: 18,
    },
    {
      name: "ALPACA",
      address: "0x6f553a0df1ff4b36e732132418d0fd24ea54b51f",
      decimals: 18,
    },
    {
      name: "AMP",
      address: "0xca9ee339fd7ac332aa9098406a290753bc4bdace",
      decimals: 18,
    },
    {
      name: "APE",
      address: "0x40db765044fe976b6fc5d767e7f9061df94b4b25",
      decimals: 18,
    },
    {
      name: "ARV",
      address: "0x29dc302ccda200fdbd28ed726934ecc9c0bbce26",
      decimals: 8,
    },
    {
      name: "AUDIO",
      address: "0x78a2f2bff4df04e6635b13d798a9f0605965963e",
      decimals: 18,
    },
    {
      name: "AUTO",
      address: "0x4c5688807decf6dc85fa0eae901a6369cb90e7c8",
      decimals: 18,
    },
    {
      name: "AVAI",
      address: "0x6e0b57f037672b1e0c52b525806a4af21b2cb2df",
      decimals: 18,
    },
    {
      name: "AVINOC",
      address: "0x8f848da3e6f04e2208e4527227c46dac08d4c898",
      decimals: 18,
    },
    {
      name: "AVME",
      address: "0xd2a5b1f5fc98cd56f6d08ec40ab3a4791f3a6648",
      decimals: 18,
    },
    {
      name: "BANANA",
      address: "0xb2ea844746416d6bbef7e8e4cacc4cff2faaa3ef",
      decimals: 18,
    },
    {
      name: "BDO",
      address: "0xb9e4312de3e89555e9aa012b5250575807254e28",
      decimals: 18,
    },
    {
      name: "BELT",
      address: "0xdb1b54a04ad3a3a2f1287b914abca753af28d639",
      decimals: 18,
    },
    {
      name: "BETH",
      address: "0x9560854bf2190cb2281940a1a3ebe4fb6e928698",
      decimals: 18,
    },
    {
      name: "BFC",
      address: "0x1d45958267d3c092836bb14ec3ede2c51ad37538",
      decimals: 18,
    },
    {
      name: "BGOV",
      address: "0xcd65f58599e17a64bd405ac28d3d09847ab246f3",
      decimals: 18,
    },
    {
      name: "BNT",
      address: "0x885c8b591434bef1868322fae6ce2e5a51db1f0c",
      decimals: 18,
    },
    {
      name: "BOMB",
      address: "0x9b3953a8a91cd475a2a2d21170595b3f5f205f1a",
      decimals: 18,
    },
    {
      name: "BOND",
      address: "0x227178de10c030a7ac0af07252dbc36fc0f0fa46",
      decimals: 18,
    },
    {
      name: "BOO",
      address: "0x555974587c2989ebe639d40162540fccd1b7fe71",
      decimals: 18,
    },
    {
      name: "BR34P",
      address: "0xbbb52e84cdbcadda2929cabf1be8cbc4da84c585",
      decimals: 8,
    },
    {
      name: "BSCPAD",
      address: "0xf1329fdd8e383fe6dde688621fa9ececd474f004",
      decimals: 18,
    },
    {
      name: "BSHARE",
      address: "0xb0729ee8525a03765bb2a326302c112383b909a3",
      decimals: 18,
    },
    {
      name: "BSW",
      address: "0x019ac2a9fc620d08f0f98057fb9c9ba9a11d692f",
      decimals: 18,
    },
    {
      name: "CLY",
      address: "0x7739970d08145ca8d49361ecf430762e11fdea94",
      decimals: 18,
    },
    {
      name: "CRA",
      address: "0xb37bc11b4474bfd44e2bab86bf64aa30f2b96630",
      decimals: 18,
    },
    {
      name: "CULT",
      address: "0xc2eb85f9f2e973bec6fd7b557d2b9942f02f3248",
      decimals: 18,
    },
    {
      name: "CVX",
      address: "0xfd2377c24e820df7312b154b3749f9aa91aa8a86",
      decimals: 18,
    },
    {
      name: "DAO",
      address: "0xea62fa8281cf25e88e69ca4891d4c062df968cde",
      decimals: 18,
    },
    {
      name: "DCAU",
      address: "0x64d6d88a92ea06ddc1d8debb6e4febfa6746442a",
      decimals: 18,
    },
    {
      name: "DEXT",
      address: "0x5326ad397d04f932c7722a5d56a6a3ecf4fcd677",
      decimals: 18,
    },
    {
      name: "DG",
      address: "0x59718a1929b2f7eb0c9134d32d74b95bd19ad492",
      decimals: 18,
    },
    {
      name: "DIGG",
      address: "0xd5195d0e87b8e9504157e8a0af62ad8f844b8d66",
      decimals: 9,
    },
    {
      name: "DOME",
      address: "0xbfbc75fd4c3cdbdcc507fe078655219630ecdabc",
      decimals: 18,
    },
    {
      name: "DPI",
      address: "0x4f40819778c8e3b5b47468d68249dcafa9741431",
      decimals: 18,
    },
    {
      name: "DXD",
      address: "0x06afeafdc695321e5f8c28f7e0a57240c5e0e397",
      decimals: 18,
    },
    {
      name: "ECP",
      address: "0xaeca96d2f2b76680e871326f39c1c7de5a02a8ee",
      decimals: 9,
    },
    {
      name: "EDEN",
      address: "0xabb94128eaf0dec612ced4a388e0b21a088b7fc7",
      decimals: 18,
    },
    {
      name: "EGG",
      address: "0x3700ddb5af3fb7212ff9a3d6f86d657ee35aa0a3",
      decimals: 18,
    },
    {
      name: "ELK",
      address: "0xdae22fd81004c375b2422508e5052d633a0d8aa5",
      decimals: 18,
    },
    {
      name: "ELON",
      address: "0xa6d72a6a796c0b2928f23b52121dd9c65aaaa1a0",
      decimals: 18,
    },
    {
      name: "ELONGATE",
      address: "0xfe436342bb7323932da8c038341687552d0aa0e3",
      decimals: 9,
    },
    {
      name: "EMAX",
      address: "0x9a352fb4171c6f3c98a84447f07761bbc653fe22",
      decimals: 18,
    },
    {
      name: "ENS",
      address: "0x838a1df869b2c76f9ec7a5c00d7d2dac6b561fda",
      decimals: 18,
    },
    {
      name: "EPS",
      address: "0xd59c67fe920dc5148beb1c6998646bf5127083cb",
      decimals: 18,
    },
    {
      name: "ERN",
      address: "0xf349682b997e159a53ca66905a34960c0d52f31e",
      decimals: 18,
    },
    {
      name: "EVN",
      address: "0xfd75d8777b6c9975e978fa7101b49a6fb3dfa3bf",
      decimals: 18,
    },
    {
      name: "FLOKI",
      address: "0x861af45da183cef1214f19651b884d19ff109922",
      decimals: 9,
    },
    {
      name: "FLX",
      address: "0xdd3fcf07ff85c8f18c493eaeb0797caa9cf4a32c",
      decimals: 18,
    },
    {
      name: "FNC",
      address: "0x18f8f5eb33d331edb68ff9142c997c74ed48683e",
      decimals: 18,
    },
    {
      name: "FODL",
      address: "0xefb91bbbe9191cc398ff6b3a8e0f9e47227d7904",
      decimals: 18,
    },
    {
      name: "FOX",
      address: "0xb746f0ae1f83ee9fe3acc7e6af3d1e5944e91596",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0x129a8a02098a6552a45345e8750d101e40ec30fd",
      decimals: 18,
    },
    {
      name: "FUEL",
      address: "0xdbdbdc409a27f7738737be6bdeac9a18a6d5cf57",
      decimals: 18,
    },
    {
      name: "FXS",
      address: "0xabd2d2ce395611e18216bde58c74ee40985d432d",
      decimals: 18,
    },
    {
      name: "GLM",
      address: "0xab5b3a4b44ec28d3238e2d9a29d142ddf984c6bd",
      decimals: 18,
    },
    {
      name: "GMT",
      address: "0x57391d2e3cd0cc1de037d632d361545e5da31b0e",
      decimals: 8,
    },
    {
      name: "GMX",
      address: "0x34e8dfbb08f0ff50fa632bb9d4dfb176c09bd4d2",
      decimals: 18,
    },
    {
      name: "HEC",
      address: "0x17cd13406802f811a0b15eda3d0f4f0dd30117b7",
      decimals: 9,
    },
    {
      name: "HEX",
      address: "0x07685fc2ecbf2a4746a78742d52eb64d6c004f3e",
      decimals: 8,
    },
    {
      name: "HEZ",
      address: "0x8242126a3914d7900970ce506a26cadbf5324479",
      decimals: 18,
    },
    {
      name: "ICE",
      address: "0x27eacc3d71f40109224239137ff39fbc997eb3ae",
      decimals: 18,
    },
    {
      name: "ICHI",
      address: "0x6337a2cc7d7adcb32a4fc23e6628f63a998825ec",
      decimals: 9,
    },
    {
      name: "ILV",
      address: "0x13ff777ba623cc5a378716a02496d19cfc50bb3f",
      decimals: 18,
    },
    {
      name: "IME",
      address: "0x245e2f74b9fcba96100bcad9b8bf1c85967f05da",
      decimals: 18,
    },
    {
      name: "IMX",
      address: "0x7ade4d20d7864990d3453f3cae7fd11e94e0e70f",
      decimals: 18,
    },
    {
      name: "KLO",
      address: "0x32f6cd49b5ca473dc1fd8f193a7a239262303e83",
      decimals: 18,
    },
    {
      name: "LDO",
      address: "0xa70cac32848cf24ad97f9a288e2ef82c674593ca",
      decimals: 18,
    },
    {
      name: "LEASH",
      address: "0x6a3d0eb62b2026e1b1ef799388695fff3226f7de",
      decimals: 18,
    },
    {
      name: "LINA",
      address: "0xe015c22fadfce1aa803b63db8f877a6f6a00f7a0",
      decimals: 18,
    },
    {
      name: "LON",
      address: "0x0d911d016695c0983275b955e3f48b23ae2636eb",
      decimals: 18,
    },
    {
      name: "LQDR",
      address: "0x638381773d14ac45ef48c2469fbd71a35d35c79a",
      decimals: 18,
    },
    {
      name: "LTX",
      address: "0x1f6824d01e6c70d6233ebb5d2a34dcb195516364",
      decimals: 8,
    },
    {
      name: "MBOX",
      address: "0x5f93cf6cf0d25f47e63327293c7e3b07aaec3624",
      decimals: 18,
    },
    {
      name: "MC",
      address: "0xfb3b68fc2549b7e2758c984e14064764a82b4be9",
      decimals: 18,
    },
    {
      name: "MDA",
      address: "0xe58b3c17326a29917c48eb5bc966868e68387320",
      decimals: 18,
    },
    {
      name: "METIS",
      address: "0x8e0368da229930114287c15be69245e1faad91a4",
      decimals: 18,
    },
    {
      name: "MIM",
      address: "0xfb37dffa0e2e345834c3e720a14a54ce99cad76a",
      decimals: 18,
    },
    {
      name: "MIST",
      address: "0xd3c667b7316d0ade69928027afe673ff116ad20a",
      decimals: 18,
    },
    {
      name: "MKR",
      address: "0x4f802c3279868beaba77a0dfcc568d43a3058b15",
      decimals: 18,
    },
    {
      name: "MM",
      address: "0xed9e97a54da9ff1926a6e36d611ffc26a5ac3416",
      decimals: 18,
    },
    {
      name: "MOONTOKEN",
      address: "0x35ac22b921733030009d516c42aba307263a4992",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x1ec17e5787c4f8f6ad9d0a88e35de93409e1d7de",
      decimals: 18,
    },
    {
      name: "NFTI",
      address: "0x3f62ad369f4d5f5eb76354436454ec83c2b2ec1f",
      decimals: 18,
    },
    {
      name: "NFTX",
      address: "0x54e6ea3f05861413b8c062419810bd5e890ee8a3",
      decimals: 18,
    },
    {
      name: "OCEAN",
      address: "0xc354605b509cabca60990f67c19f9c81069f9d96",
      decimals: 18,
    },
    {
      name: "OGN",
      address: "0x94bc81cb0e4f5838d13887283ff948cb90ad5df6",
      decimals: 18,
    },
    {
      name: "OHM",
      address: "0x78869bd8e4866fa6e09e6c9849b97d0754fb7d08",
      decimals: 9,
    },
    {
      name: "PACOCA",
      address: "0xf4d6c8b030576cb9120a808dbad828f7c70bb5eb",
      decimals: 18,
    },
    {
      name: "PAXG",
      address: "0x7053b0cc41e99566ff676f522711f0149de30512",
      decimals: 18,
    },
    {
      name: "PEEPS",
      address: "0x7518272c6cffd1d3cd317be39b7e2b2330276ba8",
      decimals: 18,
    },
    {
      name: "PEFI",
      address: "0x0ac3ff4c5bbb180fface3f2477967bf661fda9c5",
      decimals: 18,
    },
    {
      name: "PENDLE",
      address: "0xa18da146dab7b4a67cd6d07aca429eb57498e941",
      decimals: 18,
    },
    {
      name: "PERP",
      address: "0x9b84a2294f05051178383b89b02cf233f0cb1eaf",
      decimals: 18,
    },
    {
      name: "PIG",
      address: "0xaa2f78a169d2b560e9e036ecead78a3958c48200",
      decimals: 9,
    },
    {
      name: "PIT",
      address: "0x29e4ca950dfbe3ff80aa9639deba2ec7fb06264b",
      decimals: 9,
    },
    {
      name: "PKF",
      address: "0xc896ebe462c7f0b141f09424324042cc6a49b6a6",
      decimals: 18,
    },
    {
      name: "PNK",
      address: "0x4a922f44ce9e6866c35d2cf60a4283eda0a55a80",
      decimals: 18,
    },
    {
      name: "POLS",
      address: "0xf14577e61968123fb8f6c2a82433958fdd07e6c5",
      decimals: 18,
    },
    {
      name: "PREMIA",
      address: "0xf41d40408df690c39b9890e40ba137e82678e63c",
      decimals: 18,
    },
    {
      name: "PROTO",
      address: "0x6794b2b1ff7dcca8d0ff360fa2cb90eca85be902",
      decimals: 18,
    },
    {
      name: "PTP",
      address: "0x2cc2893a0984c2b2c8f02b05932b86f882ef75b0",
      decimals: 18,
    },
    {
      name: "QI",
      address: "0x12c2de263467c3af06a05b3aa171b6c346327b3a",
      decimals: 18,
    },
    {
      name: "RAD",
      address: "0xe164b6ebeff63771b3259c8f8e26d3250f645457",
      decimals: 18,
    },
    {
      name: "RAI",
      address: "0x38817032751ab4c992cceba1ecb8fa2797f72f7d",
      decimals: 18,
    },
    {
      name: "REN",
      address: "0xc79ef732fa2b420bd6349f75074d2655f1642953",
      decimals: 18,
    },
    {
      name: "REQ",
      address: "0xed16f09d91c465db52d1f4932ee1fa702bbf4d38",
      decimals: 18,
    },
    {
      name: "RGT",
      address: "0xd6ed8517381706abd8664ba5a17357c874374977",
      decimals: 18,
    },
    {
      name: "RLY",
      address: "0x813e69dfc90bc86ecd5807e2461dd83fd81f9d68",
      decimals: 18,
    },
    {
      name: "ROCK",
      address: "0x80e95bdfcd90e84d278b44387d14d5bfa2e68b80",
      decimals: 18,
    },
    {
      name: "ROOK",
      address: "0xefc7ff381b1205cbdd97aaadde468e1d93a85f3a",
      decimals: 18,
    },
    {
      name: "RPL",
      address: "0x164ae48834215f42e6cf155f958e04b4daf0c5a2",
      decimals: 18,
    },
    {
      name: "SAFEMARS",
      address: "0xa5338375e34388c12b526c79ff4c00a5da885ee6",
      decimals: 9,
    },
    {
      name: "SAITAMA",
      address: "0xc171cdf3393c5d5e81d903b7474c624275aee901",
      decimals: 9,
    },
    {
      name: "SAND",
      address: "0xd08f96e3db7d3bad84d7a7d64876f75bb176b8c8",
      decimals: 18,
    },
    {
      name: "SCREAM",
      address: "0x8680a15cd591d65695d602e1f4a41c4668ed7567",
      decimals: 18,
    },
    {
      name: "SFP",
      address: "0xc90fb670599156383a8c19e5dc4e8c38674138b2",
      decimals: 18,
    },
    {
      name: "SFUND",
      address: "0x6fdbc56b903f62f5d5d07be86c1778267b2fc529",
      decimals: 18,
    },
    {
      name: "SMRTR",
      address: "0x7f40fdcc4d835c39233590ad24829ef66a4de69f",
      decimals: 18,
    },
    {
      name: "SPA",
      address: "0xbe07d05adbf00c028994aaf6dc134903b4b7d924",
      decimals: 9,
    },
    {
      name: "SPARTA",
      address: "0x8baff2da2e41f3f57d1420e29f6bd19865a828be",
      decimals: 18,
    },
    {
      name: "SPELL",
      address: "0xe735606819a550d7fa6ae70c68055baf5e653fd6",
      decimals: 18,
    },
    {
      name: "SPIRIT",
      address: "0xae1a17edd86e33dc2e71365d610b75bb1b44443e",
      decimals: 18,
    },
    {
      name: "STARL",
      address: "0xed575ebf60b5c586465a5628d89bee98f560e9d1",
      decimals: 18,
    },
    {
      name: "SUPER",
      address: "0x3dc53a64661c10d0ca7c9c11d4b410b67f1396a5",
      decimals: 18,
    },
    {
      name: "SWFL",
      address: "0x4a847cd9baf4ad5c892cadffce4e4c191c83c866",
      decimals: 18,
    },
    {
      name: "SWPR",
      address: "0xdf3cd1d4cf27293899d307e7a361cd3aa6c7b19d",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0x20411f0abbbdea4cbccc9c8fed5b5ea646e1663c",
      decimals: 18,
    },
    {
      name: "TAROT",
      address: "0x7382b384d28e14f8c000b6f6923b7ca498835f56",
      decimals: 18,
    },
    {
      name: "TIC",
      address: "0x45eb40bc57124cc3515f8b0321054d95ceceff55",
      decimals: 18,
    },
    {
      name: "TKO",
      address: "0xc392f83a35ae776cfa1d00855bf0162f901c021e",
      decimals: 18,
    },
    {
      name: "TOKE",
      address: "0x7bd27b6324b67c33fa31ab881011b71f6cd3325c",
      decimals: 18,
    },
    {
      name: "TOMB",
      address: "0xbc8a7ba2b5aaeb6db1f350ca7483d71df44d0944",
      decimals: 18,
    },
    {
      name: "TOR",
      address: "0x7cd7aab9d052499fba59175b90c7dbb03fec37bc",
      decimals: 18,
    },
    {
      name: "TORN",
      address: "0x92892af31c0a034b5519930032f6c9b7114e913a",
      decimals: 18,
    },
    {
      name: "TRIBE",
      address: "0xb444b19689cb5e1f91a1281a5ea349334c394512",
      decimals: 18,
    },
    {
      name: "TRU",
      address: "0x713d8af380b497d0fbd40b189ccedf40ba5a6faa",
      decimals: 8,
    },
    {
      name: "TSHARE",
      address: "0x26f59f6a264a16a6f13ae6261ea01bbdd0f89a4d",
      decimals: 18,
    },
    {
      name: "TUS",
      address: "0xe949071c33110ebf2042b6f861dabd3f86562877",
      decimals: 18,
    },
    {
      name: "TWT",
      address: "0x60dfc3c81363d2ca44a6590c3786be2016fedcfc",
      decimals: 18,
    },
    {
      name: "UFO",
      address: "0x94735e1b70a39b051a642ae238726bb3d1642aa1",
      decimals: 18,
    },
    {
      name: "VADER",
      address: "0xe3cbad8a75e749d86ea9b8291441333949480625",
      decimals: 18,
    },
    {
      name: "VSO",
      address: "0xef4c1323862eee5ac76e07a28aa698cbfc454753",
      decimals: 18,
    },
    {
      name: "WAXE",
      address: "0xa2991ff44ca515330ee79dd270b7ea94f684e4bb",
      decimals: 8,
    },
    {
      name: "WET",
      address: "0x2002b74512f0c20b2127a9dfc6a07ddce7004be5",
      decimals: 18,
    },
    {
      name: "WISE",
      address: "0x573236f4f4f9bd44e732bb124738154b7782471c",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x9b0ed16453d0fa5bb402e777001c4a64268c6442",
      decimals: 18,
    },
    {
      name: "WOOP",
      address: "0x1790864c5ae652b0e87fa4fe70fd99bd5c32b5a9",
      decimals: 18,
    },
    {
      name: "WXT",
      address: "0x400f4e82a85e22f8b306fb25c07cb82da3adde63",
      decimals: 18,
    },
    {
      name: "X2Y2",
      address: "0x34fffdc30511b76c7966182aa4f78370a0313396",
      decimals: 18,
    },
    {
      name: "XAVA",
      address: "0x0653ae290a23dca2c0031091f71351bdc6a84e68",
      decimals: 18,
    },
    {
      name: "XWIN",
      address: "0x5f20f5404f7b2654ee1a6b7b045f8fb3d08b1dc4",
      decimals: 18,
    },
    {
      name: "YAK",
      address: "0xe6aa9523aee85d8c59f04aafab41e302b4d90ef5",
      decimals: 18,
    },
    {
      name: "YOSHI",
      address: "0xb347ad52be59d5c5337a46f4c08d830897be70f1",
      decimals: 18,
    },
    {
      name: "ZCN",
      address: "0x37536e37fec0fdfbb500472bef22ea199484edd9",
      decimals: 10,
    },
    {
      name: "VVS",
      address: "0x5f85a5a31dba2034513a26a09174258547d3b4ab",
      decimals: 18,
    },
    {
      name: "CRONA",
      address: "0x28fbc1a099dd0b894cb5165256234032bd03f0b9",
      decimals: 18,
    },
    {
      name: "CHINESE",
      address: "0x03a6eed53b5dcb0395dfbecf4cbc816dc6f93790",
      decimals: 18,
    },
    {
      name: "CUBE",
      address: "0x185b67ee68ba07d3910bedb051b102741d977314",
      decimals: 18,
    },
    {
      name: "CORN",
      address: "0x407643a2d240e450b34f2cb74e0367055728454e",
      decimals: 18,
    },
    {
      name: "SEXY",
      address: "0x05038f190eb986e8bbfc2708806026174fb4bebe",
      decimals: 6,
    },
    {
      name: "LTC",
      address: "0xc41d1129a5f6eb6286d3fb1eb36f9b3c97815927",
      decimals: 8,
    },
    {
      name: "DOGE",
      address: "0x8628f3e97635da5e94eee8ccfa91f0444a526ff4",
      decimals: 8,
    },
    {
      name: "VET",
      address: "0x3f0144628b89f27647a0d91736b0b987658b1715",
      decimals: 18,
    },
    {
      name: "IOTX",
      address: "0x1d4e8ff134219355076dfc77972e88dc9382edad",
      decimals: 18,
    },
    {
      name: "ADA",
      address: "0xde70358a313f9ad07010e75895b1bfbd4bfa1d75",
      decimals: 6,
    },
    {
      name: "SUKU",
      address: "0xf30f16714d71103b47a59ce18dff2071adcd09b5",
      decimals: 18,
    },
    {
      name: "SHIT",
      address: "0x5e14e4f1f961b7183915793965a0aa40646b2936",
      decimals: 18,
    },
    {
      name: "CAW",
      address: "0x123a6428eb6098bad6c336cbb8c5346af8a00b2c",
      decimals: 18,
    },
    {
      name: "XRP",
      address: "0xc9b0024bf523471b78558b21217478cdbbadca86",
      decimals: 6,
    },
    {
      name: "ETC",
      address: "0x49f2f7d599159d7402adae27225d25005578bad8",
      decimals: 18,
    },
    {
      name: "DIA",
      address: "0x292b6e57466bdc6f96db15e1623131425eeed7e6",
      decimals: 18,
    },
    {
      name: "OP",
      address: "0xbde88a0c63d19d42fb6a42e2a7e9739cfc63b04f",
      decimals: 18,
    },
    {
      name: "CHZ",
      address: "0xa5590e7a3cb538cd44ebda7a31e2f76200a1b270",
      decimals: 18,
    },
    {
      name: "BUNNY",
      address: "0xd0b6749de3fbfd7213c05de62fda61e5acabab7e",
      decimals: 18,
    },
    {
      name: "FGD",
      address: "0xf9586afd59e2521af9a73559925bbba835a30c10",
      decimals: 18,
    },
    {
      name: "MEB",
      address: "0x82e350474cb9bd17a927eff164f1395276d4ceef",
      decimals: 18,
    },
    {
      name: "HERO",
      address: "0xe031b55b9d0c13cb5a4ededb13cb394a69b8af93",
      decimals: 18,
    },
    {
      name: "FIST",
      address: "0xf411215eaf73bde89422379a215794fb770e8343",
      decimals: 6,
    },
    {
      name: "RACA",
      address: "0xc581a7abb3a1bc578e54b41ef798a82898d05d0e",
      decimals: 18,
    },
    {
      name: "FSV",
      address: "0xee543a5fede0ca8d282f3159b9b6cac3937f46a1",
      decimals: 6,
    },
    {
      name: "DEBT",
      address: "0x5856425a4f52722895df8c7586e2e127b8c40897",
      decimals: 8,
    },
    {
      name: "PMR",
      address: "0xf5ac5400cb4537367ea636a29a920ff8c9a25421",
      decimals: 18,
    },
    {
      name: "TTC",
      address: "0x9b6f6abe714481b87c7220b2b0cd181e66b85154",
      decimals: 18,
    },
    {
      name: "SQUA",
      address: "0xe11dde19ea73f514400a578e808bce984a4ee275",
      decimals: 18,
    },
    {
      name: "IUSD",
      address: "0xc5b0e0417b951f5e29f7855ad44b40d11eb29949",
      decimals: 18,
    },
    {
      name: "IZI",
      address: "0xcdc8051907b1d1e1e0e1d4c6afc1e39cfbf3f2e7",
      decimals: 18,
    },
    {
      name: "ETHW",
      address: "0xefe954040ebf0452de7eff93ade37dba843af857",
      decimals: 18,
    },
    {
      name: "ETHF",
      address: "0xf8174c68a820483335d1165f924ae6f94f3f9680",
      decimals: 18,
    },
    {
      name: "TRADE",
      address: "0x4a4b062f602f83387a13915f815396ade22b692a",
      decimals: 18,
    },
    {
      name: "BHC",
      address: "0x6575b4378de2c0fff49aa664581e4c2beb2b31bc",
      decimals: 18,
    },
    {
      name: "CANTO",
      address: "0xa6f997bbc6f989c9ff423b3f9ac2ff7bdcaedcb3",
      decimals: 18,
    },
    {
      name: "RBTC",
      address: "0x9a7ca3d775d5ca64cba81ba188a965e233bc53bf",
      decimals: 18,
    },
    {
      name: "RIF",
      address: "0x8df3cf264a0183fc3d1de1c6826cd3468d58e92c",
      decimals: 18,
    },
    {
      name: "RDOC",
      address: "0x12077c9b23d4b394c769f130e7abb85dc7938adc",
      decimals: 18,
    },
    {
      name: "APT",
      address: "0x58a7c954c9b7cb9148af7873bba5830b6f617204",
      decimals: 8,
    },
    {
      name: "FNK",
      address: "0xb24db6409bfd6d5a13f21357a94f773d94602b8b",
      decimals: 18,
    },
    {
      name: "OSK",
      address: "0xf7902210f5b892b554609179c0de04b0b94944cd",
      decimals: 18,
    },
    {
      name: "FUFU",
      address: "0x65f1c002447e07dec992617aeef9e6014916c046",
      decimals: 18,
    },
    {
      name: "SAITO",
      address: "0x619d6b8d7a3a8912f0a256e78235a06740738ce7",
      decimals: 18,
    },
    {
      name: "WIRTUAL",
      address: "0x5960dd4944afd8c0752fb31268a3814cb58e659c",
      decimals: 18,
    },
    {
      name: "GENE",
      address: "0x6129c3e01d53d7c0387f91830be243c241f99318",
      decimals: 18,
    },
    {
      name: "DPX",
      address: "0xce4121ac26878790a19a416bcf2c235c1da85018",
      decimals: 18,
    },
    {
      name: "TIME",
      address: "0xaff50a5ed94cabb94ff75ee8735177b2d1cc89e9",
      decimals: 8,
    },
    {
      name: "IF",
      address: "0x101350b17eab103ec2440893f02dcf7899575901",
      decimals: 18,
    },
    {
      name: "IDIA",
      address: "0x3c9255609b8c94d79d3df9282e58c753d17abb84",
      decimals: 18,
    },
    {
      name: "EBOX",
      address: "0x34a8a2aa0aa6668238d573ff500deb61ddac862d",
      decimals: 18,
    },
    {
      name: "BCH",
      address: "0x14bd984714c5b21a8200a7baaf9c5bd4f725db77",
      decimals: 18,
    },
    {
      name: "CREAM",
      address: "0x96d36a360f58061079ad3ae341bd1c77b8ed37bb",
      decimals: 18,
    },
    {
      name: "MAGIC",
      address: "0x3923fa72aa13b4a3632273b09df55ab1fa7ec8cf",
      decimals: 18,
    },
    {
      name: "BTT",
      address: "0x9db10e8698e353410b8b12e260dc03a22b4367ff",
      decimals: 18,
    },
    {
      name: "GDDY",
      address: "0x9bcf1a728ee39be58c829c2862a2d0e982fbc1b6",
      decimals: 18,
    },
    {
      name: "RDPX",
      address: "0x28ed77dfbcae2920aac04e7cb1c5c0ed92fe5cd0",
      decimals: 18,
    },
    {
      name: "PUNK",
      address: "0xfeeb79a316f65cdbcdbe693bfc9d5fd569f17f38",
      decimals: 18,
    },
    {
      name: "BIGSB",
      address: "0x0a1db75f5dbc9465a62baa66ba44241af648b71b",
      decimals: 18,
    },
    {
      name: "MEER",
      address: "0xba81918611cbc4bc9c563273075d2ce8d3ea7b19",
      decimals: 18,
    },
    {
      name: "JPEG",
      address: "0xc75f6f2b7ae356e410daa286078cdc6fafbd0fee",
      decimals: 18,
    },
    {
      name: "DELTA",
      address: "0x30f385aab5e02cf85a4a50ba4e89c0a6373083f5",
      decimals: 18,
    },
    {
      name: "BCT",
      address: "0xb707142309225935d943a1a2ea6c8d349286dc55",
      decimals: 9,
    },
    {
      name: "DEI",
      address: "0x3834838a42f834687ab34a8f7bf10eadb6f6e977",
      decimals: 18,
    },
    {
      name: "GOHM",
      address: "0xe0eaf62c614fbb93dd7bf178e567346a6815b2e0",
      decimals: 18,
    },
    {
      name: "TAU",
      address: "0x98206e7e4c3f3d69c57c07804721e2b55509e6fc",
      decimals: 18,
    },
    {
      name: "WMEMO",
      address: "0x88b201cc5277ac64525e05630a36468282dbbf1b",
      decimals: 18,
    },
    {
      name: "ASTO",
      address: "0x42e424ad1daa381b93d6ddfc64d9c9785afa0fc7",
      decimals: 18,
    },
    {
      name: "XMON",
      address: "0xb1162cdb7c272e2359691d93cadc3aaa8de85efc",
      decimals: 18,
    },
    {
      name: "AMT",
      address: "0x1fbc5132df537df41195c16db2e7b862cd4da35e",
      decimals: 18,
    },
    {
      name: "QUARTZ",
      address: "0x8600a2e7dacd9c22bd5888c57f6e70024fe53c68",
      decimals: 18,
    },
    {
      name: "GOLD",
      address: "0x37703142949cb9c7d4146c958639bf6d87fa61d4",
      decimals: 18,
    },
    {
      name: "KLIMA",
      address: "0x82a8b54985290105d4441bc8480841be64d7ad55",
      decimals: 9,
    },
    {
      name: "HIGH",
      address: "0x9952e0016c19b8ea47abb521e92ac396fc93c8f7",
      decimals: 18,
    },
    {
      name: "ESHARE",
      address: "0x8910bd208bbc79d7668915e25d2ff190817486ad",
      decimals: 18,
    },
    {
      name: "VOXEL",
      address: "0xe7e83763c0bed5fe38e7c5d7d8b0627449b0d718",
      decimals: 18,
    },
    {
      name: "SPS",
      address: "0x4932fa04e0250de1f417594c3c3982ee27ffe3c9",
      decimals: 18,
    },
    {
      name: "TONIC",
      address: "0x3d9218ab03ed6124b91de458011e24e134cf8466",
      decimals: 18,
    },
    {
      name: "SHIBDOGE",
      address: "0x3904ca712ed092d135bdb84e36ec344245dd98dd",
      decimals: 9,
    },
    {
      name: "DIFX",
      address: "0x1a0f4428589a030d5d06ca1da960df512bca813e",
      decimals: 18,
    },
    {
      name: "EGS",
      address: "0xf102baf75f80c46499fe68e0e2a35d700ff2f7f8",
      decimals: 18,
    },
    {
      name: "ZKS",
      address: "0x6253a1bdfc4e761498964143b4e54f8b9bf9b338",
      decimals: 18,
    },
    {
      name: "YFII",
      address: "0x5bbf2ddd1d552f1459a4bb43f05992a7a824a0a0",
      decimals: 18,
    },
    {
      name: "OMG",
      address: "0x4b68173a9be7889a046edcee862ec48e96b177f1",
      decimals: 18,
    },
    {
      name: "VRA",
      address: "0x16516a34e6f4aba48d460ab47aac556f9842b47b",
      decimals: 18,
    },
    {
      name: "GT",
      address: "0x5b07b4b464dac3df570ce3b0d058e9eefe258862",
      decimals: 18,
    },
    {
      name: "MX",
      address: "0xf6eca9f04ce4932b6d047186401d0fcb0701986d",
      decimals: 18,
    },
    {
      name: "GALA",
      address: "0x25e24ff802eac9e9569d75a85d5183acb8f49210",
      decimals: 8,
    },
    {
      name: "MASK",
      address: "0x482b25534ab06ad0290d6a71bb8d6f28df32b2b3",
      decimals: 18,
    },
    {
      name: "OKB",
      address: "0x510344f3344338bcea1b274f8b606d0b33ff0553",
      decimals: 18,
    },
    {
      name: "AKITA",
      address: "0xbcd8bd2aea4910a75d65a70c59b5c49c9728b6cf",
      decimals: 18,
    },
    {
      name: "NMS",
      address: "0xbaecf814e618e479fbbc0dcff99277bd2f2424ad",
      decimals: 9,
    },
    {
      name: "ELF",
      address: "0x5b1a6742461de1a6b82fd17dd0e96f00b3dad3c3",
      decimals: 18,
    },
    {
      name: "IXT",
      address: "0x99e451c1e926c47e185b1d0c773ead14076ef3f9",
      decimals: 18,
    },
    {
      name: "QOM",
      address: "0xace98b423150f59061243cdaf26b5daddb45b66e",
      decimals: 18,
    },
    {
      name: "YGG",
      address: "0x2343f35d2aa0beffbad66ecdbab1c655d022b48b",
      decimals: 18,
    },
    {
      name: "BIT",
      address: "0xbf6d6da49c2261382d420211e1e8a21c702a33da",
      decimals: 18,
    },
    {
      name: "UNIX",
      address: "0xf6aee552e61f4fd46a1799dae419f6fe7f8fc4a2",
      decimals: 18,
    },
    {
      name: "CC",
      address: "0x6652afebba0aacb38d28be4a139fe5117ec4c069",
      decimals: 18,
    },
    {
      name: "LCD",
      address: "0x5feac8a05311f1fb27c08770fe97976e428d370a",
      decimals: 18,
    },
    {
      name: "MIDAS",
      address: "0x66d1db626b3518d57bd7d6648295c1cfd5c60d4a",
      decimals: 18,
    },
    {
      name: "WILD",
      address: "0x5bf6ebfa58d6a3f39d8afd7a766f347120a216c7",
      decimals: 18,
    },
    {
      name: "JONES",
      address: "0x1622173a11100660b35926d5c1623f195cdf842a",
      decimals: 18,
    },
    {
      name: "SASHIMI",
      address: "0x82a14526ca50ea55672505328b527bc3075326d4",
      decimals: 18,
    },
    {
      name: "SOS",
      address: "0x9094d0d890bc05d8f2d66e99db4cb77a9527d268",
      decimals: 18,
    },
    {
      name: "LFT",
      address: "0x3218feea81332e96779e9eab9344bbeacacd95d3",
      decimals: 18,
    },
    {
      name: "LAND",
      address: "0x5bc7180e6408e72b4e6ce47c92a4e666ba587dd1",
      decimals: 18,
    },
    {
      name: "LIT",
      address: "0x25766ed8866330176744ec3290efe14ec7961a87",
      decimals: 18,
    },
    {
      name: "OSWAP",
      address: "0x402f41a1124dbf44c4b218872ef8dbe8a74df753",
      decimals: 18,
    },
    {
      name: "AURA",
      address: "0x17f01f3c13bca2f5dd898281a3c60e28352e1bfe",
      decimals: 6,
    },
    {
      name: "ARDN",
      address: "0xe797a55a725a65c82e81bb345d0fd472d67497e8",
      decimals: 18,
    },
    {
      name: "EXPO",
      address: "0x641360e0d7c547875981768ab9b5aaf3bd88fe52",
      decimals: 18,
    },
    {
      name: "BNX",
      address: "0x229d9c4ca1817cc69c21cf8bc61d9907c6d7db97",
      decimals: 18,
    },
    {
      name: "DOG",
      address: "0x53dddda3468f59b312d06d592037e61951410b5c",
      decimals: 18,
    },
    {
      name: "BREED",
      address: "0x7eb5be073d1792983b1012322c54e0d4a46b3044",
      decimals: 18,
    },
    {
      name: "KNIGHT",
      address: "0x7c718ed384534452c73752a303742c29e8acf0f1",
      decimals: 18,
    },
    {
      name: "DOE",
      address: "0x085108424e1ece70c7085d3bae9f5370ac68abaf",
      decimals: 18,
    },
    {
      name: "UNDEAD",
      address: "0x7747c774bbee336ed1bc0ba5c24e93927f833376",
      decimals: 18,
    },
    {
      name: "MMF",
      address: "0xd34538617c4bd3d59d2de3265ce15cddecd51195",
      decimals: 18,
    },
    {
      name: "WALV",
      address: "0xdf05e0b2364be6f49c66f48ff1c38117e17b632f",
      decimals: 18,
    },
    {
      name: "WOM",
      address: "0x7630ea160b9687bb29fdc2a06789d6fc15e755e0",
      decimals: 18,
    },
    {
      name: "PLS",
      address: "0x8a27e9935521546d08549b0ce6a88764dca9a957",
      decimals: 18,
    },
    {
      name: "CVC",
      address: "0x875dadf47eb013502ead2619286f2accf0e15db5",
      decimals: 9,
    },
    {
      name: "MPL",
      address: "0xf371bdf567aecbd7d23e9dedbb6c13a025476b80",
      decimals: 18,
    },
    {
      name: "PINKSALE",
      address: "0x035ad75743e71d69e63c2d1dcf97cd5eec5d455e",
      decimals: 18,
    },
    {
      name: "KUMA",
      address: "0xa8297379769eaedbbb6d32926bcbd3ecea61e417",
      decimals: 18,
    },
    {
      name: "FIRA",
      address: "0x6c91fa9cb3e1cc2bf6cb2447a72d33d663670303",
      decimals: 18,
    },
    {
      name: "TSUKA",
      address: "0x8292d4d783d68c4c395c1e138d6674ad68811347",
      decimals: 9,
    },
    {
      name: "TMT",
      address: "0x940374c9ab2a4d97d5a0a7d1ebd534d32a125eeb",
      decimals: 18,
    },
    {
      name: "CRK",
      address: "0x74f8ad9006e2854c3ca7e6a8879dfa4f8ea667e2",
      decimals: 9,
    },
    {
      name: "QKC",
      address: "0x223fa5d235cd15af84e5c25ad3136b5fa1b6f635",
      decimals: 18,
    },
    {
      name: "DIVER",
      address: "0xd726e731bab979dc437c7abe2473da1892af2cc4",
      decimals: 18,
    },
    {
      name: "JMPT",
      address: "0xcb96cad2f6828a7c2c62444765ca7c2101406022",
      decimals: 18,
    },
    {
      name: "AITN",
      address: "0x82cf7fb91159e44973f401dd5980ec3443b57e47",
      decimals: 18,
    },
    {
      name: "ALICE",
      address: "0x56dedcd24010737b06ce7fcb6c047975ddca9788",
      decimals: 6,
    },
    {
      name: "STG",
      address: "0x9923fb04ac577080d3503fedc48c7e173b88645c",
      decimals: 18,
    },
    {
      name: "DEXSHARE",
      address: "0x26028509fe262a959539c9f345e6219906d1f786",
      decimals: 18,
    },
    {
      name: "TRI",
      address: "0xfcb6b2aaddabf22e56c82194e231013409073ea9",
      decimals: 18,
    },
    {
      name: "Tiger",
      address: "0x34951b5b374c5e45b41460d8cbb9c6769b3c3aff",
      decimals: 18,
    },
    {
      name: "CDS",
      address: "0x183f3e7c30b7aae1db87db61f35142513c378cc4",
      decimals: 18,
    },
    {
      name: "XCAD",
      address: "0x5236be12e10ff6ddcf9c1854c6fe63edd926d980",
      decimals: 18,
    },
    {
      name: "VIDYA",
      address: "0x6dfc0285a90a10134619be137d6b9b85ee037ed2",
      decimals: 18,
    },
    {
      name: "KISHU",
      address: "0xb3fb2c6cba92bc9a3868142810163ea13c6fc620",
      decimals: 9,
    },
    {
      name: "ANT",
      address: "0xf8f582d7d042f4a9b7f9a3f1fab517d54205da32",
      decimals: 18,
    },
    {
      name: "GUILD",
      address: "0x13a994d471036454c9b74f29c6e8dab2a4022a8d",
      decimals: 18,
    },
    {
      name: "LIQD",
      address: "0xd69dab9f9ba89534cecb5def12f89af4f74294e2",
      decimals: 18,
    },
    {
      name: "SAFE",
      address: "0xb83a23a9fd8f2ef8bd3fff733299a159624c5c77",
      decimals: 18,
    },
    {
      name: "ZERO",
      address: "0xb15e2960be8f35635241b00adcadd5e5c3e68732",
      decimals: 18,
    },
    {
      name: "NEWO",
      address: "0x61ad5b5017ce248607634cb2ce5180b55f17aa5e",
      decimals: 18,
    },
    {
      name: "MRST",
      address: "0x76cfe110c0a5d096e1fee423cbb9c2dfb06a2710",
      decimals: 18,
    },
    {
      name: "THOR",
      address: "0xaf9926a4d59d1b46b6d1f84a7a62bce3aa2eb473",
      decimals: 18,
    },
    {
      name: "FILST",
      address: "0x73708767963d67002101fb42f39cbefc35799fa1",
      decimals: 18,
    },
    {
      name: "KFC",
      address: "0x963595c90d3051ce594e2c27718d90df368ceca3",
      decimals: 18,
    },
    {
      name: "KYOKO",
      address: "0x48258e7ad7dc93eb4c042456b4e082f6b2336514",
      decimals: 18,
    },
    {
      name: "BAS",
      address: "0xc6599cccdac4fadec55464ea4592b197572c3ee8",
      decimals: 18,
    },
    {
      name: "ULX",
      address: "0xb9ad20b19b64fa7b6916c98b4cbc118722927eae",
      decimals: 18,
    },
    {
      name: "CHR",
      address: "0x577c2ff6dd57e51d88f6d6912e11deb7992d402c",
      decimals: 6,
    },
    {
      name: "URUS",
      address: "0x570da5d84badd17bf124be8d260abd3a267c71c0",
      decimals: 18,
    },
    {
      name: "BMON",
      address: "0x317e84aa09c96ce664cc94644d377b426538f546",
      decimals: 18,
    },
    {
      name: "DJ15",
      address: "0xa6ebddc266fbb463d51212ed797befeef922a568",
      decimals: 9,
    },
    {
      name: "CHP",
      address: "0x1ba63bd1b31171ef4d289485569094b06921b15a",
      decimals: 18,
    },
    {
      name: "DAR",
      address: "0x8cc5dafaf7a68e35bc6edaac4420e586b9444b85",
      decimals: 6,
    },
    {
      name: "FOLD",
      address: "0x63fcef188f6b931f2a8301bd24f6c1f964b7d870",
      decimals: 18,
    },
    {
      name: "GALEON",
      address: "0xf416f8828b3c8c2efda2d446a586876acd1effb4",
      decimals: 18,
    },
    {
      name: "ROUTE",
      address: "0xaa3aec7aafddbb55827ead750d2f0c2121113458",
      decimals: 18,
    },
    {
      name: "RADAR",
      address: "0x8ec735dc91b5cea66b2abcb32c0944f83f610930",
      decimals: 18,
    },
    {
      name: "ALU",
      address: "0x9149aa72a32750848bcc6b0b570788719ee43607",
      decimals: 18,
    },
    {
      name: "OPT2",
      address: "0xc14b721aef51c40b0d1dd5502b125819e8e1173d",
      decimals: 18,
    },
    {
      name: "PUSH",
      address: "0xebb0c3824df1ccbf96d8ddebf47ebc032359ed25",
      decimals: 18,
    },
    {
      name: "KP3R",
      address: "0x5b30e2058773bbc60f698aac5e8be9188554fa20",
      decimals: 18,
    },
    {
      name: "CORE",
      address: "0x9497bb14882674203ca00060edaa108541de4fac",
      decimals: 18,
    },
    {
      name: "TRIVIA",
      address: "0x534cd7e699a7a8b110d082cdabe310040f890aa5",
      decimals: 3,
    },
    {
      name: "RDNT",
      address: "0x5f50217d0ff882f698b259c5bc972782e56fe2f5",
      decimals: 18,
    },
    {
      name: "WHALE",
      address: "0x4817a2982de869f0c5c1021f921f27e98d2a7755",
      decimals: 4,
    },
    {
      name: "TINC",
      address: "0x982a12a2e18ab26184836578a4b66e9203841c46",
      decimals: 18,
    },
    {
      name: "CHEDDA",
      address: "0x93670b9230e6d759656f70a12ac7c3dcb8db1bd5",
      decimals: 18,
    },
    {
      name: "SHEESHA",
      address: "0x7c45c8749dbf701b76c7af544ddffd3b3a4bad17",
      decimals: 18,
    },
    {
      name: "DOP",
      address: "0x43fe4146cf7dc5bc2f9027f4899500b22e2cac73",
      decimals: 18,
    },
    {
      name: "PEEL",
      address: "0xdf0c3bde76dbc76d57cfdec895ddbc7744c91b89",
      decimals: 18,
    },
    {
      name: "RBN",
      address: "0xd2cbbbb004be1c6da5b0839242497db2f1336746",
      decimals: 18,
    },
    {
      name: "VS",
      address: "0xc2c4f2ff68f3df0b6ab603d5834ddbd8074d3308",
      decimals: 6,
    },
    {
      name: "FAME",
      address: "0x8bc40d4f39e8aaeb4f4d417673117237d6441e22",
      decimals: 18,
    },
    {
      name: "RFOX",
      address: "0x1d6b7dc57fa70ef56d153bfb90c525b7038518b9",
      decimals: 18,
    },
    {
      name: "BATH",
      address: "0xf55a64d3b10385c2ffb7fc00428acafb934df788",
      decimals: 18,
    },
    {
      name: "GIGA",
      address: "0x070dee39f0e06fa2c70ab3094b22105247e7c76b",
      decimals: 9,
    },
    {
      name: "BLOCKS",
      address: "0x1cc5b0147826dbb14f04a7170f37d511d5b3b4c1",
      decimals: 18,
    },
    {
      name: "OLE",
      address: "0x555338576b016d0cd944cc4ad315ed3a1e0ad7b6",
      decimals: 18,
    },
    {
      name: "FIRE",
      address: "0xb9687210d9183a803563346fc8204aba64ef678b",
      decimals: 18,
    },
    {
      name: "SIPHER",
      address: "0xfc139c1756837d13c2e0c9fdb53637d7e389f38a",
      decimals: 18,
    },
    {
      name: "UNISTAKE",
      address: "0x4f36782bd45df439288fc0a1f4a9b96626958509",
      decimals: 18,
    },
    {
      name: "XYZ",
      address: "0x125018c57adb8f0d43072601b594b8ce873cead4",
      decimals: 18,
    },
    {
      name: "SPACEPI",
      address: "0x0aebbe730984038b8c0c62ec50b8c00d6b4b13db",
      decimals: 9,
    },
    {
      name: "CVP",
      address: "0x58a41f01a6022f8d81b178f3096c98ae62b5e16a",
      decimals: 18,
    },
    {
      name: "EXRD",
      address: "0x22436acf9ff9839729414abda17e079df2cc82b9",
      decimals: 18,
    },
    {
      name: "AIR",
      address: "0x1a79979a064248acd75839e32cca27f0cc7af6ee",
      decimals: 18,
    },
    {
      name: "FTE",
      address: "0x9c89163616e4f7d612ea1f7c4b76821ee837cf78",
      decimals: 18,
    },
    {
      name: "SPIN",
      address: "0x55a640b4266e9b319941f7faf3afedf34c581d3b",
      decimals: 18,
    },
    {
      name: "GET",
      address: "0x45eb4c33ad0c7cabeaeab099ecc5c95ab5ae1646",
      decimals: 18,
    },
    {
      name: "SARCO",
      address: "0x1593142534f0abea96e8253724bc5d25c273eaf6",
      decimals: 18,
    },
    {
      name: "BETA",
      address: "0xbf73ff0be8e0f55f16809a721586db00c048f6e0",
      decimals: 18,
    },
    {
      name: "DFI",
      address: "0xfdb82123af79c8cf277c665eebd5b51fc5d449c3",
      decimals: 8,
    },
    {
      name: "GMM",
      address: "0x5e3ffa32fed08c73231128a9466e05c181c24ad4",
      decimals: 18,
    },
    {
      name: "WHITE",
      address: "0xbbd39f8bf4136b0063ff88b4ffdf4b65293791f1",
      decimals: 18,
    },
    {
      name: "MMO",
      address: "0xb142b4e4f587521965df31c30f9c2d3899afb24b",
      decimals: 18,
    },
    {
      name: "GOVI",
      address: "0x9b1f51f1711494a54cea10df2c6316fcf1cc7204",
      decimals: 18,
    },
    {
      name: "SSS",
      address: "0x9e113aa6177a681557b4e8fb8faecf29668039d9",
      decimals: 18,
    },
    {
      name: "RVST",
      address: "0xd177a0943b35ccdd8da7646981a754051e91e249",
      decimals: 18,
    },
    {
      name: "HGHG",
      address: "0x18feb155c4a6e3dd14fd5d95ac3921f64d26b424",
      decimals: 8,
    },
    {
      name: "BIRD",
      address: "0x069273f4f374fac1a390b0fd255fddee791942f4",
      decimals: 18,
    },
    {
      name: "BID",
      address: "0xcc174e0e97ce5b46afb14755e51e10f388efed9e",
      decimals: 18,
    },
    {
      name: "MLT",
      address: "0xc36b54258912fabf4d5a84a3b1d1b4fe9f618dd3",
      decimals: 18,
    },
    {
      name: "BTH",
      address: "0xf58370dfac5b7c91350cbfdb23d1b5533090b26a",
      decimals: 18,
    },
    {
      name: "BOTTO",
      address: "0xf8c2a1b494652d61e37265a7df56683c35f8cb1b",
      decimals: 18,
    },
    {
      name: "ALI",
      address: "0x8ed32b1345c88e364dffd5744214b010e88697b8",
      decimals: 18,
    },
    {
      name: "KEYS",
      address: "0xfdc9f3e5c4f5d98ef64649ab992cf8c0484a9a9c",
      decimals: 9,
    },
    {
      name: "MUSE",
      address: "0x0d2701dbe8eb2ea0396d0a15543fb4df144e4976",
      decimals: 18,
    },
    {
      name: "DEUS",
      address: "0x8aa17466bfb8bac2b9b7cabe11b1603c5ac9d248",
      decimals: 18,
    },
    {
      name: "SALE",
      address: "0x7207ab60ad336979c86e4968faa1d2db077639d8",
      decimals: 18,
    },
    {
      name: "GQ",
      address: "0x6ac888e57ba2a53f1a18e762471d8798f2c5fbe3",
      decimals: 18,
    },
    {
      name: "VPND",
      address: "0x9289862834574e9aae72514cfab465afdc0e4ce3",
      decimals: 18,
    },
    {
      name: "UMBR",
      address: "0x795f6fe39e865544bb160dca8b365b5794044de4",
      decimals: 18,
    },
    {
      name: "HAPPY",
      address: "0x685f78e0144a9b1dc6245814232b36943f9b19b2",
      decimals: 18,
    },
    {
      name: "VEMP",
      address: "0x7fae556964d8cfbcc8623340629c813993ad866e",
      decimals: 18,
    },
    {
      name: "RPG",
      address: "0xfc73984f1b6bd91214fa5c3cfc5e0164de7303af",
      decimals: 18,
    },
    {
      name: "VTX",
      address: "0x5f19e4c66b4a3f2ff5a23d182f1d99b8b41bfef5",
      decimals: 18,
    },
    {
      name: "SMARTCREDIT",
      address: "0x1c4a62afbf60c414c9761223c4eaf944638e1698",
      decimals: 18,
    },
    {
      name: "CHESS",
      address: "0x19e8f45c0fdfa6876e9aab21a7fe88315887d8ec",
      decimals: 18,
    },
    {
      name: "MOBY",
      address: "0x62adb478c72b015ae9114f0d4f267ffdffe3a599",
      decimals: 18,
    },
    {
      name: "RAIN",
      address: "0x1c5faeef36d15a22da8a650550f7090a62b5b9fc",
      decimals: 18,
    },
    {
      name: "OM",
      address: "0xfa105b78da328348d8e275995ab6bc538c77de40",
      decimals: 18,
    },
    {
      name: "K21",
      address: "0x86acf886e7e347637a451bfcd50fc6e7ee5c603e",
      decimals: 18,
    },
    {
      name: "XRX",
      address: "0xff0b917e595faff812839905e3da89eef3674725",
      decimals: 18,
    },
    {
      name: "JADE",
      address: "0xfacd8c95852308cdce7ac645970c54fad7860df5",
      decimals: 9,
    },
    {
      name: "STANDARD",
      address: "0x512f58035e93778edbf95ae9e2d8350a39ae8b99",
      decimals: 18,
    },
    {
      name: "NOIA",
      address: "0x0299a86ac8d8b66cf7162f7e7837ab9ac0589408",
      decimals: 18,
    },
    {
      name: "NBL",
      address: "0x93438af0f1a9ff324ff8b3e1f97e71d3ea630f2d",
      decimals: 18,
    },
    {
      name: "ACT",
      address: "0x63ccc423fa8746cf311b0f7988565032e1dc2fdc",
      decimals: 18,
    },
    {
      name: "STRP",
      address: "0xf1ba4d4d252bbebff30c400be8091a71721f5d47",
      decimals: 18,
    },
    {
      name: "RFUEL",
      address: "0xa68cf28b67d77b2f360237b5152b7f72a8001c8a",
      decimals: 18,
    },
    {
      name: "KEX",
      address: "0xce23475a36a8b61046fe83fcfee7f88c6c28261e",
      decimals: 6,
    },
    {
      name: "EMBR",
      address: "0x39592219846598ad01f48890fcf6b60c739c5e4a",
      decimals: 18,
    },
    {
      name: "MILO",
      address: "0xf5acebcc6af854366ccf85d56977953dadba3cfc",
      decimals: 9,
    },
    {
      name: "MMPRO",
      address: "0xa5f01bfbe144656baca3fc31529f416deb084c55",
      decimals: 18,
    },
    {
      name: "OIL",
      address: "0xa43f325f7205d684b774df881c19fc7721f763e2",
      decimals: 18,
    },
    {
      name: "COT",
      address: "0x285e0c5fdf4ad33648f2dd856e57fa1e1e012c5d",
      decimals: 18,
    },
    {
      name: "MOD",
      address: "0x9d9a37c5018dd4e976b02f8b43074ea4e19950c0",
      decimals: 18,
    },
    {
      name: "DERC",
      address: "0x99251ba19afed363511802a01afca369c5e7221d",
      decimals: 18,
    },
    {
      name: "WKD",
      address: "0xbe9f617b4d75464c7fe84715e28da553e5a4b166",
      decimals: 9,
    },
    {
      name: "CAI",
      address: "0x3091373d51b902d73b264eecdba0ddeeb8fbbea3",
      decimals: 18,
    },
    {
      name: "CLS",
      address: "0xffd03d1d2de871b5645cbdf652fa0ef7d74b391d",
      decimals: 18,
    },
    {
      name: "FTT",
      address: "0x033fe158dd8251278d568610ae86542447c85e3d",
      decimals: 18,
    },
    {
      name: "WNK",
      address: "0xf2937019a356951166ae1f9f81fadf4a651a6cef",
      decimals: 18,
    },
    {
      name: "HDAO",
      address: "0x4c81b3521252c3f08bf52fac936d61ba7ea3b2e9",
      decimals: 18,
    },
    {
      name: "WLD",
      address: "0x4d227bffed45a37be46ee3d4f6863b139a90a90d",
      decimals: 18,
    },
    {
      name: "PARA",
      address: "0x500367d48dbbf977930ef42f63a33555072f062d",
      decimals: 18,
    },
    {
      name: "MGC",
      address: "0x664f104b30e1acdda749c5977c55cddf54c00a0c",
      decimals: 18,
    },
    {
      name: "AQUA",
      address: "0x1deb42bd8b788eb59cad1611070cf125002890a8",
      decimals: 18,
    },
    {
      name: "ETERNAL",
      address: "0xd058db801066f4558124de0495cac340febfdb23",
      decimals: 18,
    },
    {
      name: "YACHTX",
      address: "0xb4c958e388eb599401894f4a7f3ba15a26ef364a",
      decimals: 8,
    },
    {
      name: "BEE",
      address: "0xa94314bfc8bbd3a4275feddd2e2d8a501f74a8d5",
      decimals: 18,
    },
    {
      name: "TVK",
      address: "0x4346bac0bd5a3928efc6d8299c8ac231453056da",
      decimals: 18,
    },
    {
      name: "MINT",
      address: "0xb4b5009a63e309da971973804e5e5bc5576f3a2e",
      decimals: 18,
    },
    {
      name: "INJ",
      address: "0x13c1de354c9aee05808c714ec8346dcac9e30965",
      decimals: 18,
    },
    {
      name: "JINDOGE",
      address: "0x01ff0763876a69df2ed0e1af7025717c333f045b",
      decimals: 18,
    },
    {
      name: "POOLZ",
      address: "0x6ce25c0def47c9cf827b759844cc9e5cea519db5",
      decimals: 18,
    },
    {
      name: "MCT",
      address: "0x08840b6966730d32f01aa5411bc0d8160300ca9d",
      decimals: 18,
    },
    {
      name: "TAD",
      address: "0x7745fc3a397c9aa3c6b88ea9e07ed7d26403539a",
      decimals: 18,
    },
    {
      name: "MDAO",
      address: "0x82f9bb6b5466cdee97fe196242f5613438cc1db7",
      decimals: 18,
    },
    {
      name: "MBH",
      address: "0x8232731fbb5ad84ae0924727313e0ec9ed089b34",
      decimals: 18,
    },
    {
      name: "OCT",
      address: "0xad0ba3e695e83fbeef023a6eb7444636281f56b7",
      decimals: 18,
    },
    {
      name: "QRX",
      address: "0xec97978aca98b1d2add793f964226383126d5062",
      decimals: 18,
    },
    {
      name: "BLID",
      address: "0xa1a566363bd03b64f13f95e328e962e29601fc29",
      decimals: 18,
    },
    {
      name: "VPAD",
      address: "0x1a116cdc558cd7e39056f2c12e868bba7f133721",
      decimals: 18,
    },
    {
      name: "PAN",
      address: "0x4acfb99eb8dd427168150853e5288ccfefc98445",
      decimals: 18,
    },
    {
      name: "Z7",
      address: "0x8987e1a3ae7a53083d3d66ff59c63f5897cab1f4",
      decimals: 18,
    },
    {
      name: "DPR",
      address: "0x6ac8d84608704e3ed160ac9a12e4f4de41515e5b",
      decimals: 18,
    },
    {
      name: "XRT",
      address: "0x5544b9276a85fe30656711235d25e544babe40a5",
      decimals: 9,
    },
    {
      name: "POLAR",
      address: "0xdf8a45058fc5590581caa999d8fc77be97fb6906",
      decimals: 18,
    },
    {
      name: "MCRT",
      address: "0xfb07cada511178053f9b1c73beaadaef6b2e3b20",
      decimals: 9,
    },
    {
      name: "CHARM",
      address: "0x2bd0346c73f4d87b29dd2869eb8e53bad57ddc9b",
      decimals: 18,
    },
    {
      name: "SWAP",
      address: "0xab6882ce5c48825881975946943df4068601d5cc",
      decimals: 18,
    },
    {
      name: "SYLO",
      address: "0x52c75b658c2e60ca93e27b19d23f1cac5cf7ac75",
      decimals: 18,
    },
    {
      name: "ORBS",
      address: "0x8e20bd00ebdbe05976b20a4eb7f8b678d12254f3",
      decimals: 18,
    },
    {
      name: "GYRO",
      address: "0xadf57280dcfddcd9c3d854226eca9e9a169ea205",
      decimals: 9,
    },
    {
      name: "GAMMA",
      address: "0xc95f96c2aeff028eca00a02d04749ee2997f7933",
      decimals: 18,
    },
    {
      name: "UMX",
      address: "0xe5d03b98b1e7bb5f1de16ed083e80463e232a814",
      decimals: 18,
    },
    {
      name: "ZOO",
      address: "0xe58ae211b92047735c7bddebed9cc5a0678a3847",
      decimals: 18,
    },
    {
      name: "BAPE",
      address: "0x1ed76f0dbd19d637bf6bb1570e088640370061d0",
      decimals: 18,
    },
    {
      name: "RAIDER",
      address: "0x55d6ec815941660b4e9cf832aaebbbb72e2860e6",
      decimals: 18,
    },
    {
      name: "SHKOOBY",
      address: "0xfdb3b04242afe518df0d21f9afb765f9af461643",
      decimals: 18,
    },
    {
      name: "NFTB",
      address: "0xa784dceb1edab8408e30fb13fd64a05ac9a14e2c",
      decimals: 18,
    },
    {
      name: "AVG",
      address: "0xade0254f4d30b14051576ca1a4fdea5ecb56464f",
      decimals: 18,
    },
    {
      name: "CAT",
      address: "0x8ac3cc89f430d84040e0f585799fc6238aea7656",
      decimals: 18,
    },
    {
      name: "FUSE",
      address: "0x6339867278a1485a2ddb6f16d4c192fe613cf403",
      decimals: 18,
    },
    {
      name: "STRNGR",
      address: "0x5c4faa93ef7850ecd4a0ae341c3d6455f758e6d4",
      decimals: 18,
    },
    {
      name: "COPI",
      address: "0x4688a0d6ce32c6d1a9bc77ba49391eced061993e",
      decimals: 18,
    },
    {
      name: "IPAD",
      address: "0x543777e468e114323456d42e263759b0068ba3cd",
      decimals: 18,
    },
    {
      name: "BSTN",
      address: "0x293953c434ea4fb014e75cf09c3c71d08a91ff66",
      decimals: 18,
    },
    {
      name: "BEFTM",
      address: "0x5f9b635933109517f2874cd025bad6bf3b4b0d40",
      decimals: 18,
    },
    {
      name: "EOS",
      address: "0x94b0a23f0d1c0dda6cbb986dd72d31ee3cdaecc9",
      decimals: 4,
    },
    {
      name: "AUCTION",
      address: "0x5af54a3e037d25107b27ba86493ec50e643d60b4",
      decimals: 18,
    },
    {
      name: "BTA",
      address: "0xb764b3c851b8b64284d5ccd63822830576cb5889",
      decimals: 9,
    },
    {
      name: "MIX",
      address: "0x8a486107380c578bc3ad647344e6da746117c703",
      decimals: 18,
    },
    {
      name: "BRUSH",
      address: "0x8bfba51ccba12e7c8c8c898c3457961b2a135e39",
      decimals: 18,
    },
    {
      name: "STC",
      address: "0x7bfd0854e160a71bc787e5edad857ca66d38a6e3",
      decimals: 18,
    },
    {
      name: "WLITI",
      address: "0x6eb5d491c9c1e167a2c036d10a48addbc06c3e46",
      decimals: 18,
    },
    {
      name: "STRONG",
      address: "0x81b7a02810bfa276618a91009631f59cf852f435",
      decimals: 18,
    },
    {
      name: "LINKS",
      address: "0x76bcfd5950e89a2aa6d3a584a52df55d940af0b5",
      decimals: 18,
    },
    {
      name: "SGLY",
      address: "0x196abf3740b4af6babf69e158a583f74fdcfc765",
      decimals: 18,
    },
    {
      name: "IQ",
      address: "0x5ec2f860b0203cd59b60211108e0c3839655d341",
      decimals: 18,
    },
    {
      name: "GSWAP",
      address: "0xc91266b005f019ad0c9bab68a84fbab10706c015",
      decimals: 18,
    },
    {
      name: "FEVR",
      address: "0xc1b1198d029aa0fb81c90378a9596ebac7d0a394",
      decimals: 18,
    },
    {
      name: "XRUNE",
      address: "0x6b4c9955935c9a75f179606bcf6a81a65899a11e",
      decimals: 18,
    },
    {
      name: "INUS",
      address: "0xa78d69b0f6e53cea4972a5f499cf466e9a031507",
      decimals: 18,
    },
    {
      name: "LEAD",
      address: "0x01f8162fd69b86709b89d020baabee49804d39ca",
      decimals: 18,
    },
    {
      name: "NTVRK",
      address: "0xb1fd8d5f550d1d37d62040f820d9d87b5275d0df",
      decimals: 18,
    },
    {
      name: "VXL",
      address: "0xfc9726b92e5bea43a62976c489c05ee56c9817f3",
      decimals: 18,
    },
    {
      name: "NFTS",
      address: "0xd6413605cc2360586364ce282e4618011f63f758",
      decimals: 18,
    },
    {
      name: "ATA",
      address: "0x44c01bb6a480b35580dbb6891a14524a66e39f16",
      decimals: 18,
    },
    {
      name: "NUARS",
      address: "0x00955442dfd32f23dcf86dda8071016dc33aca0a",
      decimals: 18,
    },
    {
      name: "LSS",
      address: "0x6f6328defa5d2c98301be888d35c54f1b4ca7dd0",
      decimals: 18,
    },
    {
      name: "QANX",
      address: "0xc5e2f78d926e49428db3732719f42d270ca3f245",
      decimals: 18,
    },
    {
      name: "IMT",
      address: "0x4b15407a1b7c14593b24126f34959f204843500d",
      decimals: 18,
    },
    {
      name: "KIRO",
      address: "0x6c2384415f2f329479ca0472f832310206d0d971",
      decimals: 18,
    },
    {
      name: "WAS",
      address: "0xa86a73b046edb7a5e583ced4072596a9fc1e23cc",
      decimals: 18,
    },
    {
      name: "GRO",
      address: "0xb9a1ca235ffd2c78b7d24cb02d74f19b60e33cda",
      decimals: 18,
    },
    {
      name: "SYNC",
      address: "0x0a468f90616459295f19c96109c07768ba298588",
      decimals: 18,
    },
    {
      name: "BTBS",
      address: "0x46338027c3b984197c54cc648c2812cf2bf99c41",
      decimals: 18,
    },
    {
      name: "STRK",
      address: "0xd3e6f2a30aa1bb9ae600496014a14f8768aabf26",
      decimals: 18,
    },
    {
      name: "PERC",
      address: "0x27ccb16e24a18f557c095cbc508c6f30ac60175a",
      decimals: 18,
    },
    {
      name: "ZINU",
      address: "0x6c81577a812a99182107686809c064f1057d9a6d",
      decimals: 9,
    },
    {
      name: "LAYER",
      address: "0x51cdf95548a79c33cbecd12b0d780fef61c669ed",
      decimals: 18,
    },
    {
      name: "SD",
      address: "0xdd200d2ccd92f25289a717fba6ae05911abfb594",
      decimals: 18,
    },
    {
      name: "GAFI",
      address: "0xf980767c784aef1ea3a6cf1787c98ee9f6c8224d",
      decimals: 18,
    },
    {
      name: "OOE",
      address: "0xba1fe0b2537c3dc5f5a44ba16f74b0b6909cfe7a",
      decimals: 18,
    },
    {
      name: "LORD",
      address: "0x560260d0071f9cb194d374b9e48898465f401c40",
      decimals: 18,
    },
    {
      name: "FARA",
      address: "0xf9222dcffd0e0756ccaaa0403a38a833f696cc7a",
      decimals: 18,
    },
    {
      name: "WWY",
      address: "0x6bcfab2bba1f2038695c0c4c8abac61146a31a8b",
      decimals: 18,
    },
    {
      name: "PLY",
      address: "0xf3da69158318f4f97ed9eba3314d68120622315c",
      decimals: 18,
    },
    {
      name: "KRED",
      address: "0x659eea213b766d5113f43dacd0c76bab5edc8466",
      decimals: 18,
    },
    {
      name: "XAMP",
      address: "0x6b5ecf7bdbd77175fa1aa56edc694acaddc88c12",
      decimals: 9,
    },
    {
      name: "XED",
      address: "0x941c37dfc6e852095fa3338ee86e32b7c6d97ea3",
      decimals: 18,
    },
    {
      name: "RAINI",
      address: "0xdb83714385773cc924f12d914a152e1ba6f0d86d",
      decimals: 18,
    },
    {
      name: "DEFIT",
      address: "0x9f7247028098984311310d21ff06f1f0108c6b80",
      decimals: 18,
    },
    {
      name: "BLANK",
      address: "0x623c721a424ae60cffad68d1c833a9dfed3a7e60",
      decimals: 18,
    },
    {
      name: "POLC",
      address: "0x45aa3e4c1700ecab2a34d41719700ac377cb1003",
      decimals: 18,
    },
    {
      name: "ADAM",
      address: "0xb05083531dfb561133a408d9501b6801970095f7",
      decimals: 8,
    },
    {
      name: "ZOON",
      address: "0x02512a3c70c855fb998eac8a2de2a461c27fbfca",
      decimals: 18,
    },
    {
      name: "CAPS",
      address: "0xa6820db462f05e8c406003231be81313cf219b7c",
      decimals: 18,
    },
    {
      name: "ADX",
      address: "0xe5844e9856a818818e637c9634c2ff2f60286639",
      decimals: 18,
    },
    {
      name: "DKNIGHT",
      address: "0xb8faf5dc4fdb63a9bc838e8a20fb3b8e4f73100c",
      decimals: 18,
    },
    {
      name: "SHIBA",
      address: "0x810f468a3408856ec22060f35a1129adda7932f1",
      decimals: 18,
    },
    {
      name: "MINDS",
      address: "0xd4a0873e50e4e6eab4cabdd569846bf2e425d5f2",
      decimals: 18,
    },
    {
      name: "EHIVE",
      address: "0xe697787610db91d6f9db55fc54139ddefdb576c9",
      decimals: 18,
    },
    {
      name: "AFNTY",
      address: "0x751c2f1c910696641df1c8503a4d26b5d5a37a25",
      decimals: 9,
    },
    {
      name: "TREEB",
      address: "0x83b1efa1b433918e7a50801a9f292205260df92b",
      decimals: 18,
    },
    {
      name: "GEIST",
      address: "0x5a6a7bee769ca070ba856571b836213b478d487c",
      decimals: 18,
    },
    {
      name: "MVS",
      address: "0xa3387e130761f65575d056878b631e208912706e",
      decimals: 18,
    },
    {
      name: "UPUNK",
      address: "0xcf787ac6e1622fc0176615cf122e6146096ee43b",
      decimals: 18,
    },
    {
      name: "Ari10",
      address: "0x69772296028be925a12f366875bb7a5b4c7e88f5",
      decimals: 18,
    },
    {
      name: "NMX",
      address: "0xac543b771e319de73dc134dbf22c021dba57581b",
      decimals: 18,
    },
    {
      name: "XTM",
      address: "0x48feca7a469d277745d0ebae3f85b7a62e5d488f",
      decimals: 18,
    },
    {
      name: "ALD",
      address: "0x2df3cdee962a87a873abba9f3c9097bd427fd29c",
      decimals: 18,
    },
    {
      name: "CGG",
      address: "0x6ecef6a0f0f9ab7bcc34c0cc6a57f3c3ed050480",
      decimals: 18,
    },
    {
      name: "UOS",
      address: "0xc79f02385959275113f6af775a5a4077057365d9",
      decimals: 4,
    },
    {
      name: "FX",
      address: "0x563492403083ea022c2c5bcf0cb14dd0f21629b7",
      decimals: 18,
    },
    {
      name: "WIN",
      address: "0xf4f88df222be7db971625e7500b9d63092865ba5",
      decimals: 18,
    },
    {
      name: "KEEP",
      address: "0x685acab37d2a3e76415a7ad360d2ea5c3eaf241a",
      decimals: 18,
    },
    {
      name: "ONG",
      address: "0x9307358ccb102b9c78970012798ea08eb5dbb1b9",
      decimals: 9,
    },
    {
      name: "RSR",
      address: "0x13fb900c270b195579de906a09954c0b58e91e80",
      decimals: 18,
    },
    {
      name: "REEF",
      address: "0x816f775e25a03daec2073553ad83597cc2734c4e",
      decimals: 18,
    },
    {
      name: "FLOW",
      address: "0xf513dbe2fde0cb9c3bb974614984ca0c1e4f6f88",
      decimals: 18,
    },
    {
      name: "C98",
      address: "0xad1cd034c3da29a8c303e02680f77ba331ef8732",
      decimals: 18,
    },
    {
      name: "XTZ",
      address: "0x957b49d8e1594efe0e933294d4cc264a3244b7a2",
      decimals: 18,
    },
    {
      name: "UNFI",
      address: "0xfc7868395a5d4198c6f7f351a656feb0b26a53f2",
      decimals: 18,
    },
    {
      name: "LUXY",
      address: "0xed88260ed24970a1178f3c2ef60a81c03bf79a3b",
      decimals: 18,
    },
    {
      name: "MXC",
      address: "0x3ed59486c10aaa4e4fa20fe070c6a1e2163d4615",
      decimals: 18,
    },
    {
      name: "CRU",
      address: "0x62b3d96a9ae543b263b55bed3e1dafc2a41425a2",
      decimals: 18,
    },
    {
      name: "MNSTRS",
      address: "0x73f08440a9f2bb5a2245da41382ef8a2b54f6263",
      decimals: 18,
    },
    {
      name: "RBC",
      address: "0xa1058cc19b6ff157406e119d98e4bb102e937563",
      decimals: 18,
    },
    {
      name: "ASTRAFER",
      address: "0xca86d700c89c947a80bcddca4cfbaeb603472a59",
      decimals: 18,
    },
    {
      name: "SHIRYO",
      address: "0x5afad834c99391ef298ace14f837b1b8caff4fe9",
      decimals: 9,
    },
    {
      name: "SEA",
      address: "0x4713e4db4df82ed9d489d019dd87009241ea6999",
      decimals: 18,
    },
    {
      name: "FSW",
      address: "0x57954e888c370014532a5723b66d62dc22e6865c",
      decimals: 18,
    },
    {
      name: "GOG",
      address: "0x2500502fb698d83884a2df7250b50262bee6ab14",
      decimals: 18,
    },
    {
      name: "QMALL",
      address: "0x4ec980799688323984dc83eb37db1897f5aa47bc",
      decimals: 18,
    },
    {
      name: "LINU",
      address: "0x142c0f11fcf52dd939999316240aa4c61c94642d",
      decimals: 18,
    },
    {
      name: "MSHEESHA",
      address: "0xab9b10947eccddba96336f6e23c2c205720caa38",
      decimals: 18,
    },
    {
      name: "OPUL",
      address: "0xa6cd41d72dbbfc1e9d6e3d56595ae28b21cd9638",
      decimals: 18,
    },
    {
      name: "THG",
      address: "0x189304e8f00bdc49c05386bcc9858f3ad655986a",
      decimals: 18,
    },
    {
      name: "DFYN",
      address: "0xf9a997e5abe98012785615115aa5038cbe737cd6",
      decimals: 18,
    },
    {
      name: "RCH",
      address: "0x875baae85b3921e12533d79a521a749139f66035",
      decimals: 9,
    },
    {
      name: "BDT",
      address: "0xed87806e0cc456819c569104cbe510f2e336041f",
      decimals: 18,
    },
    {
      name: "HTB",
      address: "0x413cbe4caaab17352976ca61722d729a1b4f39ac",
      decimals: 18,
    },
    {
      name: "XETA",
      address: "0xe94ccf149567dcdc789acce4580b229edc5f2d9a",
      decimals: 18,
    },
    {
      name: "MUSK",
      address: "0xcc1a3807a400f2374898ef062eee73a2beaa825a",
      decimals: 18,
    },
    {
      name: "MV",
      address: "0x725ae9c9d467220904cbb51e29f4238e7c9cdc8b",
      decimals: 18,
    },
    {
      name: "VEGA",
      address: "0x5182c42520655b559fad2862d667e6d85314ff2f",
      decimals: 18,
    },
    {
      name: "XIO",
      address: "0x04ce5b5e918ec5d2d7bd559b1e5a36f341f1b6ac",
      decimals: 18,
    },
    {
      name: "FNT",
      address: "0xd37275f3742427c85f09b94b5edfe0b43977b1c8",
      decimals: 6,
    },
    {
      name: "AIOZ",
      address: "0x30f084c70ec14a60733483fbb29c7323a878166b",
      decimals: 18,
    },
    {
      name: "SKEY",
      address: "0x680c55f308d6d07b676ff3268f4e570aaf7c35af",
      decimals: 8,
    },
    {
      name: "TAG",
      address: "0xfe56e11fd7389c48fa56a7def512c6a5702b6a3b",
      decimals: 18,
    },
    {
      name: "HAI",
      address: "0x55e7f4d14fbf1546c67304485867af4cb4444840",
      decimals: 8,
    },
    {
      name: "DESU",
      address: "0xe90ff0d6e331194491f714036b9e83f75ea799f7",
      decimals: 18,
    },
    {
      name: "FABRIC",
      address: "0xc7871db928b5a37328ee1afbaed3da85311bc35f",
      decimals: 18,
    },
    {
      name: "DORA",
      address: "0xbd8b3b6a7be12413ba7dd2c44df42b9c719655d3",
      decimals: 18,
    },
    {
      name: "TLM",
      address: "0xc1e20289f0f007abb2f68bbd14737e84c72f2fff",
      decimals: 4,
    },
    {
      name: "BAND",
      address: "0xacf0e45dc23aff8d97d63902e2d73d4537778ee5",
      decimals: 18,
    },
    {
      name: "XFT",
      address: "0x8b2714f0d26358f976199cc6ac7e42688465af59",
      decimals: 18,
    },
    {
      name: "QUICK",
      address: "0x573fab45c0b1fb4aad150ed7e0d78d630f4c190f",
      decimals: 18,
    },
    {
      name: "COLLAR",
      address: "0x75f309da42ec85533ed715770e02a2775609a625",
      decimals: 18,
    },
    {
      name: "HXRO",
      address: "0xdf12ef38e8f3e06c4c66fa4362c0f0bfd37adad9",
      decimals: 18,
    },
    {
      name: "SYNR",
      address: "0xd6071119fa89b21694946f2da2c73fdd2980a465",
      decimals: 18,
    },
    {
      name: "RVF",
      address: "0xcba3517241ef5e8fc9466af889f552e9b8f039bd",
      decimals: 18,
    },
    {
      name: "YETI",
      address: "0xd36e97e065782c31b35403a5b0d6da7019c2ec6b",
      decimals: 18,
    },
    {
      name: "STILT",
      address: "0x2f36998ee56df87a1673cd1cdd64e075cec4e85b",
      decimals: 9,
    },
    {
      name: "AOG",
      address: "0x79b34bf00cff92d62ce9f8429e7ce79c203674c8",
      decimals: 18,
    },
    {
      name: "ACH",
      address: "0xca893413763348cde0766eb2d274ef25c576dd61",
      decimals: 8,
    },
    {
      name: "ARC",
      address: "0xd99f99a4cf6d638f20bf574ebf3c8e4d2247d4ad",
      decimals: 18,
    },
    {
      name: "SIL",
      address: "0xa481368cd5791bcf8689017fad9fd8b72f1e82a7",
      decimals: 18,
    },
    {
      name: "NITRO",
      address: "0xc157aff2c082f55cc97f498a65ae43a705a1f5b5",
      decimals: 18,
    },
    {
      name: "ATR",
      address: "0x6ad6ddb34e1966cfe6c09f2cd7138e7befaa123d",
      decimals: 9,
    },
    {
      name: "CLCT",
      address: "0xea35426639373e3e670014f22e2bb002f1ab4343",
      decimals: 18,
    },
    {
      name: "EPAN",
      address: "0x57eef920dff7e262786823ae9f2f00e2fba73524",
      decimals: 18,
    },
    {
      name: "DXCT",
      address: "0xfae4da31675c2bf9e158f6e861cd50f36c8b02cb",
      decimals: 18,
    },
    {
      name: "ZEE",
      address: "0x5b5be93bf773bdecd64e9781974f6bd6ce6c0236",
      decimals: 18,
    },
    {
      name: "HDRN",
      address: "0xd82f64093467954d313f0c16292e4f0907cc69f5",
      decimals: 9,
    },
    {
      name: "ZIL",
      address: "0x659b2c89e399614dfd5775265004c0cfd0bd6450",
      decimals: 12,
    },
    {
      name: "TEM",
      address: "0xb109416bbf198cda33d93b943172b959431d93be",
      decimals: 9,
    },
    {
      name: "RDR",
      address: "0x8304531ae02826c454251dbcaf5f4b5fd3f4c6e5",
      decimals: 18,
    },
    {
      name: "GLCH",
      address: "0xd18a9d624f225b6b7cd0da1d5c5b1f7d5da28e25",
      decimals: 18,
    },
    {
      name: "YON",
      address: "0x5840dd67b9c869ac81c052ff8e4a0cfd4d194662",
      decimals: 18,
    },
    {
      name: "SHI",
      address: "0x553bf66c6966e78eea92f820457922b04296d056",
      decimals: 18,
    },
    {
      name: "VIM",
      address: "0xfee24f91f443992ff6354d00b39cd5e75f686190",
      decimals: 18,
    },
    {
      name: "ORAI",
      address: "0x9ffb82db8e544ed2e851b83866b166fe4a91b0a0",
      decimals: 18,
    },
    {
      name: "MEGALAND",
      address: "0x6a3becf3422a98cfc878a905b3bd7d3a8d6029f4",
      decimals: 18,
    },
    {
      name: "CTK",
      address: "0xa5ca2a0c20dbd13529fe4f09d4504e08ebf43e2a",
      decimals: 6,
    },
    {
      name: "TEL",
      address: "0x65cb995e0cf9020d415173b36e86722440126438",
      decimals: 2,
    },
    {
      name: "BLP",
      address: "0x5319869bb07ba169ac83a9d5aabd6ae56e4b897d",
      decimals: 18,
    },
    {
      name: "DHD",
      address: "0xbf7634bd465526e0ead7b25c46dd0db8a309fcce",
      decimals: 18,
    },
    {
      name: "ADS",
      address: "0x5ee2433645bcfb26826a006cb9c8c127f0db4a92",
      decimals: 11,
    },
    {
      name: "DARK",
      address: "0x371e09af7b7be597256d65680b3abcf0719ed000",
      decimals: 8,
    },
    {
      name: "CHRP",
      address: "0x5b48b5bc0c3fbe22d0a73e443115181bc28ddf96",
      decimals: 18,
    },
    {
      name: "SDT",
      address: "0xc34a1d480bd8982c787e669d7fc88b77a07188d2",
      decimals: 18,
    },
    {
      name: "NFTL",
      address: "0xe0186c3b4c5af1b19cecd504cefc20d2ae64c605",
      decimals: 18,
    },
    {
      name: "AZY",
      address: "0x1f491dcb525f1ad2d51a2eb55f2c76a4ccca40cb",
      decimals: 18,
    },
    {
      name: "CQT",
      address: "0x6f80e6d2a80cfc7ebc9c52a111c622ec7bed55cd",
      decimals: 18,
    },
    {
      name: "NGL",
      address: "0x27cc2cfd0907839b22485ac57e57b878b3c3ee33",
      decimals: 18,
    },
    {
      name: "APRIL",
      address: "0x75651961c25539a319981159f22ccb4097a4ff33",
      decimals: 18,
    },
    {
      name: "SOLACE",
      address: "0xfd70d9222f822a7df95c305427e0e0a8ad33e9d7",
      decimals: 18,
    },
    {
      name: "CLIMB",
      address: "0x310517b069783c55d71615cdbbeeed8f57754ba8",
      decimals: 8,
    },
    {
      name: "IMO",
      address: "0xae8a10f2b381955ed7fca786a9db8f08b8e2ae51",
      decimals: 18,
    },
    {
      name: "BCDT",
      address: "0xda3ba34a20bd115969b003b634c567b91ba070df",
      decimals: 18,
    },
    {
      name: "PMON",
      address: "0x9dcb7aec00c16cd99a99607fa15595f0080647eb",
      decimals: 18,
    },
    {
      name: "CPO",
      address: "0x6cd3804d9b3b4a3d8c145f859469f1a19947cd06",
      decimals: 18,
    },
    {
      name: "NOW",
      address: "0x9dab7cb1ae160ac148b5cbce42361fa9cdcdc493",
      decimals: 8,
    },
    {
      name: "KTLYO",
      address: "0x26006b0f37466656c1b76afc28b08880823d056f",
      decimals: 18,
    },
    {
      name: "CRX",
      address: "0x1fd5e003b8c74f27536fabf215712fa80fa20b24",
      decimals: 18,
    },
    {
      name: "SHELL",
      address: "0x170c0e9434b8ddb308bc01c9a9c71dee71ce5822",
      decimals: 18,
    },
    {
      name: "HUB",
      address: "0x647b1974d33b70fd05892aafea2aa07bfbed1066",
      decimals: 18,
    },
    {
      name: "MSU",
      address: "0xb76c1dc10a1ba9b8b981b83804300ffe5c4ac896",
      decimals: 18,
    },
    {
      name: "NNT",
      address: "0xa8de82ecf76e90adc744267e5d89f1da8a0088e0",
      decimals: 18,
    },
    {
      name: "OPTCM",
      address: "0xaf122e4413694d7295d26f9c23aa30e9bdd3d078",
      decimals: 18,
    },
    {
      name: "NFT11",
      address: "0x57d640a86f1a401843a957e080ea8930919f004b",
      decimals: 18,
    },
    {
      name: "RETA",
      address: "0xe4762d8789924915f7aa85c1238cebd9dd11d717",
      decimals: 18,
    },
    {
      name: "BULL",
      address: "0xddfcdbb35a1c46cada3793324c72a761864baf54",
      decimals: 18,
    },
    {
      name: "MYC",
      address: "0x039d28127450c50cd560cbd64771e59efa3167fc",
      decimals: 18,
    },
    {
      name: "LENDA",
      address: "0x715d841fac55b36edf143fad589990b79d020a50",
      decimals: 18,
    },
    {
      name: "TITA",
      address: "0x183a0825ee55666a4e0590eea2f15f9cc60abd3b",
      decimals: 18,
    },
    {
      name: "GMEE",
      address: "0x1ced28649735af7b7f1c2d0adbb1b698c4e279a8",
      decimals: 18,
    },
    {
      name: "CHI",
      address: "0xe06ad1c8efad107a241f22f17d3a749549d9c34b",
      decimals: 18,
    },
    {
      name: "CFi",
      address: "0xa64d2cecd75a6a7a3ee4e75a968d889549cd82ee",
      decimals: 18,
    },
    {
      name: "BETU",
      address: "0x64e17a46dd16a396fcf10d82d7a4d6e208154da6",
      decimals: 18,
    },
    {
      name: "NINKY",
      address: "0x81aaa42d7b5d7171af312068c997d6e14ecb9260",
      decimals: 18,
    },
    {
      name: "GEAR",
      address: "0xcff04e0b0353c6dc3bd45a8efdfe263710d3eeb6",
      decimals: 18,
    },
    {
      name: "XGEM",
      address: "0x9fad7dfabdea368500952de203ae2f937b81adc4",
      decimals: 18,
    },
    {
      name: "1FLR",
      address: "0x18d6472a79448f33cc0ff81a77f0e8b00344ec3c",
      decimals: 18,
    },
    {
      name: "CELL",
      address: "0x857899c766ea2e144c4d2633e876cdc0a2c05ef4",
      decimals: 18,
    },
    {
      name: "MAP",
      address: "0x301fd4bdeebc9c3712ee873037885bedcbd19d67",
      decimals: 18,
    },
    {
      name: "$MAID",
      address: "0x521f79ca7db1243d22653ac78dfb81d98ca629d7",
      decimals: 18,
    },
    {
      name: "ROOM",
      address: "0x33e084830655dd95f1fc30e095bafd99d827b54d",
      decimals: 18,
    },
    {
      name: "REVO",
      address: "0x88f0bae60a2fb7813da3517cb863162dd83dbba1",
      decimals: 18,
    },
    {
      name: "CUDOS",
      address: "0x85419d73aeba80a9c20399f33dd557cc129e4e3c",
      decimals: 18,
    },
    {
      name: "LOOT",
      address: "0x8084f5359b30475a64eaf7e9838402145ec4e32b",
      decimals: 18,
    },
    {
      name: "UMB",
      address: "0xda3c783f7a7137deaf3a9bdd55bc8fdd2d0a9bcd",
      decimals: 18,
    },
    {
      name: "RVC",
      address: "0x74a5d2ef1ddf22a239d4bb39944191273e4ad86e",
      decimals: 18,
    },
    {
      name: "NAFT",
      address: "0xdecb5094fecb9053178dc7bc82a575f74edd3746",
      decimals: 18,
    },
    {
      name: "A4",
      address: "0xc9abf2268f4f4c4f459e9a500b9e4ec228aa5a3b",
      decimals: 6,
    },
    {
      name: "WANA",
      address: "0xb9c09eaf8b291a83f2e07e85e170d4e88a924030",
      decimals: 18,
    },
    {
      name: "SPOLAR",
      address: "0x43ae7649d172fd50e69be0a330fc69c173e5571f",
      decimals: 18,
    },
    {
      name: "BP",
      address: "0x8f3b9e01decc384f9610e7f4bf4f1f68de5cbb5e",
      decimals: 18,
    },
    {
      name: "ELMON",
      address: "0x7f80fb87b99ad73d19ae963d33f3482ab46cfd73",
      decimals: 18,
    },
    {
      name: "EPIK",
      address: "0xa090e7d8bc34d545f2b744894b2aa7d6205b9b28",
      decimals: 18,
    },
    {
      name: "GGG",
      address: "0x4957d357ca2da632bea79e73a5744665634ee99f",
      decimals: 18,
    },
    {
      name: "FND",
      address: "0xb2282e72ff2de51d4013a27e284013988ac0678f",
      decimals: 18,
    },
    {
      name: "LIF3",
      address: "0xd1413df6603eb6e8926ee145fcdf2c44eef6ef47",
      decimals: 18,
    },
    {
      name: "CUMINU",
      address: "0xe0f621ec9618e31ba0a57635f709e0e675897466",
      decimals: 18,
    },
    {
      name: "CRUX",
      address: "0xa78b5b5285dd7cabb24aac191625f0fa7ceb4387",
      decimals: 18,
    },
    {
      name: "ROBO",
      address: "0xf691d25cf52ff44dc6d8cf0ef312519dd17e10c4",
      decimals: 18,
    },
    {
      name: "1ART",
      address: "0xe3ad82a6577de5de4c5741e3edda3c679d123e54",
      decimals: 18,
    },
    {
      name: "TRVL",
      address: "0xc9057c89e2bff2ec41f59698ead83f44c7076c2c",
      decimals: 18,
    },
    {
      name: "KLING",
      address: "0x2dbe5203bca42ce078cef332ea752911e6f325c0",
      decimals: 18,
    },
    {
      name: "XDOGE",
      address: "0xa9a9c845a4dbab0385fdd9b2ca03278e7cef9d1c",
      decimals: 18,
    },
    {
      name: "VINU",
      address: "0xd6bf2f771c5e6f36c2ae3db878b198afbead9696",
      decimals: 18,
    },
    {
      name: "UNCL",
      address: "0xea73e2079bd596c867b1c312f07e45ea297d0984",
      decimals: 18,
    },
    {
      name: "SWISS",
      address: "0xcc36e066bc8685c6fc7b85de73b27e249772c20c",
      decimals: 18,
    },
    {
      name: "CPD",
      address: "0x9cdb7f083dd45656d5aa97bb0eb9d75dba429614",
      decimals: 18,
    },
    {
      name: "AIRI",
      address: "0xb59d9e27dcf9c5cc6bbd00eb1d44df9dbabc2db0",
      decimals: 18,
    },
    {
      name: "PIZZA",
      address: "0x17eba9eb86f835cb791e4843b598bb651a3a7e75",
      decimals: 18,
    },
    {
      name: "MOOV",
      address: "0xdde2a23524fdc23da906aa89a6f022ad8db867a5",
      decimals: 18,
    },
    {
      name: "JELLY",
      address: "0xec00b32626a20ea704d1c1ce6af03e1df0109c70",
      decimals: 18,
    },
    {
      name: "GDT",
      address: "0xd7a60325d08d720597928ac409a2017b443ea00e",
      decimals: 8,
    },
    {
      name: "EDDA",
      address: "0x3deb05626520d93a4b009d7ef3d62d61e57e2d5b",
      decimals: 18,
    },
    {
      name: "KAI",
      address: "0x5aad41df3e86edaa8b2684ecfdb33d1f2ea85a44",
      decimals: 18,
    },
    {
      name: "PRL",
      address: "0xc4f6e4db37ada8db08901568c4ae71f3e69136bb",
      decimals: 18,
    },
    {
      name: "ZDC",
      address: "0x96adb79afee9d8cf7517970bbe972413561f85b2",
      decimals: 18,
    },
    {
      name: "DEXM",
      address: "0xafd68623ad979987a42fca672e761b998aff5af0",
      decimals: 18,
    },
    {
      name: "RBP",
      address: "0x1a9015c69af4d3669e80e4a36558a0f249a46aa1",
      decimals: 18,
    },
    {
      name: "XMT",
      address: "0xfe54f0e3fbaf7a40226271935fd99e3fdd485583",
      decimals: 18,
    },
    {
      name: "MVI",
      address: "0xed33d978e89a44fd3c52a646143dbc520b42d623",
      decimals: 18,
    },
    {
      name: "IUX",
      address: "0xf5e1378cd653380c312201cac3fab18b388577fa",
      decimals: 18,
    },
    {
      name: "PROM",
      address: "0x3011adb1eadea2922b627f58dd6cc89ca1d81b57",
      decimals: 18,
    },
    {
      name: "ARMOR",
      address: "0xae121a8a5130f4ed8d053b9885cb7784b0f08bd5",
      decimals: 18,
    },
    {
      name: "ZOA",
      address: "0xeded4865a47dd2162940b95740c5cc9ca0561ece",
      decimals: 18,
    },
    {
      name: "CREO",
      address: "0x9aa83eb639898f7159a86451f0671362c8972f74",
      decimals: 18,
    },
    {
      name: "CYC",
      address: "0x31e8ec41442598323b4d4c966db8c0ee8318b243",
      decimals: 18,
    },
    {
      name: "DIONE",
      address: "0x4ef1b67ff738b917deb1b03955a44b075a7d84e1",
      decimals: 9,
    },
    {
      name: "BEL",
      address: "0x0854220ab5abd07069fabb51398a6690683cabd1",
      decimals: 18,
    },
    {
      name: "MSTR",
      address: "0x6f881ae8a96259bbe27f425462b31911509b0244",
      decimals: 18,
    },
    {
      name: "ETNA",
      address: "0x7c6048954bb6012b57a1e1900f69b5e1e8a59607",
      decimals: 18,
    },
    {
      name: "LOCK",
      address: "0xaf347ff8ddb0275b430b3c5091286b89c587ad0d",
      decimals: 9,
    },
    {
      name: "QNT",
      address: "0x7fc994f4dbe240d6a1e2f80b43b6a233c58edac4",
      decimals: 18,
    },
    {
      name: "WAL",
      address: "0x10e301a88af21003e88c0a5279f62a4a890c32c7",
      decimals: 18,
    },
    {
      name: "RAZOR",
      address: "0x917924fbbee9f84df85e3be3ac56cbf1f3b6ad08",
      decimals: 18,
    },
    {
      name: "NEBO",
      address: "0xf175cf96d0f40454c7b41374501a2531b5a88ef5",
      decimals: 18,
    },
    {
      name: "REVV",
      address: "0xa22670894f82f24639967cde2f304b7475a3b20e",
      decimals: 18,
    },
    {
      name: "MASQ",
      address: "0x5227bd35aaaf84cf2e890e9d85d690cce4159cac",
      decimals: 18,
    },
    {
      name: "STOS",
      address: "0xa011b8934eb17db254fa8d88a52dc32f56a8f511",
      decimals: 18,
    },
    {
      name: "FORS",
      address: "0x0c85c0b4b0e53518ea9b3f89087cab260a1592f2",
      decimals: 18,
    },
    {
      name: "LAUNCH",
      address: "0xebb9b35f2ff4cffd01a7b848d57c72473c36c421",
      decimals: 18,
    },
    {
      name: "LOOKS",
      address: "0xcd6d14abc974b6bfbc58b4097b072ef1230ab466",
      decimals: 18,
    },
    {
      name: "MILIT",
      address: "0x983682ebadb1d81d2b8a6edd5bb08f581885ada1",
      decimals: 18,
    },
    {
      name: "STACK",
      address: "0x154ec3dd72fbfe678a3190c206bd15c00bd52480",
      decimals: 18,
    },
    {
      name: "COP",
      address: "0x0a4887c6684e1cf0128a9bd77846a201ed8e7864",
      decimals: 18,
    },
    {
      name: "SDL",
      address: "0x46d3cfdf36efe62c28bfe4a2c8ec7a1cf3090ee0",
      decimals: 18,
    },
    {
      name: "NAOS",
      address: "0x07ef10421ba07bb95c056d43bbaf1779ac03b4c3",
      decimals: 18,
    },
    {
      name: "DPET",
      address: "0xf15bc630da54126076edca1170d6193cef295d0b",
      decimals: 18,
    },
    {
      name: "NEWB",
      address: "0xd6add8ce1a9d06eb96e3f01e3a17e15c5567bc82",
      decimals: 18,
    },
    {
      name: "SLD",
      address: "0x8daed8c3556d44b29e0b90f0e918c5a8217186a8",
      decimals: 18,
    },
    {
      name: "SWAPZ",
      address: "0xa3d60e088f280451193a583b69f7b0f2b9d3b066",
      decimals: 18,
    },
    {
      name: "XEND",
      address: "0xb9c5d64a44d8f28897245ae7e0f66023872befad",
      decimals: 18,
    },
    {
      name: "ECD",
      address: "0xc779c69a571a8c3fc8301d8ad775b671d4fd0d7d",
      decimals: 18,
    },
    {
      name: "SSG",
      address: "0x40f7e29f5a766c95d4e83e117c9ecce4da584869",
      decimals: 18,
    },
    {
      name: "PHL",
      address: "0xf8a50c3533402224cc98707ec9a4eec37961bcb9",
      decimals: 18,
    },
    {
      name: "PLA",
      address: "0x50dfe8a6d51ff190102d4456542f7e64942d0441",
      decimals: 18,
    },
    {
      name: "CBT",
      address: "0x7312d58a8f4d754d1d0154bbafb0e9d1a4089d71",
      decimals: 18,
    },
    {
      name: "DRCT",
      address: "0x8c1e08c739a79949074fd4312d959faad86fdb0a",
      decimals: 18,
    },
    {
      name: "HZN",
      address: "0xd682a2841a4503498579d61d7adc61b3505cb018",
      decimals: 18,
    },
    {
      name: "MERKLE",
      address: "0x1222f77c5c453ca6502efbf7a676e11fbf88c6e5",
      decimals: 18,
    },
    {
      name: "LYXe",
      address: "0xa32d3b6632d866b328926c53a7188deeb26b0fd1",
      decimals: 18,
    },
    {
      name: "HE",
      address: "0x926893d1c32e4b360fc5dc8e25eb1afbc25ddcdf",
      decimals: 18,
    },
    {
      name: "SANI",
      address: "0xb42ae72328098b3563c9f3a71e08ecb45efe09d3",
      decimals: 18,
    },
    {
      name: "AGS",
      address: "0xcb10ae812328f0e1f2c13e61ae22bd8dc3a9d45c",
      decimals: 18,
    },
    {
      name: "DERI",
      address: "0x888aba761b8d9905b62f1b2e30b6b50b5a745662",
      decimals: 18,
    },
    {
      name: "METAL",
      address: "0x6507decdb45b8a36e19abe3af5a71da4e0d1b666",
      decimals: 18,
    },
    {
      name: "BUFFS",
      address: "0x46f6b04e6c4bd31cc2ef53b55e9460994604f461",
      decimals: 4,
    },
    {
      name: "ASTAR",
      address: "0x2acdfb6e8d739eb85a6d98fe633c6132580b25c7",
      decimals: 18,
    },
    {
      name: "LIQR",
      address: "0x050f81f55bb9e42be17249e1fba41da373b201c3",
      decimals: 18,
    },
    {
      name: "THC",
      address: "0xc43958a59afbe3d255377b9fe4012d9c374d6b69",
      decimals: 18,
    },
    {
      name: "TKX",
      address: "0x0463b5d3a6dbdfbe069f6329b577d239a152df56",
      decimals: 8,
    },
    {
      name: "FROYO",
      address: "0x14582bfb40dc88727bd3b63a97e6aa88b5daae50",
      decimals: 18,
    },
    {
      name: "ARPA",
      address: "0x0898e2e872f7f402ae53f89504b5060916e39b1b",
      decimals: 18,
    },
    {
      name: "YEL",
      address: "0xc83fecec5862874e312254536ba1ee538f901fe0",
      decimals: 18,
    },
    {
      name: "HOTCROSS",
      address: "0x3fc306dfcb7777af0b0d14a3939c4bb8f4b214db",
      decimals: 18,
    },
    {
      name: "SWAG",
      address: "0xbe7b6c65b28e267430ca1586514a14932d3747f1",
      decimals: 18,
    },
    {
      name: "FINE",
      address: "0xe2b178ebb489ab920443923299f821ff02668207",
      decimals: 18,
    },
    {
      name: "VERSE",
      address: "0x5c4fa3d7435f64b943a31698f43aea2d3934cdc7",
      decimals: 18,
    },
    {
      name: "TON",
      address: "0xa463cc6240411c3360e0fc8f705e137f51485cc5",
      decimals: 9,
    },
    {
      name: "SIN",
      address: "0xb9cb8a75c77a004400dc33dbc1c07a432a156deb",
      decimals: 18,
    },
    {
      name: "KXA",
      address: "0xb7b91b7229d138a83653c30edc39c7cbdd00286f",
      decimals: 18,
    },
    {
      name: "DDD",
      address: "0xcdfc635d09f8873e02d1740cc4ada5825186ee51",
      decimals: 18,
    },
    {
      name: "YFIM",
      address: "0x11e25318712db2ff2454599ed5f6397a55ce021c",
      decimals: 18,
    },
    {
      name: "PUSSY",
      address: "0xa718e6fc1c3b8414b39d7e6b5a7c12e7ce6b6e73",
      decimals: 18,
    },
    {
      name: "BBT",
      address: "0x995039333cc383531e52fc1689b27adba75ab153",
      decimals: 8,
    },
    {
      name: "POO",
      address: "0xd1a73c2d5ad00754a4849d8b45752f4d391757b0",
      decimals: 18,
    },
    {
      name: "SON",
      address: "0x88b19c713c1890ec7c276c8e8b3554a9eda62a5d",
      decimals: 18,
    },
    {
      name: "MARS4",
      address: "0x87d8198185fe8dd6705fcfc8409e17980633b7bf",
      decimals: 18,
    },
    {
      name: "BLK",
      address: "0x1fce4235102b6bc60e09e5739711af70272abfc7",
      decimals: 18,
    },
    {
      name: "LIFE",
      address: "0xdd8aabdb52cc85e9ef0e7f537824a225a2ce06ae",
      decimals: 18,
    },
    {
      name: "SEEN",
      address: "0x968f92ff5a2e0db512763a2094689bd894619f25",
      decimals: 18,
    },
    {
      name: "NFTY",
      address: "0x66ef7e2b2922e8f3bea394b9d323aea6363f1e20",
      decimals: 18,
    },
    {
      name: "TAP",
      address: "0x612268ba90e90c847a5bc7bb09626c74de485ff7",
      decimals: 18,
    },
    {
      name: "CBD",
      address: "0xa671bbaeec2d27ec1788be93379241cac1d5a068",
      decimals: 18,
    },
    {
      name: "UNIC",
      address: "0x8a7856dcbdbe18fe7722d9f62cf7d426b09bab48",
      decimals: 18,
    },
    {
      name: "RDT",
      address: "0x1aa69c16d873ecf68585b58c32d6e28f96dcafc1",
      decimals: 18,
    },
    {
      name: "MOONED",
      address: "0xd436ab75b18be7ff00e00817f0a8dc76b741a1a7",
      decimals: 18,
    },
    {
      name: "PLOT",
      address: "0xc7b256173ccc38aed46e74e35b2aa3ea69d96e0a",
      decimals: 18,
    },
    {
      name: "GYSR",
      address: "0x2e5e5c88c5d4b0721d6477a187f197e3f882b1c6",
      decimals: 18,
    },
    {
      name: "AGIX",
      address: "0x23ae659d70ef58bd2d3c92a997ae7a0982e59dab",
      decimals: 8,
    },
    {
      name: "FEAR",
      address: "0x76512b344981a9a308769476d73e4276458e778e",
      decimals: 18,
    },
    {
      name: "NBT",
      address: "0x92e9a7008eda41753bfb8580e46346de46b659c0",
      decimals: 18,
    },
    {
      name: "UDO",
      address: "0x95c3b04cfce7bc2e3916fc17a3e9a3c76944b7b6",
      decimals: 18,
    },
    {
      name: "CHAIN",
      address: "0x25999a5a0efec27f2c7fe7ceac384306b633518f",
      decimals: 18,
    },
    {
      name: "PNL",
      address: "0x9f3592f814584edc798fccdeccd01443df21fbb0",
      decimals: 18,
    },
    {
      name: "TRAVA",
      address: "0x1cde45c97f5ee4f8c7a73f70fcfb0838c3bd5ebb",
      decimals: 18,
    },
    {
      name: "BPT",
      address: "0x8c3693bfe5eba7f608a6d547b8117980e672cb06",
      decimals: 18,
    },
    {
      name: "BPRO",
      address: "0x0b18323511b576eb48c1a67ffbd0176e93a05f85",
      decimals: 18,
    },
    {
      name: "RU",
      address: "0xb36ec353b84451b719966561eada995bb5ee45df",
      decimals: 18,
    },
    {
      name: "KGO",
      address: "0x804a9a9ef07e26f2cd997345783dabc6f97d714c",
      decimals: 5,
    },
    {
      name: "WHL",
      address: "0x7e315c78c1739b9b3425bf8eac082e3595653601",
      decimals: 18,
    },
    {
      name: "DDIM",
      address: "0x1dfb99edd44fb61957db6c3a40fa3935df2c61ba",
      decimals: 18,
    },
    {
      name: "TENFI",
      address: "0x006f43081602999b142c7b14690248400b4c7b37",
      decimals: 18,
    },
    {
      name: "BDP",
      address: "0x2c24f9438975c5e55017b1b34e0d3aaa5138e1bd",
      decimals: 18,
    },
    {
      name: "SUPS",
      address: "0x7644aaf3a9510209fab261ad82647b70680b034e",
      decimals: 18,
    },
    {
      name: "SHAK",
      address: "0x07e483e343befcead24e6b81af946a6ca268bf91",
      decimals: 18,
    },
    {
      name: "ABR",
      address: "0x9672968a510c5b8bb7829828ea7c11921e66ca03",
      decimals: 18,
    },
    {
      name: "ANTA",
      address: "0xafc175a296ba422cdefa2fef4d0a512657b4a5eb",
      decimals: 18,
    },
    {
      name: "ORE",
      address: "0x3217cdb9374ef882cbed35991dae2330fd74a8a3",
      decimals: 18,
    },
    {
      name: "CE",
      address: "0x13e22f2a74c32ccb9d09f92812e4ec27b05ad384",
      decimals: 18,
    },
    {
      name: "SLICE",
      address: "0x0e33be3055882cfdad0464ace4315443cf50ab3e",
      decimals: 18,
    },
    {
      name: "HAPI",
      address: "0xf8f2d804eccf7a6feddec3ca3ce48a87ca3d55d9",
      decimals: 18,
    },
    {
      name: "FAWA",
      address: "0x4df37682546de0a2c66cff4c199da6b539bb26d8",
      decimals: 18,
    },
    {
      name: "AXS",
      address: "0xe2bd710074d6c2dca7c5f5bd36ca0c04b6febdea",
      decimals: 18,
    },
    {
      name: "DON",
      address: "0x8ab36aac57ad15ba79e6abc1a5dafbe3f447f5e4",
      decimals: 18,
    },
    {
      name: "YAE",
      address: "0xf67643cf5011ffada79a8e2d1bf2ec444dc31014",
      decimals: 18,
    },
    {
      name: "HORD",
      address: "0x0c5c7b9d304963da4f8b2ba1e3527bd6554fa3cb",
      decimals: 18,
    },
    {
      name: "EQUAD",
      address: "0x7dc283a8bb980d6c14c2269aa93ce98a09341c35",
      decimals: 18,
    },
    {
      name: "TNDR",
      address: "0xc790795709b405e043c073705ef13ec6a42028dd",
      decimals: 18,
    },
    {
      name: "CPLT",
      address: "0x6656e7ccd1ed023f387490282aacf6d573130b9a",
      decimals: 18,
    },
    {
      name: "MHT",
      address: "0x06c7144ecfa612a65194ce138e427ab26c0cac46",
      decimals: 18,
    },
    {
      name: "HUDI",
      address: "0x9fac9494cad3df16a7a5932797fd2301c4f4a22a",
      decimals: 18,
    },
    {
      name: "KALI",
      address: "0xec52a339122622b0d2c8729400b23fa11c2ca3f4",
      decimals: 18,
    },
    {
      name: "NRT",
      address: "0xde0d21b94cc76d1595b9e35c9ebd2a73b05954a1",
      decimals: 18,
    },
    {
      name: "GMPD",
      address: "0x6cf91edcd3bd7e941d3ba4c46ef899b509c4d51a",
      decimals: 18,
    },
    {
      name: "GCAKE",
      address: "0x6c703a53750f47262ea9666a73aac9a6a836d892",
      decimals: 18,
    },
    {
      name: "VST",
      address: "0x3bb7f499a365db4fe8825155fbb11a301d909952",
      decimals: 18,
    },
    {
      name: "REALM",
      address: "0xb5c69a3a59dc773a9f12d8ebdb0b228e8a6ec584",
      decimals: 18,
    },
    {
      name: "BNSD",
      address: "0xadcd06763ba0544e2f6b250f93bd3e041950c926",
      decimals: 18,
    },
    {
      name: "Mononoke-Inu",
      address: "0xc8fdc0714001e3b277bab25c6894b03f135fc4d1",
      decimals: 9,
    },
    {
      name: "ERP",
      address: "0x97dca0d78e5aecf0e6955b755f36d0a2e5bdb5cb",
      decimals: 18,
    },
    {
      name: "BABI",
      address: "0xa36b1a3314b8a817fc6c52efb7445861d6163a78",
      decimals: 18,
    },
    {
      name: "PINK",
      address: "0xcdb888570f4872345c8e44289ffe3d0b2c9334a3",
      decimals: 18,
    },
    {
      name: "DUCK",
      address: "0x909786dcd11f1fdf317d7860194b7cc32d347b2d",
      decimals: 18,
    },
    {
      name: "MU",
      address: "0xb9655ff1a9a1c43f42acb8e0bc51fb7d2c2d5904",
      decimals: 18,
    },
    {
      name: "XBE",
      address: "0xdbb174dbe7f7dadfa6c1f84c4f041f1ea79d1ced",
      decimals: 18,
    },
    {
      name: "BONE",
      address: "0x747277c112e83210a65957367026452ac516b49d",
      decimals: 18,
    },
    {
      name: "FINA",
      address: "0xf6501e7718cfb957e35ad760a391cc429c5734a0",
      decimals: 18,
    },
    {
      name: "VRX",
      address: "0x5f0934843911f263ae8b4d708043bb6498f5f491",
      decimals: 18,
    },
    {
      name: "SWAPP",
      address: "0xcb332ba86e2ddbc5781206438225676fe89ede77",
      decimals: 18,
    },
    {
      name: "FHTN",
      address: "0x2c11bb23ad9e49e155db9b886447b02bfc303df8",
      decimals: 18,
    },
    {
      name: "UPI",
      address: "0x0a9079e79480dac9eb2856799a7a53354af3a502",
      decimals: 18,
    },
    {
      name: "DECODE",
      address: "0xbe826a428f8328588021676e6b040655040e4bef",
      decimals: 18,
    },
    {
      name: "DNXC",
      address: "0x0d65a6f678ab94d4f45b3c54051738590a6591bb",
      decimals: 18,
    },
    {
      name: "WNCG",
      address: "0xb19f6c8fa394cc570e7ac8ad85e2b513648a0292",
      decimals: 18,
    },
    {
      name: "XP",
      address: "0x3c620344561baaac31bbd189a1b4531a80ccd24e",
      decimals: 18,
    },
    {
      name: "COTI",
      address: "0x36127370cdbda09adc75cd0bd68d3a57f70ea8f2",
      decimals: 18,
    },
    {
      name: "POOL",
      address: "0x49706493c0a0d6388d59afda23a13c37f95fdfd4",
      decimals: 18,
    },
    {
      name: "GRVE",
      address: "0x5b74bf6aa3d48f44d1a2fc2dd265b1ebf3b44619",
      decimals: 18,
    },
    {
      name: "YSEC",
      address: "0x88fa022ea8a010d1c312b095cfd0239b879b84db",
      decimals: 18,
    },
    {
      name: "SCV",
      address: "0x8c921e08f611bc5f07d60191d127c580efd18c37",
      decimals: 18,
    },
    {
      name: "FAI",
      address: "0x0a33f9332a5f0e3e2c5967c3379bb6dcd966cee9",
      decimals: 18,
    },
    {
      name: "HEGIC",
      address: "0x156ad9325189bba05e3a9d1e94bfd9da3deb01aa",
      decimals: 18,
    },
    {
      name: "SNK",
      address: "0x2541ce996642db60f62151d5aa977fd99f0864ee",
      decimals: 18,
    },
    {
      name: "FOTA",
      address: "0xcf8251c2a9e8a81b6982a2bffd7d297fc50532c0",
      decimals: 18,
    },
    {
      name: "$KMC",
      address: "0x00c87cb43d176af177a875a83b7c21c500cffc08",
      decimals: 18,
    },
    {
      name: "GMR",
      address: "0xeb51fe7407c602577483d02cfde92ab595392f18",
      decimals: 18,
    },
    {
      name: "DGN",
      address: "0xd2266cf29ba70b966149974b1efc138862090007",
      decimals: 18,
    },
    {
      name: "RUBY",
      address: "0x07c0fdbab11b5a1d33c3acea29283155dc63ea87",
      decimals: 6,
    },
    {
      name: "MEPAD",
      address: "0xae27bdd25fb9bff23e6d88c49e8db52063c1c60d",
      decimals: 18,
    },
    {
      name: "AIRT",
      address: "0x6ad9d06111050a1c1d5c5269039aa05f7050195d",
      decimals: 18,
    },
    {
      name: "HC",
      address: "0xe57d9dcf90b980a5d689f41342a5392cb8ffa70b",
      decimals: 18,
    },
    {
      name: "FCL",
      address: "0x4aec15f06fcb1699bf6d11a12683561aaab71c38",
      decimals: 18,
    },
    {
      name: "CRBN",
      address: "0xc6f529aa8781b3bfa4629129769212388ca1338d",
      decimals: 18,
    },
    {
      name: "XMETA",
      address: "0xf3c6f5b7016b896444a2a1661f0085d92d41bb93",
      decimals: 18,
    },
    {
      name: "LTT",
      address: "0x50314fa2420915a733254ed2d60cc8c00770c84e",
      decimals: 9,
    },
    {
      name: "CIRUS",
      address: "0xd0d2a455a0d02a12eb6098ab68a11f33318d54ce",
      decimals: 18,
    },
    {
      name: "eRSDL",
      address: "0xdb3047a49765f10dcd523d3cf424c265b701c9d6",
      decimals: 18,
    },
    {
      name: "TFS",
      address: "0x6ba6e3a3b800df7cab9ca8bead78ae994ab34804",
      decimals: 18,
    },
    {
      name: "FNDZ",
      address: "0x76677552c658393f596c9f57fe687360f44f9e88",
      decimals: 18,
    },
    {
      name: "DGS",
      address: "0xc3396466c392706bdc16c8bcdd239339e00e6147",
      decimals: 18,
    },
    {
      name: "MONA",
      address: "0x07ffe051b81c2d346a4c57e1747d63738374761e",
      decimals: 18,
    },
    {
      name: "1-UP",
      address: "0x5a69d1300d21f5b57e2ea8d75213d61087456142",
      decimals: 18,
    },
    {
      name: "CHANGE",
      address: "0xf78e78d077c6687416cf805042f950b0480db863",
      decimals: 18,
    },
    {
      name: "UMW",
      address: "0x076baff6895615136888d96dccd5c198ac6ce552",
      decimals: 18,
    },
    {
      name: "CMD",
      address: "0xcc90b9bed2a2862e1980e8eab6b6690fb0579e21",
      decimals: 18,
    },
    {
      name: "DVI",
      address: "0xad4c4aa825783528026c0c2a83fccdfa8b253da6",
      decimals: 18,
    },
    {
      name: "RLOOP",
      address: "0xd49a7248c227ea9f32f2c4e4491dabdf7f95a76a",
      decimals: 18,
    },
    {
      name: "HOICHI",
      address: "0x8a29aff444e2dc96617701f22ef94a6f045a4f6f",
      decimals: 18,
    },
    {
      name: "MTRG",
      address: "0xceb28ac8027aa55f829f1d1913abf0976dd40569",
      decimals: 18,
    },
    {
      name: "ONT",
      address: "0x451055252704c2c9bcd8bb60805e70054e1d5301",
      decimals: 9,
    },
    {
      name: "SRP",
      address: "0x1345d0e9e69e995d4171afc11ba869637e164239",
      decimals: 18,
    },
    {
      name: "COPYCAT",
      address: "0xd6adccd3573aba7dead3e5540d9cf0cf75f8f279",
      decimals: 18,
    },
    {
      name: "BONDLY",
      address: "0x26323dd07a12ccf25449dda4df0a0a03845c5147",
      decimals: 18,
    },
    {
      name: "MoFi",
      address: "0x4f72ba09764ef58a686c05494453a819d5edeb19",
      decimals: 18,
    },
    {
      name: "LRPS",
      address: "0x708e77565584e7d34c35d6cc7f8fe0d64bd6311b",
      decimals: 18,
    },
    {
      name: "AXL",
      address: "0x86b3a8277224ce647ea684cab1887c8adff5907d",
      decimals: 18,
    },
    {
      name: "HIP",
      address: "0x7bf74be626a3cadefcda200484e6132e4ee30b67",
      decimals: 18,
    },
    {
      name: "CHTS",
      address: "0x157ab975694624f7d775230a246e2b0ad0124dcb",
      decimals: 18,
    },
    {
      name: "KALLY",
      address: "0xaab90adaafe89bf609d10c7b57836ac55569440f",
      decimals: 18,
    },
    {
      name: "GSC",
      address: "0x42adf02d9da64428895dd259ad46fa842195aa96",
      decimals: 18,
    },
    {
      name: "FLAME",
      address: "0x9f0bcfde5ebf71be15a178cb2086d0ecc69bfe91",
      decimals: 18,
    },
    {
      name: "GS",
      address: "0xba3f99c5ae65e8d7857786b42fb89bdce68689cc",
      decimals: 18,
    },
    {
      name: "DOSE",
      address: "0xaed2b6c00b7a2099f6acd66571248f02284ded70",
      decimals: 18,
    },
    {
      name: "GAINS",
      address: "0x48a3fe2dbbbadbace728ae703cef11234cf99cfd",
      decimals: 18,
    },
    {
      name: "HID",
      address: "0x77c1306021d836ee831945c6d07adc8ba68300cb",
      decimals: 18,
    },
    {
      name: "FYN",
      address: "0xf54613673a8f882550c72072c9558284c379dd73",
      decimals: 18,
    },
    {
      name: "SNCT",
      address: "0xcb09f812a2d052efaa9ca350ce5ba67f7c02dad5",
      decimals: 18,
    },
    {
      name: "BEETS",
      address: "0x4da76924804ac57d7396344591fda3e794f6a634",
      decimals: 18,
    },
    {
      name: "SHIH",
      address: "0x9c833db421bd8ae10d86914283068ff91b55dab8",
      decimals: 18,
    },
    {
      name: "SHROOM",
      address: "0xf451788a1c17ca6753d59113558be3c03758c667",
      decimals: 18,
    },
    {
      name: "MSCP",
      address: "0xc74dba9b58fb8d554a3a04fd1babe41412ec0664",
      decimals: 18,
    },
    {
      name: "WGC",
      address: "0x310914edae28b68980b374f4ed5349a9d703e311",
      decimals: 16,
    },
    {
      name: "BSCS",
      address: "0x127253754b48df73c31edf871f1bcd257e3e9250",
      decimals: 18,
    },
    {
      name: "SPI",
      address: "0xfc94cb89cc77ffbd799d4acdefa50e6e25c8ed87",
      decimals: 18,
    },
    {
      name: "FRMX",
      address: "0xc49b04e5ba3e2f23039d2ffbc3dd0759dbe63a44",
      decimals: 18,
    },
    {
      name: "MRUN",
      address: "0x18c40b2372e88364f0d67713fdf1ede9576f1fa2",
      decimals: 18,
    },
    {
      name: "WSG",
      address: "0x3749a87b9a0a542cc603fa209186a00509880742",
      decimals: 18,
    },
    {
      name: "POTS",
      address: "0xc72e299b84bed15029090c422c783898c8726c6a",
      decimals: 18,
    },
    {
      name: "RGOLD",
      address: "0xb680acc70ba6401b161384676dbbb87334520a9d",
      decimals: 18,
    },
    {
      name: "IONX",
      address: "0x63539d4b3b9a46ebac659c326b5fb74e9c18ef6e",
      decimals: 18,
    },
    {
      name: "AMF",
      address: "0xdcb9016dcbdf51ca6b748d07c12806b842e2eabc",
      decimals: 18,
    },
    {
      name: "OIN",
      address: "0xe430a6ca80ca9918c92a7c3658e19ee18cd8c5a0",
      decimals: 8,
    },
    {
      name: "SHL",
      address: "0xba1d5eb011d8649c6354fb5aa941b58d66de5a2a",
      decimals: 18,
    },
    {
      name: "PSR",
      address: "0xf7a86d7195e41cf8aaa5af9b65aa725fdff0bc9e",
      decimals: 18,
    },
    {
      name: "ORKL",
      address: "0x83e00a858279dcec5c7def1c2aa26369130682e6",
      decimals: 18,
    },
    {
      name: "LEAG",
      address: "0x89b34a3620fb58efb60663ab8ec6f167f77afd64",
      decimals: 18,
    },
    {
      name: "WNT",
      address: "0xc48029ca85b213839d2290f92204a772288ca18b",
      decimals: 18,
    },
    {
      name: "SAN",
      address: "0x410f8829c8e759502edf0aca86476154ccb9e822",
      decimals: 18,
    },
    {
      name: "SHAKE",
      address: "0x82b7f1760aec8919440b4ee3c00aedb61770357d",
      decimals: 18,
    },
    {
      name: "OCC",
      address: "0x70bdd641be4621dff334cc3a72afeaf8caea35e3",
      decimals: 18,
    },
    {
      name: "QUA",
      address: "0xddcacd32645d3974e5f0220025794cd0b1e11221",
      decimals: 18,
    },
    {
      name: "POWER",
      address: "0xbfbb1e81a9a9bddde4c22678f75b5a51260d46e4",
      decimals: 18,
    },
    {
      name: "IRT",
      address: "0xd3660656b661f34410423d44a9ba6665717d6de0",
      decimals: 18,
    },
    {
      name: "GAT",
      address: "0xa6c130c78abd4cdd64285f5715bb9a03dd4d7f92",
      decimals: 18,
    },
    {
      name: "MHUNT",
      address: "0x276b606a0c866957449e823621c0c779e79f52bf",
      decimals: 18,
    },
    {
      name: "ETER",
      address: "0x42593fff56e98dba45a41ffaf0509a1f80d34938",
      decimals: 18,
    },
    {
      name: "SINGLE",
      address: "0xf721db172041fd5d88a643aeea7cbdd1f796d72a",
      decimals: 18,
    },
    {
      name: "F9",
      address: "0xe2685898f86684225bdecbb4c4508d7b4e26688b",
      decimals: 9,
    },
    {
      name: "CONV",
      address: "0x17488d0e5a98890bbeedcd6090b5114f54f43089",
      decimals: 18,
    },
    {
      name: "INU",
      address: "0x857a1d97dc9c36c7a8f8f611f12985c5142971cb",
      decimals: 18,
    },
    {
      name: "DOGEGF",
      address: "0xbfd455b852dfc1a272c4b8f9d1b2213bd1ce2b67",
      decimals: 18,
    },
    {
      name: "XFIT",
      address: "0x94d7378a68627cb000cef7fbe7c7e75d5940c011",
      decimals: 18,
    },
    {
      name: "HIMO",
      address: "0x966179fa88555c6178b1484b774d516af6c3366b",
      decimals: 18,
    },
    {
      name: "PICKLE",
      address: "0x15737af5a8cd70be5dbe56fccbfcc7b82aa1b2e5",
      decimals: 18,
    },
    {
      name: "TNODE",
      address: "0x79d4313e5d716a40a10d91af6a06b26313cc592c",
      decimals: 18,
    },
    {
      name: "DUEL",
      address: "0x1c566a8dcef390304747ac5bd588384911a36fc7",
      decimals: 18,
    },
    {
      name: "BASIC",
      address: "0x46d769583239d5f0f6c3654d0dfebf95e5f87009",
      decimals: 18,
    },
    {
      name: "VENT",
      address: "0x3f116daf39fb1d75f2fda983c98087f635cfa684",
      decimals: 18,
    },
    {
      name: "HON",
      address: "0x25babaa4e63e855a3ce7ea855e297f68b590987f",
      decimals: 18,
    },
    {
      name: "SIS",
      address: "0x6dae3ae7e36954be557186aa29ee85efa8347513",
      decimals: 18,
    },
    {
      name: "AAG",
      address: "0xf1e6145d376b92dfd447d02ca6a41118f67d201b",
      decimals: 18,
    },
    {
      name: "CSC",
      address: "0x2fd2fdfedee4696afbd0685b5aff6c12042ae347",
      decimals: 18,
    },
    {
      name: "BAO",
      address: "0x7c7c688a6b76f55761162698a706160cce81260b",
      decimals: 18,
    },
    {
      name: "1MT",
      address: "0xff5a499bd580e131bd72075193375c04c3ddce3e",
      decimals: 18,
    },
    {
      name: "BCUBE",
      address: "0x3a8bed4f8fb84bd511ff999b5298bf2e05a22170",
      decimals: 18,
    },
    {
      name: "USF",
      address: "0x40d8ab102be47ad2d50451853c772451db2301d0",
      decimals: 18,
    },
    {
      name: "YAMV2",
      address: "0x72e39837b452c1b3d62fd656cfa68aa4ed25b50f",
      decimals: 24,
    },
    {
      name: "GEEQ",
      address: "0xd4a23dc1af71cb987190db523dbe7327ea3a717c",
      decimals: 18,
    },
    {
      name: "IOI",
      address: "0xe30294e180e5f0787434f4deb46c133e528d1839",
      decimals: 6,
    },
    {
      name: "LUA",
      address: "0x7d48a84ad14e674d42f101f61a5c93144410c3a4",
      decimals: 18,
    },
    {
      name: "TTK",
      address: "0x569db0f002d314ea59eee428e9ec4efc779f8af6",
      decimals: 18,
    },
    {
      name: "CTZN",
      address: "0x7678273f1904656f51bfc1e54cbdf0a413c23ef6",
      decimals: 18,
    },
    {
      name: "AVN",
      address: "0x7714c93c8d151f6f64b5a6eca00ab40466f5dc6a",
      decimals: 18,
    },
    {
      name: "NORA",
      address: "0xd28f7505747f71038a33dca39dad66c26dba4c09",
      decimals: 18,
    },
    {
      name: "INSURE",
      address: "0x4ee0f5a8f4090ae86d96f560c299b8796062ea99",
      decimals: 18,
    },
    {
      name: "SOURCE",
      address: "0x667786c039fa534a54cf62b2447ea83cf59e432e",
      decimals: 18,
    },
    {
      name: "PATH",
      address: "0xf5b70c5585b6713f1d274939181571e9e679801a",
      decimals: 18,
    },
    {
      name: "UNIQ",
      address: "0x93bbf5a0047a1c8ffe772717cc297294f47bfdb8",
      decimals: 18,
    },
    {
      name: "XMS",
      address: "0x0a0f684820c20ec08ad45fe9bd6965587962e5f4",
      decimals: 18,
    },
    {
      name: "MAPE",
      address: "0x8bcf28062ebc02d8b7e3dcbfa67a0f547eafd36d",
      decimals: 18,
    },
    {
      name: "FOMO",
      address: "0xb7ef478583f781475b331e521806f53c8face530",
      decimals: 18,
    },
    {
      name: "FRIN",
      address: "0xa3d8870a67ec14a43ca5cb02dc8ff528764ce48d",
      decimals: 18,
    },
    {
      name: "EPW",
      address: "0xa735037a3b8c0935968e9bf2e049ce2245f7d919",
      decimals: 18,
    },
    {
      name: "BZEN",
      address: "0x80be6a2c5bdf3a6a47fd0430bbe26d02c8358504",
      decimals: 9,
    },
    {
      name: "TOSHI",
      address: "0x3a11402c8d77718dce124c0fea5ee97bfdf9b54b",
      decimals: 18,
    },
    {
      name: "CIV",
      address: "0x1a299e244eeb3034c7bebe6f217012c0029f248c",
      decimals: 18,
    },
    {
      name: "SPW",
      address: "0x69f07850494e44d84800e091d51351cade91b1b9",
      decimals: 18,
    },
    {
      name: "4MW",
      address: "0x6d4830f963c4d39cb4a22992afecd1d0cffa6f6b",
      decimals: 18,
    },
    {
      name: "NFT",
      address: "0x2578558ed1c62d5a0e1aa777a1864caeeff81428",
      decimals: 18,
    },
    {
      name: "FANC",
      address: "0x341dedb441feaa28ae81215ad48c36f087f43640",
      decimals: 18,
    },
    {
      name: "FRM",
      address: "0xcc84bf5977815ebfa720a3fc9e6c44df064c7eab",
      decimals: 6,
    },
    {
      name: "PHA",
      address: "0x5f98e9cb5ee813e6131d49d9ce841e01abeab10b",
      decimals: 18,
    },
    {
      name: "BFG",
      address: "0xf1c7f88d1cc3c872f31b232bdac8d05e31c95cfa",
      decimals: 18,
    },
    {
      name: "COR",
      address: "0x683d40113ce4b7d221b7a2173b0fe5d95806fb2a",
      decimals: 18,
    },
    {
      name: "OCP",
      address: "0xb645ba3b183136431ff24dcd6fb6986005c092e6",
      decimals: 18,
    },
    {
      name: "ANML",
      address: "0xf5f5871477793306fdf0693bc76d9581dff366d7",
      decimals: 18,
    },
    {
      name: "IRON",
      address: "0xa12a13ed8c90c2ab51f99b6fde5a53e4e6113541",
      decimals: 18,
    },
    {
      name: "MILK",
      address: "0x58881be09efee978c6063b92291fd0d05145c526",
      decimals: 18,
    },
    {
      name: "DKS",
      address: "0x16c838611a9b91d4511a6cb6cf308b96d1900fda",
      decimals: 18,
    },
    {
      name: "STAK",
      address: "0x8aea65e50c42e185d8ebe1ebbc7295711cbf8a73",
      decimals: 18,
    },
    {
      name: "MONES",
      address: "0xb1c40ce56c64960bae9ae03003930f0cfa5eeff6",
      decimals: 18,
    },
    {
      name: "CMCX",
      address: "0x1b81dd37419ea98e0eb317d08d2b19278629a21e",
      decimals: 18,
    },
    {
      name: "N1",
      address: "0x19dab6cdcddea3ee515a4d2ff75b5b5268fc0a17",
      decimals: 18,
    },
    {
      name: "EXNT",
      address: "0xc7f3c323c6012d663f1ea11830d92d9ce0134454",
      decimals: 16,
    },
    {
      name: "bPRIVA",
      address: "0xe750ff4b1c4b47ce44fedb64e1c37800c8257654",
      decimals: 8,
    },
    {
      name: "ALGOBLK",
      address: "0x51d9b6a33b997551ff1311b778dd788a36f868a2",
      decimals: 18,
    },
    {
      name: "SWFTC",
      address: "0x5e96490451c95ebc124dc0dde8d059ffafd540de",
      decimals: 8,
    },
    {
      name: "DUW",
      address: "0x1e5df797bdce1da61e9204afd7a77554ceb21529",
      decimals: 18,
    },
    {
      name: "OASIS",
      address: "0xfafce6c73a46f6fbb36be5da3e583d34be7be4a0",
      decimals: 18,
    },
    {
      name: "FIS",
      address: "0x5e1a5ad6099ebc03adb4d5c030a450b3eff39cc8",
      decimals: 18,
    },
    {
      name: "SOVI",
      address: "0xcd3e2a2023dae147f2d7c0837bd676901c752642",
      decimals: 18,
    },
    {
      name: "ORT",
      address: "0x0413bb2dee99681623466db4151ccb090febcf0d",
      decimals: 18,
    },
    {
      name: "MELT",
      address: "0x074128d5c6acd9791271af455959039ab22399bb",
      decimals: 8,
    },
    {
      name: "SOFI",
      address: "0x24295e70420f86942b03479893c32ecad95ab089",
      decimals: 18,
    },
    {
      name: "SRBP",
      address: "0x0de729abc061fea10c036f9d1f37594fa20dd832",
      decimals: 18,
    },
    {
      name: "MGOD",
      address: "0xff69eb7e3e78a224fb897bd2f0ec11aa6f522e0d",
      decimals: 18,
    },
    {
      name: "SEON",
      address: "0xf38911a9c553e531491044aa581eba6079b912be",
      decimals: 18,
    },
    {
      name: "LSWAP",
      address: "0xac128eb61c7b7f5fbb2a81cb15c3a31467f5b8b8",
      decimals: 18,
    },
    {
      name: "GFARM2",
      address: "0x2904a84e5d212920a53cc9fb17a80830e402d072",
      decimals: 18,
    },
    {
      name: "INSUR",
      address: "0xaf02187e1022977a69fd7af5a97685bd0ad027f9",
      decimals: 18,
    },
    {
      name: "SAITOKI",
      address: "0x653b33c0e64fe4ef09da473be55efe550317ad3c",
      decimals: 9,
    },
    {
      name: "CYT",
      address: "0x37a83ff274202a076552a21fc7a338161d5e71e6",
      decimals: 18,
    },
    {
      name: "KINE",
      address: "0x9ffb6f5aa78e2322dd768461b47ccb98168c66e1",
      decimals: 18,
    },
    {
      name: "DAFI",
      address: "0xbedbc999e784d4ae666b3599782e8dec579c947d",
      decimals: 18,
    },
    {
      name: "SENT",
      address: "0x6e425893b28ad343b1ef7ccb185b58109739af32",
      decimals: 18,
    },
    {
      name: "SMON",
      address: "0x9059ecbeb7c6c6143fe24b298a65ebf1ef1d83a2",
      decimals: 18,
    },
    {
      name: "NTX",
      address: "0xb86297a82b364d0b45f0ca8128ebee2ae57a012a",
      decimals: 6,
    },
    {
      name: "WSHEC",
      address: "0x6a4fce592e02fcdc84f217fa2380ee75c5f4bcdb",
      decimals: 18,
    },
    {
      name: "CHIWA",
      address: "0xdc82934762154f70a63f8eb56b82041d1f3b3c74",
      decimals: 18,
    },
    {
      name: "MARSH",
      address: "0xf97efb741f795640e6646face9d6ac32e4811e40",
      decimals: 18,
    },
    {
      name: "RUN",
      address: "0xf16091f5c8c3f931e197bf9b75f001d9e6dcb7a0",
      decimals: 18,
    },
    {
      name: "MOO",
      address: "0x05af924381ebbd02e662dd51908021085f9979f4",
      decimals: 18,
    },
    {
      name: "EJS",
      address: "0x175e0375c595ea3f084bd89298e509b8e51a8c11",
      decimals: 18,
    },
    {
      name: "VSHARE",
      address: "0x15ac361ea724d591332cb0929345d23e7c5287fc",
      decimals: 18,
    },
    {
      name: "FRONT",
      address: "0xb2d9fe99009be83650bf53a6c97a42d50f17a0cd",
      decimals: 18,
    },
    {
      name: "TRIAS",
      address: "0x0fc86ccd74a21e2334af7086ec543c5879269412",
      decimals: 18,
    },
    {
      name: "STORJ",
      address: "0xac464816945bae8a18ce1ff7e8ced24b091305a1",
      decimals: 8,
    },
    {
      name: "GROK",
      address: "0x51a64e803efc1a568a096dde76a0c06fde50cde6",
      decimals: 18,
    },
    {
      name: "LAIKA",
      address: "0x9977d6a849d75ca789f7d7211542006f735aa839",
      decimals: 18,
    },
    {
      name: "MPD",
      address: "0xfe757ce6daa550a85dd60f6028f17ea4594f11b3",
      decimals: 18,
    },
    {
      name: "KEN",
      address: "0x086293e2b96ed9b7713d42faad559d71f77cd49d",
      decimals: 18,
    },
    {
      name: "PRQ",
      address: "0xeace53f61409d80f909c65ecd417b3952ab9988b",
      decimals: 18,
    },
    {
      name: "IMPACTXP",
      address: "0xda7faa87692abf9b56dfc5cbab267994d147b9d3",
      decimals: 9,
    },
    {
      name: "CEL",
      address: "0x6356326b89e2906e2ff1b9a0d5ff6ded25901460",
      decimals: 4,
    },
    {
      name: "BIST",
      address: "0xa324cf2fa1cb92361f2454f8d785fa9d5cb402bb",
      decimals: 18,
    },
    {
      name: "POPS",
      address: "0xb2c286194c385852649b644655441025cca6f839",
      decimals: 18,
    },
    {
      name: "HEART",
      address: "0x2cd3dd8c8e20ccfd2a7d01b90abc7bae3a99c54c",
      decimals: 18,
    },
    {
      name: "XAI",
      address: "0x65bb593d2b26e329f88d7a60af84fe9f9a3aaab1",
      decimals: 18,
    },
    {
      name: "DIGI",
      address: "0x130b8ca28a4cdfaa0d64a52c080a552ab98d3c5b",
      decimals: 18,
    },
    {
      name: "TDX",
      address: "0xd596352b45736703c8aba7546b5ecd09fbac29ba",
      decimals: 18,
    },
    {
      name: "MIMAS",
      address: "0x336e311ff130624893f15c21d0fc9f0ddcdfbe0b",
      decimals: 18,
    },
    {
      name: "SFEX",
      address: "0x06e252c37140442a407705cde82840a5811841c1",
      decimals: 18,
    },
    {
      name: "MPH",
      address: "0xcacd69bb616411a9b92fa9aacadada8b52df482e",
      decimals: 18,
    },
    {
      name: "BWJ",
      address: "0x52977f410197218d986805426e6ba1748b46afe0",
      decimals: 9,
    },
    {
      name: "MAPS",
      address: "0xd0e94b5aef86f3d0bd8c1026e521ba5ffca3e5da",
      decimals: 6,
    },
    {
      name: "NFTD",
      address: "0x0ce7da7fc76e7129a79f88898542281414572567",
      decimals: 18,
    },
    {
      name: "TITI",
      address: "0xbb1995f34e4abb606bf8af9e8c065b24d3c5f25d",
      decimals: 18,
    },
    {
      name: "MILE",
      address: "0x66da854c42a5aa95286c75c8a7ffa2a5a73138b8",
      decimals: 18,
    },
    {
      name: "MRHB",
      address: "0x1e5eb13e50c50534669c0010de6941094a86a04c",
      decimals: 18,
    },
    {
      name: "CIFI",
      address: "0x6608e5f350d2d47954908869573739491a618208",
      decimals: 18,
    },
    {
      name: "XCN",
      address: "0x64c2bff0b8674542855ff580880196df6c3464c6",
      decimals: 18,
    },
    {
      name: "CROSS",
      address: "0x487e5b519f6d7877903ada23a3e057957163cb84",
      decimals: 18,
    },
    {
      name: "HUNNY",
      address: "0x7ee90d3f0450a07ffbf6e36a6e450dc471eb034a",
      decimals: 18,
    },
    {
      name: "KIT",
      address: "0xa7fd5433accfe9cd278c0edc5a789936111d2cba",
      decimals: 18,
    },
    {
      name: "ID",
      address: "0xba7ac71a8e96c8ac4aac816590f9c2307cf804b7",
      decimals: 18,
    },
    {
      name: "VERSA",
      address: "0x36433849566c2ac785e0c87f53be127e7162aaa9",
      decimals: 18,
    },
    {
      name: "CHAMP",
      address: "0xac645130e40928b8dda9af813ffbb725a01ce957",
      decimals: 8,
    },
    {
      name: "XWG",
      address: "0x62096ec7670ee52e31c03c49cc3f7aa237851368",
      decimals: 18,
    },
    {
      name: "NYM",
      address: "0x2d198e51293301bda35a5e12f5ef6c64d46b4127",
      decimals: 6,
    },
    {
      name: "PROS",
      address: "0x9c17cf4f2ee6acb9a8aee2477dd9e7322e85abf6",
      decimals: 18,
    },
    {
      name: "ENTR",
      address: "0xd935bd2f4281beadb2a13939df412978525c983a",
      decimals: 18,
    },
    {
      name: "GLQ",
      address: "0x0b954bfbe6a554e0fef0744ab252d05cd90ff804",
      decimals: 18,
    },
    {
      name: "QDX",
      address: "0x7c817ff3d84b1b97f83bec5d6a999c4bcd2b3522",
      decimals: 18,
    },
    {
      name: "DUSK",
      address: "0x3d3554d911147a35e7665e01da3a8a7868a3383c",
      decimals: 18,
    },
    {
      name: "VLX",
      address: "0xf7f0114b3e7393b80c75515cfb887794c352f9e2",
      decimals: 18,
    },
    {
      name: "PDEX",
      address: "0xc4a813d7cd481f50023fcf9e72e3cbc27eeba30a",
      decimals: 18,
    },
    {
      name: "BTSE",
      address: "0x905f6fbbb1da413b1baeba1a93bc48b0da100dd8",
      decimals: 8,
    },
    {
      name: "STI",
      address: "0xe29c391c50d468c757b8d8bfc18997436df650f4",
      decimals: 10,
    },
    {
      name: "PVU",
      address: "0xc321a1f5ff7bc89582c74e84d9546f90bf0babab",
      decimals: 18,
    },
    {
      name: "BLZ",
      address: "0x93cae42196efcaff8d7e5c8c2595c686bdbdb731",
      decimals: 18,
    },
    {
      name: "MEXI",
      address: "0x0051e9fc87b203a521bd18cbf9ee813e12c43768",
      decimals: 18,
    },
    {
      name: "STRM",
      address: "0x6adb209ab0877acae49558228fe1021682c07ed7",
      decimals: 18,
    },
    {
      name: "ONI",
      address: "0x5beb1366d804fbeb1986cbcdbe4ba6a5a4f795b3",
      decimals: 18,
    },
    {
      name: "NUM",
      address: "0x5f45de18048a2d3ed9c074a82bd32a15b4941a40",
      decimals: 18,
    },
    {
      name: "VLT",
      address: "0xa0d76ef492e2f1b190ea7cf2fd1ade4e79f0a79b",
      decimals: 18,
    },
    {
      name: "RLC",
      address: "0x52d5970fa5ac5d964988fba2a1bb8874a4cfa3fd",
      decimals: 9,
    },
    {
      name: "KUNCI",
      address: "0xd6dcfdaabde81f87fa1e69d1806b4da09fd9c596",
      decimals: 6,
    },
    {
      name: "DEXE",
      address: "0x84510ab3d4cc166799921081e2fb9ce283f2ab07",
      decimals: 18,
    },
    {
      name: "O5O",
      address: "0x3101faec3b878153bfe6a8169c41c786086e4b66",
      decimals: 18,
    },
    {
      name: "LGCY",
      address: "0x3594efae16a34e5e06a1d8eb921bdc587ac2501f",
      decimals: 18,
    },
    {
      name: "CVZ",
      address: "0x77b2a9e912f7e05ce876767b3ccfb5de781013d5",
      decimals: 18,
    },
    {
      name: "RAMP",
      address: "0x8a10a5cc9fd5484c0e526b79d1e6a89df70d432b",
      decimals: 18,
    },
    {
      name: "GAME",
      address: "0xf6d00e0fe2d6066570013354935d9e1c111aa090",
      decimals: 5,
    },
    {
      name: "VITE",
      address: "0x2439785ac95c3c2425c77c6503c2846d90529238",
      decimals: 18,
    },
    {
      name: "FER",
      address: "0x9d3cd8e4bee7a38f738399aea7269c93444f617d",
      decimals: 18,
    },
    {
      name: "PULSEDOGE",
      address: "0xe63dccffb2fabd611464b812f968ad237cf1edde",
      decimals: 18,
    },
    {
      name: "HGET",
      address: "0x4fbe398591637c10adc2cf7481dee2c219042edf",
      decimals: 6,
    },
    {
      name: "LFC",
      address: "0xd83951d4af813ee185b22de50ddc79ab9f19d275",
      decimals: 9,
    },
    {
      name: "FADO",
      address: "0xd6db88ff79edcee21c4d59ab7492db1e4eb4558d",
      decimals: 18,
    },
    {
      name: "LUS",
      address: "0x07a08b50a993f536c758907c989ab44dd3b6c6aa",
      decimals: 18,
    },
    {
      name: "IXS",
      address: "0xb665274d93d2eb8c5ad98524800f870e3e289dc0",
      decimals: 18,
    },
    {
      name: "PNODE",
      address: "0xb209fc464d7642c0c7434ff76ca4e318219fbdb2",
      decimals: 18,
    },
    {
      name: "DAL",
      address: "0x9021e11088d41e836d5a5f4c2b804ad85455032a",
      decimals: 18,
    },
    {
      name: "PKR",
      address: "0xc0e5737dd9afff1d6047b951bab0015825d3b3c5",
      decimals: 18,
    },
    {
      name: "CRACE",
      address: "0xa95839d73acbac23e526c5533fbdf9b6fe69d1b2",
      decimals: 18,
    },
    {
      name: "EYE",
      address: "0x8b719cb2ba00a2f9e3f4fb714e811f5b7e764056",
      decimals: 18,
    },
    {
      name: "BBANK",
      address: "0xe8145ffd5bed656c59b5d39a7418ae2bacdf2b58",
      decimals: 18,
    },
    {
      name: "XY",
      address: "0xde55637ce0cd765bed626fc2793879bda176ef02",
      decimals: 18,
    },
    {
      name: "PSP",
      address: "0xc9c11faf4d620e99a8bed139737c682c9276f6d2",
      decimals: 18,
    },
    {
      name: "BRKL",
      address: "0x2039cc280072269a6dad48698095546185609c9b",
      decimals: 18,
    },
    {
      name: "MEME",
      address: "0xe2824ec0830570e093b760cad835479baa9ec4bd",
      decimals: 8,
    },
    {
      name: "YFO",
      address: "0x5e5f41bfbf76560833327277b93878328c77bdf0",
      decimals: 18,
    },
    {
      name: "PLT",
      address: "0x971fe6af4a35a09bf01e062e9df2f8ec3f4a4014",
      decimals: 18,
    },
    {
      name: "HEROES",
      address: "0x62931b3f8fd89a6d788ce98039a0df00893fdf1f",
      decimals: 12,
    },
    {
      name: "DARA",
      address: "0xdbe6eef0bd5cb731950b8d67c4d944f11937ce20",
      decimals: 18,
    },
    {
      name: "NSFW",
      address: "0xbc0a459029f3b42576badc853d0eee64a1c1ce91",
      decimals: 18,
    },
    {
      name: "SKILL",
      address: "0x78b3fa3c43a3c5266a97118d5cceab08807be07b",
      decimals: 18,
    },
    {
      name: "MCRN",
      address: "0x3088c8cd623071d14e4df43cdb183dd02b4c1ec4",
      decimals: 18,
    },
    {
      name: "BMI",
      address: "0x7dce40d3651915d3df684a459c30619b348bedcd",
      decimals: 18,
    },
    {
      name: "STEAK",
      address: "0x9d493da9c8eaddff3af10db2519120782835373d",
      decimals: 18,
    },
    {
      name: "8PAY",
      address: "0x012c0eb67fa77d4f7876070f3ebb75c50c4ad22d",
      decimals: 18,
    },
    {
      name: "GAMI",
      address: "0xec31caf6c04af9538995467c44714f733278cb5a",
      decimals: 6,
    },
    {
      name: "SFL",
      address: "0x2faec51de07959fd6d37b4f246229a400d4d5b2d",
      decimals: 18,
    },
    {
      name: "SNACK",
      address: "0xb3e1f515a4cc3eff6d5f4240631117310fe4a23e",
      decimals: 18,
    },
    {
      name: "LOCG",
      address: "0x51af69f5077d8faa0eb70ba7f80345c330319389",
      decimals: 18,
    },
    {
      name: "KSW",
      address: "0x2157b5497acf3e1ed80d24497f2099345a033529",
      decimals: 18,
    },
    {
      name: "RIPH",
      address: "0xbe4316b60d9ced3ce3de54bc3e7a6ec158f78ca1",
      decimals: 18,
    },
    {
      name: "DRACE",
      address: "0x5c273ea7c05452925eead09f108461763874e787",
      decimals: 18,
    },
    {
      name: "VICS",
      address: "0x7d19c6db81c09482ccd628b8cb17eaee1ca51e44",
      decimals: 18,
    },
    {
      name: "WOMBAT",
      address: "0x8b71a705f7185e093bfc5b0dbf86f1bcef6fb5d4",
      decimals: 18,
    },
    {
      name: "BR",
      address: "0xb77729159862923ecf9e16b2851c0bcc09f43760",
      decimals: 6,
    },
    {
      name: "FBX",
      address: "0x116dcdd0f80b6e0e2de2f768d58a02869e32d3d2",
      decimals: 18,
    },
    {
      name: "FBL",
      address: "0xc9abcd963ac497713271858c95d5bd665816e2d0",
      decimals: 18,
    },
    {
      name: "STZ",
      address: "0x539006d84d723620bd00fa836a1bff1de03a49bb",
      decimals: 18,
    },
    {
      name: "SATOZ",
      address: "0x68c6ac060dcdafad6d0262ba05f84c8744625115",
      decimals: 8,
    },
    {
      name: "MPC",
      address: "0x2d35b8bc29ccb6f6a790759c9066336505531912",
      decimals: 18,
    },
    {
      name: "GOGO",
      address: "0x339d848f846a17a1e7fe89e865ae12bb47039407",
      decimals: 18,
    },
    {
      name: "UNO",
      address: "0x594a0816606ce5284ef31377b8f77d76f335d0c8",
      decimals: 18,
    },
    {
      name: "XPND",
      address: "0xc01cdd6c9b796b733557bd9c4d1937683dbea7eb",
      decimals: 18,
    },
    {
      name: "CTRAIN",
      address: "0x64d90b1a71eabc94e16dd08ffef2d9323bc179a1",
      decimals: 18,
    },
    {
      name: "DOM",
      address: "0x5e72618adef095a20665e2139a0e9f9e70d03273",
      decimals: 8,
    },
    {
      name: "YOP",
      address: "0x931ec5d4654c00d8da3c134dd00c2d04a6cd75df",
      decimals: 8,
    },
    {
      name: "LEON",
      address: "0x6baf55bdedcb5e8529a5ed2bbf9cf82beeeea42f",
      decimals: 18,
    },
    {
      name: "LSHARE",
      address: "0xc836ffeb417132af8a02105f58345858a0ecbd2d",
      decimals: 18,
    },
    {
      name: "ANTEX",
      address: "0x1c28f54dae3bcc5038e2d1db808324823da59f1f",
      decimals: 8,
    },
    {
      name: "ORYX",
      address: "0xc1be34a5f81fcae83fdf5d80a286f5a15bbe9bab",
      decimals: 18,
    },
    {
      name: "FIU",
      address: "0xefb7d6a6fc08af2e1d98ea0478f95eb27e461ac1",
      decimals: 18,
    },
    {
      name: "BCF",
      address: "0x6245b595731019bb3454021cbf461de2ee072f45",
      decimals: 18,
    },
    {
      name: "ZRO",
      address: "0xe97fcbef09de4c386ffa1819b98d4c71a3d250b9",
      decimals: 18,
    },
    {
      name: "GODS",
      address: "0x9da3632583420d7cddbeeeea1de258de815866c2",
      decimals: 18,
    },
    {
      name: "RNDM",
      address: "0x14cc3acef9daa39ce0d7bda5b0d39ce197a3774d",
      decimals: 18,
    },
    {
      name: "LIQ",
      address: "0x3db24a151c28832035cfd85eca3fb80421796b10",
      decimals: 18,
    },
    {
      name: "MOPS",
      address: "0x1c4768b5177517d85f4f96b1b47572a8c8d9d756",
      decimals: 18,
    },
    {
      name: "HECTA",
      address: "0x6fca2b93fa04136fd7e948ef5006c0d35c2318a0",
      decimals: 9,
    },
    {
      name: "SATA",
      address: "0x6a677e6144b154854a09201b4e94681159f8efdf",
      decimals: 18,
    },
    {
      name: "CEEK",
      address: "0x94f1476ff2e9c3b6cef581680e92507326f02d09",
      decimals: 18,
    },
    {
      name: "RUG",
      address: "0xc872f6ce928965ae40e351ae89ab28b75742c193",
      decimals: 9,
    },
    {
      name: "MITA",
      address: "0x7041a5ce0a2b94d25847942f6525a15523b12c99",
      decimals: 8,
    },
    {
      name: "TETU",
      address: "0x6b0df6fe3a5b61e9cf61b16a798440d055b61e26",
      decimals: 18,
    },
    {
      name: "WATCH",
      address: "0xf075669669a32ea3bd1887a4b635fe4a62c550ee",
      decimals: 18,
    },
    {
      name: "CWS",
      address: "0x17fbaeb9fc3aa33961354ddbe7c2a98cb8b37276",
      decimals: 18,
    },
    {
      name: "TRAXX",
      address: "0x9c2a150c839dc15a9c690a94658400dfcf1c88de",
      decimals: 18,
    },
    {
      name: "FARM",
      address: "0x7c08de51d766ed624dccb36998b60775b3fd80aa",
      decimals: 18,
    },
    {
      name: "MONS",
      address: "0x5b97a4f54e9e31e425557c44fdc63e5e43e6dde3",
      decimals: 18,
    },
    {
      name: "MTB",
      address: "0x9f7aa5eb3ce087903596306c6bea52aae334fa74",
      decimals: 18,
    },
    {
      name: "PFY",
      address: "0x715de8c58cd428e033b1861f1be06ea08b2a7ec4",
      decimals: 9,
    },
    {
      name: "SIDUS",
      address: "0x2d2f90241e6359e8f2fa774f4a3114e8eb2f5602",
      decimals: 18,
    },
    {
      name: "BRIGHT",
      address: "0x3ec868042a76e8aa40a99114c84f94e2c7800468",
      decimals: 18,
    },
    {
      name: "DOMI",
      address: "0x1e50af7bd4f109b7a52a908369cf3c3a87454f74",
      decimals: 18,
    },
    {
      name: "TTX",
      address: "0xee90b0fca95aae0cef00f954c25e5708b0040463",
      decimals: 18,
    },
    {
      name: "TOWER",
      address: "0xa5eabc6505da004b7b689c8db10b9d419b3a7e2d",
      decimals: 18,
    },
    {
      name: "ORARE",
      address: "0xb8dfb9bc7b022af74105815ddbc0fc1584a8e35c",
      decimals: 18,
    },
    {
      name: "DLTA",
      address: "0x5bba33c84ebf273af47590b6b6bf7892c5551c5d",
      decimals: 18,
    },
    {
      name: "JAM",
      address: "0xe6ca0db98e4c600809e5020da27eae50086c5c4e",
      decimals: 18,
    },
    {
      name: "HAKA",
      address: "0xaf9efcbb580b7c57f353eb27d8e5319957e81977",
      decimals: 18,
    },
    {
      name: "SFI",
      address: "0x538486352d3fb010c876f9f4541dfd0358343746",
      decimals: 18,
    },
    {
      name: "DRIV",
      address: "0x700354c88fffb471cd536607a3b1a4a6f9100a44",
      decimals: 18,
    },
    {
      name: "MTD",
      address: "0xaac39f4481cd784478259492ebffb3a37a0c01f6",
      decimals: 18,
    },
    {
      name: "SRK",
      address: "0x2b0c6c1caff1c5ca9bcafb002a26f63283238f4c",
      decimals: 18,
    },
    {
      name: "SCRL",
      address: "0x1c0f122d963e63add91c14914895de9da03f3d94",
      decimals: 18,
    },
    {
      name: "CLIQ",
      address: "0xdc67300fbf0566aced55782344a4b43fb2bfde74",
      decimals: 18,
    },
    {
      name: "INV",
      address: "0x7a3d95d46d69fdd238a7a4d8b9f4cda1407e8839",
      decimals: 18,
    },
    {
      name: "ECIO",
      address: "0x8df4841370dd691e57a55dff17e26609ed4013d1",
      decimals: 18,
    },
    {
      name: "XCV",
      address: "0x367893524b134a11b85a3c6e376996749336b092",
      decimals: 18,
    },
    {
      name: "DRF",
      address: "0xf02b0d646abad972190fd395dcb97ff6db7d189c",
      decimals: 18,
    },
    {
      name: "CORGI",
      address: "0x3a11edf374fdbceb676b019eaf25173ff1d7e60a",
      decimals: 18,
    },
    {
      name: "TARAL",
      address: "0xd2e5fafa2949cc2ca4a2b0c093837e900bcb277c",
      decimals: 18,
    },
    {
      name: "INVEST",
      address: "0x952f615d46af2f91f4d85c9b337400f3be0a6b2d",
      decimals: 18,
    },
    {
      name: "MATH",
      address: "0xbad97c594117b1c03123bbc7602137eef8f05265",
      decimals: 18,
    },
    {
      name: "PALLA",
      address: "0x8a0f443a469c868eec6fc7b31dc5542256cad1f0",
      decimals: 18,
    },
    {
      name: "GTC",
      address: "0x5545331145044df0e5ce1007f34e3fc762ee7f25",
      decimals: 18,
    },
    {
      name: "STARS",
      address: "0x6fefdfb4270af19a8e4a5243e56f34eadf91b5e2",
      decimals: 18,
    },
    {
      name: "BSCX",
      address: "0xc8ac47a392186689fe34a5db77df7736a58f734a",
      decimals: 18,
    },
    {
      name: "GINZA",
      address: "0x91c11e3c6eca322398fa8dd63576349574c90ff8",
      decimals: 18,
    },
    {
      name: "LBL",
      address: "0x9c276d041727515aec92a7000a6318bc77904981",
      decimals: 18,
    },
    {
      name: "CDT",
      address: "0xffb507fa942f2f136257c4fd60b13e029cf186e6",
      decimals: 18,
    },
    {
      name: "RBLS",
      address: "0x3c487fd178f87b81190d9b333b2f7d9c4e5c37fa",
      decimals: 8,
    },
    {
      name: "PBX",
      address: "0x3e475f8e750635fcd143c02322c39ca0768f7965",
      decimals: 18,
    },
    {
      name: "XCT",
      address: "0xd82182239aea4ba53145f717706540bd6582a952",
      decimals: 6,
    },
    {
      name: "ISP",
      address: "0x205bc28608e866bdd60bb4e6590c9c17a917999d",
      decimals: 18,
    },
    {
      name: "MGP",
      address: "0xc1abf615b21762df406c5095830879c563efa6ca",
      decimals: 18,
    },
    {
      name: "CPOOL",
      address: "0xe5b06faeae7b5a1420fbb6c433d5152724e9cfe0",
      decimals: 18,
    },
    {
      name: "DCS",
      address: "0x1dcea0e11abcddee5e7a8124a38a80fd602c35e7",
      decimals: 18,
    },
    {
      name: "BCOIN",
      address: "0xa67b74bedc220af2023643b7bd7809196afefdf9",
      decimals: 18,
    },
    {
      name: "WE",
      address: "0x8f98d54a11301e854d37abd97ec17a4139f095d9",
      decimals: 8,
    },
    {
      name: "MLN",
      address: "0x30df40f71d0261c8e646a5ba4518bfed290e6c3a",
      decimals: 18,
    },
    {
      name: "LOVELY",
      address: "0x8a927288963b55a2611c7e6a916f3243a58ccbcf",
      decimals: 8,
    },
    {
      name: "HOD",
      address: "0xd076a8d1e153d53ff6d268c4d58810ed553f1604",
      decimals: 18,
    },
    {
      name: "WARS",
      address: "0x374d0ec673e9d521c8b5bbb31c4936f1e43a221a",
      decimals: 18,
    },
    {
      name: "LACE",
      address: "0x251d368f25d538854e01a3d58e735ed3f609ea4b",
      decimals: 18,
    },
    {
      name: "PYR",
      address: "0x4eab14c72f337f5af70709a502247f8961c24adc",
      decimals: 18,
    },
    {
      name: "EBA",
      address: "0x0592ffe4d4004becca7fa816b72f21b2d6849def",
      decimals: 18,
    },
    {
      name: "LOWB",
      address: "0x430c9fe1fab9eb61e76fad0b6233b65c594872f7",
      decimals: 18,
    },
    {
      name: "GOO",
      address: "0xa2b31c5e1150045dff555382656640452c5cf39a",
      decimals: 9,
    },
    {
      name: "ONUS",
      address: "0x7bba0366b46c05a3949ec4d6678142840db54361",
      decimals: 18,
    },
    {
      name: "FISH",
      address: "0xc025b33ca0e47a3ed7a1f36ef4298c0cfd681375",
      decimals: 18,
    },
    {
      name: "KT",
      address: "0xa6f4b871b28fb4eeb84bc592d9d3a36d0aad9c58",
      decimals: 18,
    },
    {
      name: "MTA",
      address: "0x56e2c76d3b9a2e11406b6d9f3696e1287ebd7e5a",
      decimals: 18,
    },
    {
      name: "$STARLY",
      address: "0x3e5ef7c2524762ec8ef2c2b3dee914724d636179",
      decimals: 8,
    },
    {
      name: "CHARGE",
      address: "0x61cb5c0911d443145cd3d40488b30cc58112592c",
      decimals: 18,
    },
    {
      name: "POG",
      address: "0x66cfa2c7f2fe9e66157477df00547b3c846c3789",
      decimals: 18,
    },
    {
      name: "DFAI",
      address: "0x003211507eb665fc6f264a1d1514afa10fccf5e5",
      decimals: 18,
    },
    {
      name: "UFT",
      address: "0x52a43c23428cb862d87b56d8a77f31605bffb3bf",
      decimals: 18,
    },
    {
      name: "ATPAD",
      address: "0x23d35b1d186fd4ed9d4b233546958911b586dc2e",
      decimals: 18,
    },
    {
      name: "CCAR",
      address: "0x7607802da11b474c6d20260a8f636b034ffe950d",
      decimals: 18,
    },
    {
      name: "FINIX",
      address: "0x8cb555bd6dc33d51596360d3ea84e4eab12213d8",
      decimals: 18,
    },
    {
      name: "DFX",
      address: "0x95401f354c960790e4f9f81f9b35ba89845cda52",
      decimals: 18,
    },
    {
      name: "CSS",
      address: "0xcf871b54c4c96188d2bce979d4077dc48bddf51d",
      decimals: 18,
    },
    {
      name: "ARZ",
      address: "0xca77a47d3a19828f5e53066bbb575cadd2f55c82",
      decimals: 18,
    },
    {
      name: "SHOPX",
      address: "0x1016feb604e91513d7f64c6ee5ac7adcab0a9f25",
      decimals: 18,
    },
    {
      name: "MFO",
      address: "0xe9280a4529ee43c78d64bcfeaabbe77adc9d2aef",
      decimals: 18,
    },
    {
      name: "ZEC",
      address: "0x3a86825290984efae6c10553384aa4721c41f619",
      decimals: 18,
    },
    {
      name: "ITAM",
      address: "0x2333b08517874a517a4fcbd8bb3709c0b08447b3",
      decimals: 18,
    },
    {
      name: "API3",
      address: "0x4e577e183b39f319c0d781b1d64c076daf0b519a",
      decimals: 18,
    },
    {
      name: "CLIST",
      address: "0x66291010444eee505e74e324719f7ae6573305ab",
      decimals: 18,
    },
    {
      name: "ONX",
      address: "0x2354cbdded4db21e98a75f90afc3f0d811b39008",
      decimals: 18,
    },
    {
      name: "RARI",
      address: "0xa790677541e6335a8bb0eca8917b65749cdab602",
      decimals: 18,
    },
    {
      name: "OKLP",
      address: "0xcdbad43ac3a0f89e17cadfb57c5b363d36b456b4",
      decimals: 18,
    },
    {
      name: "NSURE",
      address: "0x7375ed19ec622fb6b1ef8ad1924e113eca64ed42",
      decimals: 18,
    },
    {
      name: "LUCK",
      address: "0x054550fca2dd644e5f89545e357cc39dcae903fc",
      decimals: 18,
    },
    {
      name: "CHD",
      address: "0x49c6a91c5bec5eee03144232a84e7a24950f285d",
      decimals: 18,
    },
    {
      name: "KDG",
      address: "0xf7b603f07736bc16cf20b59690e76842efbce809",
      decimals: 18,
    },
    {
      name: "PGALA",
      address: "0xaa585455f4086ae505e5f365cdf53989138bcbc6",
      decimals: 18,
    },
    {
      name: "MOONEY",
      address: "0x75d77dc1b8d55c1f1a57408d63a3cce5011a1a65",
      decimals: 18,
    },
    {
      name: "TOK",
      address: "0x038912cde11228d148cbef8b931db1379c4f2477",
      decimals: 18,
    },
    {
      name: "MEX",
      address: "0x8124a2bb81345a71d4a02a6e7bee739c57212d41",
      decimals: 18,
    },
    {
      name: "BHAT",
      address: "0x947a8b25915f60031cf5da19099acef0c1916453",
      decimals: 18,
    },
    {
      name: "RIDE",
      address: "0x51aa6d703e1b8ba328acb2199a3acfa63cafb195",
      decimals: 18,
    },
    {
      name: "ITHEUM",
      address: "0x09af51e5a41521f9cfd1669cb19b6144cde6b094",
      decimals: 18,
    },
    {
      name: "ZPAY",
      address: "0x515ee67fd9a33d7ed89ccedc38d0a73600716cad",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x012fe87d45e5569bcf3793c727290dc3d299ab7e",
      decimals: 8,
    },
    {
      name: "NOTE",
      address: "0xb6c71f87912eddc0fcc2d967f9b48b60a0b85bb4",
      decimals: 18,
    },
    {
      name: "AZERO",
      address: "0xa30022a37ab100e42cfc503eef08ff7eea2247eb",
      decimals: 12,
    },
    {
      name: "NEST",
      address: "0x769c9eb0a169dc5709562d87b5e45a720034f588",
      decimals: 18,
    },
    {
      name: "KAP",
      address: "0xd17cf7063fc6cc359dd43910615745e390e2f1d4",
      decimals: 18,
    },
    {
      name: "CAF",
      address: "0xa510fb72fa76c13b2e0af836a1aa5cac345a7660",
      decimals: 18,
    },
    {
      name: "WTO",
      address: "0xff91f0f459ad4c14171a66212682e50aae37cdfb",
      decimals: 18,
    },
    {
      name: "AMA",
      address: "0xf78eeebe1094b2fa1630c82822edb4dd191a3e5d",
      decimals: 18,
    },
    {
      name: "WMX",
      address: "0xa40dc26b38d8ddcbba97c2646954948de1001736",
      decimals: 18,
    },
    {
      name: "MYTH",
      address: "0x2d2c1d25d00c8eb012cb3debb77c31e155023d75",
      decimals: 18,
    },
    {
      name: "LCT",
      address: "0x16ddbbf5abb9c1ce2228c406c2c7b45cadb6f0e7",
      decimals: 18,
    },
    {
      name: "$SNOW",
      address: "0xaac4cdc6eea1184cf1af192f324e1f0264cef93a",
      decimals: 18,
    },
    {
      name: "HOOP",
      address: "0x71bc51f1060550c71c1a4dce0056fa1e7e71db0e",
      decimals: 18,
    },
    {
      name: "KIRA",
      address: "0xb218a212830b31f7b6bb83162256ab27048049f0",
      decimals: 8,
    },
    {
      name: "GDE",
      address: "0x42fb594c0d409ef9e1f5dc237bd336e11d657456",
      decimals: 18,
    },
    {
      name: "CO",
      address: "0xb289023eddafbcfde5d687bbd4760c27b21b4ef0",
      decimals: 6,
    },
    {
      name: "BNBP",
      address: "0xf73007368a535b5bea6e57b734e9cd4b1e4f3699",
      decimals: 18,
    },
    {
      name: "SGS",
      address: "0x6107611bfcd5d666bd175771c8fc5807abc76926",
      decimals: 18,
    },
    {
      name: "SRG",
      address: "0x7cbc1f5430470d5d5299c84db9955281f5c9ea0f",
      decimals: 18,
    },
    {
      name: "UCON",
      address: "0xa990b3c528a7062ebcbca0baf7304d34cb470932",
      decimals: 18,
    },
    {
      name: "KSN",
      address: "0xd808e57a85931d9ead0dc454629d28e28dd604e6",
      decimals: 18,
    },
    {
      name: "AVA",
      address: "0x99cd479d63edc8274139c7b5d931db30cc345d00",
      decimals: 18,
    },
    {
      name: "VIDT",
      address: "0x26c31c77aa2003f091e81212eb94c1c3777e8ae0",
      decimals: 18,
    },
    {
      name: "WIGO",
      address: "0x045c00d4606b17381befe3f353e6b8fd3f0ee058",
      decimals: 18,
    },
    {
      name: "BFR",
      address: "0xd17f7801721a0a48d1d673467075237f0964edd3",
      decimals: 18,
    },
    {
      name: "MCHC",
      address: "0x6d935645f0ff0a0cd06826b6ded69476f3d10c21",
      decimals: 18,
    },
    {
      name: "UMAMI",
      address: "0xa85d5e211a9b47986d54e4e7ce856afb8e0dbbf7",
      decimals: 9,
    },
    {
      name: "DDF",
      address: "0xf51754fc6c456850dd60164506a5d1e759a66d91",
      decimals: 18,
    },
    {
      name: "OKG",
      address: "0x001e135a0a7063b615ede2eafd040bb236caadf3",
      decimals: 18,
    },
    {
      name: "FAB",
      address: "0xf628dd2b3af1a3f52c5b374deea18dfc050f71b0",
      decimals: 8,
    },
    {
      name: "SYC",
      address: "0x9bd25fd25011ee7cc682eb3254edbbd0646c851e",
      decimals: 18,
    },
    {
      name: "CBSN",
      address: "0xb5bbfc4eb41ff1dbfb668af708d51a728aa18286",
      decimals: 18,
    },
    {
      name: "PFI",
      address: "0x79d6442ab1cec0416a314e3605d47ea36273fb0c",
      decimals: 18,
    },
    {
      name: "SIFU",
      address: "0x84e756436fe9942101ba2c773005c4b152fc30df",
      decimals: 18,
    },
    {
      name: "UNIDX",
      address: "0xaa7a2dcb4d6b3b63906beb41c6a3132039b2602f",
      decimals: 18,
    },
    {
      name: "BTRST",
      address: "0xfbf317ff9e2b45ccb66b860a38fe59a2f4817c20",
      decimals: 18,
    },
    {
      name: "OSQTH",
      address: "0xcdf76b5995d4b7e6b332fb03561cd25875f8817e",
      decimals: 18,
    },
    {
      name: "PAR",
      address: "0x22af4eabb29d5f647eb0eb114ef3735d81873209",
      decimals: 18,
    },
    {
      name: "LQTY",
      address: "0xa667ae5469ce181a502c8c8da47fdd9a9769f023",
      decimals: 18,
    },
    {
      name: "GNO",
      address: "0x2f9a17f028d8b21f54910d0b59c1aba9b11b5cdf",
      decimals: 18,
    },
    {
      name: "DOLA",
      address: "0x28ad71d26ae543b20aa26390d8167f066a956117",
      decimals: 18,
    },
    {
      name: "GPO",
      address: "0xbdb7aa796750c442cf773147cecb30251902fde1",
      decimals: 18,
    },
    {
      name: "FUN",
      address: "0x19fb74f9569567882025103c61542a5c9c76d32b",
      decimals: 8,
    },
    {
      name: "PLSD",
      address: "0x216ac4936a9b4764873f21132d56cb33e80be11e",
      decimals: 12,
    },
    {
      name: "MLP",
      address: "0xb62c859ccd2f9f9adf7c5d232f0d69553434f7fe",
      decimals: 18,
    },
    {
      name: "RAE",
      address: "0x34c64d6b95c1fc4724196b57464d10616c53c293",
      decimals: 18,
    },
    {
      name: "BUY",
      address: "0x5fa547cae92f9e6eff8e85129f09e858221eaac7",
      decimals: 18,
    },
    {
      name: "PIXEL",
      address: "0xf8cfc87f08084dec4c0761a50b7b5520e8857388",
      decimals: 18,
    },
    {
      name: "NEXO",
      address: "0x212f3792ca18c8d3264d1c5ba4827c4d413a53dd",
      decimals: 18,
    },
    {
      name: "3CRV",
      address: "0x4b2f01540d06d4edacb87d990eac3ec290b3b549",
      decimals: 18,
    },
    {
      name: "MDT",
      address: "0x1c129cb1c391b9ba482c09dcdbc2e755d08c2407",
      decimals: 18,
    },
    {
      name: "MVRS",
      address: "0x505295f38ed22b517f975c7ac42631ac4caf9be2",
      decimals: 18,
    },
    {
      name: "MET",
      address: "0x8b513488aa1ef67c505d181830fa9726ef6be09b",
      decimals: 18,
    },
    {
      name: "QRDO",
      address: "0x60a2f01d7f2b2188a5cbfd142b7e71607e195231",
      decimals: 8,
    },
    {
      name: "ZZ",
      address: "0x22ec616420043593786ac43c295ed664323a50ea",
      decimals: 18,
    },
    {
      name: "APED",
      address: "0x7952465730f2ca6e9d41752d8c48d49b0793d541",
      decimals: 18,
    },
    {
      name: "JEUR",
      address: "0xaafcdb880821454aaf0034e65d34f6c38446a36d",
      decimals: 18,
    },
    {
      name: "WOOL",
      address: "0x9bc39173db4f0e7effec680f5146b7e1f568da56",
      decimals: 18,
    },
    {
      name: "THN",
      address: "0xa70fffb8ade5bad7c8edb9a834350612badaac9f",
      decimals: 18,
    },
    {
      name: "NEXT",
      address: "0x2ff3466276ca399debde725ed9f6485af01b752f",
      decimals: 18,
    },
    {
      name: "BTRFLY",
      address: "0x867a3d6d346e3da61bfce54455c0076664ce60c1",
      decimals: 9,
    },
    {
      name: "PDT",
      address: "0xeda4a528358b891b705c0818c5aab19b86db24f8",
      decimals: 18,
    },
    {
      name: "XCHF",
      address: "0x544823fff1f1b6cbd193ca90eac9e88633cb747f",
      decimals: 18,
    },
    {
      name: "BSGG",
      address: "0x2bd37062ea88bb629a741ffffa77c5c7bd0b6a21",
      decimals: 18,
    },
    {
      name: "MVX",
      address: "0xe9fe0e90eb8568afc3e633384fcd5387a3a465a6",
      decimals: 18,
    },
    {
      name: "POWR",
      address: "0x4c54fb6482bc0f161ed148f73855ac56809c2712",
      decimals: 6,
    },
    {
      name: "HUNT",
      address: "0x05fb22c16d2c69b82946641550e6c8c201ac4141",
      decimals: 18,
    },
    {
      name: "NVIR",
      address: "0x0b0e9915696f01d85010059cf29b68adacf94158",
      decimals: 18,
    },
    {
      name: "VITA",
      address: "0x09d878cbd05ce0d67c0550b84d85ca443a597dc6",
      decimals: 18,
    },
    {
      name: "VELO",
      address: "0xe7585d1c63c0a99868d610a224932e461dd6e6a9",
      decimals: 18,
    },
    {
      name: "ALGB",
      address: "0xa7c97e7818ce7aa043800f03657451d1a69519ad",
      decimals: 18,
    },
    {
      name: "GEL",
      address: "0x878c9ced87652b4d6b6e916f6fa14485abb57e70",
      decimals: 18,
    },
    {
      name: "WSI",
      address: "0x3dd35aa88a50d7d1a2e8b61876c412e61232d61e",
      decimals: 18,
    },
    {
      name: "EUL",
      address: "0x96d5b634de94c699b6bd8b1f1a6581a7b796de6a",
      decimals: 18,
    },
    {
      name: "LCX",
      address: "0x9b581e08d8f11b92bfdcc4a59fa3d802935397f4",
      decimals: 18,
    },
    {
      name: "MGN",
      address: "0x68d15517c36081e25b2dda757d70366a794e5117",
      decimals: 18,
    },
    {
      name: "TCR",
      address: "0x632d473eb0b207cd60ccdb9f9db527b2fb3b4643",
      decimals: 18,
    },
    {
      name: "RSS3",
      address: "0x0dde9527670c91f6ac39fd3ade83d8ca0ba95bd7",
      decimals: 18,
    },
    {
      name: "TEMP",
      address: "0xe881ae39ec6741db13d74ea4f311acb240b2357b",
      decimals: 18,
    },
    {
      name: "ORC",
      address: "0x595b8654061d88cbfab954acccff1c0dbf84ac96",
      decimals: 18,
    },
    {
      name: "XYO",
      address: "0x1b9ef11a1ce4e5e086dbcb204dc3cb53c805dd77",
      decimals: 18,
    },
    {
      name: "FLOOR",
      address: "0x755e26152260cefd1215171a7374b456c8033ced",
      decimals: 9,
    },
    {
      name: "LORDS",
      address: "0x7a6d4143111ca6d09dfa7a3840ac89ca6b6cd413",
      decimals: 18,
    },
    {
      name: "BOBA",
      address: "0x5648105a577e5576e6193f2886b277b12ddd5ac6",
      decimals: 18,
    },
    {
      name: "DC",
      address: "0x9797cea99ec9406919817dfef98ddc215e24977a",
      decimals: 18,
    },
    {
      name: "STKK",
      address: "0x24677bfbdaa9a79a255db24976072152f2f2b434",
      decimals: 4,
    },
    {
      name: "MNW",
      address: "0xe5255505d5be013fd7a15a8635bc58cd0bc12f50",
      decimals: 18,
    },
    {
      name: "MAXI",
      address: "0x9cf1218c6107e69e156ea6d9e5221d0036dc7b46",
      decimals: 8,
    },
    {
      name: "NCR",
      address: "0x5858a0663756f2d82a687247a92b6a83c803bb55",
      decimals: 18,
    },
    {
      name: "QSP",
      address: "0xed5a5d78b18ae7043d2772f46c3af476fea3a598",
      decimals: 18,
    },
    {
      name: "FOAM",
      address: "0xe986c317f0f74b5fdb5d3a179bafb84b4a50ff7f",
      decimals: 18,
    },
    {
      name: "GLF",
      address: "0xdf2bb6f69ee621074ebd9b55248f1a9418ee59ea",
      decimals: 18,
    },
    {
      name: "X3TA",
      address: "0xcd94bf0ceb29fb43bcef317d03f0a61ecca6aec5",
      decimals: 18,
    },
    {
      name: "CTSI",
      address: "0x835e7b794a8a0e5dbb240800af40f704244ae3a7",
      decimals: 18,
    },
    {
      name: "CRI",
      address: "0x77c86f866334e92cc7c0f431c26289545163a083",
      decimals: 18,
    },
    {
      name: "YLD",
      address: "0xc1219bca6484a2b0db19b7027f8922dcefc6efa1",
      decimals: 18,
    },
    {
      name: "L2DAO",
      address: "0xd8a6201226c8feb158ecc2eb1ad51ba3cbca6ff4",
      decimals: 18,
    },
    {
      name: "OPIUM",
      address: "0xdc082dd52d4a63e6bb1a87c6e2201dfebd93bf86",
      decimals: 18,
    },
    {
      name: "BRZ",
      address: "0x86e22679951bf71bd575c7044dddd20ba33f173e",
      decimals: 4,
    },
    {
      name: "OVR",
      address: "0x00e6a62736fb45c193670a9d9f3b859f58b53d04",
      decimals: 18,
    },
    {
      name: "TEMPLE",
      address: "0x637bf3680639fe1f6a53adeb121d3e895793dfac",
      decimals: 18,
    },
    {
      name: "SYL",
      address: "0xeced86067a280e272757214cb06be9507c19babe",
      decimals: 18,
    },
    {
      name: "PHTR",
      address: "0xa6270c5113c8c0112b72a2db6749378b8b6e4b3d",
      decimals: 18,
    },
    {
      name: "XDEFI",
      address: "0x9fdb378663aff764c53f1faa11d9782c81821a6a",
      decimals: 18,
    },
    {
      name: "DCAR",
      address: "0x97e98ce77e30e5bf4e830389f883179d6238eb84",
      decimals: 18,
    },
    {
      name: "SROCKET",
      address: "0xf45b8e7bd943f87e76c077552813ab931d9f4005",
      decimals: 18,
    },
    {
      name: "PLU",
      address: "0xcece836c436ddf8d7d347c01e68a5fc45209bc1d",
      decimals: 18,
    },
    {
      name: "DTH",
      address: "0x59984963b923c13f2be6de4278458df0c0a3c222",
      decimals: 18,
    },
    {
      name: "FPIS",
      address: "0xd3258c3439bb57a11c108298fe81b6d53d43982b",
      decimals: 18,
    },
    {
      name: "FANZ",
      address: "0x02ec1b518c56d42b4a091c4f7178936ddea5501b",
      decimals: 18,
    },
    {
      name: "ARIA20",
      address: "0x99348c5551d0e7c9bc3ae95fd73eca527233ea24",
      decimals: 18,
    },
    {
      name: "PAL",
      address: "0x6ecd0ccf8a79924ce58d64f88ddc02cc4ebf1789",
      decimals: 18,
    },
    {
      name: "MECHA",
      address: "0xcb5fcbca98bd7a5a3faa7dafbad202550fab420d",
      decimals: 18,
    },
    {
      name: "KROM",
      address: "0xd3a35c045e2883874567c46584780963281a973e",
      decimals: 18,
    },
    {
      name: "MMG",
      address: "0xa7156e631e5f37c7ca4eef0e20bea9098afcc369",
      decimals: 6,
    },
    {
      name: "TOWN",
      address: "0xaec95397f41f641ab6d3c4b3df83456483a7aeb0",
      decimals: 8,
    },
    {
      name: "B2M",
      address: "0x25df844bb8ce8bfd2a43a897c957451ab42f960b",
      decimals: 18,
    },
    {
      name: "BIOS",
      address: "0x8f3bef386f0758bdd8d976df0d16c6f8e7eb3b3c",
      decimals: 18,
    },
    {
      name: "ZEUM",
      address: "0x8114ca19ddb7d24b50445d902da6ba540e4fa1de",
      decimals: 18,
    },
    {
      name: "HOP",
      address: "0xdb67d8d4ec31c14062588c6b989c2b30dae435d6",
      decimals: 18,
    },
    {
      name: "SSV",
      address: "0xbab8ab3538ab357431a73951bf154cb10b0b935c",
      decimals: 18,
    },
    {
      name: "VISR",
      address: "0x4fccf3adc376b3cc7ecf4f2684ed2b81a59a37f7",
      decimals: 18,
    },
    {
      name: "QDT",
      address: "0x6307cc5fbc2079dee1aaf69ea802d5b38fb2eb6a",
      decimals: 18,
    },
    {
      name: "MPWR",
      address: "0x396317964744b3a6a89677de7e1a36b756c9238a",
      decimals: 18,
    },
    {
      name: "TXT",
      address: "0x4ad0d5f3cf69a4fdef15aa70f4ab3754662d0326",
      decimals: 18,
    },
    {
      name: "LPT",
      address: "0x9b31e7fbaddbaf41848c5bf163e995539abbb72f",
      decimals: 18,
    },
    {
      name: "JASMY",
      address: "0xb32ef4fc55707af5714d36e69381b30c29343530",
      decimals: 18,
    },
    {
      name: "PILOT",
      address: "0x715e07b7404688365d7f19d3da40a5becaeed935",
      decimals: 18,
    },
    {
      name: "SONNE",
      address: "0xc270c87b1f3d7f18a1673c5c737226244af890d5",
      decimals: 18,
    },
    {
      name: "RUX",
      address: "0x8d6d05d4e3571e732ab316de48e0402200420c5d",
      decimals: 18,
    },
    {
      name: "KITTY",
      address: "0x47c757714f9b7e60ae994f875611635c1d0d9065",
      decimals: 18,
    },
    {
      name: "AELIN",
      address: "0xa93815b681db5cd3c0cf3e171f431cf4f921c541",
      decimals: 18,
    },
    {
      name: "TRAC",
      address: "0x75cfa5afce7d8cb9721300a0ab37ab382c10bdfe",
      decimals: 18,
    },
    {
      name: "PPAY",
      address: "0x91138c0476a8dd2064d277acc5dc1001a8534c7e",
      decimals: 18,
    },
    {
      name: "GF",
      address: "0x2f447f497fe6aaca0dabbff13b8ebd90b38ffa9c",
      decimals: 18,
    },
    {
      name: "MTO",
      address: "0xf75bcfe30da38d62c668e5733add3a6ad3917059",
      decimals: 18,
    },
    {
      name: "TPT",
      address: "0xfdd52dd6b25428053a693a26c879c33c63650e5c",
      decimals: 4,
    },
    {
      name: "CHO",
      address: "0xa929c1cdf061cf81f91e9a1bf5bd51668625b25b",
      decimals: 18,
    },
    {
      name: "PRBLY",
      address: "0x5fee1450071cec9d4652860117f5432cb6929899",
      decimals: 18,
    },
    {
      name: "PRIMAL",
      address: "0xc34f846e8c37e8820151768a68dc24ad1104ee54",
      decimals: 18,
    },
    {
      name: "POLK",
      address: "0xd7ae4f75afc7a7bef5864e61709b55532d9e75b4",
      decimals: 18,
    },
    {
      name: "SILO",
      address: "0x905a3538988902223c9ea2778817fe29919f8f17",
      decimals: 18,
    },
    {
      name: "POW",
      address: "0xd0f911342e2452afd725ed49d0a10f2933f76451",
      decimals: 18,
    },
    {
      name: "BANK",
      address: "0xdbd37c6fd2cf9c9f74e7069cbfa43b3e9bed84fb",
      decimals: 18,
    },
    {
      name: "GNS",
      address: "0x35985fa12fe79bbdd734c371e3b165e9e2bfde0f",
      decimals: 18,
    },
    {
      name: "RING",
      address: "0x3a5f188588732310d5868d41f05bc779ef5987b9",
      decimals: 18,
    },
    {
      name: "METANO",
      address: "0x4483605350f6305914e3a8afb1edb202301a9f52",
      decimals: 18,
    },
    {
      name: "PHCR",
      address: "0x1a5a3ec50f234e0a7647124d59015c3d1b154e31",
      decimals: 18,
    },
    {
      name: "SUTER",
      address: "0x4a34da3d2ca897612bc8a6083cc08019a0117b47",
      decimals: 18,
    },
    {
      name: "DHT",
      address: "0x8cab2e77782daa4e7bfd839ae364c64ee1036209",
      decimals: 18,
    },
    {
      name: "GCOIN",
      address: "0xed882bfc57c9cc5ab9fa4a8664a36bd5720a635c",
      decimals: 18,
    },
    {
      name: "RVP",
      address: "0x2829953b550b2d31988ff8e328ef3105ee57589c",
      decimals: 18,
    },
    {
      name: "ACQ",
      address: "0xcde75fc0d346fdf7b4488db3a713f92366d2126c",
      decimals: 18,
    },
    {
      name: "MOV",
      address: "0x79cf81e1be1d461a09a51cbb8fbee148382d99bf",
      decimals: 18,
    },
    {
      name: "BTP",
      address: "0xbe3ec87fc9449e94a82653c51ca7b62d324c08b3",
      decimals: 18,
    },
    {
      name: "OOKS",
      address: "0x9c0f0d5a3bff37d3174bb5b1f41727582a7a6f50",
      decimals: 18,
    },
    {
      name: "CXO",
      address: "0x105cff69b2096e5dd518b18e9f75fd3229b10053",
      decimals: 18,
    },
    {
      name: "WAMPL",
      address: "0xe10c8bd9fd63578cb893dd5fcec7290556bd3aa3",
      decimals: 18,
    },
    {
      name: "TKING",
      address: "0x3726d0d0c593a0abfa98df500f3de750043319f1",
      decimals: 18,
    },
    {
      name: "ADDY",
      address: "0x6a16093a92e731d9df98a64f7f9673a8eeb3dd27",
      decimals: 18,
    },
    {
      name: "HOPR",
      address: "0x7ccc5824e4eabecf865807fe0c67bb9c2e4ffd4d",
      decimals: 18,
    },
    {
      name: "EL",
      address: "0x5893e1da3c198bc3d6c212122d2b83d93c479ca3",
      decimals: 18,
    },
    {
      name: "UNV",
      address: "0x8e00c1242d5f7dfa5ed76743fef1e71480d8a132",
      decimals: 18,
    },
    {
      name: "ANKR",
      address: "0xcb4e724aeaa555b8ea5c52128520829015da14a7",
      decimals: 18,
    },
    {
      name: "CP",
      address: "0x76b3bcff1c9d8f0649db0ffef4b50b1ad24179c5",
      decimals: 18,
    },
    {
      name: "GGTK",
      address: "0x656d4f957f0d2c782c5bb32b2558bd1a37fdc01a",
      decimals: 18,
    },
    {
      name: "SKEB",
      address: "0x0e3a26bae0e1f41dc2edd4d6236040088b5a7428",
      decimals: 18,
    },
    {
      name: "ETX",
      address: "0x230680ec903fb6aff3f4c770351e1fe1fa4eb9ba",
      decimals: 18,
    },
    {
      name: "AST",
      address: "0xa9ec9f2ecf3e51c9b13588c3bd85ba20c0f97108",
      decimals: 4,
    },
    {
      name: "BOSON",
      address: "0x74517b1d966ab9bd5083d2f96c9c55d05881c52f",
      decimals: 18,
    },
    {
      name: "NATION",
      address: "0xb829ac1d03b6fdcad963715beacc3a5a22092ecc",
      decimals: 18,
    },
    {
      name: "STND",
      address: "0x2a5eb600d03fb3c20c835d3d969cf8b64ab80cee",
      decimals: 18,
    },
    {
      name: "OCTO",
      address: "0xabc740b9fb382306a0efeeed7c80ee327cdb0e15",
      decimals: 18,
    },
    {
      name: "COVAL",
      address: "0x61285794c41bb5e6ecac11fd2df5309c89a3a1c1",
      decimals: 8,
    },
    {
      name: "ZED",
      address: "0x89513add6366664c84e9441a4681a0c3269047ad",
      decimals: 18,
    },
    {
      name: "BXX",
      address: "0xa8719c5b346022c02af9c3b567d638f7907f547d",
      decimals: 18,
    },
    {
      name: "NYAN",
      address: "0x5e5f448e282586892667370d166a16e26dcfe24d",
      decimals: 18,
    },
    {
      name: "AMON",
      address: "0xf9650568337060cb7be725855599f98de875ab38",
      decimals: 18,
    },
    {
      name: "UMAD",
      address: "0x36f4553a51c46ee71d6c97232be43a8bfe1746aa",
      decimals: 8,
    },
    {
      name: "TOKO",
      address: "0x7f8c7cabac5cd31452df1b551608f923e6b94730",
      decimals: 18,
    },
    {
      name: "STEMX",
      address: "0xc8ea1bfd271a9dba5945002e1482f6ca729c09e2",
      decimals: 18,
    },
    {
      name: "UBEX",
      address: "0xd83c5f79cb235d328143c9081c217d94f8d8d316",
      decimals: 18,
    },
    {
      name: "ARCX",
      address: "0xac752335ccec9eefba36fdcc7b9599345234303b",
      decimals: 18,
    },
    {
      name: "FKX",
      address: "0x8a38196f7af12b800ba7cf39eca784e31302aebd",
      decimals: 18,
    },
    {
      name: "VGX",
      address: "0xd7599be7d91e16ce408cffa3aec7a878cf7957e3",
      decimals: 8,
    },
    {
      name: "ARTM",
      address: "0x235908282f810f7e39b7813adb89d915582ae1f2",
      decimals: 18,
    },
    {
      name: "SNTVT",
      address: "0x0816a97908f9a6d06a16ce435f790bcbdfcd1e7b",
      decimals: 18,
    },
    {
      name: "IGUP",
      address: "0x1d18b3c411e296ffe0cf36cd3dd2504f4e24e4d0",
      decimals: 18,
    },
    {
      name: "VDR",
      address: "0xd8c80db5b656bb22b18e8bb44b57284e3eef46ab",
      decimals: 18,
    },
    {
      name: "NCT",
      address: "0xa4738b4212bedca026c78d0c283d45f5b30384f3",
      decimals: 18,
    },
    {
      name: "ARGO",
      address: "0x65d6c3ee4934705aca37d10ddf0fbd074acad654",
      decimals: 18,
    },
    {
      name: "GRID",
      address: "0x035e3128e62c4d215c2935c3facfa3f26209470d",
      decimals: 12,
    },
    {
      name: "DEPAY",
      address: "0x145b777eaced9f75359c210bf390db00419f9145",
      decimals: 18,
    },
    {
      name: "RBIS",
      address: "0x8508ddc60c70dab489305796783676e09b6211ca",
      decimals: 18,
    },
    {
      name: "ROGUE",
      address: "0x12446451e0725ca1f2d9f0be9bef789a3bc3c701",
      decimals: 8,
    },
    {
      name: "NU",
      address: "0x47afca577a4e5c8815d87eb3e4a1e32cabc04716",
      decimals: 18,
    },
    {
      name: "ALEPH",
      address: "0x7bae435dfb28506f048a2b82d32715af4dca4bba",
      decimals: 18,
    },
    {
      name: "NINO",
      address: "0x99e48bea06752e6f275e3a9d64205e18fd01516d",
      decimals: 18,
    },
    {
      name: "CAST",
      address: "0xa6a16a8925514254dac161c9e60cfb8fd8a15c72",
      decimals: 8,
    },
    {
      name: "QUAD",
      address: "0xffe8aba639eb9d5dd97a8412f82a39af44bbe4d4",
      decimals: 18,
    },
    {
      name: "UTU",
      address: "0xd8c5472ac750f9fb27fe5dd93d6f5b860edbf11e",
      decimals: 18,
    },
    {
      name: "TGT",
      address: "0x1b7f185b68937d077b48cefbde42d3d0c45105d0",
      decimals: 18,
    },
    {
      name: "BENT",
      address: "0xfa93a6f3e8e4506c6cb6e6f14bb9afca2f017b90",
      decimals: 18,
    },
    {
      name: "DSCPL",
      address: "0x294b312d4488ad50833b1a7103ee3f99add7ff8a",
      decimals: 18,
    },
    {
      name: "SOCKS",
      address: "0xb5020f030c037acb4b6633fcb94c0772c0688214",
      decimals: 18,
    },
    {
      name: "FOREX",
      address: "0x8b323c58ec5ae5d0106df9a0a7f0245b0e1eb374",
      decimals: 18,
    },
    {
      name: "THALES",
      address: "0x401137375757fd9e1fdffd2035a4905282dbfa50",
      decimals: 18,
    },
    {
      name: "METO",
      address: "0x05e4d793cf49a852d4bcd3bab63d6a6654cf94fc",
      decimals: 18,
    },
    {
      name: "VXV",
      address: "0xc551efea02cf85d57134d5816314e3e36846e560",
      decimals: 18,
    },
    {
      name: "VAI",
      address: "0x0b7e24cb474c6606d4dee5d501ec631adff1531f",
      decimals: 18,
    },
    {
      name: "SATT",
      address: "0x1855303daeb5ac548dca11c75dd38ad510e316ce",
      decimals: 18,
    },
    {
      name: "XPX",
      address: "0xcc685320e44d19cfc1014a5853e4f7ac310cf075",
      decimals: 6,
    },
    {
      name: "WRLD",
      address: "0x693dd8c83e3efcc527251914c413646b157da5ba",
      decimals: 18,
    },
    {
      name: "OKSE",
      address: "0x2f23823e3ff84807d4250139c86a330fe2f2be04",
      decimals: 18,
    },
    {
      name: "ZKP",
      address: "0x3f48a91d87e20ecfbc443d244f130baf377a4354",
      decimals: 18,
    },
    {
      name: "KCT",
      address: "0xd00423fc034292a7326abdeede4cd39e99a2a027",
      decimals: 18,
    },
    {
      name: "WCK",
      address: "0xe133e75345e31bd5959fb7ebf5b4f787afea5f1a",
      decimals: 18,
    },
    {
      name: "COGI",
      address: "0xd812352a7493f887120e6f61c9630fc5caca3fcc",
      decimals: 18,
    },
    {
      name: "WCFG",
      address: "0x3884332acf32742522045f41129f5fd6a7e7d1a5",
      decimals: 18,
    },
    {
      name: "MIMATIC",
      address: "0x251a055911992b7183e49e2f9dbf92b848ff3d6f",
      decimals: 18,
    },
    {
      name: "NUSA",
      address: "0x062231fe80f4de3d88a88ab4d50383da06b4b789",
      decimals: 18,
    },
    {
      name: "CZATS",
      address: "0xdd62059e5278c7f82e55681859bfc9794c652c7a",
      decimals: 18,
    },
    {
      name: "RIO",
      address: "0xdb9659520581989bbdd3e492ddf2ecd12f268573",
      decimals: 18,
    },
    {
      name: "ALCAZAR",
      address: "0x83dd066e80dce88fb8454155b058f85fdc958732",
      decimals: 18,
    },
    {
      name: "CTT",
      address: "0x87f953cb66101064de11e4a4080fb87bb86568ff",
      decimals: 18,
    },
    {
      name: "STB",
      address: "0x3afb9e4ae3ad5de65b914cf652a1f6665ffb1493",
      decimals: 18,
    },
    {
      name: "SHIDO",
      address: "0xc1de3b2e04991700c99754e817819c7c6f4f2918",
      decimals: 9,
    },
    {
      name: "PSI",
      address: "0x4743dedddda85b885b571b6f8bbb9e8f7afd532d",
      decimals: 9,
    },
    {
      name: "DBL",
      address: "0x8b5cb4ace31a01c38330d94afd18aa092d780fd8",
      decimals: 18,
    },
    {
      name: "BRC",
      address: "0xc29b7a3da1971da3c462847f4c97ed25f5889fca",
      decimals: 18,
    },
    {
      name: "COMBO",
      address: "0xa480a57e0b919908f908fe13f2afddc7908a14d9",
      decimals: 18,
    },
    {
      name: "DDX",
      address: "0xdbbd9504525256ee27fd4df46176ce5b1d130756",
      decimals: 18,
    },
    {
      name: "VELA",
      address: "0xb8f2824050b3c9b83e2b0c538313f26af441b5d7",
      decimals: 18,
    },
    {
      name: "MOETA",
      address: "0x9b9bbd6f2db12a301a9bb1e1c9e76fcc65c1010d",
      decimals: 9,
    },
    {
      name: "BLUR",
      address: "0xa7ccf5a0c25fe64b185c0995439b267e460139c0",
      decimals: 18,
    },
    {
      name: "GRAIL",
      address: "0x5b1b5cf256d1b0dffa453b5e39604fafb5d3e163",
      decimals: 18,
    },
    {
      name: "LFG",
      address: "0xf1ae83317e07f634b7d21903aff31067cf322dd0",
      decimals: 18,
    },
    {
      name: "HIFI",
      address: "0xfd688d1b47cfda443f3ef3445021d44badd767c5",
      decimals: 18,
    },
    {
      name: "MMY",
      address: "0x92597c4c920562fb35a66d796d2b8f15aec6b804",
      decimals: 18,
    },
    {
      name: "HWT",
      address: "0x83929cdca20cdc92f5191719f73d8195bd4525b3",
      decimals: 18,
    },
    {
      name: "SHIK",
      address: "0x27c5471e5ca699860712d9b29b4f4fbb2babd06a",
      decimals: 18,
    },
    {
      name: "LVL",
      address: "0xc34dbb4497ac50888779e374d1871a130a3680d2",
      decimals: 18,
    },
    {
      name: "OHMI",
      address: "0x7ca6998c18f9d9014fdbfc0cd7088e00b10ac84b",
      decimals: 18,
    },
    {
      name: "POI$ON",
      address: "0x8cff7c020d0c975014478e4db605386e1b15e6bd",
      decimals: 18,
    },
    {
      name: "HAN",
      address: "0x688c8863b14a54481ec033e9506dfcb83aca4293",
      decimals: 18,
    },
    {
      name: "MNU",
      address: "0x80aec16e9704f79ec96dcc0c98e5d77a9445e50e",
      decimals: 18,
    },
    {
      name: "JMZ",
      address: "0xcdc4adcc6237f9c79060c5a3a60c01f4a6e4f7e0",
      decimals: 18,
    },
    {
      name: "TND",
      address: "0xd8e4787bcace28e51cb3435e14d5b61e30ff241e",
      decimals: 18,
    },
    {
      name: "RCM",
      address: "0x16e0c146da69fe5bba310233b87346972530bde0",
      decimals: 18,
    },
    {
      name: "CNLT",
      address: "0x9f74d55082e6f3cae8eec48412ea0b0c23cba95f",
      decimals: 18,
    },
    {
      name: "FCC",
      address: "0xdfbe63be8d4d5e267fbf4148c0cc87dd9fccef1d",
      decimals: 18,
    },
    {
      name: "GENI",
      address: "0xe2c758cd17464d52aefabcb89b73135ceebe49ad",
      decimals: 9,
    },
    {
      name: "PLSB",
      address: "0xe35f26d3dc5f6d59e455c260a277d7d1102dc231",
      decimals: 12,
    },
    {
      name: "D2T",
      address: "0x8a0b4f0bd0c38ac2473d3aac06eb779ba28335e1",
      decimals: 18,
    },
    {
      name: "XI",
      address: "0x33bf2b51b52a0817ac4ccc6dc856dee6559905b0",
      decimals: 18,
    },
    {
      name: "LIUX",
      address: "0x85961164a400b0ae8cdd5ba255d17762226da622",
      decimals: 18,
    },
    {
      name: "EZY",
      address: "0x36d9b30ca67ce7c4c320efafbb0cb25333271271",
      decimals: 18,
    },
    {
      name: "TRG",
      address: "0x0c575c220491a81ff597739c2de23823fd9ddcf4",
      decimals: 18,
    },
    {
      name: "BAY",
      address: "0xffe0eb8f2c7943151c8c33ef85a8038b11d96cb6",
      decimals: 18,
    },
    {
      name: "STFX",
      address: "0x5bbe1201edfde7ba1c6cd29ec480be58704d52fa",
      decimals: 18,
    },
    {
      name: "AREA",
      address: "0x7ac19b8d953e656e76541e90a52f2807b4b3aa30",
      decimals: 18,
    },
    {
      name: "SIMP",
      address: "0x1364bd82596a25491381c3250af43014ca4064ee",
      decimals: 18,
    },
    {
      name: "CNC",
      address: "0x00b2139a036ea915f0e4b252e74ca3279f65a966",
      decimals: 18,
    },
    {
      name: "GWINK",
      address: "0x7193b2f66c3695bffca0afafd3b5ecf6e36cb5ba",
      decimals: 18,
    },
    {
      name: "COM",
      address: "0xe1e3992de073c317a550dc58c83d6c08da985a7d",
      decimals: 12,
    },
    {
      name: "VNO",
      address: "0x436c90a541f102f08c062f689b22295a64c23169",
      decimals: 18,
    },
    {
      name: "BTAF",
      address: "0xdb9c33228e1bb77de0dc6859e2ccec582341d83b",
      decimals: 18,
    },
    {
      name: "SILV2",
      address: "0x938fc0e6e26aafe0fc37c2622deeb985e16a4d6b",
      decimals: 18,
    },
    {
      name: "HACHI",
      address: "0x37aaaf5cd89ce1906e1f31f1c9238d5674719702",
      decimals: 18,
    },
    {
      name: "FUTURE-AI",
      address: "0x29177bce4d5eb84de8614395ed37f0221077bf1e",
      decimals: 18,
    },
    {
      name: "GOBLIN",
      address: "0xd93fc02caa31da40e3bcad9c7742a49b2fb947f8",
      decimals: 9,
    },
    {
      name: "GINTO",
      address: "0x3c25d89e292f211e1d186fa095df1f2e86201a67",
      decimals: 18,
    },
    {
      name: "WOOF",
      address: "0xf34a7ea3f15cf03946bafe331506de13151e7a8f",
      decimals: 18,
    },
    {
      name: "WFIO",
      address: "0xe033abe4d969546ced6781b8bf88efbf1f2e26ae",
      decimals: 9,
    },
    {
      name: "JIZZ",
      address: "0xf125d71c4383d71b3620de404beef7155d9d40e8",
      decimals: 18,
    },
    {
      name: "IM",
      address: "0xa2ec6280072cfd74d2f9c11aadc79312e6b5c09a",
      decimals: 18,
    },
    {
      name: "REVOAI",
      address: "0x7df2de538225627c40cdf2857203903526ad957e",
      decimals: 9,
    },
    {
      name: "PAW",
      address: "0x18f2ff578ebd50911266f1ac52a0ec8e38100679",
      decimals: 18,
    },
    {
      name: "MUSICAI",
      address: "0xe6d6e835ffcb537eb1011530db334dc6e16f343e",
      decimals: 18,
    },
    {
      name: "STABLZ",
      address: "0x8e3d9d8520b495d3a8ba00c5576acd94e42de265",
      decimals: 18,
    },
    {
      name: "FUND",
      address: "0x131521ced112fb0a9de9202ffd6b8ae070975438",
      decimals: 18,
    },
    {
      name: "OXAI",
      address: "0x5c8635a437d7003fb54bd4dddf254ac5cd822c53",
      decimals: 18,
    },
    {
      name: "NEURALAI",
      address: "0xcbb42389da34f2a5e1c897e1bb30bc231f031358",
      decimals: 18,
    },
    {
      name: "EGGS",
      address: "0x93e5957e8a025c85a9a55de34eb92e2c9015b591",
      decimals: 18,
    },
    {
      name: "CVXFXS",
      address: "0x2f863634bc1223a836cc5b54f38984a96480a81b",
      decimals: 18,
    },
    {
      name: "GYM AI",
      address: "0xc4c4ad0c9cabbe15de2501b27a1ef78a6a6c12ba",
      decimals: 18,
    },
    {
      name: "MPI",
      address: "0x2b648761f6e0b24be7c8137862383a7af65e8cbc",
      decimals: 18,
    },
    {
      name: "GOS",
      address: "0xeae4e2974d8968176404ea65753acb3e93cd81df",
      decimals: 6,
    },
    {
      name: "SUDO",
      address: "0xbc6d8b900a7bdf44397031d083bbb4bc3c15346b",
      decimals: 18,
    },
    {
      name: "ARCH",
      address: "0xe63dbc57038bee40b8ced0cfe1eb4cc90bd45eb3",
      decimals: 18,
    },
    {
      name: "ZYB",
      address: "0x210c45ada2e47dd5e6caa87db45796e9b44b23b6",
      decimals: 18,
    },
    {
      name: "TROVE",
      address: "0x2cca68595fcf65f85245195f78f3090d0a5a7af2",
      decimals: 18,
    },
    {
      name: "CARROT",
      address: "0x61904c215e1fe7b1c97d732e5d091318eefd9603",
      decimals: 18,
    },
    {
      name: "NMR",
      address: "0x714f2ff9ba72ee060b91c2670332ce8637d3a12d",
      decimals: 18,
    },
    {
      name: "FET",
      address: "0x75b61d1416bd0dcaf3e2b49c7388b9c4a8dc2480",
      decimals: 18,
    },
    {
      name: "PSTAKE",
      address: "0x92f5a55c387051cfa99bf838bb5865646bc9c2c7",
      decimals: 18,
    },
    {
      name: "IGU",
      address: "0x3d891ec9b255ae1429cccf9fa9f4636b1c333b93",
      decimals: 18,
    },
    {
      name: "SKL",
      address: "0x65bfba0991bcb0a8298d019b6a4b5b3b60b6c188",
      decimals: 18,
    },
    {
      name: "FIRO",
      address: "0xcda359ba4032fea1bad7445c91ace86ae6faf2f5",
      decimals: 8,
    },
    {
      name: "RNDR",
      address: "0x616f6facab68ea5a5985f94c4d9b995debd642cc",
      decimals: 18,
    },
    {
      name: "VR",
      address: "0x3f3ecdaf1dab1638910c64f6381f8cb09d2d4be1",
      decimals: 18,
    },
    {
      name: "CELR",
      address: "0x3cb9a25ac0ec8b4b23e0d7cc7076d9a9368ae5ab",
      decimals: 18,
    },
    {
      name: "SOV",
      address: "0x012b4ad4e106f5699ad27c78296f8e4abf989b54",
      decimals: 18,
    },
    {
      name: "DSLA",
      address: "0x74564201ccf0d48c6c43dbb92ffec074d265c197",
      decimals: 18,
    },
    {
      name: "FACTR",
      address: "0xcc6b94605d21a362fd5a1447bfdc1dd67a6585b3",
      decimals: 18,
    },
    {
      name: "USDT.e",
      address: "0x294445902d36bc635ffd1ac0ac920b445b2c057b",
      decimals: 6,
    },
    {
      name: "IB",
      address: "0xc64a09b073b1aad10dfae0a22c041700b3c34a52",
      decimals: 18,
    },
    {
      name: "RADIO",
      address: "0x9c8c4f2af2d2dccc682675f799b0a0b09f7ffbdc",
      decimals: 18,
    },
    {
      name: "BORING",
      address: "0xb464256ba0cb62e68f4208ef6c1078efe53733a8",
      decimals: 18,
    },
    {
      name: "KWENTA",
      address: "0x526067f119855e2cde91e2171ee36e8c6598058b",
      decimals: 18,
    },
    {
      name: "OPX",
      address: "0xab9ef05eaae67e0442428671dbb98995f56f4b3c",
      decimals: 18,
    },
    {
      name: "ACX",
      address: "0xf216a31c16bf4ea975a00bfcd1b374d063eb46a1",
      decimals: 18,
    },
    {
      name: "ALIEN",
      address: "0x382bf0d51ddaabc8e01ec0089d9433a1e5caa067",
      decimals: 18,
    },
    {
      name: "SLIZ",
      address: "0x7c1fd9f3b63d707e268793202f119542cde35098",
      decimals: 18,
    },
    {
      name: "ARBI",
      address: "0x75c36c8c47f0d329d53c7125e545fa758b0b06f4",
      decimals: 18,
    },
    {
      name: "WHEAT",
      address: "0x0ea50f4be61bafc554f5357f90b3721e93fafa92",
      decimals: 18,
    },
    {
      name: "STAI",
      address: "0x1d9c21d0244f2c59ec2a59951a3f4e81fba0113d",
      decimals: 18,
    },
    {
      name: "VOLTA",
      address: "0x32b5f0928db8eb98e473eda1a8d3371418200cfc",
      decimals: 18,
    },
    {
      name: "RUNY",
      address: "0x80072507baacdbdda60d3de536570a07a9617fe2",
      decimals: 18,
    },
    {
      name: "WSAFU",
      address: "0x32fdf5302820972890b7419bc55b84101e1f59a0",
      decimals: 18,
    },
    {
      name: "MFB",
      address: "0x9fe20b6db62506c935dfea8be9b36fa68198634f",
      decimals: 18,
    },
    {
      name: "VEE",
      address: "0x2fef359584521328f8096fcafa1cb9c68a94d151",
      decimals: 18,
    },
    {
      name: "CONK",
      address: "0x55d7b24817434556f1f1cd17bf955452b96e7bee",
      decimals: 18,
    },
    {
      name: "MMT",
      address: "0x5f21f14b63aebdf642b6619131fd34d03327c02b",
      decimals: 18,
    },
    {
      name: "FLUT",
      address: "0xb5c28d1c30c52a3a0b33c4529ee5ac1a2a3a68fb",
      decimals: 11,
    },
    {
      name: "DSQ",
      address: "0x46d3a335c86fdf45d226eaf546045145f08b7c95",
      decimals: 18,
    },
    {
      name: "GRB",
      address: "0xf212f30a1591f78245db7bbf453895adf1fe9a95",
      decimals: 18,
    },
    {
      name: "DFTL",
      address: "0x3170ef88b7e7f0f385931bdeb79cc1943091cf4f",
      decimals: 18,
    },
    {
      name: "FINANCEAI",
      address: "0x2572899831057ac051a46ec4e1c3f761dea8391a",
      decimals: 18,
    },
    {
      name: "AVAN",
      address: "0xf53b99a8cbadec46e793ba705958732e4a25e65b",
      decimals: 18,
    },
    {
      name: "LYRA",
      address: "0x2a86581744fc33711bfab699d74d285e64508b86",
      decimals: 18,
    },
    {
      name: "HND",
      address: "0x531dab4cb988b271c6a2e2fe32e8009cc99bbcee",
      decimals: 18,
    },
    {
      name: "CTX",
      address: "0x8f314b94eeb781e9d3cb18d2f6b2ace0e216d775",
      decimals: 18,
    },
    {
      name: "WPC",
      address: "0x74019aaf2966423dcf40470965cf785c20058509",
      decimals: 18,
    },
    {
      name: "CMERGE",
      address: "0x6fb889f020965f36a688c5f98384a785835c5a87",
      decimals: 9,
    },
    {
      name: "COW",
      address: "0xc1258fb8d032539b23b6e81233972bfe143ee5bb",
      decimals: 18,
    },
    {
      name: "NXRA",
      address: "0x781f1427485ed5ae6b427abd2950f8a4433cbd8b",
      decimals: 18,
    },
    {
      name: "TLOS",
      address: "0xc48da6e3cbc740a4e2da0feebc9b54a82db1b606",
      decimals: 18,
    },
    {
      name: "RAIL",
      address: "0xf7da76bc0f382ab49f6d44d9e2da46d5ef4b8652",
      decimals: 18,
    },
    {
      name: "SYS",
      address: "0x144ff21356eeecc7da3c4cc7c5497ee45bf2cd6f",
      decimals: 18,
    },
    {
      name: "KAS",
      address: "0x46019d0fabeaea205497aa5ad8e90b8c02e02b58",
      decimals: 8,
    },
    {
      name: "TRYV",
      address: "0xed23c86ef07ea1f5d4f04d208145a833b5098662",
      decimals: 18,
    },
    {
      name: "PRIME",
      address: "0xfcb9d394a27f6771c68d5a0c2aa039287fb2ef47",
      decimals: 18,
    },
    {
      name: "KAKI",
      address: "0x5aba9456310cb824fa2cce3bf9efdf1f79b4f137",
      decimals: 18,
    },
    {
      name: "GETH",
      address: "0xbd74b2e987e6de4070a38f6be53ec2812182d41b",
      decimals: 18,
    },
    {
      name: "PEPES",
      address: "0x1398e3bd616527bb18dc2cbe0716dce950656832",
      decimals: 18,
    },
    {
      name: "CBYTE",
      address: "0xf524713de98ae6015e93b7c0ef307d4441457147",
      decimals: 18,
    },
    {
      name: "SPORTS-AI",
      address: "0xcc1cbb73f2b26dfd384ab057011a8cd00672722e",
      decimals: 18,
    },
    {
      name: "PANDAI",
      address: "0xd705056a41eeece0464aeb835e96cb0c7a475ed0",
      decimals: 6,
    },
    {
      name: "HOPPYINU",
      address: "0x2a79e85aab639e6f33d636fcdb9c6c509a826de4",
      decimals: 18,
    },
    {
      name: "MSHD",
      address: "0x07f15196ada2e3b9c49666fb0366735c98b56fa0",
      decimals: 9,
    },
    {
      name: "CRIMSON",
      address: "0x0410836cf301f863abb0b0ba80692cb76d5edf37",
      decimals: 18,
    },
    {
      name: "CATSHIRA",
      address: "0x6e73b6bfeff3e687b62eb58ed25e5d1f130b16be",
      decimals: 18,
    },
    {
      name: "OBTC",
      address: "0xed9703f097cc56c8b216a723913b162a42fa6a6a",
      decimals: 18,
    },
    {
      name: "MNB",
      address: "0x25cba52a205376c5adde62a16043277a8928477f",
      decimals: 18,
    },
    {
      name: "CSIX",
      address: "0x24f3091705c4e2edf93f353717064ac4c070b9a9",
      decimals: 18,
    },
    {
      name: "MEMAG",
      address: "0xac8ed27609cfd60ae3c986eff189de6237396274",
      decimals: 18,
    },
    {
      name: "CID",
      address: "0x7ed62e07c4a1cecc04ffb0a7918fcb188186373d",
      decimals: 18,
    },
    {
      name: "ALCA",
      address: "0xa33dde15421cc8c9f7b354afbbfeef2e6ca9edc6",
      decimals: 18,
    },
    {
      name: "TSUBASAUT",
      address: "0x5d6063474c9c8a1e47a9b1d47f004f95cfbc8b56",
      decimals: 8,
    },
    {
      name: "K9",
      address: "0xe54aa91635ae297215f27c0cb6812a3c7c737f24",
      decimals: 18,
    },
    {
      name: "$CHILL",
      address: "0x7bfa99175e3582eea62c85a53f2a06623b2c7f1a",
      decimals: 18,
    },
    {
      name: "USH",
      address: "0xf26517bec5d7833dae9ea5a277fc28e29556d8cd",
      decimals: 18,
    },
    {
      name: "HEI",
      address: "0x6a060549301dc1d3934c32c8c002c8352a9afe57",
      decimals: 18,
    },
    {
      name: "TURAI",
      address: "0xc5749d4af4d47f5613c6c6e9a6c997428fd19c0b",
      decimals: 18,
    },
    {
      name: "MEZZ",
      address: "0x9a756a3bdc1d01473a40decba744fbe79493efae",
      decimals: 18,
    },
    {
      name: "GPT",
      address: "0xa0394aba91d2412ee5ab3f7befd59e2c3c9f64ca",
      decimals: 18,
    },
    {
      name: "RJV",
      address: "0xb7afedc5e76878a14d46b93f014c4f0d403c5776",
      decimals: 6,
    },
    {
      name: "RAB",
      address: "0xe517510865c60f58dfc73d76683390e805afd5e7",
      decimals: 18,
    },
    {
      name: "FDAO",
      address: "0x0ae665cdb0364a45de3c665b3c9b0794ddb08e79",
      decimals: 18,
    },
    {
      name: "TRENDAI",
      address: "0xde50281efd37285a8975d9c7d460859df36065fd",
      decimals: 18,
    },
    {
      name: "RAM",
      address: "0xc91e1d84eed38f4acd0367765be297365dc4ef44",
      decimals: 18,
    },
    {
      name: "EDX",
      address: "0x873dbc3e5b2d6c6f2708d8826e90233cc4c6af03",
      decimals: 18,
    },
    {
      name: "WOR",
      address: "0x605a6b25a3cce07ec4a20c8d158932f749f2f4cb",
      decimals: 18,
    },
    {
      name: "ROKO",
      address: "0x3091d1cbcb210d5cf35edb4725bb2c3e5e840e0d",
      decimals: 18,
    },
    {
      name: "PTOOLS",
      address: "0x8be629c7ad1e4a48583df5ad85f6d0d8b0fb6e3d",
      decimals: 18,
    },
    {
      name: "THEO",
      address: "0x00f439e4c4a91ccfc2fbe97b7912c37b2a9986b2",
      decimals: 9,
    },
    {
      name: "GDX",
      address: "0xa09f9da1f99b1a9c9b3419b307271938a172f0fc",
      decimals: 18,
    },
    {
      name: "RAKE",
      address: "0xf6d8362533728ed31bb6dcc205fa891cdef66b7d",
      decimals: 6,
    },
    {
      name: "TFLOW",
      address: "0x880a4e39c8986a3d0e9d3bb7ee32afdcbcaa5b18",
      decimals: 18,
    },
    {
      name: "HUMAI",
      address: "0x9ad14a3fc277a2dba2ae2f0080313ad70b4abeea",
      decimals: 18,
    },
    {
      name: "BCM",
      address: "0xec85a8db83e554fb07ce0989df5f18a12b3114a7",
      decimals: 18,
    },
    {
      name: "SATS",
      address: "0xbff5da8c1eab106d8f156f098f0f4599c8b603a3",
      decimals: 9,
    },
    {
      name: "EDE",
      address: "0x47197f55520a110e49e0efb613396ce5871d26ef",
      decimals: 18,
    },
    {
      name: "ACID",
      address: "0x31a5d78e4120c3a534bf086012e07930e1f6d404",
      decimals: 9,
    },
    {
      name: "BPEG",
      address: "0xc39ac7a794b984f641f7fd21f8e4132d8f734193",
      decimals: 18,
    },
    {
      name: "MZR",
      address: "0xbaa15a42684a6258875f701f287fbc5aea0d6ab9",
      decimals: 18,
    },
    {
      name: "HMX",
      address: "0x0a6ecaaccc8b6dd3e081f110e463cf19240adfe6",
      decimals: 18,
    },
    {
      name: "KIBSHI",
      address: "0x109522175fb03845916a2f0cf85e6ba49181df96",
      decimals: 18,
    },
    {
      name: "MEDAI",
      address: "0xa55ce885586b62a1a759b92ffe7c4d3751118a10",
      decimals: 18,
    },
    {
      name: "DEOD",
      address: "0x22c4313e709c8828c78db73f4675a7cc791aca1d",
      decimals: 18,
    },
    {
      name: "DIPA",
      address: "0x3ab6d625882bb6d2899409265dbcee4c8d1c0f7c",
      decimals: 18,
    },
    {
      name: "TWINU",
      address: "0xac62a2a810dce3a905dcc21826e20207ec1e24dd",
      decimals: 18,
    },
    {
      name: "FCTR",
      address: "0xd7f59bb35e1ebc8cfd56dcd053dab220b324c98e",
      decimals: 18,
    },
    {
      name: "ARB",
      address: "0x7bdf5d1c4da23f212fb546e08c6a6151781302cf",
      decimals: 18,
    },
    {
      name: "CMP",
      address: "0xc99bd452aaafb37d629147914ed9c5b8482a7eac",
      decimals: 18,
    },
  ],
  ethereum: [
    {
      name: "CHNG",
      address: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf",
      decimals: 18,
    },
    {
      name: "FSN",
      address: "0xfa4fa764f15d0f6e20aaec8e0d696870e5b77c6e",
      decimals: 18,
    },
    {
      name: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6,
    },
    { name: "ETH", address: nullAddress, decimals: 18 },
    {
      name: "BTC",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      decimals: 8,
    },
    {
      name: "HT",
      address: "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
      decimals: 18,
    },
    {
      name: "UNI",
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x514910771af9ca656af840dff83e8264ecf986ca",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      decimals: 18,
    },
    {
      name: "ENJ",
      address: "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      decimals: 18,
    },
    {
      name: "HOT",
      address: "0x6c6ee5e31d828de241282b9606c8e98ea48526e2",
      decimals: 18,
    },
    {
      name: "ALPHA",
      address: "0xa1faa113cbe53436df28ff0aee54275c13b40975",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      decimals: 18,
    },
    {
      name: "LRC",
      address: "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
      decimals: 18,
    },
    {
      name: "INCH",
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      decimals: 18,
    },
    {
      name: "DENT",
      address: "0x3597bfd533a99c9aa083587b074434e61eb0a258",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      decimals: 18,
    },
    {
      name: "MANA",
      address: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      decimals: 18,
    },
    {
      name: "GRT",
      address: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      decimals: 18,
    },
    {
      name: "BAT",
      address: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      decimals: 18,
    },
    {
      name: "ZRX",
      address: "0xe41d2489571d322189246dafa5ebde1f4699f498",
      decimals: 18,
    },
    {
      name: "UMA",
      address: "0x04fa0d235c4abf4bcf4787af4cf447de572ef828",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0xd533a949740bb3306d119cc777fa900ba034cd52",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0xba100000625a3754423978a60c9317c58a424e3d",
      decimals: 18,
    },
    {
      name: "SXP",
      address: "0x8ce9137d39326ad0cd6491fb5cc0cba0e089b6a9",
      decimals: 18,
    },
    {
      name: "KNC",
      address: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      decimals: 18,
    },
    {
      name: "BADGER",
      address: "0x3472a5a71965499acd81997a54bba8d852c6e53d",
      decimals: 18,
    },
    {
      name: "DODO",
      address: "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd",
      decimals: 18,
    },
    {
      name: "FORTH",
      address: "0x77fba179c79de5b7653f68b5039af940ada60ce0",
      decimals: 18,
    },
    {
      name: "SHIB",
      address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
      decimals: 18,
    },
    {
      name: "MOMAT",
      address: "0x865bb9a28041259b4badafd37799a288aabbfc8c",
      decimals: 18,
    },
    {
      name: "KSC",
      address: "0x2921bc03cfdf650f078092b1a19f3046b66bfd04",
      decimals: 18,
    },
    {
      name: "LC",
      address: "0x23b99002a1749cc4fb81d8a4a2d56acf4a2b47ad",
      decimals: 18,
    },
    {
      name: "MATIC",
      address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6,
    },
    {
      name: "O3",
      address: "0xee9801669c6138e84bd50deb500827b776777d28",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0x8107d02d6edde8ce0479617178f43f861f359669",
      decimals: 18,
    },
    {
      name: "FIN",
      address: "0x054f76beed60ab6dbeb23502178c52d6c5debe40",
      decimals: 18,
    },
    {
      name: "RNFT",
      address: "0xfb400df345ef8121622178008843678bbfa2c141",
      decimals: 18,
    },
    {
      name: "DYDX",
      address: "0x92d6c1e31e14520e676a687f0a93788b716beff5",
      decimals: 18,
    },
    {
      name: "SFC",
      address: "0xe420f0c442cd427554ecd211ea26229e97e280df",
      decimals: 6,
    },
    {
      name: "BUSD",
      address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      decimals: 18,
    },
    {
      name: "CRO",
      address: "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b",
      decimals: 8,
    },
    {
      name: "DAI",
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimals: 18,
    },
    {
      name: "LOVE",
      address: "0x6452961d566449fa5364a182b802a32e17f5cc5f",
      decimals: 0,
    },
    {
      name: "PEOPLE",
      address: "0x7a58c0be72be218b41c608b7fe7c5bb630736c71",
      decimals: 18,
    },
    {
      name: "AURORA",
      address: "0xaaaaaa20d9e0e2461697782ef11675f668207961",
      decimals: 18,
    },
    {
      name: "ATOM",
      address: "0x8d983cb9388eac77af0474fa441c4815500cb7bb",
      decimals: 6,
    },
    {
      name: "USTC",
      address: "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "KLAY",
      address: "0x43a934f6058fbeb24620070153267a5f8162207c",
      decimals: 18,
    },
    {
      name: "WEMIX",
      address: "0x00d197d8cfe95498264eaceddb02c79bc0f26d67",
      decimals: 18,
    },
    {
      name: "KLEVA",
      address: "0x9a5331021455708851dd87a8759c82e1f152b09c",
      decimals: 18,
    },
    {
      name: "BORA",
      address: "0x08608ebf81ddab792cd3d75b78bd3e3771d49fa0",
      decimals: 18,
    },
    {
      name: "KSP",
      address: "0x6ee4e858e6167250756235df76db6da7c38d9f7e",
      decimals: 18,
    },
    {
      name: "KFI",
      address: "0x27775ba0673e6d27bf25696ce4087c0d41c48df1",
      decimals: 18,
    },
    {
      name: "ALBT",
      address: "0x00a8b738e453ffd858a7edf03bccfe20412f0eb0",
      decimals: 18,
    },
    {
      name: "ALCX",
      address: "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
      decimals: 18,
    },
    {
      name: "AMP",
      address: "0xff20817765cb7f73d4bde2e66e067e58d11095c2",
      decimals: 18,
    },
    {
      name: "APE",
      address: "0x4d224452801aced8b2f0aebe155379bb5d594381",
      decimals: 18,
    },
    {
      name: "ARV",
      address: "0x79c7ef95ad32dcd5ecadb231568bb03df7824815",
      decimals: 8,
    },
    {
      name: "AUDIO",
      address: "0x18aaa7115705e8be94bffebde57af9bfc265b998",
      decimals: 18,
    },
    {
      name: "AVINOC",
      address: "0xf1ca9cb74685755965c7458528a36934df52a3ef",
      decimals: 18,
    },
    {
      name: "BFC",
      address: "0x0c7d5ae016f806603cb1782bea29ac69471cab9c",
      decimals: 18,
    },
    {
      name: "BNT",
      address: "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c",
      decimals: 18,
    },
    {
      name: "BOND",
      address: "0x0391d2021f89dc339f60fff84546ea23e337750f",
      decimals: 18,
    },
    {
      name: "BOO",
      address: "0x55af5865807b196bd0197e0902746f31fbccfa58",
      decimals: 18,
    },
    {
      name: "CULT",
      address: "0xf0f9d895aca5c8678f706fb8216fa22957685a13",
      decimals: 18,
    },
    {
      name: "CVX",
      address: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
      decimals: 18,
    },
    {
      name: "DAO",
      address: "0x0f51bb10119727a7e5ea3538074fb341f56b09ad",
      decimals: 18,
    },
    {
      name: "DEXT",
      address: "0xfb7b4564402e5500db5bb6d63ae671302777c75a",
      decimals: 18,
    },
    {
      name: "DG",
      address: "0x53c8395465a84955c95159814461466053dedede",
      decimals: 18,
    },
    {
      name: "DIGG",
      address: "0x798d1be841a82a273720ce31c822c61a67a601c3",
      decimals: 9,
    },
    {
      name: "DPI",
      address: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      decimals: 18,
    },
    {
      name: "DXD",
      address: "0xa1d65e8fb6e87b60feccbc582f7f97804b725521",
      decimals: 18,
    },
    {
      name: "EDEN",
      address: "0x1559fa1b8f28238fd5d76d9f434ad86fd20d1559",
      decimals: 18,
    },
    {
      name: "ELON",
      address: "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3",
      decimals: 18,
    },
    {
      name: "EMAX",
      address: "0x15874d65e649880c2614e7a480cb7c9a55787ff6",
      decimals: 18,
    },
    {
      name: "ENS",
      address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
      decimals: 18,
    },
    {
      name: "ERN",
      address: "0xbbc2ae13b23d715c30720f079fcd9b4a74093505",
      decimals: 18,
    },
    {
      name: "EVN",
      address: "0x9af15d7b8776fa296019979e70a5be53c714a7ec",
      decimals: 18,
    },
    {
      name: "FLOKI",
      address: "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
      decimals: 9,
    },
    {
      name: "FLX",
      address: "0x6243d8cea23066d098a15582d81a598b4e8391f4",
      decimals: 18,
    },
    {
      name: "FNC",
      address: "0x7f280dac515121dcda3eac69eb4c13a52392cace",
      decimals: 18,
    },
    {
      name: "FODL",
      address: "0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3",
      decimals: 18,
    },
    {
      name: "FOX",
      address: "0xc770eefad204b5180df6a14ee197d99d808ee52d",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0x853d955acef822db058eb8505911ed77f175b99e",
      decimals: 18,
    },
    {
      name: "FXS",
      address: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
      decimals: 18,
    },
    {
      name: "GLM",
      address: "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429",
      decimals: 18,
    },
    {
      name: "HEC",
      address: "0x29b3d220f0f1e37b342cf7c48c1164bf5bf79efa",
      decimals: 9,
    },
    {
      name: "HEX",
      address: "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
      decimals: 8,
    },
    {
      name: "HEZ",
      address: "0xeef9f339514298c6a857efcfc1a762af84438dee",
      decimals: 18,
    },
    {
      name: "ICE",
      address: "0xf16e81dce15b08f326220742020379b855b87df9",
      decimals: 18,
    },
    {
      name: "ICHI",
      address: "0x903bef1736cddf2a537176cf3c64579c3867a881",
      decimals: 9,
    },
    {
      name: "ILV",
      address: "0x767fe9edc9e0df98e07454847909b5e959d7ca0e",
      decimals: 18,
    },
    {
      name: "IMX",
      address: "0xf57e7e7c23978c3caec3c3548e3d615c346e79ff",
      decimals: 18,
    },
    {
      name: "LDO",
      address: "0x5a98fcbea516cf06857215779fd812ca3bef1b32",
      decimals: 18,
    },
    {
      name: "LEASH",
      address: "0x27c70cd1946795b66be9d954418546998b546634",
      decimals: 18,
    },
    {
      name: "LINA",
      address: "0x3e9bc21c9b189c09df3ef1b824798658d5011937",
      decimals: 18,
    },
    {
      name: "LON",
      address: "0x0000000000095413afc295d19edeb1ad7b71c952",
      decimals: 18,
    },
    {
      name: "LTX",
      address: "0xa393473d64d2f9f026b60b6df7859a689715d092",
      decimals: 8,
    },
    {
      name: "MC",
      address: "0x949d48eca67b17269629c7194f4b727d4ef9e5d6",
      decimals: 18,
    },
    {
      name: "METIS",
      address: "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e",
      decimals: 18,
    },
    {
      name: "MIM",
      address: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
      decimals: 18,
    },
    {
      name: "MIST",
      address: "0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab",
      decimals: 18,
    },
    {
      name: "MKR",
      address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      decimals: 18,
    },
    {
      name: "MM",
      address: "0x6b4c7a5e3f0b99fcd83e9c089bddd6c7fce5c611",
      decimals: 18,
    },
    {
      name: "MOONTOKEN",
      address: "0x68a3637ba6e75c0f66b61a42639c4e9fcd3d4824",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x65ef703f5594d2573eb71aaf55bc0cb548492df4",
      decimals: 18,
    },
    {
      name: "NFTI",
      address: "0xe5feeac09d36b18b3fa757e5cf3f8da6b8e27f4c",
      decimals: 18,
    },
    {
      name: "NFTX",
      address: "0x87d73e916d7057945c9bcd8cdd94e42a6f47f776",
      decimals: 18,
    },
    {
      name: "OCEAN",
      address: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
      decimals: 18,
    },
    {
      name: "OGN",
      address: "0x8207c1ffc5b6804f6024322ccf34f29c3541ae26",
      decimals: 18,
    },
    {
      name: "OHM",
      address: "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5",
      decimals: 9,
    },
    {
      name: "PAXG",
      address: "0x45804880de22913dafe09f4980848ece6ecbaf78",
      decimals: 18,
    },
    {
      name: "PEEPS",
      address: "0xe1030b48b2033314979143766d7dc1f40ef8ce11",
      decimals: 18,
    },
    {
      name: "PENDLE",
      address: "0x808507121b80c02388fad14726482e061b8da827",
      decimals: 18,
    },
    {
      name: "PERP",
      address: "0xbc396689893d065f41bc2c6ecbee5e0085233447",
      decimals: 18,
    },
    {
      name: "PKF",
      address: "0x8b39b70e39aa811b69365398e0aace9bee238aeb",
      decimals: 18,
    },
    {
      name: "PNK",
      address: "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d",
      decimals: 18,
    },
    {
      name: "POLS",
      address: "0x83e6f1e41cdd28eaceb20cb649155049fac3d5aa",
      decimals: 18,
    },
    {
      name: "PREMIA",
      address: "0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70",
      decimals: 18,
    },
    {
      name: "RAD",
      address: "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3",
      decimals: 18,
    },
    {
      name: "RAI",
      address: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
      decimals: 18,
    },
    {
      name: "REN",
      address: "0x408e41876cccdc0f92210600ef50372656052a38",
      decimals: 18,
    },
    {
      name: "REQ",
      address: "0x8f8221afbb33998d8584a2b05749ba73c37a938a",
      decimals: 18,
    },
    {
      name: "RGT",
      address: "0xd291e7a03283640fdc51b121ac401383a46cc623",
      decimals: 18,
    },
    {
      name: "RLY",
      address: "0xf1f955016ecbcd7321c7266bccfb96c68ea5e49b",
      decimals: 18,
    },
    {
      name: "ROOK",
      address: "0xfa5047c9c78b8877af97bdcb85db743fd7313d4a",
      decimals: 18,
    },
    {
      name: "RPL",
      address: "0xd33526068d116ce69f19a9ee46f0bd304f21a51f",
      decimals: 18,
    },
    {
      name: "SAITAMA",
      address: "0xce3f08e664693ca792cace4af1364d5e220827b2",
      decimals: 9,
    },
    {
      name: "SAND",
      address: "0x3845badade8e6dff049820680d1f14bd3903a5d0",
      decimals: 18,
    },
    {
      name: "SPELL",
      address: "0x090185f2135308bad17527004364ebcc2d37e5f6",
      decimals: 18,
    },
    {
      name: "STARL",
      address: "0x8e6cd950ad6ba651f6dd608dc70e5886b1aa6b24",
      decimals: 18,
    },
    {
      name: "SUPER",
      address: "0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55",
      decimals: 18,
    },
    {
      name: "SWFL",
      address: "0xba21ef4c9f433ede00badefcc2754b8e74bd538a",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0x0f2d719407fdbeff09d87557abb7232601fd9f29",
      decimals: 18,
    },
    {
      name: "TOKE",
      address: "0x2e9d63788249371f1dfc918a52f8d799f4a38c94",
      decimals: 18,
    },
    {
      name: "TORN",
      address: "0x77777feddddffc19ff86db637967013e6c6a116c",
      decimals: 18,
    },
    {
      name: "TRIBE",
      address: "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b",
      decimals: 18,
    },
    {
      name: "TRU",
      address: "0x4c19596f5aaff459fa38b0f7ed92f11ae6543784",
      decimals: 8,
    },
    {
      name: "UFO",
      address: "0x249e38ea4102d0cf8264d3701f1a0e39c4f2dc3b",
      decimals: 18,
    },
    {
      name: "VADER",
      address: "0x2602278ee1882889b946eb11dc0e810075650983",
      decimals: 18,
    },
    {
      name: "WAXE",
      address: "0x7a2bc711e19ba6aff6ce8246c546e8c4b4944dfd",
      decimals: 8,
    },
    {
      name: "WISE",
      address: "0x66a0f676479cee1d7373f3dc2e2952778bff5bd6",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
      decimals: 18,
    },
    {
      name: "WOOP",
      address: "0xaad483f97f13c6a20b9d05d07c397ce85c42c393",
      decimals: 18,
    },
    {
      name: "WXT",
      address: "0xa02120696c7b8fe16c09c749e4598819b2b0e915",
      decimals: 18,
    },
    {
      name: "X2Y2",
      address: "0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9",
      decimals: 18,
    },
    {
      name: "YOSHI",
      address: "0x4374f26f0148a6331905edf4cd33b89d8eed78d1",
      decimals: 18,
    },
    {
      name: "ZCN",
      address: "0xb9ef770b6a5e12e45983c5d80545258aa38f3b78",
      decimals: 10,
    },
    {
      name: "CHINESE",
      address: "0x03a6eed53b5dcb0395dfbecf4cbc816dc6f93790",
      decimals: 18,
    },
    {
      name: "IOTX",
      address: "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69",
      decimals: 18,
    },
    {
      name: "SUKU",
      address: "0x0763fdccf1ae541a5961815c0872a8c5bc6de4d7",
      decimals: 18,
    },
    {
      name: "SHIT",
      address: "0x4e4a47cac6a28a62dcc20990ed2cda9bc659469f",
      decimals: 18,
    },
    {
      name: "CAW",
      address: "0xf3b9569f82b18aef890de263b84189bd33ebe452",
      decimals: 18,
    },
    {
      name: "XRP",
      address: "0x39fbbabf11738317a448031930706cd3e612e1b9",
      decimals: 18,
    },
    {
      name: "CHZ",
      address: "0x3506424f91fd33084466f402d5d97f05f8e3b4af",
      decimals: 18,
    },
    {
      name: "RACA",
      address: "0x12bb890508c125661e03b09ec06e404bc9289040",
      decimals: 18,
    },
    {
      name: "IUSD",
      address: "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d",
      decimals: 18,
    },
    {
      name: "IZI",
      address: "0x9ad37205d608b8b219e6a2573f922094cec5c200",
      decimals: 18,
    },
    {
      name: "TRADE",
      address: "0x4a4b062f602f83387a13915f815396ade22b692a",
      decimals: 18,
    },
    {
      name: "FNK",
      address: "0xb5fe099475d3030dde498c3bb6f3854f762a48ad",
      decimals: 18,
    },
    {
      name: "SAITO",
      address: "0xfa14fa6958401314851a17d6c5360ca29f74b57b",
      decimals: 18,
    },
    {
      name: "DPX",
      address: "0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81",
      decimals: 18,
    },
    {
      name: "TIME",
      address: "0x485d17a6f1b8780392d53d64751824253011a260",
      decimals: 8,
    },
    {
      name: "IF",
      address: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
      decimals: 18,
    },
    {
      name: "IDIA",
      address: "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89",
      decimals: 18,
    },
    {
      name: "EBOX",
      address: "0x33840024177a7daca3468912363bed8b425015c5",
      decimals: 18,
    },
    {
      name: "CREAM",
      address: "0x2ba592f78db6436527729929aaf6c908497cb200",
      decimals: 18,
    },
    {
      name: "MAGIC",
      address: "0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a",
      decimals: 18,
    },
    {
      name: "BTT",
      address: "0xc669928185dbce49d2230cc9b0979be6dc797957",
      decimals: 18,
    },
    {
      name: "RDPX",
      address: "0x0ff5a8451a839f5f0bb3562689d9a44089738d11",
      decimals: 18,
    },
    {
      name: "PUNK",
      address: "0x269616d549d7e8eaa82dfb17028d0b212d11232a",
      decimals: 18,
    },
    {
      name: "BIGSB",
      address: "0x131157c6760f78f7ddf877c0019eba175ba4b6f6",
      decimals: 18,
    },
    {
      name: "JPEG",
      address: "0xe80c0cd204d654cebe8dd64a4857cab6be8345a3",
      decimals: 18,
    },
    {
      name: "DELTA",
      address: "0x9ea3b5b4ec044b70375236a281986106457b20ef",
      decimals: 18,
    },
    {
      name: "BCT",
      address: "0x350d3f0f41b5b21f0e252fe2645ae9d55562150a",
      decimals: 9,
    },
    {
      name: "GOHM",
      address: "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f",
      decimals: 18,
    },
    {
      name: "ASTO",
      address: "0x823556202e86763853b40e9cde725f412e294689",
      decimals: 18,
    },
    {
      name: "XMON",
      address: "0x3aada3e213abf8529606924d8d1c55cbdc70bf74",
      decimals: 18,
    },
    {
      name: "QUARTZ",
      address: "0xba8a621b4a54e61c442f5ec623687e2a942225ef",
      decimals: 18,
    },
    {
      name: "HIGH",
      address: "0x71ab77b7dbb4fa7e017bc15090b2163221420282",
      decimals: 18,
    },
    {
      name: "SPS",
      address: "0x00813e3421e1367353bfe7615c7f7f133c89df74",
      decimals: 18,
    },
    {
      name: "SHIBDOGE",
      address: "0x6adb2e268de2aa1abf6578e4a8119b960e02928f",
      decimals: 9,
    },
    {
      name: "DIFX",
      address: "0x9792409ae27726d337af30d701ab525372495607",
      decimals: 18,
    },
    {
      name: "EGS",
      address: "0xb009bfaaf85e53f55d8657781eb69feaaed83672",
      decimals: 18,
    },
    {
      name: "ZKS",
      address: "0xe4815ae53b124e7263f08dcdbbb757d41ed658c6",
      decimals: 18,
    },
    {
      name: "YFII",
      address: "0xa1d0e215a23d7030842fc67ce582a6afa3ccab83",
      decimals: 18,
    },
    {
      name: "OMG",
      address: "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
      decimals: 18,
    },
    {
      name: "VRA",
      address: "0xf411903cbc70a74d22900a5de66a2dda66507255",
      decimals: 18,
    },
    {
      name: "GT",
      address: "0xe66747a101bff2dba3697199dcce5b743b454759",
      decimals: 18,
    },
    {
      name: "MX",
      address: "0x11eef04c884e24d9b7b4760e7476d06ddf797f36",
      decimals: 18,
    },
    {
      name: "GALA",
      address: "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
      decimals: 8,
    },
    {
      name: "MASK",
      address: "0x69af81e73a73b40adf4f3d4223cd9b1ece623074",
      decimals: 18,
    },
    {
      name: "OKB",
      address: "0x75231f58b43240c9718dd58b4967c5114342a86c",
      decimals: 18,
    },
    {
      name: "AKITA",
      address: "0x3301ee63fb29f863f2333bd4466acb46cd8323e6",
      decimals: 18,
    },
    {
      name: "ELF",
      address: "0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
      decimals: 18,
    },
    {
      name: "QOM",
      address: "0xa71d0588eaf47f12b13cf8ec750430d21df04974",
      decimals: 18,
    },
    {
      name: "YGG",
      address: "0x25f8087ead173b73d6e8b84329989a8eea16cf73",
      decimals: 18,
    },
    {
      name: "BIT",
      address: "0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5",
      decimals: 18,
    },
    {
      name: "UNIX",
      address: "0xddd6a0ecc3c6f6c102e5ea3d8af7b801d1a77ac8",
      decimals: 18,
    },
    {
      name: "WILD",
      address: "0x2a3bff78b79a009976eea096a51a948a3dc00e34",
      decimals: 18,
    },
    {
      name: "SASHIMI",
      address: "0xc28e27870558cf22add83540d2126da2e4b464c2",
      decimals: 18,
    },
    {
      name: "SOS",
      address: "0x3b484b82567a09e2588a13d54d032153f0c0aee0",
      decimals: 18,
    },
    {
      name: "LFT",
      address: "0xb620be8a1949aa9532e6a3510132864ef9bc3f82",
      decimals: 18,
    },
    {
      name: "ARDN",
      address: "0xb1c9bc94acd2fae6aabf4ffae4429b93512a81d2",
      decimals: 18,
    },
    {
      name: "EXPO",
      address: "0xcfaf8edcea94ebaa080dc4983c3f9be5701d6613",
      decimals: 18,
    },
    {
      name: "DOG",
      address: "0xbaac2b4491727d78d2b78815144570b9f2fe8899",
      decimals: 18,
    },
    {
      name: "BREED",
      address: "0x94e9eb8b5ab9fd6b9ea3169d55ffade62a01702e",
      decimals: 18,
    },
    {
      name: "DOE",
      address: "0xf8e9f10c22840b613cda05a0c5fdb59a4d6cd7ef",
      decimals: 18,
    },
    {
      name: "UNDEAD",
      address: "0x310c8f00b9de3c31ab95ea68feb6c877538f7947",
      decimals: 18,
    },
    {
      name: "CVC",
      address: "0x22b59a7387f7d25fe2b1c692ee825e1802e6e3d5",
      decimals: 9,
    },
    {
      name: "MPL",
      address: "0x33349b282065b0284d756f0577fb39c158f935e6",
      decimals: 18,
    },
    {
      name: "KUMA",
      address: "0x48c276e8d03813224bb1e55f953adb6d02fd3e02",
      decimals: 18,
    },
    {
      name: "TSUKA",
      address: "0xc5fb36dd2fb59d3b98deff88425a3f425ee469ed",
      decimals: 9,
    },
    {
      name: "QKC",
      address: "0xea26c4ac16d4a5a106820bc8aee85fd0b7b2b664",
      decimals: 18,
    },
    {
      name: "DIVER",
      address: "0xfb782396c9b20e564a64896181c7ac8d8979d5f4",
      decimals: 18,
    },
    {
      name: "JMPT",
      address: "0x420a24c9c65bd44c48bfb1cc8d6cd1ea8b1ac840",
      decimals: 18,
    },
    {
      name: "ALICE",
      address: "0xac51066d7bec65dc4589368da368b212745d63e8",
      decimals: 6,
    },
    {
      name: "STG",
      address: "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6",
      decimals: 18,
    },
    {
      name: "CDS",
      address: "0x3c48ca59bf2699e51d4974d4b6d284ae52076e5e",
      decimals: 18,
    },
    {
      name: "XCAD",
      address: "0x7659ce147d0e714454073a5dd7003544234b6aa0",
      decimals: 18,
    },
    {
      name: "VIDYA",
      address: "0x3d3d35bb9bec23b06ca00fe472b50e7a4c692c30",
      decimals: 18,
    },
    {
      name: "KISHU",
      address: "0xa2b4c0af19cc16a6cfacce81f192b024d625817d",
      decimals: 9,
    },
    {
      name: "ANT",
      address: "0xa117000000f279d81a1d3cc75430faa017fa5a2e",
      decimals: 18,
    },
    {
      name: "GUILD",
      address: "0x83e9f223e1edb3486f876ee888d76bfba26c475a",
      decimals: 18,
    },
    {
      name: "ZERO",
      address: "0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8",
      decimals: 18,
    },
    {
      name: "NEWO",
      address: "0x98585dfc8d9e7d48f0b1ae47ce33332cf4237d96",
      decimals: 18,
    },
    {
      name: "THOR",
      address: "0xa5f2211b9b8170f694421f2046281775e8468044",
      decimals: 18,
    },
    {
      name: "FILST",
      address: "0x7346ad4c8cd1886ff6d16072bcea5dfc0bc24ca2",
      decimals: 18,
    },
    {
      name: "KFC",
      address: "0xe63684bcf2987892cefb4caa79bd21b34e98a291",
      decimals: 18,
    },
    {
      name: "KYOKO",
      address: "0x14a32f050facf226ec60882398a9bf36d91dbac2",
      decimals: 18,
    },
    {
      name: "CHR",
      address: "0x8a2279d4a90b6fe1c4b30fa660cc9f926797baa2",
      decimals: 6,
    },
    {
      name: "URUS",
      address: "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
      decimals: 18,
    },
    {
      name: "DJ15",
      address: "0x5d269fac3b2e0552b0f34cdc253bdb427682a4b9",
      decimals: 9,
    },
    {
      name: "DAR",
      address: "0x081131434f93063751813c619ecca9c4dc7862a3",
      decimals: 6,
    },
    {
      name: "FOLD",
      address: "0xd084944d3c05cd115c09d072b9f44ba3e0e45921",
      decimals: 18,
    },
    {
      name: "ROUTE",
      address: "0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4",
      decimals: 18,
    },
    {
      name: "RADAR",
      address: "0x44709a920fccf795fbc57baa433cc3dd53c44dbe",
      decimals: 18,
    },
    {
      name: "PUSH",
      address: "0xf418588522d5dd018b425e472991e52ebbeeeeee",
      decimals: 18,
    },
    {
      name: "KP3R",
      address: "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44",
      decimals: 18,
    },
    {
      name: "CORE",
      address: "0x62359ed7505efc61ff1d56fef82158ccaffa23d7",
      decimals: 18,
    },
    {
      name: "WHALE",
      address: "0x9355372396e3f6daf13359b7b607a3374cc638e0",
      decimals: 4,
    },
    {
      name: "CHEDDA",
      address: "0x16756ec1deb89a2106c35e0b586a799d0a61837d",
      decimals: 18,
    },
    {
      name: "DOP",
      address: "0x6bb61215298f296c55b19ad842d3df69021da2ef",
      decimals: 18,
    },
    {
      name: "RBN",
      address: "0x6123b0049f904d730db3c36a31167d9d4121fa6b",
      decimals: 18,
    },
    {
      name: "RFOX",
      address: "0xa1d6df714f91debf4e0802a542e13067f31b8262",
      decimals: 18,
    },
    {
      name: "GIGA",
      address: "0x83249c6794bca5a77eb8c0af9f1a86e055459cea",
      decimals: 9,
    },
    {
      name: "BLOCKS",
      address: "0x8a6d4c8735371ebaf8874fbd518b56edd66024eb",
      decimals: 18,
    },
    {
      name: "OLE",
      address: "0x92cfbec26c206c90aee3b7c66a9ae673754fab7e",
      decimals: 18,
    },
    {
      name: "SIPHER",
      address: "0x9f52c8ecbee10e00d9faaac5ee9ba0ff6550f511",
      decimals: 18,
    },
    {
      name: "UNISTAKE",
      address: "0x9ed8e7c9604790f7ec589f99b94361d8aab64e5e",
      decimals: 18,
    },
    {
      name: "XYZ",
      address: "0x618679df9efcd19694bb1daa8d00718eacfa2883",
      decimals: 18,
    },
    {
      name: "CVP",
      address: "0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1",
      decimals: 18,
    },
    {
      name: "EXRD",
      address: "0x6468e79a80c0eab0f9a2b574c8d5bc374af59414",
      decimals: 18,
    },
    {
      name: "GET",
      address: "0x8a854288a5976036a725879164ca3e91d30c6a1b",
      decimals: 18,
    },
    {
      name: "SARCO",
      address: "0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a",
      decimals: 18,
    },
    {
      name: "BETA",
      address: "0xbe1a001fe942f96eea22ba08783140b9dcc09d28",
      decimals: 18,
    },
    {
      name: "DFI",
      address: "0x8fc8f8269ebca376d046ce292dc7eac40c8d358a",
      decimals: 8,
    },
    {
      name: "WHITE",
      address: "0x5f0e628b693018f639d10e4a4f59bd4d8b2b6b44",
      decimals: 18,
    },
    {
      name: "GOVI",
      address: "0xeeaa40b28a2d1b0b08f6f97bb1dd4b75316c6107",
      decimals: 18,
    },
    {
      name: "RVST",
      address: "0x120a3879da835a5af037bb2d1456bebd6b54d4ba",
      decimals: 18,
    },
    {
      name: "BIRD",
      address: "0x70401dfd142a16dc7031c56e862fc88cb9537ce0",
      decimals: 18,
    },
    {
      name: "BID",
      address: "0x25e1474170c4c0aa64fa98123bdc8db49d7802fa",
      decimals: 18,
    },
    {
      name: "MLT",
      address: "0x9506d37f70eb4c3d79c398d326c871abbf10521d",
      decimals: 18,
    },
    {
      name: "BOTTO",
      address: "0x9dfad1b7102d46b1b197b90095b5c4e9f5845bba",
      decimals: 18,
    },
    {
      name: "ALI",
      address: "0x6b0b3a982b4634ac68dd83a4dbf02311ce324181",
      decimals: 18,
    },
    {
      name: "KEYS",
      address: "0xe0a189c975e4928222978a74517442239a0b86ff",
      decimals: 9,
    },
    {
      name: "MUSE",
      address: "0xb6ca7399b4f9ca56fc27cbff44f4d2e4eef1fc81",
      decimals: 18,
    },
    {
      name: "DEUS",
      address: "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44",
      decimals: 18,
    },
    {
      name: "SALE",
      address: "0xf063fe1ab7a291c5d06a86e14730b00bf24cb589",
      decimals: 18,
    },
    {
      name: "UMBR",
      address: "0xa4bbe66f151b22b167127c770016b15ff97dd35c",
      decimals: 18,
    },
    {
      name: "HAPPY",
      address: "0x3079f61704e9efa2bcf1db412f735d8d4cfa26f4",
      decimals: 18,
    },
    {
      name: "VEMP",
      address: "0xcfeb09c3c5f0f78ad72166d55f9e6e9a60e96eec",
      decimals: 18,
    },
    {
      name: "RPG",
      address: "0x0e5c8c387c5eba2ecbc137ad012aed5fe729e251",
      decimals: 18,
    },
    {
      name: "SMARTCREDIT",
      address: "0x72e9d9038ce484ee986fea183f8d8df93f9ada13",
      decimals: 18,
    },
    {
      name: "RAIN",
      address: "0x71fc1f555a39e0b698653ab0b475488ec3c34d57",
      decimals: 18,
    },
    {
      name: "OM",
      address: "0x3593d125a4f7849a1b059e64f4517a86dd60c95d",
      decimals: 18,
    },
    {
      name: "K21",
      address: "0xb9d99c33ea2d86ec5ec6b8a4dd816ebba64404af",
      decimals: 18,
    },
    {
      name: "STANDARD",
      address: "0xda0c94c73d127ee191955fb46bacd7ff999b2bcd",
      decimals: 18,
    },
    {
      name: "NOIA",
      address: "0xa8c8cfb141a3bb59fea1e2ea6b79b5ecbcd7b6ca",
      decimals: 18,
    },
    {
      name: "STRP",
      address: "0x97872eafd79940c7b24f7bcc1eadb1457347adc9",
      decimals: 18,
    },
    {
      name: "RFUEL",
      address: "0xaf9f549774ecedbd0966c52f250acc548d3f36e5",
      decimals: 18,
    },
    {
      name: "KEX",
      address: "0x16980b3b4a3f9d89e33311b5aa8f80303e5ca4f8",
      decimals: 6,
    },
    {
      name: "OIL",
      address: "0x0275e1001e293c46cfe158b3702aade0b99f88a5",
      decimals: 18,
    },
    {
      name: "COT",
      address: "0x5cac718a3ae330d361e39244bf9e67ab17514ce8",
      decimals: 18,
    },
    {
      name: "MOD",
      address: "0xea1ea0972fa092dd463f2968f9bb51cc4c981d71",
      decimals: 18,
    },
    {
      name: "DERC",
      address: "0x9fa69536d1cda4a04cfb50688294de75b505a9ae",
      decimals: 18,
    },
    {
      name: "WKD",
      address: "0x5444c30210d8a0a156178cfb8048b4137c0d40d1",
      decimals: 9,
    },
    {
      name: "CLS",
      address: "0x675bbc7514013e2073db7a919f6e4cbef576de37",
      decimals: 18,
    },
    {
      name: "FTT",
      address: "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
      decimals: 18,
    },
    {
      name: "WNK",
      address: "0xe1bda0c3bfa2be7f740f0119b6a34f057bd58eba",
      decimals: 18,
    },
    {
      name: "HDAO",
      address: "0xdac657ffd44a3b9d8aba8749830bf14beb66ff2d",
      decimals: 18,
    },
    {
      name: "PARA",
      address: "0x3a8d5bc8a8948b68dfc0ce9c14ac4150e083518c",
      decimals: 18,
    },
    {
      name: "TVK",
      address: "0xd084b83c305dafd76ae3e1b4e1f1fe2ecccb3988",
      decimals: 18,
    },
    {
      name: "INJ",
      address: "0xe28b3b32b6c345a34ff64674606124dd5aceca30",
      decimals: 18,
    },
    {
      name: "JINDOGE",
      address: "0x3f4cd830543db25254ec0f05eac058d4d6e86166",
      decimals: 18,
    },
    {
      name: "POOLZ",
      address: "0x69a95185ee2a045cdc4bcd1b1df10710395e4e23",
      decimals: 18,
    },
    {
      name: "TAD",
      address: "0x9f7229af0c4b9740e207ea283b9094983f78ba04",
      decimals: 18,
    },
    {
      name: "OCT",
      address: "0xf5cfbc74057c610c8ef151a439252680ac68c6dc",
      decimals: 18,
    },
    {
      name: "QRX",
      address: "0x6e0dade58d2d89ebbe7afc384e3e4f15b70b14d8",
      decimals: 18,
    },
    {
      name: "BLID",
      address: "0x8a7adc1b690e81c758f1bd0f72dfe27ae6ec56a5",
      decimals: 18,
    },
    {
      name: "VPAD",
      address: "0x51fe2e572e97bfeb1d719809d743ec2675924edc",
      decimals: 18,
    },
    {
      name: "DPR",
      address: "0xf3ae5d769e153ef72b4e3591ac004e89f48107a1",
      decimals: 18,
    },
    {
      name: "XRT",
      address: "0x7de91b204c1c737bcee6f000aaa6569cf7061cb7",
      decimals: 9,
    },
    {
      name: "MCRT",
      address: "0xde16ce60804a881e9f8c4ebb3824646edecd478d",
      decimals: 9,
    },
    {
      name: "SWAP",
      address: "0xcc4304a31d09258b0029ea7fe63d032f52e44efe",
      decimals: 18,
    },
    {
      name: "SYLO",
      address: "0xf293d23bf2cdc05411ca0eddd588eb1977e8dcd4",
      decimals: 18,
    },
    {
      name: "ORBS",
      address: "0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa",
      decimals: 18,
    },
    {
      name: "GAMMA",
      address: "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
      decimals: 18,
    },
    {
      name: "UMX",
      address: "0x10be9a8dae441d276a5027936c3aaded2d82bc15",
      decimals: 18,
    },
    {
      name: "SHKOOBY",
      address: "0x29a5c1db7321c5c9eae57f9366ee8eef00ca11fb",
      decimals: 18,
    },
    {
      name: "AVG",
      address: "0xa41f142b6eb2b164f8164cae0716892ce02f311f",
      decimals: 18,
    },
    {
      name: "CAT",
      address: "0x56015bbe3c01fe05bc30a8a9a9fd9a88917e7db3",
      decimals: 18,
    },
    {
      name: "FUSE",
      address: "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d",
      decimals: 18,
    },
    {
      name: "STRNGR",
      address: "0xdc0327d50e6c73db2f8117760592c8bbf1cdcf38",
      decimals: 18,
    },
    {
      name: "IPAD",
      address: "0x36ed7baad9a571b5dad55d096c0ed902188d6d3c",
      decimals: 18,
    },
    {
      name: "AUCTION",
      address: "0xa9b1eb5908cfc3cdf91f9b8b3a74108598009096",
      decimals: 18,
    },
    {
      name: "MIX",
      address: "0x5d285f735998f36631f678ff41fb56a10a4d0429",
      decimals: 18,
    },
    {
      name: "WLITI",
      address: "0x0b63128c40737b13647552e0c926bcfeccc35f93",
      decimals: 18,
    },
    {
      name: "STRONG",
      address: "0x990f341946a3fdb507ae7e52d17851b87168017c",
      decimals: 18,
    },
    {
      name: "IQ",
      address: "0x579cea1889991f68acc35ff5c3dd0621ff29b0c9",
      decimals: 18,
    },
    {
      name: "GSWAP",
      address: "0xaac41ec512808d64625576eddd580e7ea40ef8b2",
      decimals: 18,
    },
    {
      name: "FEVR",
      address: "0x9fb83c0635de2e815fd1c21b3a292277540c2e8d",
      decimals: 18,
    },
    {
      name: "XRUNE",
      address: "0x69fa0fee221ad11012bab0fdb45d444d3d2ce71c",
      decimals: 18,
    },
    {
      name: "INUS",
      address: "0x39207d2e2feef178fbda8083914554c59d9f8c00",
      decimals: 18,
    },
    {
      name: "LEAD",
      address: "0x1dd80016e3d4ae146ee2ebb484e8edd92dacc4ce",
      decimals: 18,
    },
    {
      name: "NTVRK",
      address: "0xfc0d6cf33e38bce7ca7d89c0e292274031b7157a",
      decimals: 18,
    },
    {
      name: "VXL",
      address: "0x16cc8367055ae7e9157dbcb9d86fd6ce82522b31",
      decimals: 18,
    },
    {
      name: "NFTS",
      address: "0x08037036451c768465369431da5c671ad9b37dbc",
      decimals: 18,
    },
    {
      name: "ATA",
      address: "0xa2120b9e674d3fc3875f415a7df52e382f141225",
      decimals: 18,
    },
    {
      name: "LSS",
      address: "0x3b9be07d622accaed78f479bc0edabfd6397e320",
      decimals: 18,
    },
    {
      name: "QANX",
      address: "0xaaa7a10a8ee237ea61e8ac46c50a8db8bcc1baaa",
      decimals: 18,
    },
    {
      name: "KIRO",
      address: "0xb1191f691a355b43542bea9b8847bc73e7abb137",
      decimals: 18,
    },
    {
      name: "WAS",
      address: "0x0c572544a4ee47904d54aaa6a970af96b6f00e1b",
      decimals: 18,
    },
    {
      name: "GRO",
      address: "0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7",
      decimals: 18,
    },
    {
      name: "SYNC",
      address: "0xb6ff96b8a8d214544ca0dbc9b33f7ad6503efd32",
      decimals: 18,
    },
    {
      name: "BTBS",
      address: "0x32e6c34cd57087abbd59b5a4aecc4cb495924356",
      decimals: 18,
    },
    {
      name: "STRK",
      address: "0x74232704659ef37c08995e386a2e26cc27a8d7b1",
      decimals: 18,
    },
    {
      name: "PERC",
      address: "0x60be1e1fe41c1370adaf5d8e66f07cf1c2df2268",
      decimals: 18,
    },
    {
      name: "ZINU",
      address: "0xc50ef449171a51fbeafd7c562b064b6471c36caa",
      decimals: 9,
    },
    {
      name: "LAYER",
      address: "0x0ff6ffcfda92c53f615a4a75d982f399c989366b",
      decimals: 18,
    },
    {
      name: "SD",
      address: "0x30d20208d987713f46dfd34ef128bb16c404d10f",
      decimals: 18,
    },
    {
      name: "OOE",
      address: "0x7778360f035c589fce2f4ea5786cbd8b36e5396b",
      decimals: 18,
    },
    {
      name: "PLY",
      address: "0x1ab43204a195a0fd37edec621482afd3792ef90b",
      decimals: 18,
    },
    {
      name: "XAMP",
      address: "0xf911a7ec46a2c6fa49193212fe4a2a9b95851c27",
      decimals: 9,
    },
    {
      name: "XED",
      address: "0xee573a945b01b788b9287ce062a0cfc15be9fd86",
      decimals: 18,
    },
    {
      name: "RAINI",
      address: "0xeb953eda0dc65e3246f43dc8fa13f35623bdd5ed",
      decimals: 18,
    },
    {
      name: "DEFIT",
      address: "0x84cffa78b2fbbeec8c37391d2b12a04d2030845e",
      decimals: 18,
    },
    {
      name: "BLANK",
      address: "0x41a3dba3d677e573636ba691a70ff2d606c29666",
      decimals: 18,
    },
    {
      name: "POLC",
      address: "0xaa8330fb2b4d5d07abfe7a72262752a8505c6b37",
      decimals: 18,
    },
    {
      name: "CAPS",
      address: "0x03be5c903c727ee2c8c4e9bc0acc860cca4715e2",
      decimals: 18,
    },
    {
      name: "ADX",
      address: "0xade00c28244d5ce17d72e40330b1c318cd12b7c3",
      decimals: 18,
    },
    {
      name: "MINDS",
      address: "0xb26631c6dda06ad89b93c71400d25692de89c068",
      decimals: 18,
    },
    {
      name: "EHIVE",
      address: "0x4ae2cd1f5b8806a973953b76f9ce6d5fab9cdcfd",
      decimals: 18,
    },
    {
      name: "UPUNK",
      address: "0x8d2bffcbb19ff14a698c424fbcdcfd17aab9b905",
      decimals: 18,
    },
    {
      name: "XTM",
      address: "0xcd1faff6e578fa5cac469d2418c95671ba1a62fe",
      decimals: 18,
    },
    {
      name: "ALD",
      address: "0xb26c4b3ca601136daf98593feaeff9e0ca702a8d",
      decimals: 18,
    },
    {
      name: "CGG",
      address: "0x1fe24f25b1cf609b9c4e7e12d802e3640dfa5e43",
      decimals: 18,
    },
    {
      name: "UOS",
      address: "0xd13c7342e1ef687c5ad21b27c2b65d772cab5c8c",
      decimals: 4,
    },
    {
      name: "FX",
      address: "0x8c15ef5b4b21951d50e53e4fbda8298ffad25057",
      decimals: 18,
    },
    {
      name: "KEEP",
      address: "0x85eee30c52b0b379b046fb0f85f4f3dc3009afec",
      decimals: 18,
    },
    {
      name: "RSR",
      address: "0x320623b8e4ff03373931769a31fc52a4e78b5d70",
      decimals: 18,
    },
    {
      name: "REEF",
      address: "0xfe3e6a25e6b192a42a44ecddcd13796471735acf",
      decimals: 18,
    },
    {
      name: "FLOW",
      address: "0x5c147e74d63b1d31aa3fd78eb229b65161983b2b",
      decimals: 18,
    },
    {
      name: "C98",
      address: "0xae12c5930881c53715b369cec7606b70d8eb229f",
      decimals: 18,
    },
    {
      name: "UNFI",
      address: "0x441761326490cacf7af299725b6292597ee822c2",
      decimals: 18,
    },
    {
      name: "MXC",
      address: "0x5ca381bbfb58f0092df149bd3d243b08b9a8386e",
      decimals: 18,
    },
    {
      name: "CRU",
      address: "0x32a7c02e79c4ea1008dd6564b35f131428673c41",
      decimals: 18,
    },
    {
      name: "RBC",
      address: "0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3",
      decimals: 18,
    },
    {
      name: "SHIRYO",
      address: "0x1e2f15302b90edde696593607b6bd444b64e8f02",
      decimals: 9,
    },
    {
      name: "FSW",
      address: "0xfffffffff15abf397da76f1dcc1a1604f45126db",
      decimals: 18,
    },
    {
      name: "GOG",
      address: "0x9ab7bb7fdc60f4357ecfef43986818a2a3569c62",
      decimals: 18,
    },
    {
      name: "QMALL",
      address: "0x2217e5921b7edfb4bb193a6228459974010d2198",
      decimals: 18,
    },
    {
      name: "LINU",
      address: "0x78132543d8e20d2417d8a07d9ae199d458a0d581",
      decimals: 18,
    },
    {
      name: "OPUL",
      address: "0x80d55c03180349fff4a229102f62328220a96444",
      decimals: 18,
    },
    {
      name: "DFYN",
      address: "0x9695e0114e12c0d3a3636fab5a18e6b737529023",
      decimals: 18,
    },
    {
      name: "BDT",
      address: "0x4efe8665e564bf454ccf5c90ee16817f7485d5cf",
      decimals: 18,
    },
    {
      name: "HTB",
      address: "0x6be61833fc4381990e82d7d4a9f4c9b3f67ea941",
      decimals: 18,
    },
    {
      name: "MUSK",
      address: "0x6069c9223e8a5da1ec49ac5525d4bb757af72cd8",
      decimals: 18,
    },
    {
      name: "MV",
      address: "0xae788f80f2756a86aa2f410c651f2af83639b95b",
      decimals: 18,
    },
    {
      name: "VEGA",
      address: "0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e",
      decimals: 18,
    },
    {
      name: "XIO",
      address: "0x0f7f961648ae6db43c75663ac7e5414eb79b5704",
      decimals: 18,
    },
    {
      name: "FNT",
      address: "0xdc5864ede28bd4405aa04d93e05a0531797d9d59",
      decimals: 6,
    },
    {
      name: "AIOZ",
      address: "0x626e8036deb333b408be468f951bdb42433cbf18",
      decimals: 18,
    },
    {
      name: "SKEY",
      address: "0x06a01a4d579479dd5d884ebf61a31727a3d8d442",
      decimals: 8,
    },
    {
      name: "HAI",
      address: "0x05fb86775fd5c16290f1e838f5caaa7342bd9a63",
      decimals: 8,
    },
    {
      name: "FABRIC",
      address: "0x8c6fa66c21ae3fc435790e451946a9ea82e6e523",
      decimals: 18,
    },
    {
      name: "DORA",
      address: "0xbc4171f45ef0ef66e76f979df021a34b46dcc81d",
      decimals: 18,
    },
    {
      name: "TLM",
      address: "0x888888848b652b3e3a0f34c96e00eec0f3a23f72",
      decimals: 4,
    },
    {
      name: "BAND",
      address: "0xba11d00c5f74255f56a5e366f4f77f5a186d7f55",
      decimals: 18,
    },
    {
      name: "XFT",
      address: "0xabe580e7ee158da464b51ee1a83ac0289622e6be",
      decimals: 18,
    },
    {
      name: "QUICK",
      address: "0x6c28aef8977c9b773996d0e8376d2ee379446f2f",
      decimals: 18,
    },
    {
      name: "COLLAR",
      address: "0x9783b81438c24848f85848f8df31845097341771",
      decimals: 18,
    },
    {
      name: "HXRO",
      address: "0x4bd70556ae3f8a6ec6c4080a0c327b24325438f3",
      decimals: 18,
    },
    {
      name: "SYNR",
      address: "0xbc6e06778708177a18210181b073da747c88490a",
      decimals: 18,
    },
    {
      name: "RVF",
      address: "0xdc8af07a7861bedd104b8093ae3e9376fc8596d2",
      decimals: 18,
    },
    {
      name: "STILT",
      address: "0xb5f1457d6fba1956fb8d31b0b7caca14bde0be4b",
      decimals: 9,
    },
    {
      name: "ACH",
      address: "0xed04915c23f00a313a544955524eb7dbd823143d",
      decimals: 8,
    },
    {
      name: "ARC",
      address: "0xc82e3db60a52cf7529253b4ec688f631aad9e7c2",
      decimals: 18,
    },
    {
      name: "SIL",
      address: "0x133bb423d9248a336d2b3086b8f44a7dbff3a13c",
      decimals: 18,
    },
    {
      name: "NITRO",
      address: "0x0335a7610d817aeca1bebbefbd392ecc2ed587b8",
      decimals: 18,
    },
    {
      name: "EPAN",
      address: "0x72630b1e3b42874bf335020ba0249e3e9e47bafc",
      decimals: 18,
    },
    {
      name: "ZEE",
      address: "0x2edf094db69d6dcd487f1b3db9febe2eec0dd4c5",
      decimals: 18,
    },
    {
      name: "HDRN",
      address: "0x3819f64f282bf135d62168c1e513280daf905e06",
      decimals: 9,
    },
    {
      name: "GLCH",
      address: "0x038a68ff68c393373ec894015816e33ad41bd564",
      decimals: 18,
    },
    {
      name: "SHI",
      address: "0xad996a45fd2373ed0b10efa4a8ecb9de445a4302",
      decimals: 18,
    },
    {
      name: "ORAI",
      address: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
      decimals: 18,
    },
    {
      name: "TEL",
      address: "0x467bccd9d29f223bce8043b84e8c8b282827790f",
      decimals: 2,
    },
    {
      name: "ADS",
      address: "0xcfcecfe2bd2fed07a9145222e8a7ad9cf1ccd22a",
      decimals: 11,
    },
    {
      name: "SDT",
      address: "0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f",
      decimals: 18,
    },
    {
      name: "NFTL",
      address: "0x3c8d2fce49906e11e71cb16fa0ffeb2b16c29638",
      decimals: 18,
    },
    {
      name: "CQT",
      address: "0xd417144312dbf50465b1c641d016962017ef6240",
      decimals: 18,
    },
    {
      name: "NGL",
      address: "0x2653891204f463fb2a2f4f412564b19e955166ae",
      decimals: 18,
    },
    {
      name: "SOLACE",
      address: "0x501ace9c35e60f03a2af4d484f49f9b1efde9f40",
      decimals: 18,
    },
    {
      name: "BCDT",
      address: "0xacfa209fb73bf3dd5bbfb1101b9bc999c49062a5",
      decimals: 18,
    },
    {
      name: "PMON",
      address: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
      decimals: 18,
    },
    {
      name: "NOW",
      address: "0xe9a95d175a5f4c9369f3b74222402eb1b837693b",
      decimals: 8,
    },
    {
      name: "KTLYO",
      address: "0x24e3794605c84e580eea4972738d633e8a7127c8",
      decimals: 18,
    },
    {
      name: "NNT",
      address: "0x4c4d878fae704fff9e00325f7c2bc758489202ec",
      decimals: 18,
    },
    {
      name: "MYC",
      address: "0x4b13006980acb09645131b91d259eaa111eaf5ba",
      decimals: 18,
    },
    {
      name: "GMEE",
      address: "0xd9016a907dc0ecfa3ca425ab20b6b785b42f2373",
      decimals: 18,
    },
    {
      name: "CFi",
      address: "0x63b4f3e3fa4e438698ce330e365e831f7ccd1ef4",
      decimals: 18,
    },
    {
      name: "CELL",
      address: "0x26c8afbbfe1ebaca03c2bb082e69d0476bffe099",
      decimals: 18,
    },
    {
      name: "MAP",
      address: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4",
      decimals: 18,
    },
    {
      name: "$MAID",
      address: "0x4af698b479d0098229dc715655c667ceb6cd8433",
      decimals: 18,
    },
    {
      name: "REVO",
      address: "0x155040625d7ae3e9cada9a73e3e44f76d3ed1409",
      decimals: 18,
    },
    {
      name: "CUDOS",
      address: "0x817bbdbc3e8a1204f3691d14bb44992841e3db35",
      decimals: 18,
    },
    {
      name: "LOOT",
      address: "0x721a1b990699ee9d90b6327faad0a3e840ae8335",
      decimals: 18,
    },
    {
      name: "UMB",
      address: "0x6fc13eace26590b80cccab1ba5d51890577d83b2",
      decimals: 18,
    },
    {
      name: "EPIK",
      address: "0x4da0c48376c277cdbd7fc6fdc6936dee3e4adf75",
      decimals: 18,
    },
    {
      name: "CUMINU",
      address: "0xd6327ce1fb9d6020e8c2c0e124a1ec23dcab7536",
      decimals: 18,
    },
    {
      name: "ROBO",
      address: "0x6fc2f1044a3b9bb3e43a43ec8f840843ed753061",
      decimals: 18,
    },
    {
      name: "1ART",
      address: "0xd3c325848d7c6e29b574cb0789998b2ff901f17e",
      decimals: 18,
    },
    {
      name: "TRVL",
      address: "0xd47bdf574b4f76210ed503e0efe81b58aa061f3d",
      decimals: 18,
    },
    {
      name: "VINU",
      address: "0xafcdd4f666c84fed1d8bd825aa762e3714f652c9",
      decimals: 18,
    },
    {
      name: "UNCL",
      address: "0x2f4eb47a1b1f4488c71fc10e39a4aa56af33dd49",
      decimals: 18,
    },
    {
      name: "SWISS",
      address: "0x692eb773e0b5b7a79efac5a015c8b36a2577f65c",
      decimals: 18,
    },
    {
      name: "CPD",
      address: "0x9b31bb425d8263fa1b8b9d090b83cf0c31665355",
      decimals: 18,
    },
    {
      name: "MOOV",
      address: "0x24ec2ca132abf8f6f8a6e24a1b97943e31f256a7",
      decimals: 18,
    },
    {
      name: "JELLY",
      address: "0xf5f06ffa53ad7f5914f493f16e57b56c8dd2ea80",
      decimals: 18,
    },
    {
      name: "GDT",
      address: "0xc67b12049c2d0cf6e476bc64c7f82fc6c63cffc5",
      decimals: 8,
    },
    {
      name: "EDDA",
      address: "0xfbbe9b1142c699512545f47937ee6fae0e4b0aa9",
      decimals: 18,
    },
    {
      name: "KAI",
      address: "0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093",
      decimals: 18,
    },
    {
      name: "DEXM",
      address: "0x0020d80229877b495d2bf3269a4c13f6f1e1b9d3",
      decimals: 18,
    },
    {
      name: "XMT",
      address: "0x3e5d9d8a63cc8a88748f229999cf59487e90721e",
      decimals: 18,
    },
    {
      name: "MVI",
      address: "0x72e364f2abdc788b7e918bc238b21f109cd634d7",
      decimals: 18,
    },
    {
      name: "PROM",
      address: "0xfc82bb4ba86045af6f327323a46e80412b91b27d",
      decimals: 18,
    },
    {
      name: "ARMOR",
      address: "0x1337def16f9b486faed0293eb623dc8395dfe46a",
      decimals: 18,
    },
    {
      name: "CYC",
      address: "0x8861cff2366c1128fd699b68304ad99a0764ef9a",
      decimals: 18,
    },
    {
      name: "DIONE",
      address: "0x89b69f2d1adffa9a253d40840b6baa7fc903d697",
      decimals: 9,
    },
    {
      name: "BEL",
      address: "0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14",
      decimals: 18,
    },
    {
      name: "QNT",
      address: "0x4a220e6096b25eadb88358cb44068a3248254675",
      decimals: 18,
    },
    {
      name: "RAZOR",
      address: "0x50de6856358cc35f3a9a57eaaa34bd4cb707d2cd",
      decimals: 18,
    },
    {
      name: "NEBO",
      address: "0x7f0c8b125040f707441cad9e5ed8a8408673b455",
      decimals: 18,
    },
    {
      name: "REVV",
      address: "0x557b933a7c2c45672b610f8954a3deb39a51a8ca",
      decimals: 18,
    },
    {
      name: "MASQ",
      address: "0x06f3c323f0238c72bf35011071f2b5b7f43a054c",
      decimals: 18,
    },
    {
      name: "STOS",
      address: "0x08c32b0726c5684024ea6e141c50ade9690bbdcc",
      decimals: 18,
    },
    {
      name: "FORS",
      address: "0xb1ec548f296270bc96b8a1b3b3c8f3f04b494215",
      decimals: 18,
    },
    {
      name: "LOOKS",
      address: "0xf4d2888d29d722226fafa5d9b24f9164c092421e",
      decimals: 18,
    },
    {
      name: "STACK",
      address: "0x56a86d648c435dc707c8405b78e2ae8eb4e60ba4",
      decimals: 18,
    },
    {
      name: "SDL",
      address: "0xf1dc500fde233a4055e25e5bbf516372bc4f6871",
      decimals: 18,
    },
    {
      name: "NAOS",
      address: "0x4a615bb7166210cce20e6642a6f8fb5d4d044496",
      decimals: 18,
    },
    {
      name: "SLD",
      address: "0x1ef6a7e2c966fb7c5403efefde38338b1a95a084",
      decimals: 18,
    },
    {
      name: "XEND",
      address: "0xe4cfe9eaa8cdb0942a80b7bc68fd8ab0f6d44903",
      decimals: 18,
    },
    {
      name: "PLA",
      address: "0x3a4f40631a4f906c2bad353ed06de7a5d3fcb430",
      decimals: 18,
    },
    {
      name: "DRCT",
      address: "0x9d561d63375672abd02119b9bc4fb90eb9e307ca",
      decimals: 18,
    },
    {
      name: "LYXe",
      address: "0xa8b919680258d369114910511cc87595aec0be6d",
      decimals: 18,
    },
    {
      name: "SANI",
      address: "0x4521c9ad6a3d4230803ab752ed238be11f8b342f",
      decimals: 18,
    },
    {
      name: "AGS",
      address: "0x667fd83e24ca1d935d36717d305d54fa0cac991c",
      decimals: 18,
    },
    {
      name: "DERI",
      address: "0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9",
      decimals: 18,
    },
    {
      name: "BUFFS",
      address: "0x140b890bf8e2fe3e26fcd516c75728fb20b31c4f",
      decimals: 4,
    },
    {
      name: "TKX",
      address: "0x667102bd3413bfeaa3dffb48fa8288819e480a88",
      decimals: 8,
    },
    {
      name: "ARPA",
      address: "0xba50933c268f567bdc86e1ac131be072c6b0b71a",
      decimals: 18,
    },
    {
      name: "YEL",
      address: "0x7815bda662050d84718b988735218cffd32f75ea",
      decimals: 18,
    },
    {
      name: "HOTCROSS",
      address: "0x4297394c20800e8a38a619a243e9bbe7681ff24e",
      decimals: 18,
    },
    {
      name: "SWAG",
      address: "0x87edffde3e14c7a66c9b9724747a1c5696b742e6",
      decimals: 18,
    },
    {
      name: "VERSE",
      address: "0x249ca82617ec3dfb2589c4c17ab7ec9765350a18",
      decimals: 18,
    },
    {
      name: "TON",
      address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
      decimals: 9,
    },
    {
      name: "YFIM",
      address: "0x2e2f3246b6c65ccc4239c9ee556ec143a7e5de2c",
      decimals: 18,
    },
    {
      name: "PUSSY",
      address: "0x9196e18bc349b1f64bc08784eae259525329a1ad",
      decimals: 18,
    },
    {
      name: "MARS4",
      address: "0x16cda4028e9e872a38acb903176719299beaed87",
      decimals: 18,
    },
    {
      name: "LIFE",
      address: "0x6c936d4ae98e6d2172db18c16c4b601c99918ee6",
      decimals: 18,
    },
    {
      name: "SEEN",
      address: "0xca3fe04c7ee111f0bbb02c328c699226acf9fd33",
      decimals: 18,
    },
    {
      name: "NFTY",
      address: "0xe1d7c7a4596b038ced2a84bf65b8647271c53208",
      decimals: 18,
    },
    {
      name: "UNIC",
      address: "0x94e0bab2f6ab1f19f4750e42d7349f2740513ad5",
      decimals: 18,
    },
    {
      name: "RDT",
      address: "0x4740735aa98dc8aa232bd049f8f0210458e7fca3",
      decimals: 18,
    },
    {
      name: "PLOT",
      address: "0x72f020f8f3e8fd9382705723cd26380f8d0c66bb",
      decimals: 18,
    },
    {
      name: "GYSR",
      address: "0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab",
      decimals: 18,
    },
    {
      name: "AGIX",
      address: "0x5b7533812759b45c2b44c19e320ba2cd2681b542",
      decimals: 8,
    },
    {
      name: "FEAR",
      address: "0x88a9a52f944315d5b4e917b9689e65445c401e83",
      decimals: 18,
    },
    {
      name: "NBT",
      address: "0x446f2a8a39cc730ef378be759a3c57f1a3fe824c",
      decimals: 18,
    },
    {
      name: "UDO",
      address: "0xea3983fc6d0fbbc41fb6f6091f68f3e08894dc06",
      decimals: 18,
    },
    {
      name: "CHAIN",
      address: "0xc4c2614e694cf534d407ee49f8e44d125e4681c4",
      decimals: 18,
    },
    {
      name: "PNL",
      address: "0x9fc8f0ca1668e87294941b7f627e9c15ea06b459",
      decimals: 18,
    },
    {
      name: "TRAVA",
      address: "0x186d0ba3dfc3386c464eecd96a61fbb1e2da00bf",
      decimals: 18,
    },
    {
      name: "BPT",
      address: "0x0ec9f76202a7061eb9b3a7d6b59d36215a7e37da",
      decimals: 18,
    },
    {
      name: "BPRO",
      address: "0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61",
      decimals: 18,
    },
    {
      name: "WHL",
      address: "0x2af72850c504ddd3c1876c66a914caee7ff8a46a",
      decimals: 18,
    },
    {
      name: "DDIM",
      address: "0xfbeea1c75e4c4465cb2fccc9c6d6afe984558e20",
      decimals: 18,
    },
    {
      name: "BDP",
      address: "0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e",
      decimals: 18,
    },
    {
      name: "ABR",
      address: "0xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c",
      decimals: 18,
    },
    {
      name: "ORE",
      address: "0x4f640f2529ee0cf119a2881485845fa8e61a782a",
      decimals: 18,
    },
    {
      name: "CE",
      address: "0x8f12dfc7981de79a8a34070a732471f2d335eece",
      decimals: 18,
    },
    {
      name: "SLICE",
      address: "0x0aee8703d34dd9ae107386d3eff22ae75dd616d1",
      decimals: 18,
    },
    {
      name: "HAPI",
      address: "0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54",
      decimals: 18,
    },
    {
      name: "AXS",
      address: "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
      decimals: 18,
    },
    {
      name: "DON",
      address: "0x217ddead61a42369a266f1fb754eb5d3ebadc88a",
      decimals: 18,
    },
    {
      name: "YAE",
      address: "0x4ee438be38f8682abb089f2bfea48851c5e71eaf",
      decimals: 18,
    },
    {
      name: "HORD",
      address: "0x43a96962254855f16b925556f9e97be436a43448",
      decimals: 18,
    },
    {
      name: "EQUAD",
      address: "0xc28e931814725bbeb9e670676fabbcb694fe7df2",
      decimals: 18,
    },
    {
      name: "GCAKE",
      address: "0x5f944b0c4315cb7c3a846b025ab4045da44abf6c",
      decimals: 18,
    },
    {
      name: "VST",
      address: "0x77a1f4e744d810239f465043e35d067ca33de259",
      decimals: 18,
    },
    {
      name: "REALM",
      address: "0x464fdb8affc9bac185a7393fd4298137866dcfb8",
      decimals: 18,
    },
    {
      name: "BNSD",
      address: "0x668dbf100635f593a3847c0bdaf21f0a09380188",
      decimals: 18,
    },
    {
      name: "Mononoke-Inu",
      address: "0x4da08a1bff50be96bded5c7019227164b49c2bfc",
      decimals: 9,
    },
    {
      name: "ERP",
      address: "0x0a0e3bfd5a8ce610e735d4469bc1b3b130402267",
      decimals: 18,
    },
    {
      name: "DUCK",
      address: "0xc0ba369c8db6eb3924965e5c4fd0b4c1b91e305f",
      decimals: 18,
    },
    {
      name: "XBE",
      address: "0x5de7cc4bcbca31c473f6d2f27825cfb09cc0bb16",
      decimals: 18,
    },
    {
      name: "BONE",
      address: "0x9813037ee2218799597d83d4a5b6f3b6778218d9",
      decimals: 18,
    },
    {
      name: "VRX",
      address: "0x87de305311d5788e8da38d19bb427645b09cb4e5",
      decimals: 18,
    },
    {
      name: "SWAPP",
      address: "0x8cb924583681cbfe487a62140a994a49f833c244",
      decimals: 18,
    },
    {
      name: "UPI",
      address: "0x70d2b7c19352bb76e4409858ff5746e500f2b67c",
      decimals: 18,
    },
    {
      name: "DNXC",
      address: "0x20a8cec5fffea65be7122bcab2ffe32ed4ebf03a",
      decimals: 18,
    },
    {
      name: "WNCG",
      address: "0xf203ca1769ca8e9e8fe1da9d147db68b6c919817",
      decimals: 18,
    },
    {
      name: "XP",
      address: "0x948c70dc6169bfb10028fdbe96cbc72e9562b2ac",
      decimals: 18,
    },
    {
      name: "COTI",
      address: "0xddb3422497e61e13543bea06989c0789117555c5",
      decimals: 18,
    },
    {
      name: "POOL",
      address: "0x0cec1a9154ff802e7934fc916ed7ca50bde6844e",
      decimals: 18,
    },
    {
      name: "YSEC",
      address: "0xeea9ae787f3a620072d13b2cdc8cabffb9c0ab96",
      decimals: 18,
    },
    {
      name: "SCV",
      address: "0x282417b21236ac01a3a3d7ba304ed8d284f48b4d",
      decimals: 18,
    },
    {
      name: "FAI",
      address: "0xcda2f16c6aa895d533506b426aff827b709c87f5",
      decimals: 18,
    },
    {
      name: "HEGIC",
      address: "0x584bc13c7d411c00c01a62e8019472de68768430",
      decimals: 18,
    },
    {
      name: "FCL",
      address: "0xf4d861575ecc9493420a3f5a14f85b13f0b50eb3",
      decimals: 18,
    },
    {
      name: "CRBN",
      address: "0xcdeee767bed58c5325f68500115d4b722b3724ee",
      decimals: 18,
    },
    {
      name: "CIRUS",
      address: "0xa01199c61841fce3b3dafb83fefc1899715c8756",
      decimals: 18,
    },
    {
      name: "eRSDL",
      address: "0x5218e472cfcfe0b64a064f055b43b4cdc9efd3a6",
      decimals: 18,
    },
    {
      name: "TFS",
      address: "0xc2a81eb482cb4677136d8812cc6db6e0cb580883",
      decimals: 18,
    },
    {
      name: "MONA",
      address: "0x275f5ad03be0fa221b4c6649b8aee09a42d9412a",
      decimals: 18,
    },
    {
      name: "1-UP",
      address: "0xc86817249634ac209bc73fca1712bbd75e37407d",
      decimals: 18,
    },
    {
      name: "CHANGE",
      address: "0x7051faed0775f664a0286af4f75ef5ed74e02754",
      decimals: 18,
    },
    {
      name: "DVI",
      address: "0x10633216e7e8281e33c86f02bf8e565a635d9770",
      decimals: 18,
    },
    {
      name: "HOICHI",
      address: "0xc4ee0aa2d993ca7c9263ecfa26c6f7e13009d2b6",
      decimals: 18,
    },
    {
      name: "ONT",
      address: "0xcb46c550539ac3db72dc7af7c89b11c306c727c2",
      decimals: 9,
    },
    {
      name: "BONDLY",
      address: "0x91dfbee3965baaee32784c2d546b7a0c62f268c9",
      decimals: 18,
    },
    {
      name: "MoFi",
      address: "0xb2dbf14d0b47ed3ba02bdb7c954e05a72deb7544",
      decimals: 18,
    },
    {
      name: "AXL",
      address: "0x25b24b3c47918b7962b3e49c4f468367f73cc0e0",
      decimals: 18,
    },
    {
      name: "KALLY",
      address: "0xfd30c9bea1a952feeed2ef2c6b2ff8a8fc4aad07",
      decimals: 18,
    },
    {
      name: "GS",
      address: "0xe0b9a2c3e9f40cf74b2c7f591b2b0cca055c3112",
      decimals: 18,
    },
    {
      name: "DOSE",
      address: "0xb31ef9e52d94d4120eb44fe1ddfde5b4654a6515",
      decimals: 18,
    },
    {
      name: "GAINS",
      address: "0xd9b312d77bc7bed9b9cecb56636300bed4fe5ce9",
      decimals: 18,
    },
    {
      name: "HID",
      address: "0xb14ebf566511b9e6002bb286016ab2497b9b9c9d",
      decimals: 18,
    },
    {
      name: "SHIH",
      address: "0x841fb148863454a3b3570f515414759be9091465",
      decimals: 18,
    },
    {
      name: "SHROOM",
      address: "0xed0439eacf4c4965ae4613d77a5c2efe10e5f183",
      decimals: 18,
    },
    {
      name: "SPI",
      address: "0x9b02dd390a603add5c07f9fd9175b7dabe8d63b7",
      decimals: 18,
    },
    {
      name: "FRMX",
      address: "0xf6832ea221ebfdc2363729721a146e6745354b14",
      decimals: 18,
    },
    {
      name: "IONX",
      address: "0x02d3a27ac3f55d5d91fb0f52759842696a864217",
      decimals: 18,
    },
    {
      name: "OIN",
      address: "0x9aeb50f542050172359a0e1a25a9933bc8c01259",
      decimals: 8,
    },
    {
      name: "LEAG",
      address: "0x7b39917f9562c8bc83c7a6c2950ff571375d505d",
      decimals: 18,
    },
    {
      name: "SAN",
      address: "0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098",
      decimals: 18,
    },
    {
      name: "SHAKE",
      address: "0x6006fc2a849fedaba8330ce36f5133de01f96189",
      decimals: 18,
    },
    {
      name: "OCC",
      address: "0x2f109021afe75b949429fe30523ee7c0d5b27207",
      decimals: 18,
    },
    {
      name: "QUA",
      address: "0xd35c06a2781f648c75290976ecf71e71582188b7",
      decimals: 18,
    },
    {
      name: "F9",
      address: "0x38a94e92a19e970c144ded0b2dd47278ca11cc1f",
      decimals: 9,
    },
    {
      name: "CONV",
      address: "0xc834fa996fa3bec7aad3693af486ae53d8aa8b50",
      decimals: 18,
    },
    {
      name: "INU",
      address: "0x050d94685c6b0477e1fc555888af6e2bb8dfbda5",
      decimals: 18,
    },
    {
      name: "DOGEGF",
      address: "0xfb130d93e49dca13264344966a611dc79a456bc5",
      decimals: 18,
    },
    {
      name: "XFIT",
      address: "0x4aa41bc1649c9c3177ed16caaa11482295fc7441",
      decimals: 18,
    },
    {
      name: "PICKLE",
      address: "0x429881672b9ae42b8eba0e26cd9c73711b891ca5",
      decimals: 18,
    },
    {
      name: "BASIC",
      address: "0xf25c91c87e0b1fd9b4064af0f427157aab0193a7",
      decimals: 18,
    },
    {
      name: "VENT",
      address: "0x5f0bc16d50f72d10b719dbf6845de2e599eb5624",
      decimals: 18,
    },
    {
      name: "SIS",
      address: "0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9",
      decimals: 18,
    },
    {
      name: "AAG",
      address: "0x5ba19d656b65f1684cfea4af428c23b9f3628f97",
      decimals: 18,
    },
    {
      name: "BAO",
      address: "0x374cb8c27130e2c9e04f44303f3c8351b9de61c1",
      decimals: 18,
    },
    {
      name: "BCUBE",
      address: "0x93c9175e26f57d2888c7df8b470c9eea5c0b0a93",
      decimals: 18,
    },
    {
      name: "USF",
      address: "0xe0e05c43c097b0982db6c9d626c4eb9e95c3b9ce",
      decimals: 18,
    },
    {
      name: "YAMV2",
      address: "0xaba8cac6866b83ae4eec97dd07ed254282f6ad8a",
      decimals: 24,
    },
    {
      name: "GEEQ",
      address: "0x6b9f031d718dded0d681c20cb754f97b3bb81b78",
      decimals: 18,
    },
    {
      name: "IOI",
      address: "0x8b3870df408ff4d7c3a26df852d41034eda11d81",
      decimals: 6,
    },
    {
      name: "LUA",
      address: "0xb1f66997a5760428d3a87d68b90bfe0ae64121cc",
      decimals: 18,
    },
    {
      name: "CTZN",
      address: "0xa803778ab953d3ffe4fbd20cfa0042ecefe8319d",
      decimals: 18,
    },
    {
      name: "INSURE",
      address: "0xd83ae04c9ed29d6d3e6bf720c71bc7beb424393e",
      decimals: 18,
    },
    {
      name: "SOURCE",
      address: "0x7118057ff0f4fd0994fb9d2d94de8231d5cca79e",
      decimals: 18,
    },
    {
      name: "PATH",
      address: "0x2a2550e0a75acec6d811ae3930732f7f3ad67588",
      decimals: 18,
    },
    {
      name: "UNIQ",
      address: "0x3758e00b100876c854636ef8db61988931bb8025",
      decimals: 18,
    },
    {
      name: "FRIN",
      address: "0xc9fe6e1c76210be83dc1b5b20ec7fd010b0b1d15",
      decimals: 18,
    },
    {
      name: "TOSHI",
      address: "0xf136d7b0b7ae5b86d21e7b78dfa95375a7360f19",
      decimals: 18,
    },
    {
      name: "CIV",
      address: "0x37fe0f067fa808ffbdd12891c0858532cfe7361d",
      decimals: 18,
    },
    {
      name: "NFT",
      address: "0xcb8d1260f9c92a3a545d409466280ffdd7af7042",
      decimals: 18,
    },
    {
      name: "FANC",
      address: "0xbb126042235e6bd38b17744cb31a8bf4a206c045",
      decimals: 18,
    },
    {
      name: "FRM",
      address: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
      decimals: 6,
    },
    {
      name: "PHA",
      address: "0x6c5ba91642f10282b576d91922ae6448c9d52f4e",
      decimals: 18,
    },
    {
      name: "COR",
      address: "0x9c2dc0c3cc2badde84b0025cf4df1c5af288d835",
      decimals: 18,
    },
    {
      name: "ANML",
      address: "0x38b0e3a59183814957d83df2a97492aed1f003e2",
      decimals: 18,
    },
    {
      name: "STAK",
      address: "0x1f8a626883d7724dbd59ef51cbd4bf1cf2016d13",
      decimals: 18,
    },
    {
      name: "CMCX",
      address: "0x5b685863494c33f344081f75e5430c260c224a32",
      decimals: 18,
    },
    {
      name: "N1",
      address: "0xacbd826394189cf2623c6df98a18b41fc8ffc16d",
      decimals: 18,
    },
    {
      name: "EXNT",
      address: "0xd6c67b93a7b248df608a653d82a100556144c5da",
      decimals: 16,
    },
    {
      name: "bPRIVA",
      address: "0xa82e4aa4c8d0859b1dd333145b6dd488f23e9782",
      decimals: 8,
    },
    {
      name: "SWFTC",
      address: "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
      decimals: 8,
    },
    {
      name: "FIS",
      address: "0xef3a930e1ffffacd2fc13434ac81bd278b0ecc8d",
      decimals: 18,
    },
    {
      name: "SOVI",
      address: "0x2cd5c5705f587e3f794a91dff6e86786ba0c18d5",
      decimals: 18,
    },
    {
      name: "SOFI",
      address: "0xb49fa25978abf9a248b8212ab4b87277682301c0",
      decimals: 18,
    },
    {
      name: "GFARM2",
      address: "0x831091da075665168e01898c6dac004a867f1e1b",
      decimals: 18,
    },
    {
      name: "INSUR",
      address: "0x544c42fbb96b39b21df61cf322b5edc285ee7429",
      decimals: 18,
    },
    {
      name: "SAITOKI",
      address: "0xa3c56427683a19f7574b9fc219cfd27d5d6e87fa",
      decimals: 9,
    },
    {
      name: "KINE",
      address: "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d",
      decimals: 18,
    },
    {
      name: "DAFI",
      address: "0xfc979087305a826c2b2a0056cfaba50aad3e6439",
      decimals: 18,
    },
    {
      name: "SENT",
      address: "0x97abee33cd075c58bfdd174e0885e08e8f03556f",
      decimals: 18,
    },
    {
      name: "NTX",
      address: "0xf0d33beda4d734c72684b5f9abbebf715d0a7935",
      decimals: 6,
    },
    {
      name: "MARSH",
      address: "0x5a666c7d92e5fa7edcb6390e4efd6d0cdd69cf37",
      decimals: 18,
    },
    {
      name: "EJS",
      address: "0x96610186f3ab8d73ebee1cf950c750f3b1fb79c2",
      decimals: 18,
    },
    {
      name: "FRONT",
      address: "0xf8c3527cc04340b208c854e985240c02f7b7793f",
      decimals: 18,
    },
    {
      name: "TRIAS",
      address: "0x3a856d4effa670c54585a5d523e96513e148e95d",
      decimals: 18,
    },
    {
      name: "STORJ",
      address: "0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac",
      decimals: 8,
    },
    {
      name: "GROK",
      address: "0x21d486f6b7eb7b556978c5a0c96c79a08eb841de",
      decimals: 18,
    },
    {
      name: "LAIKA",
      address: "0x77f9cf0bd8c500cffdf420e72343893aecc2ec0b",
      decimals: 18,
    },
    {
      name: "KEN",
      address: "0x6a7ef4998eb9d0f706238756949f311a59e05745",
      decimals: 18,
    },
    {
      name: "PRQ",
      address: "0x362bc847a3a9637d3af6624eec853618a43ed7d2",
      decimals: 18,
    },
    {
      name: "IMPACTXP",
      address: "0xb12494c8824fc069757f47d177e666c571cd49ae",
      decimals: 9,
    },
    {
      name: "CEL",
      address: "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
      decimals: 4,
    },
    {
      name: "BIST",
      address: "0x6e8908cfa881c9f6f2c64d3436e7b80b1bf0093f",
      decimals: 18,
    },
    {
      name: "HEART",
      address: "0x710aa623c2c881b0d7357bcf9aeedf660e606c22",
      decimals: 18,
    },
    {
      name: "XAI",
      address: "0x35e78b3982e87ecfd5b3f3265b601c046cdbe232",
      decimals: 18,
    },
    {
      name: "DIGI",
      address: "0x3cbf23c081faa5419810ce0f6bc1ecb73006d848",
      decimals: 18,
    },
    {
      name: "TDX",
      address: "0x317eb4ad9cfac6232f0046831322e895507bcbeb",
      decimals: 18,
    },
    {
      name: "MPH",
      address: "0x6369c3dadfc00054a42ba8b2c09c48131dd4aa38",
      decimals: 18,
    },
    {
      name: "MAPS",
      address: "0x2b915b505c017abb1547aa5ab355fbe69865cc6d",
      decimals: 6,
    },
    {
      name: "NFTD",
      address: "0x8e0fe2947752be0d5acf73aae77362daf79cb379",
      decimals: 18,
    },
    {
      name: "XCN",
      address: "0xa2cd3d43c775978a96bdbf12d733d5a1ed94fb18",
      decimals: 18,
    },
    {
      name: "KIT",
      address: "0x7866e48c74cbfb8183cd1a929cd9b95a7a5cb4f4",
      decimals: 18,
    },
    {
      name: "ID",
      address: "0xebd9d99a3982d547c5bb4db7e3b1f9f14b67eb83",
      decimals: 18,
    },
    {
      name: "NYM",
      address: "0x525a8f6f3ba4752868cde25164382bfbae3990e1",
      decimals: 6,
    },
    {
      name: "PROS",
      address: "0x8642a849d0dcb7a15a974794668adcfbe4794b56",
      decimals: 18,
    },
    {
      name: "ENTR",
      address: "0xd779eea9936b4e323cddff2529eb6f13d0a4d66e",
      decimals: 18,
    },
    {
      name: "GLQ",
      address: "0x9f9c8ec3534c3ce16f928381372bfbfbfb9f4d24",
      decimals: 18,
    },
    {
      name: "DUSK",
      address: "0x940a2db1b7008b6c776d4faaca729d6d4a4aa551",
      decimals: 18,
    },
    {
      name: "VLX",
      address: "0x8c543aed163909142695f2d2acd0d55791a9edb9",
      decimals: 18,
    },
    {
      name: "PDEX",
      address: "0xf59ae934f6fe444afc309586cc60a84a0f89aaea",
      decimals: 18,
    },
    {
      name: "BTSE",
      address: "0x666d875c600aa06ac1cf15641361dec3b00432ef",
      decimals: 8,
    },
    {
      name: "BLZ",
      address: "0x5732046a883704404f284ce41ffadd5b007fd668",
      decimals: 18,
    },
    {
      name: "STRM",
      address: "0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8",
      decimals: 18,
    },
    {
      name: "NUM",
      address: "0x3496b523e5c00a4b4150d6721320cddb234c3079",
      decimals: 18,
    },
    {
      name: "VLT",
      address: "0x6b785a0322126826d8226d77e173d75dafb84d11",
      decimals: 18,
    },
    {
      name: "RLC",
      address: "0x607f4c5bb672230e8672085532f7e901544a7375",
      decimals: 9,
    },
    {
      name: "DEXE",
      address: "0xde4ee8057785a7e8e800db58f9784845a5c2cbd6",
      decimals: 18,
    },
    {
      name: "LGCY",
      address: "0xae697f994fc5ebc000f8e22ebffee04612f98a0d",
      decimals: 18,
    },
    {
      name: "RAMP",
      address: "0x33d0568941c0c64ff7e0fb4fba0b11bd37deed9f",
      decimals: 18,
    },
    {
      name: "GAME",
      address: "0xd567b5f02b9073ad3a982a099a23bf019ff11d1c",
      decimals: 5,
    },
    {
      name: "VITE",
      address: "0xadd5e881984783dd432f80381fb52f45b53f3e70",
      decimals: 18,
    },
    {
      name: "HGET",
      address: "0x7968bc6a03017ea2de509aaa816f163db0f35148",
      decimals: 6,
    },
    {
      name: "IXS",
      address: "0x73d7c860998ca3c01ce8c808f5577d94d545d1b4",
      decimals: 18,
    },
    {
      name: "PNODE",
      address: "0xaf691508ba57d416f895e32a1616da1024e882d2",
      decimals: 18,
    },
    {
      name: "PKR",
      address: "0x001a8ffcb0f03e99141652ebcdecdb0384e3bd6c",
      decimals: 18,
    },
    {
      name: "EYE",
      address: "0x155ff1a85f440ee0a382ea949f24ce4e0b751c65",
      decimals: 18,
    },
    {
      name: "BBANK",
      address: "0xf4b5470523ccd314c6b9da041076e7d79e0df267",
      decimals: 18,
    },
    {
      name: "XY",
      address: "0x77777777772cf0455fb38ee0e75f38034dfa50de",
      decimals: 18,
    },
    {
      name: "PSP",
      address: "0xcafe001067cdef266afb7eb5a286dcfd277f3de5",
      decimals: 18,
    },
    {
      name: "BRKL",
      address: "0x4674a4f24c5f63d53f22490fb3a08eaaad739ff8",
      decimals: 18,
    },
    {
      name: "MEME",
      address: "0xd5525d397898e5502075ea5e830d8914f6f0affe",
      decimals: 8,
    },
    {
      name: "YFO",
      address: "0xac0c8da4a4748d8d821a0973d00b157aa78c473d",
      decimals: 18,
    },
    {
      name: "BMI",
      address: "0x725c263e32c72ddc3a19bea12c5a0479a81ee688",
      decimals: 18,
    },
    {
      name: "8PAY",
      address: "0xfeea0bdd3d07eb6fe305938878c0cadbfa169042",
      decimals: 18,
    },
    {
      name: "LOCG",
      address: "0x60eb57d085c59932d5faa6c6026268a4386927d0",
      decimals: 18,
    },
    {
      name: "KSW",
      address: "0x7162469321ae5880f077d250b626f3271b21b903",
      decimals: 18,
    },
    {
      name: "WOMBAT",
      address: "0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd",
      decimals: 18,
    },
    {
      name: "STZ",
      address: "0x3f5294df68f871241c4b18fcf78ebd8ac18ab654",
      decimals: 18,
    },
    {
      name: "UNO",
      address: "0x474021845c4643113458ea4414bdb7fb74a01a77",
      decimals: 18,
    },
    {
      name: "YOP",
      address: "0xae1eaae3f627aaca434127644371b67b18444051",
      decimals: 8,
    },
    {
      name: "GODS",
      address: "0xccc8cb5229b0ac8069c51fd58367fd1e622afd97",
      decimals: 18,
    },
    {
      name: "LIQ",
      address: "0x5f69b7ab8f7cab199a310fd5a27b43fef44ddcc0",
      decimals: 18,
    },
    {
      name: "MOPS",
      address: "0x602f65bb8b8098ad804e99db6760fd36208cd967",
      decimals: 18,
    },
    {
      name: "SATA",
      address: "0x3ebb4a4e91ad83be51f8d596533818b246f4bee1",
      decimals: 18,
    },
    {
      name: "CEEK",
      address: "0xb056c38f6b7dc4064367403e26424cd2c60655e1",
      decimals: 18,
    },
    {
      name: "CWS",
      address: "0xac0104cca91d167873b8601d2e71eb3d4d8c33e0",
      decimals: 18,
    },
    {
      name: "TRAXX",
      address: "0xd43be54c1aedf7ee4099104f2dae4ea88b18a249",
      decimals: 18,
    },
    {
      name: "FARM",
      address: "0xa0246c9032bc3a600820415ae600c6388619a14d",
      decimals: 18,
    },
    {
      name: "SIDUS",
      address: "0x549020a9cb845220d66d3e9c6d9f9ef61c981102",
      decimals: 18,
    },
    {
      name: "BRIGHT",
      address: "0xbeab712832112bd7664226db7cd025b153d3af55",
      decimals: 18,
    },
    {
      name: "DOMI",
      address: "0x45c2f8c9b4c0bdc76200448cc26c48ab6ffef83f",
      decimals: 18,
    },
    {
      name: "TOWER",
      address: "0x1c9922314ed1415c95b9fd453c3818fd41867d0b",
      decimals: 18,
    },
    {
      name: "DLTA",
      address: "0x0000000de40dfa9b17854cbc7869d80f9f98d823",
      decimals: 18,
    },
    {
      name: "JAM",
      address: "0x23894dc9da6c94ecb439911caf7d337746575a72",
      decimals: 18,
    },
    {
      name: "HAKA",
      address: "0xd85ad783cc94bd04196a13dc042a3054a9b52210",
      decimals: 18,
    },
    {
      name: "SFI",
      address: "0xb753428af26e81097e7fd17f40c88aaa3e04902c",
      decimals: 18,
    },
    {
      name: "SRK",
      address: "0x0488401c3f535193fa8df029d9ffe615a06e74e6",
      decimals: 18,
    },
    {
      name: "CLIQ",
      address: "0x0def8d8adde14c9ef7c2a986df3ea4bd65826767",
      decimals: 18,
    },
    {
      name: "INV",
      address: "0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68",
      decimals: 18,
    },
    {
      name: "XCV",
      address: "0x493cbbd4a5da462e3dbc3e5c8e2a1e37d1d03cac",
      decimals: 18,
    },
    {
      name: "MATH",
      address: "0x08d967bb0134f2d07f7cfb6e246680c53927dd30",
      decimals: 18,
    },
    {
      name: "GTC",
      address: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
      decimals: 18,
    },
    {
      name: "STARS",
      address: "0xc55c2175e90a46602fd42e931f62b3acc1a013ca",
      decimals: 18,
    },
    {
      name: "LBL",
      address: "0x2162f572b25f7358db9376ab58a947a4e45cede1",
      decimals: 18,
    },
    {
      name: "ISP",
      address: "0xc8807f0f5ba3fa45ffbdc66928d71c5289249014",
      decimals: 18,
    },
    {
      name: "CPOOL",
      address: "0x66761fa41377003622aee3c7675fc7b5c1c2fac5",
      decimals: 18,
    },
    {
      name: "MLN",
      address: "0xec67005c4e498ec7f55e092bd1d35cbc47c91892",
      decimals: 18,
    },
    {
      name: "HOD",
      address: "0xce16a802725438af9b4dcac00e7791e3d890e3b4",
      decimals: 18,
    },
    {
      name: "PYR",
      address: "0x430ef9263e76dae63c84292c3409d61c598e9682",
      decimals: 18,
    },
    {
      name: "LOWB",
      address: "0x69e5c11a7c30f0bf84a9faecbd5161aa7a94deca",
      decimals: 18,
    },
    {
      name: "ONUS",
      address: "0x4184aa04215e5d716dd4c213fed519acadc68f92",
      decimals: 18,
    },
    {
      name: "MTA",
      address: "0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2",
      decimals: 18,
    },
    {
      name: "UFT",
      address: "0x0202be363b8a4820f3f4de7faf5224ff05943ab1",
      decimals: 18,
    },
    {
      name: "DFX",
      address: "0x888888435fde8e7d4c54cab67f206e4199454c60",
      decimals: 18,
    },
    {
      name: "SHOPX",
      address: "0x7bef710a5759d197ec0bf621c3df802c2d60d848",
      decimals: 18,
    },
    {
      name: "API3",
      address: "0x0b38210ea11411557c13457d4da7dc6ea731b88a",
      decimals: 18,
    },
    {
      name: "ONX",
      address: "0xe0ad1806fd3e7edf6ff52fdb822432e847411033",
      decimals: 18,
    },
    {
      name: "RARI",
      address: "0xfca59cd816ab1ead66534d82bc21e7515ce441cf",
      decimals: 18,
    },
    {
      name: "NSURE",
      address: "0x20945ca1df56d237fd40036d47e866c7dccd2114",
      decimals: 18,
    },
    {
      name: "MOONEY",
      address: "0x20d4db1946859e2adb0e5acc2eac58047ad41395",
      decimals: 18,
    },
    {
      name: "MEX",
      address: "0x2ad7868ca212135c6119fd7ad1ce51cfc5702892",
      decimals: 18,
    },
    {
      name: "BHAT",
      address: "0x5014cfd635bc53d6df109dc7803d7f872ee44696",
      decimals: 18,
    },
    {
      name: "RIDE",
      address: "0x25de68ef588cb0c2c8f3537861e828ae699cd0db",
      decimals: 18,
    },
    {
      name: "ITHEUM",
      address: "0x3eee5d2ed0205f93969a59f7c8597fb614264436",
      decimals: 18,
    },
    {
      name: "ZPAY",
      address: "0xf61eb8999f2f222f425d41da4c2ff4b6d8320c87",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      decimals: 8,
    },
    {
      name: "KAP",
      address: "0x9625ce7753ace1fa1865a47aae2c5c2ce4418569",
      decimals: 18,
    },
    {
      name: "MYTH",
      address: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003",
      decimals: 18,
    },
    {
      name: "KIRA",
      address: "0xf98ab0874b13a7fdc39d7295dedd49850a5d426b",
      decimals: 8,
    },
    {
      name: "SYC",
      address: "0x0a41e6d4d4897e8cec819ce7d10b2d7cda61dc94",
      decimals: 18,
    },
    {
      name: "CBSN",
      address: "0x7d4b1d793239707445305d8d2456d2c735f6b25b",
      decimals: 18,
    },
    {
      name: "SIFU",
      address: "0x29127fe04ffa4c32acac0ffe17280abd74eac313",
      decimals: 18,
    },
    {
      name: "UNIDX",
      address: "0x95b3497bbcccc46a8f45f5cf54b0878b39f8d96c",
      decimals: 18,
    },
    {
      name: "BTRST",
      address: "0x799ebfabe77a6e34311eeee9825190b9ece32824",
      decimals: 18,
    },
    {
      name: "OSQTH",
      address: "0xf1b99e3e573a1a9c5e6b2ce818b617f0e664e86b",
      decimals: 18,
    },
    {
      name: "PAR",
      address: "0x68037790a0229e9ce6eaa8a99ea92964106c4703",
      decimals: 18,
    },
    {
      name: "LQTY",
      address: "0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d",
      decimals: 18,
    },
    {
      name: "GNO",
      address: "0x6810e776880c02933d47db1b9fc05908e5386b96",
      decimals: 18,
    },
    {
      name: "DOLA",
      address: "0x865377367054516e17014ccded1e7d814edc9ce4",
      decimals: 18,
    },
    {
      name: "GPO",
      address: "0x4ad7a056191f4c9519facd6d75fa94ca26003ace",
      decimals: 18,
    },
    {
      name: "FUN",
      address: "0x419d0d8bdd9af5e606ae2232ed285aff190e711b",
      decimals: 8,
    },
    {
      name: "PLSD",
      address: "0x34f0915a5f15a66eba86f6a58be1a471fb7836a7",
      decimals: 12,
    },
    {
      name: "MLP",
      address: "0xe22020f47b7378dfedcedd2c81d4137c22fe1152",
      decimals: 18,
    },
    {
      name: "RAE",
      address: "0xe5a3229ccb22b6484594973a03a3851dcd948756",
      decimals: 18,
    },
    {
      name: "BUY",
      address: "0x31fdd1c6607f47c14a2821f599211c67ac20fa96",
      decimals: 18,
    },
    {
      name: "PIXEL",
      address: "0x65e6b60ea01668634d68d0513fe814679f925bad",
      decimals: 18,
    },
    {
      name: "NEXO",
      address: "0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206",
      decimals: 18,
    },
    {
      name: "3CRV",
      address: "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
      decimals: 18,
    },
    {
      name: "MDT",
      address: "0x814e0908b12a99fecf5bc101bb5d0b8b5cdf7d26",
      decimals: 18,
    },
    {
      name: "MVRS",
      address: "0xbede1f59fa4412556fef69f1b9969f2003e3f8c1",
      decimals: 18,
    },
    {
      name: "MET",
      address: "0x2ebd53d035150f328bd754d6dc66b99b0edb89aa",
      decimals: 18,
    },
    {
      name: "QRDO",
      address: "0x4123a133ae3c521fd134d7b13a2dec35b56c2463",
      decimals: 8,
    },
    {
      name: "ZZ",
      address: "0xc91a71a1ffa3d8b22ba615ba1b9c01b2bbbf55ad",
      decimals: 18,
    },
    {
      name: "APED",
      address: "0xfa898efdb91e35bd311c45b9b955f742b6719aa2",
      decimals: 18,
    },
    {
      name: "WOOL",
      address: "0x8355dbe8b0e275abad27eb843f3eaf3fc855e525",
      decimals: 18,
    },
    {
      name: "THN",
      address: "0x2e95cea14dd384429eb3c4331b776c4cfbb6fcd9",
      decimals: 18,
    },
    {
      name: "NEXT",
      address: "0x377d552914e7a104bc22b4f3b6268ddc69615be7",
      decimals: 18,
    },
    {
      name: "BTRFLY",
      address: "0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a",
      decimals: 9,
    },
    {
      name: "PDT",
      address: "0x375abb85c329753b1ba849a601438ae77eec9893",
      decimals: 18,
    },
    {
      name: "XCHF",
      address: "0xb4272071ecadd69d933adcd19ca99fe80664fc08",
      decimals: 18,
    },
    {
      name: "BSGG",
      address: "0x69570f3e84f51ea70b7b68055c8d667e77735a25",
      decimals: 18,
    },
    {
      name: "POWR",
      address: "0x595832f8fc6bf59c85c527fec3740a1b7a361269",
      decimals: 6,
    },
    {
      name: "HUNT",
      address: "0x9aab071b4129b083b01cb5a0cb513ce7eca26fa5",
      decimals: 18,
    },
    {
      name: "NVIR",
      address: "0x9d71ce49ab8a0e6d2a1e7bfb89374c9392fd6804",
      decimals: 18,
    },
    {
      name: "VITA",
      address: "0x81f8f0bb1cb2a06649e51913a151f0e7ef6fa321",
      decimals: 18,
    },
    {
      name: "GEL",
      address: "0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05",
      decimals: 18,
    },
    {
      name: "EUL",
      address: "0xd9fcd98c322942075a5c3860693e9f4f03aae07b",
      decimals: 18,
    },
    {
      name: "LCX",
      address: "0x037a54aab062628c9bbae1fdb1583c195585fe41",
      decimals: 18,
    },
    {
      name: "TCR",
      address: "0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050",
      decimals: 18,
    },
    {
      name: "RSS3",
      address: "0xc98d64da73a6616c42117b582e832812e7b8d57f",
      decimals: 18,
    },
    {
      name: "TEMP",
      address: "0xa36fdbbae3c9d55a1d67ee5821d53b50b63a1ab9",
      decimals: 18,
    },
    {
      name: "ORC",
      address: "0x662b67d00a13faf93254714dd601f5ed49ef2f51",
      decimals: 18,
    },
    {
      name: "XYO",
      address: "0x55296f69f40ea6d20e478533c15a6b08b654e758",
      decimals: 18,
    },
    {
      name: "FLOOR",
      address: "0xf59257e961883636290411c11ec5ae622d19455e",
      decimals: 9,
    },
    {
      name: "LORDS",
      address: "0x686f2404e77ab0d9070a46cdfb0b7fecdd2318b0",
      decimals: 18,
    },
    {
      name: "BOBA",
      address: "0x42bbfa2e77757c645eeaad1655e0911a7553efbc",
      decimals: 18,
    },
    {
      name: "DC",
      address: "0x7b4328c127b85369d9f82ca0503b000d09cf9180",
      decimals: 18,
    },
    {
      name: "MNW",
      address: "0xd3e4ba569045546d09cf021ecc5dfe42b1d7f6e4",
      decimals: 18,
    },
    {
      name: "MAXI",
      address: "0x0d86eb9f43c57f6ff3bc9e23d8f9d82503f0e84b",
      decimals: 8,
    },
    {
      name: "NCR",
      address: "0xdb5c3c46e28b53a39c255aa39a411dd64e5fed9c",
      decimals: 18,
    },
    {
      name: "QSP",
      address: "0x99ea4db9ee77acd40b119bd1dc4e33e1c070b80d",
      decimals: 18,
    },
    {
      name: "FOAM",
      address: "0x4946fcea7c692606e8908002e55a582af44ac121",
      decimals: 18,
    },
    {
      name: "CTSI",
      address: "0x491604c0fdf08347dd1fa4ee062a822a5dd06b5d",
      decimals: 18,
    },
    {
      name: "CRI",
      address: "0x12e951934246186f50146235d541d3bd1d463e4d",
      decimals: 18,
    },
    {
      name: "YLD",
      address: "0xf94b5c5651c888d928439ab6514b93944eee6f48",
      decimals: 18,
    },
    {
      name: "OPIUM",
      address: "0x888888888889c00c67689029d7856aac1065ec11",
      decimals: 18,
    },
    {
      name: "BRZ",
      address: "0x420412e765bfa6d85aaac94b4f7b708c89be2e2b",
      decimals: 4,
    },
    {
      name: "OVR",
      address: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
      decimals: 18,
    },
    {
      name: "TEMPLE",
      address: "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7",
      decimals: 18,
    },
    {
      name: "SYL",
      address: "0x92925acf2771bc59143228499f9610fe5176eb9c",
      decimals: 18,
    },
    {
      name: "PHTR",
      address: "0xe1fc4455f62a6e89476f1072530c20cf1a0622da",
      decimals: 18,
    },
    {
      name: "XDEFI",
      address: "0x72b886d09c117654ab7da13a14d603001de0b777",
      decimals: 18,
    },
    {
      name: "PLU",
      address: "0xd8912c10681d8b21fd3742244f44658dba12264e",
      decimals: 18,
    },
    {
      name: "DTH",
      address: "0x5adc961d6ac3f7062d2ea45fefb8d8167d44b190",
      decimals: 18,
    },
    {
      name: "FPIS",
      address: "0xc2544a32872a91f4a553b404c6950e89de901fdb",
      decimals: 18,
    },
    {
      name: "ARIA20",
      address: "0xedf6568618a00c6f0908bf7758a16f76b6e04af9",
      decimals: 18,
    },
    {
      name: "PAL",
      address: "0xab846fb6c81370327e784ae7cbb6d6a6af6ff4bf",
      decimals: 18,
    },
    {
      name: "KROM",
      address: "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789",
      decimals: 18,
    },
    {
      name: "TOWN",
      address: "0x3dd98c8a089dbcff7e8fc8d4f532bd493501ab7f",
      decimals: 8,
    },
    {
      name: "B2M",
      address: "0xd7c302fc3ac829c7e896a32c4bd126f3e8bd0a1f",
      decimals: 18,
    },
    {
      name: "BIOS",
      address: "0xaaca86b876ca011844b5798eca7a67591a9743c8",
      decimals: 18,
    },
    {
      name: "ZEUM",
      address: "0x436da116249044e8b4464f0cf21dd93311d88190",
      decimals: 18,
    },
    {
      name: "HOP",
      address: "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc",
      decimals: 18,
    },
    {
      name: "SSV",
      address: "0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54",
      decimals: 18,
    },
    {
      name: "VISR",
      address: "0xf938424f7210f31df2aee3011291b658f872e91e",
      decimals: 18,
    },
    {
      name: "QDT",
      address: "0x9adc7710e9d1b29d8a78c04d52d32532297c2ef3",
      decimals: 18,
    },
    {
      name: "MPWR",
      address: "0x6731827cb6879a2091ce3ab3423f7bf20539b579",
      decimals: 18,
    },
    {
      name: "TXT",
      address: "0x547b2f82cecfab9c2b1d36fdda96ef9f58c63b8c",
      decimals: 18,
    },
    {
      name: "LPT",
      address: "0x58b6a8a3302369daec383334672404ee733ab239",
      decimals: 18,
    },
    {
      name: "JASMY",
      address: "0x7420b4b9a0110cdc71fb720908340c03f9bc03ec",
      decimals: 18,
    },
    {
      name: "PILOT",
      address: "0x37c997b35c619c21323f3518b9357914e8b99525",
      decimals: 18,
    },
    {
      name: "TRAC",
      address: "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f",
      decimals: 18,
    },
    {
      name: "PPAY",
      address: "0x054d64b73d3d8a21af3d764efd76bcaa774f3bb2",
      decimals: 18,
    },
    {
      name: "GF",
      address: "0xaaef88cea01475125522e117bfe45cf32044e238",
      decimals: 18,
    },
    {
      name: "MTO",
      address: "0xe66b3aa360bb78468c00bebe163630269db3324f",
      decimals: 18,
    },
    {
      name: "TPT",
      address: "0x4161725d019690a3e0de50f6be67b07a86a9fae1",
      decimals: 4,
    },
    {
      name: "CHO",
      address: "0xbba39fd2935d5769116ce38d46a71bde9cf03099",
      decimals: 18,
    },
    {
      name: "PRBLY",
      address: "0x6361f338ab8def2af3f2a1be7bd8a7db3156f7e7",
      decimals: 18,
    },
    {
      name: "POLK",
      address: "0xd478161c952357f05f0292b56012cd8457f1cfbf",
      decimals: 18,
    },
    {
      name: "SILO",
      address: "0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8",
      decimals: 18,
    },
    {
      name: "POW",
      address: "0x43ab765ee05075d78ad8aa79dcb1978ca3079258",
      decimals: 18,
    },
    {
      name: "BANK",
      address: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
      decimals: 18,
    },
    {
      name: "RING",
      address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      decimals: 18,
    },
    {
      name: "METANO",
      address: "0x9d9e399e5385e2b9a58d4f775a1e16441b571afb",
      decimals: 18,
    },
    {
      name: "PHCR",
      address: "0x37e83a94c6b1bdb816b59ac71dd02cf154d8111f",
      decimals: 18,
    },
    {
      name: "SUTER",
      address: "0xaa2ce7ae64066175e0b90497ce7d9c190c315db4",
      decimals: 18,
    },
    {
      name: "DHT",
      address: "0xca1207647ff814039530d7d35df0e1dd2e91fa84",
      decimals: 18,
    },
    {
      name: "RVP",
      address: "0x17ef75aa22dd5f6c2763b8304ab24f40ee54d48a",
      decimals: 18,
    },
    {
      name: "ACQ",
      address: "0x4bdcb66b968060d9390c1d12bd29734496205581",
      decimals: 18,
    },
    {
      name: "OOKS",
      address: "0x69d9905b2e5f6f5433212b7f3c954433f23c1572",
      decimals: 18,
    },
    {
      name: "CXO",
      address: "0xb6ee9668771a79be7967ee29a63d4184f8097143",
      decimals: 18,
    },
    {
      name: "WAMPL",
      address: "0xedb171c18ce90b633db442f2a6f72874093b49ef",
      decimals: 18,
    },
    {
      name: "TKING",
      address: "0x24e89bdf2f65326b94e36978a7edeac63623dafa",
      decimals: 18,
    },
    {
      name: "HOPR",
      address: "0xf5581dfefd8fb0e4aec526be659cfab1f8c781da",
      decimals: 18,
    },
    {
      name: "EL",
      address: "0x2781246fe707bb15cee3e5ea354e2154a2877b16",
      decimals: 18,
    },
    {
      name: "UNV",
      address: "0xf009f5531de69067435e32c4b9d36077f4c4a673",
      decimals: 18,
    },
    {
      name: "ANKR",
      address: "0x8290333cef9e6d528dd5618fb97a76f268f3edd4",
      decimals: 18,
    },
    {
      name: "GGTK",
      address: "0xfa99a87b14b02e2240c79240c5a20f945ca5ef76",
      decimals: 18,
    },
    {
      name: "SKEB",
      address: "0x6d614686550b9e1c1df4b2cd8f91c9d4df66c810",
      decimals: 18,
    },
    {
      name: "AST",
      address: "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
      decimals: 4,
    },
    {
      name: "BOSON",
      address: "0xc477d038d5420c6a9e0b031712f61c5120090de9",
      decimals: 18,
    },
    {
      name: "NATION",
      address: "0x333a4823466879eef910a04d473505da62142069",
      decimals: 18,
    },
    {
      name: "STND",
      address: "0x9040e237c3bf18347bb00957dc22167d0f2b999d",
      decimals: 18,
    },
    {
      name: "OCTO",
      address: "0x7240ac91f01233baaf8b064248e80feaa5912ba3",
      decimals: 18,
    },
    {
      name: "COVAL",
      address: "0x3d658390460295fb963f54dc0899cfb1c30776df",
      decimals: 8,
    },
    {
      name: "BXX",
      address: "0x6b1a8f210ec6b7b6643cea3583fb0c079f367898",
      decimals: 18,
    },
    {
      name: "AMON",
      address: "0x00059ae69c1622a7542edc15e8d17b060fe307b6",
      decimals: 18,
    },
    {
      name: "UMAD",
      address: "0x31c2415c946928e9fd1af83cdfa38d3edbd4326f",
      decimals: 8,
    },
    {
      name: "UBEX",
      address: "0x6704b673c70de9bf74c8fba4b4bd748f0e2190e1",
      decimals: 18,
    },
    {
      name: "ARCX",
      address: "0x1321f1f1aa541a56c31682c57b80ecfccd9bb288",
      decimals: 18,
    },
    {
      name: "FKX",
      address: "0x16484d73ac08d2355f466d448d2b79d2039f6ebb",
      decimals: 18,
    },
    {
      name: "VGX",
      address: "0x3c4b6e6e1ea3d4863700d7f76b36b7f3d3f13e3d",
      decimals: 8,
    },
    {
      name: "ARTM",
      address: "0x19ebaa7f212b09de2aee2a32d40338553c70e2e3",
      decimals: 18,
    },
    {
      name: "SNTVT",
      address: "0x7865af71cf0b288b4e7f654f4f7851eb46a2b7f8",
      decimals: 18,
    },
    {
      name: "VDR",
      address: "0xed3d4e446a96dc3b181b64b75c3c70da41dc3cbe",
      decimals: 18,
    },
    {
      name: "NCT",
      address: "0x9e46a38f5daabe8683e10793b06749eef7d733d1",
      decimals: 18,
    },
    {
      name: "GRID",
      address: "0x12b19d3e2ccc14da04fae33e63652ce469b3f2fd",
      decimals: 12,
    },
    {
      name: "DEPAY",
      address: "0xa0bed124a09ac2bd941b10349d8d224fe3c955eb",
      decimals: 18,
    },
    {
      name: "RBIS",
      address: "0xf34b1db61aca1a371fe97bad2606c9f534fb9d7d",
      decimals: 18,
    },
    {
      name: "NU",
      address: "0x4fe83213d56308330ec302a8bd641f1d0113a4cc",
      decimals: 18,
    },
    {
      name: "ALEPH",
      address: "0x27702a26126e0b3702af63ee09ac4d1a084ef628",
      decimals: 18,
    },
    {
      name: "CAST",
      address: "0x3fab0bbaa03bceaf7c49e2b12877db0142be65fc",
      decimals: 8,
    },
    {
      name: "QUAD",
      address: "0xab2a7b5876d707e0126b3a75ef7781c77c8877ee",
      decimals: 18,
    },
    {
      name: "UTU",
      address: "0xa58a4f5c4bb043d2cc1e170613b74e767c94189b",
      decimals: 18,
    },
    {
      name: "TGT",
      address: "0x108a850856db3f85d0269a2693d896b394c80325",
      decimals: 18,
    },
    {
      name: "BENT",
      address: "0x01597e397605bf280674bf292623460b4204c375",
      decimals: 18,
    },
    {
      name: "SOCKS",
      address: "0x23b608675a2b2fb1890d3abbd85c5775c51691d5",
      decimals: 18,
    },
    {
      name: "FOREX",
      address: "0xdb298285fe4c5410b05390ca80e8fbe9de1f259b",
      decimals: 18,
    },
    {
      name: "THALES",
      address: "0x8947da500eb47f82df21143d0c01a29862a8c3c5",
      decimals: 18,
    },
    {
      name: "VXV",
      address: "0x7d29a64504629172a429e64183d6673b9dacbfce",
      decimals: 18,
    },
    {
      name: "VAI",
      address: "0xd13cfd3133239a3c73a9e535a5c4dadee36b395c",
      decimals: 18,
    },
    {
      name: "WRLD",
      address: "0xd5d86fc8d5c0ea1ac1ac5dfab6e529c9967a45e9",
      decimals: 18,
    },
    {
      name: "KCT",
      address: "0x4c601dc69affb0d4fc8de1ac303705e432a4a27e",
      decimals: 18,
    },
    {
      name: "WCK",
      address: "0x09fe5f0236f0ea5d930197dce254d77b04128075",
      decimals: 18,
    },
    {
      name: "WCFG",
      address: "0xc221b7e65ffc80de234bbb6667abdd46593d34f0",
      decimals: 18,
    },
    {
      name: "CZATS",
      address: "0xa10989335f3ba92bd43e60fbe8d42fe739412ac4",
      decimals: 18,
    },
    {
      name: "RIO",
      address: "0xf21661d0d1d76d3ecb8e1b9f1c923dbfffae4097",
      decimals: 18,
    },
    {
      name: "ALCAZAR",
      address: "0x10f44a834097469ac340592d28c479c442e99bfe",
      decimals: 18,
    },
    {
      name: "STB",
      address: "0xc481a850aead5002598b7ed355cbb3349c148072",
      decimals: 18,
    },
    {
      name: "SHIDO",
      address: "0x173e552bf97bbd50b455514ac52991ef639ba703",
      decimals: 9,
    },
    {
      name: "COMBO",
      address: "0xffffffff2ba8f66d4e51811c5190992176930278",
      decimals: 18,
    },
    {
      name: "DDX",
      address: "0x3a880652f47bfaa771908c07dd8673a787daed3a",
      decimals: 18,
    },
    {
      name: "MOETA",
      address: "0xa18a1753d524a6fe22fa01aa951da0ee5df9dc02",
      decimals: 9,
    },
    {
      name: "BLUR",
      address: "0x5283d291dbcf85356a21ba090e6db59121208b44",
      decimals: 18,
    },
    {
      name: "HIFI",
      address: "0x4b9278b94a1112cad404048903b8d343a810b07e",
      decimals: 18,
    },
    {
      name: "SHIK",
      address: "0x24da31e7bb182cb2cabfef1d88db19c2ae1f5572",
      decimals: 18,
    },
    {
      name: "OHMI",
      address: "0x4159862bcf6b4393a80550b1ed03dffa6f90533c",
      decimals: 18,
    },
    {
      name: "HAN",
      address: "0x0c90c57aaf95a3a87eadda6ec3974c99d786511f",
      decimals: 18,
    },
    {
      name: "CNLT",
      address: "0x00e13ff16d54619024ab3b861f25b84bd53e8ac1",
      decimals: 18,
    },
    {
      name: "FCC",
      address: "0x171b1daefac13a0a3524fcb6beddc7b31e58e079",
      decimals: 18,
    },
    {
      name: "GENI",
      address: "0x444444444444c1a66f394025ac839a535246fcc8",
      decimals: 9,
    },
    {
      name: "PLSB",
      address: "0x5ee84583f67d5ecea5420dbb42b462896e7f8d06",
      decimals: 12,
    },
    {
      name: "D2T",
      address: "0x4dd942baa75810a3c1e876e79d5cd35e09c97a76",
      decimals: 18,
    },
    {
      name: "XI",
      address: "0x295b42684f90c77da7ea46336001010f2791ec8c",
      decimals: 18,
    },
    {
      name: "TRG",
      address: "0x93eeb426782bd88fcd4b48d7b0368cf061044928",
      decimals: 18,
    },
    {
      name: "STFX",
      address: "0x9343e24716659a3551eb10aff9472a2dcad5db2d",
      decimals: 18,
    },
    {
      name: "SIMP",
      address: "0x41c21693e60fc1a5dbb7c50e54e7a6016aa44c99",
      decimals: 18,
    },
    {
      name: "CNC",
      address: "0x9ae380f0272e2162340a5bb646c354271c0f5cfc",
      decimals: 18,
    },
    {
      name: "COM",
      address: "0x5a9780bfe63f3ec57f01b087cd65bd656c9034a8",
      decimals: 12,
    },
    {
      name: "SILV2",
      address: "0x7e77dcb127f99ece88230a64db8d595f31f1b068",
      decimals: 18,
    },
    {
      name: "HACHI",
      address: "0x967b0c95295ead8faef70d26a7846aecd349aaff",
      decimals: 18,
    },
    {
      name: "WOOF",
      address: "0x6bc08509b36a98e829dffad49fde5e412645d0a3",
      decimals: 18,
    },
    {
      name: "WFIO",
      address: "0xbea269038eb75bdab47a9c04d0f5c572d94b93d5",
      decimals: 9,
    },
    {
      name: "JIZZ",
      address: "0x8b937af714ac7e2129bd33d93641f52b665ca352",
      decimals: 18,
    },
    {
      name: "IM",
      address: "0x0a58153a0cd1cfaea94ce1f7fdc5d7e679eca936",
      decimals: 18,
    },
    {
      name: "REVOAI",
      address: "0x8793fb615eb92822f482f88b3137b00aad4c00d2",
      decimals: 9,
    },
    {
      name: "PAW",
      address: "0xdc63269ea166b70d4780b3a11f5c825c2b761b01",
      decimals: 18,
    },
    {
      name: "STABLZ",
      address: "0xa4eb9c64ec359d093eac7b65f51ef933d6e5f7cd",
      decimals: 18,
    },
    {
      name: "FUND",
      address: "0x7d8d7c26179b7a6aebbf66a91c38ed92d5b4996b",
      decimals: 18,
    },
    {
      name: "OXAI",
      address: "0x428dca9537116148616a5a3e44035af17238fe9d",
      decimals: 18,
    },
    {
      name: "EGGS",
      address: "0x2e516ba5bf3b7ee47fb99b09eadb60bde80a82e0",
      decimals: 18,
    },
    {
      name: "CVXFXS",
      address: "0xfeef77d3f69374f66429c91d732a244f074bdf74",
      decimals: 18,
    },
    {
      name: "GOS",
      address: "0xc9393609a47f5744ce98369208b9dc66224e6b5d",
      decimals: 6,
    },
    {
      name: "SUDO",
      address: "0x3446dd70b2d52a6bf4a5a192d9b0a161295ab7f9",
      decimals: 18,
    },
    {
      name: "ARCH",
      address: "0x73c69d24ad28e2d43d03cbf35f79fe26ebde1011",
      decimals: 18,
    },
    {
      name: "NMR",
      address: "0x1776e1f26f98b1a5df9cd347953a26dd3cb46671",
      decimals: 18,
    },
    {
      name: "FET",
      address: "0xaea46a60368a7bd060eec7df8cba43b7ef41ad85",
      decimals: 18,
    },
    {
      name: "SKL",
      address: "0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7",
      decimals: 18,
    },
    {
      name: "RNDR",
      address: "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
      decimals: 18,
    },
    {
      name: "VR",
      address: "0x7d5121505149065b562c789a0145ed750e6e8cdd",
      decimals: 18,
    },
    {
      name: "CELR",
      address: "0x4f9254c83eb525f9fcf346490bbb3ed28a81c667",
      decimals: 18,
    },
    {
      name: "SOV",
      address: "0xbdab72602e9ad40fc6a6852caf43258113b8f7a5",
      decimals: 18,
    },
    {
      name: "DSLA",
      address: "0x3affcca64c2a6f4e3b6bd9c64cd2c969efd1ecbe",
      decimals: 18,
    },
    {
      name: "FACTR",
      address: "0xe0bceef36f3a6efdd5eebfacd591423f8549b9d5",
      decimals: 18,
    },
    {
      name: "BORING",
      address: "0xbc19712feb3a26080ebf6f2f7849b417fdd792ca",
      decimals: 18,
    },
    {
      name: "ACX",
      address: "0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f",
      decimals: 18,
    },
    {
      name: "VEE",
      address: "0x7616113782aadab041d7b10d474f8a0c04eff258",
      decimals: 18,
    },
    {
      name: "FLUT",
      address: "0x4f08705fb8f33affc231ed66e626b40e84a71870",
      decimals: 11,
    },
    {
      name: "LYRA",
      address: "0x01ba67aac7f75f647d94220cc98fb30fcc5105bf",
      decimals: 18,
    },
    {
      name: "CTX",
      address: "0x321c2fe4446c7c963dc41dd58879af648838f98d",
      decimals: 18,
    },
    {
      name: "WPC",
      address: "0x6f620ec89b8479e97a6985792d0c64f237566746",
      decimals: 18,
    },
    {
      name: "CMERGE",
      address: "0x87869a9789291a6cec99f3c3ef2ff71fceb12a8e",
      decimals: 9,
    },
    {
      name: "COW",
      address: "0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab",
      decimals: 18,
    },
    {
      name: "NXRA",
      address: "0x644192291cc835a93d6330b24ea5f5fedd0eef9e",
      decimals: 18,
    },
    {
      name: "TLOS",
      address: "0x7825e833d495f3d1c28872415a4aee339d26ac88",
      decimals: 18,
    },
    {
      name: "RAIL",
      address: "0xe76c6c83af64e4c60245d8c7de953df673a7a33d",
      decimals: 18,
    },
    {
      name: "PRIME",
      address: "0xb23d80f5fefcddaa212212f028021b41ded428cf",
      decimals: 18,
    },
    {
      name: "GETH",
      address: "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
      decimals: 18,
    },
    {
      name: "PEPES",
      address: "0x6bf765c43030387a983f429c1438e9d2025b7e12",
      decimals: 18,
    },
    {
      name: "OBTC",
      address: "0xff770e4c68e35db85c6e0e89a43750ec02bdb2ac",
      decimals: 18,
    },
    {
      name: "MNB",
      address: "0x42b91f1d05afea671a2da3c780eda2abf0a2a366",
      decimals: 18,
    },
    {
      name: "MEMAG",
      address: "0x6e39a587691b8c9d4341ce0a960998ed6f537af6",
      decimals: 18,
    },
    {
      name: "ALCA",
      address: "0xbb556b0ee2cbd89ed95ddea881477723a3aa8f8b",
      decimals: 18,
    },
    {
      name: "K9",
      address: "0x2bd0fb740e403b505a3146f9ac02df883fd5c3fc",
      decimals: 18,
    },
    {
      name: "USH",
      address: "0xe60779cc1b2c1d0580611c526a8df0e3f870ec48",
      decimals: 18,
    },
    {
      name: "MEZZ",
      address: "0xc4c346edc55504574cceb00aa1091d22404a4bc3",
      decimals: 18,
    },
    {
      name: "GPT",
      address: "0xd04e772bc0d591fbd288f2e2a86afa3d3cb647f8",
      decimals: 18,
    },
    {
      name: "TRENDAI",
      address: "0x6fc73113fc1afab4c28d3dd4c537a1da6045d47d",
      decimals: 18,
    },
    {
      name: "ROKO",
      address: "0x6f222e04f6c53cc688ffb0abe7206aac66a8ff98",
      decimals: 18,
    },
    {
      name: "THEO",
      address: "0xfac0403a24229d7e2edd994d50f5940624cbeac2",
      decimals: 9,
    },
    {
      name: "SATS",
      address: "0x6c22910c6f75f828b305e57c6a54855d8adeabf8",
      decimals: 9,
    },
    {
      name: "BPEG",
      address: "0x02ad335dd3ca11c18cebbbb583b9613b6289d75f",
      decimals: 18,
    },
    {
      name: "HMX",
      address: "0xb012be90957d70d9a070918027655f998c123a88",
      decimals: 18,
    },
    {
      name: "KIBSHI",
      address: "0x02e7f808990638e9e67e1f00313037ede2362361",
      decimals: 18,
    },
    {
      name: "TWINU",
      address: "0x3b6cfd5a1b35db9882c2434d931226d6dd484ee1",
      decimals: 18,
    },
  ],
  bsc: [
    {
      name: "CHNG",
      address: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf",
      decimals: 18,
    },
    {
      name: "FSN",
      address: "0xfa4fa764f15d0f6e20aaec8e0d696870e5b77c6e",
      decimals: 18,
    },
    {
      name: "USDT",
      address: "0x55d398326f99059ff775485246999027b3197955",
      decimals: 18,
    },
    {
      name: "ETH",
      address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      decimals: 18,
    },
    {
      name: "TRX",
      address: "0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b",
      decimals: 18,
    },
    { name: "BNB", address: nullAddress, decimals: 18 },
    {
      name: "UNI",
      address: "0xbf5140a22578168fd562dccf235e5d43a02ce9b1",
      decimals: 18,
    },
    {
      name: "CAKE",
      address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0xfb6115445bff7b52feb98650c87f44907e58f802",
      decimals: 18,
    },
    {
      name: "ALPHA",
      address: "0xa1faa113cbe53436df28ff0aee54275c13b40975",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0x9ac983826058b8a9c7aa1c9171441191232e8404",
      decimals: 18,
    },
    {
      name: "INCH",
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x947950bcc74888a40ffa2593c5798f11fc9124c4",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0x52ce071bd9b1c4b00a0b92d298c512478cad67e8",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e",
      decimals: 18,
    },
    {
      name: "BAT",
      address: "0x101d82428437127bf1608f699cd651e6abf9766e",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0xd4ed60d8368a92b5f1ca33af61ef2a94714b2d46",
      decimals: 18,
    },
    {
      name: "SXP",
      address: "0x47bead2563dcbf3bf2c9407fea4dc236faba485a",
      decimals: 18,
    },
    {
      name: "BAKE",
      address: "0xe02df9e3e622debdd69fb838bb799e3f168902c5",
      decimals: 18,
    },
    {
      name: "DODO",
      address: "0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2",
      decimals: 18,
    },
    {
      name: "XVS",
      address: "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63",
      decimals: 18,
    },
    {
      name: "SHIB",
      address: "0x2859e4544c4bb03966803b044a93563bd2d0dd4d",
      decimals: 18,
    },
    {
      name: "BabyDoge",
      address: "0xc748673057861a797275cd8a068abb95a902e8de",
      decimals: 9,
    },
    {
      name: "MOMAT",
      address: "0x3fca6743e2fb55759fee767f3a68b2c06d699dc4",
      decimals: 18,
    },
    {
      name: "KSC",
      address: "0x6da5d682b7986b084996b5df1947a4335d7b6794",
      decimals: 18,
    },
    {
      name: "LC",
      address: "0x664cb7a0a0a86779f1a8748cc02f9872acad3e0a",
      decimals: 18,
    },
    {
      name: "SOL",
      address: "0x570a5d26f7765ecb712c0924e4de545b89fd43df",
      decimals: 18,
    },
    {
      name: "MATIC",
      address: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
      decimals: 18,
    },
    {
      name: "FIL",
      address: "0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153",
      decimals: 18,
    },
    {
      name: "DOT",
      address: "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
    },
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    {
      name: "O3",
      address: "0xee9801669c6138e84bd50deb500827b776777d28",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0xfa18a680bc3a1c9db12822c638808a7f11d8d2cc",
      decimals: 18,
    },
    {
      name: "BIFI",
      address: "0xca3f508b8e4dd382ee878a314789373d80a5190a",
      decimals: 18,
    },
    {
      name: "RNFT",
      address: "0x2f6fb65bce25d1538dc53a3d17a5ba0efc8a10de",
      decimals: 18,
    },
    {
      name: "SFC",
      address: "0x8d9cad20080110998966b63a87fb9d51eb49b798",
      decimals: 6,
    },
    {
      name: "AVAX",
      address: "0x1ce0c2827e2ef14d5c4f29a091d735a204794041",
      decimals: 18,
    },
    {
      name: "BUSD",
      address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      decimals: 18,
    },
    {
      name: "NT",
      address: "0xfbcf80ed90856af0d6d9655f746331763efdb22c",
      decimals: 18,
    },
    {
      name: "HP",
      address: "0xede1f9cdb98b4ca6a804de268b0aca18dce192e8",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      decimals: 18,
    },
    {
      name: "LOVE",
      address: "0x6452961d566449fa5364a182b802a32e17f5cc5f",
      decimals: 0,
    },
    {
      name: "EGLD",
      address: "0xbf7c81fff98bbe61b40ed186e4afd6ddd01337fe",
      decimals: 18,
    },
    {
      name: "PEOPLE",
      address: "0x2c44b726adf1963ca47af88b284c06f30380fc78",
      decimals: 18,
    },
    {
      name: "BABY",
      address: "0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657",
      decimals: 18,
    },
    {
      name: "QJI",
      address: "0x4c2200082ad960f03bf105971e5d85bb835ddb83",
      decimals: 6,
    },
    {
      name: "NEAR",
      address: "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
      decimals: 18,
    },
    {
      name: "KSM",
      address: "0x2aa69e8d25c045b659787bc1f03ce47a388db6e8",
      decimals: 18,
    },
    {
      name: "ATOM",
      address: "0x0eb3a705fc54725037cc9e008bdede697f62f335",
      decimals: 18,
    },
    {
      name: "USTC",
      address: "0x23396cf899ca06c4472205fc903bdb4de249d6fc",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0xb700597d8425ced17677bc68042d7d92764acf59",
      decimals: 18,
    },
    {
      name: "KLAY",
      address: "0x43a934f6058fbeb24620070153267a5f8162207c",
      decimals: 18,
    },
    {
      name: "XLM",
      address: "0x43c934a845205f0b514417d757d7235b8f53f1b9",
      decimals: 18,
    },
    {
      name: "WEMIX",
      address: "0x00d197d8cfe95498264eaceddb02c79bc0f26d67",
      decimals: 18,
    },
    {
      name: "KLEVA",
      address: "0x9a5331021455708851dd87a8759c82e1f152b09c",
      decimals: 18,
    },
    {
      name: "BORA",
      address: "0x08608ebf81ddab792cd3d75b78bd3e3771d49fa0",
      decimals: 18,
    },
    {
      name: "KSP",
      address: "0x6ee4e858e6167250756235df76db6da7c38d9f7e",
      decimals: 18,
    },
    {
      name: "KFI",
      address: "0x27775ba0673e6d27bf25696ce4087c0d41c48df1",
      decimals: 18,
    },
    {
      name: "ALPACA",
      address: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
      decimals: 18,
    },
    {
      name: "ARV",
      address: "0x6679eb24f59dfe111864aec72b443d1da666b360",
      decimals: 8,
    },
    {
      name: "AVAI",
      address: "0x4bd17003473389a42daf6a0a729f6fdb328bbbd7",
      decimals: 18,
    },
    {
      name: "BANANA",
      address: "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
      decimals: 18,
    },
    {
      name: "BDO",
      address: "0x190b589cf9fb8ddeabbfeae36a813ffb2a702454",
      decimals: 18,
    },
    {
      name: "BELT",
      address: "0xe0e514c71282b6f4e823703a39374cf58dc3ea4f",
      decimals: 18,
    },
    {
      name: "BETH",
      address: "0x250632378e573c6be1ac2f97fcdf00515d0aa91b",
      decimals: 18,
    },
    {
      name: "BGOV",
      address: "0xf8e026dc4c0860771f691ecffbbdfe2fa51c77cf",
      decimals: 18,
    },
    {
      name: "BOMB",
      address: "0x522348779dcb2911539e76a1042aa922f9c47ee3",
      decimals: 18,
    },
    {
      name: "BR34P",
      address: "0xa86d305a36cdb815af991834b46ad3d7fbb38523",
      decimals: 8,
    },
    {
      name: "BSCPAD",
      address: "0x5a3010d4d8d3b5fb49f8b6e57fb9e48063f16700",
      decimals: 18,
    },
    {
      name: "BSHARE",
      address: "0x531780face85306877d7e1f05d713d1b50a37f7a",
      decimals: 18,
    },
    {
      name: "BSW",
      address: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
      decimals: 18,
    },
    {
      name: "DEXT",
      address: "0xe91a8d2c584ca93c7405f15c22cdfe53c29896e3",
      decimals: 18,
    },
    {
      name: "DOME",
      address: "0x475bfaa1848591ae0e6ab69600f48d828f61a80e",
      decimals: 18,
    },
    {
      name: "ECP",
      address: "0x375483cfa7fc18f6b455e005d835a8335fbdbb1f",
      decimals: 9,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "ELONGATE",
      address: "0x2a9718deff471f3bb91fa0eceab14154f150a385",
      decimals: 9,
    },
    {
      name: "EPS",
      address: "0xa7f552078dcc247c2684336020c03648500c6d9f",
      decimals: 18,
    },
    {
      name: "FLOKI",
      address: "0xfb5b838b6cfeedc2873ab27866079ac55363d37e",
      decimals: 9,
    },
    {
      name: "GMT",
      address: "0x3019bf2a2ef8040c242c9a4c5c4bd4c81678b2a1",
      decimals: 8,
    },
    {
      name: "HEC",
      address: "0x638eebe886b0e9e7c6929e69490064a6c94d204d",
      decimals: 9,
    },
    {
      name: "ICE",
      address: "0xf16e81dce15b08f326220742020379b855b87df9",
      decimals: 18,
    },
    {
      name: "MBOX",
      address: "0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377",
      decimals: 18,
    },
    {
      name: "METIS",
      address: "0xe552fb52a4f19e44ef5a967632dbc320b0820639",
      decimals: 18,
    },
    {
      name: "MKR",
      address: "0x5f0da599bb2cccfcf6fdfd7d81743b6020864350",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x9fb9a33956351cf4fa040f65a13b835a3c8764e3",
      decimals: 18,
    },
    {
      name: "PACOCA",
      address: "0x55671114d774ee99d653d6c12460c780a67f1d18",
      decimals: 18,
    },
    {
      name: "PAXG",
      address: "0x7950865a9140cb519342433146ed5b40c6f210f7",
      decimals: 18,
    },
    {
      name: "PIG",
      address: "0x8850d2c68c632e3b258e612abaa8fada7e6958e5",
      decimals: 9,
    },
    {
      name: "POLS",
      address: "0x7e624fa0e1c4abfd309cc15719b7e2580887f570",
      decimals: 18,
    },
    {
      name: "ROCK",
      address: "0xc3387e4285e9f80a7cfdf02b4ac6cdf2476a528a",
      decimals: 18,
    },
    {
      name: "SAFEMARS",
      address: "0x3ad9594151886ce8538c1ff615efa2385a8c3a88",
      decimals: 9,
    },
    {
      name: "SFP",
      address: "0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb",
      decimals: 18,
    },
    {
      name: "SFUND",
      address: "0x477bc8d23c634c154061869478bce96be6045d12",
      decimals: 18,
    },
    {
      name: "SPARTA",
      address: "0x3910db0600ea925f63c36ddb1351ab6e2c6eb102",
      decimals: 18,
    },
    {
      name: "SUPER",
      address: "0x51ba0b044d96c3abfca52b64d733603ccc4f0d4d",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0xa4080f1778e69467e905b8d6f72f6e441f9e9484",
      decimals: 18,
    },
    {
      name: "TKO",
      address: "0x9f589e3eabe42ebc94a44727b3f3531c0c877809",
      decimals: 18,
    },
    {
      name: "TORN",
      address: "0x1ba8d3c4c219b124d351f603060663bd1bcd9bbf",
      decimals: 18,
    },
    {
      name: "TWT",
      address: "0x4b0f1812e5df2a09796481ff14017e6005508003",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
      decimals: 18,
    },
    {
      name: "WOOP",
      address: "0x8b303d5bbfbbf46f1a4d9741e491e06986894e18",
      decimals: 18,
    },
    {
      name: "XWIN",
      address: "0xd88ca08d8eec1e9e09562213ae83a7853ebb5d28",
      decimals: 18,
    },
    {
      name: "YOSHI",
      address: "0x4374f26f0148a6331905edf4cd33b89d8eed78d1",
      decimals: 18,
    },
    {
      name: "CHINESE",
      address: "0x03a6eed53b5dcb0395dfbecf4cbc816dc6f93790",
      decimals: 18,
    },
    {
      name: "SEXY",
      address: "0x05038f190eb986e8bbfc2708806026174fb4bebe",
      decimals: 6,
    },
    {
      name: "LTC",
      address: "0x4338665cbb7b2485a8855a139b75d5e34ab0db94",
      decimals: 18,
    },
    {
      name: "DOGE",
      address: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
      decimals: 8,
    },
    {
      name: "VET",
      address: "0x6fdcdfef7c496407ccb0cec90f9c5aaa1cc8d888",
      decimals: 18,
    },
    {
      name: "IOTX",
      address: "0x9678e42cebeb63f23197d726b29b1cb20d0064e5",
      decimals: 18,
    },
    {
      name: "ADA",
      address: "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
      decimals: 18,
    },
    {
      name: "XRP",
      address: "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",
      decimals: 18,
    },
    {
      name: "ETC",
      address: "0x3d6545b08693dae087e957cb1180ee38b9e3c25e",
      decimals: 18,
    },
    {
      name: "FGD",
      address: "0x0566b9a8ffb8908682796751eed00722da967be0",
      decimals: 18,
    },
    {
      name: "MEB",
      address: "0x7268b479eb7ce8d1b37ef1ffc3b82d7383a1162d",
      decimals: 18,
    },
    {
      name: "HERO",
      address: "0xd40bedb44c081d2935eeba6ef5a3c8a31a1bbe13",
      decimals: 18,
    },
    {
      name: "FIST",
      address: "0xc9882def23bc42d53895b8361d0b1edc7570bc6a",
      decimals: 6,
    },
    {
      name: "RACA",
      address: "0x12bb890508c125661e03b09ec06e404bc9289040",
      decimals: 18,
    },
    {
      name: "FSV",
      address: "0xe9c7a827a4ba133b338b844c19241c864e95d75f",
      decimals: 6,
    },
    {
      name: "DEBT",
      address: "0xc632f90affec7121120275610bf17df9963f181c",
      decimals: 8,
    },
    {
      name: "PMR",
      address: "0x45af3e747feb3c7ab6c45cefa4398e60661dd1a4",
      decimals: 18,
    },
    {
      name: "TTC",
      address: "0x152ad7dc399269fa65d19bd7a790ea8aa5b23dad",
      decimals: 18,
    },
    {
      name: "SQUA",
      address: "0xb82beb6ee0063abd5fc8e544c852237aa62cbb14",
      decimals: 18,
    },
    {
      name: "IUSD",
      address: "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d",
      decimals: 18,
    },
    {
      name: "IZI",
      address: "0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747",
      decimals: 18,
    },
    {
      name: "TRADE",
      address: "0x4a4b062f602f83387a13915f815396ade22b692a",
      decimals: 18,
    },
    {
      name: "BHC",
      address: "0x6fd7c98458a943f469e1cf4ea85b173f5cd342f4",
      decimals: 18,
    },
    {
      name: "OSK",
      address: "0x04fa9eb295266d9d4650edcb879da204887dc3da",
      decimals: 18,
    },
    {
      name: "FUFU",
      address: "0x509a51394cc4d6bb474fefb2994b8975a55a6e79",
      decimals: 18,
    },
    {
      name: "SAITO",
      address: "0x3c6dad0475d3a1696b359dc04c99fd401be134da",
      decimals: 18,
    },
    {
      name: "WIRTUAL",
      address: "0xa19d3f4219e2ed6dc1cb595db20f70b8b6866734",
      decimals: 18,
    },
    {
      name: "GENE",
      address: "0x9df465460938f9ebdf51c38cc87d72184471f8f0",
      decimals: 18,
    },
    {
      name: "TIME",
      address: "0x3b198e26e473b8fab2085b37978e36c9de5d7f68",
      decimals: 8,
    },
    {
      name: "IF",
      address: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
      decimals: 18,
    },
    {
      name: "IDIA",
      address: "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89",
      decimals: 18,
    },
    {
      name: "EBOX",
      address: "0x33840024177a7daca3468912363bed8b425015c5",
      decimals: 18,
    },
    {
      name: "BCH",
      address: "0x8ff795a6f4d97e7887c79bea79aba5cc76444adf",
      decimals: 18,
    },
    {
      name: "CREAM",
      address: "0xd4cb328a82bdf5f03eb737f37fa6b370aef3e888",
      decimals: 18,
    },
    {
      name: "BTT",
      address: "0x352cb5e19b12fc216548a2677bd0fce83bae434b",
      decimals: 18,
    },
    {
      name: "MEER",
      address: "0xba552586ea573eaa3436f04027ff4effd0c0abbb",
      decimals: 18,
    },
    {
      name: "TAU",
      address: "0x70d7109d3afe13ee8f9015566272838519578c6b",
      decimals: 18,
    },
    {
      name: "AMT",
      address: "0xf625069dce62df95b4910f83446954b871f0fc4f",
      decimals: 18,
    },
    {
      name: "GOLD",
      address: "0xb3a6381070b1a15169dea646166ec0699fdaea79",
      decimals: 18,
    },
    {
      name: "HIGH",
      address: "0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63",
      decimals: 18,
    },
    {
      name: "ESHARE",
      address: "0xdb20f6a8665432ce895d724b417f77ecac956550",
      decimals: 18,
    },
    {
      name: "SPS",
      address: "0x1633b7157e7638c4d6593436111bf125ee74703f",
      decimals: 18,
    },
    {
      name: "DIFX",
      address: "0x697bd938e7e572e787ecd7bc74a31f1814c21264",
      decimals: 18,
    },
    {
      name: "YFII",
      address: "0x7f70642d88cf1c4a3a7abb072b53b929b653eda5",
      decimals: 18,
    },
    {
      name: "GALA",
      address: "0x7ddee176f665cd201f93eede625770e2fd911990",
      decimals: 18,
    },
    {
      name: "MASK",
      address: "0x2ed9a5c8c13b93955103b9a7c167b67ef4d568a3",
      decimals: 18,
    },
    {
      name: "NMS",
      address: "0x8ac9dc3358a2db19fdd57f433ff45d1fc357afb3",
      decimals: 9,
    },
    {
      name: "ELF",
      address: "0xa3f020a5c92e15be13caf0ee5c95cf79585eecc9",
      decimals: 18,
    },
    {
      name: "CC",
      address: "0x0c2bfa54d6d4231b6213803df616a504767020ea",
      decimals: 18,
    },
    {
      name: "LAND",
      address: "0x9d986a3f147212327dd658f712d5264a73a1fdb0",
      decimals: 18,
    },
    {
      name: "LIT",
      address: "0xb59490ab09a0f526cc7305822ac65f2ab12f9723",
      decimals: 18,
    },
    {
      name: "OSWAP",
      address: "0xb32ac3c79a94ac1eb258f3c830bbdbc676483c93",
      decimals: 18,
    },
    {
      name: "AURA",
      address: "0x23c5d1164662758b3799103effe19cc064d897d6",
      decimals: 6,
    },
    {
      name: "ARDN",
      address: "0xa0a9961b7477d1a530f06a1ee805d5e532e73d97",
      decimals: 18,
    },
    {
      name: "BNX",
      address: "0x8c851d1a123ff703bd1f9dabe631b69902df5f97",
      decimals: 18,
    },
    {
      name: "DOG",
      address: "0xaa88c603d142c371ea0eac8756123c5805edee03",
      decimals: 18,
    },
    {
      name: "KNIGHT",
      address: "0xd23811058eb6e7967d9a00dc3886e75610c4abba",
      decimals: 18,
    },
    {
      name: "WALV",
      address: "0x256d1fce1b1221e8398f65f9b36033ce50b2d497",
      decimals: 18,
    },
    {
      name: "WOM",
      address: "0xad6742a35fb341a9cc6ad674738dd8da98b94fb1",
      decimals: 18,
    },
    {
      name: "PINKSALE",
      address: "0x602ba546a7b06e0fc7f58fd27eb6996ecc824689",
      decimals: 18,
    },
    {
      name: "TMT",
      address: "0x4803ac6b79f9582f69c4fa23c72cb76dd1e46d8d",
      decimals: 18,
    },
    {
      name: "JMPT",
      address: "0x88d7e9b65dc24cf54f5edef929225fc3e1580c25",
      decimals: 18,
    },
    {
      name: "AITN",
      address: "0xda3d20e21caeb1cf6dd84370aa0325087326f07a",
      decimals: 18,
    },
    {
      name: "ALICE",
      address: "0xac51066d7bec65dc4589368da368b212745d63e8",
      decimals: 6,
    },
    {
      name: "STG",
      address: "0xb0d502e938ed5f4df2e681fe6e419ff29631d62b",
      decimals: 18,
    },
    {
      name: "DEXSHARE",
      address: "0xf4914e6d97a75f014acfcf4072f11be5cffc4ca6",
      decimals: 18,
    },
    {
      name: "XCAD",
      address: "0x431e0cd023a32532bf3969cddfc002c00e98429d",
      decimals: 18,
    },
    {
      name: "GUILD",
      address: "0x0565805ca3a4105faee51983b0bd8ffb5ce1455c",
      decimals: 18,
    },
    {
      name: "SAFE",
      address: "0x4d7fa587ec8e50bd0e9cd837cb4da796f47218a1",
      decimals: 18,
    },
    {
      name: "BAS",
      address: "0x40ffafcd7415ed2f7a902312407181140ad14e68",
      decimals: 18,
    },
    {
      name: "ULX",
      address: "0xd983ab71a284d6371908420d8ac6407ca943f810",
      decimals: 18,
    },
    {
      name: "CHR",
      address: "0xf9cec8d50f6c8ad3fb6dccec577e05aa32b224fe",
      decimals: 6,
    },
    {
      name: "URUS",
      address: "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
      decimals: 18,
    },
    {
      name: "BMON",
      address: "0x08ba0619b1e7a582e0bce5bbe9843322c954c340",
      decimals: 18,
    },
    {
      name: "DAR",
      address: "0x23ce9e926048273ef83be0a3a8ba9cb6d45cd978",
      decimals: 6,
    },
    {
      name: "GALEON",
      address: "0x1d0ac23f03870f768ca005c84cbb6fb82aa884fd",
      decimals: 18,
    },
    {
      name: "ALU",
      address: "0x8263cd1601fe73c066bf49cc09841f35348e3be0",
      decimals: 18,
    },
    {
      name: "TRIVIA",
      address: "0xb465f3cb6aba6ee375e12918387de1eac2301b05",
      decimals: 3,
    },
    {
      name: "TINC",
      address: "0x05ad6e30a855be07afa57e08a4f30d00810a402e",
      decimals: 18,
    },
    {
      name: "SHEESHA",
      address: "0x232fb065d9d24c34708eedbf03724f2e95abe768",
      decimals: 18,
    },
    {
      name: "PEEL",
      address: "0x734548a9e43d2d564600b1b2ed5be9c2b911c6ab",
      decimals: 18,
    },
    {
      name: "VS",
      address: "0xcd76bc49a69bcdc5222d81c18d4a04dc8a387297",
      decimals: 6,
    },
    {
      name: "FAME",
      address: "0x28ce223853d123b52c74439b10b43366d73fd3b5",
      decimals: 18,
    },
    {
      name: "RFOX",
      address: "0x0a3a21356793b49154fd3bbe91cbc2a16c0457f5",
      decimals: 18,
    },
    {
      name: "BATH",
      address: "0x0bc89aa98ad94e6798ec822d0814d934ccd0c0ce",
      decimals: 18,
    },
    {
      name: "OLE",
      address: "0xa865197a84e780957422237b5d152772654341f3",
      decimals: 18,
    },
    {
      name: "SPACEPI",
      address: "0x69b14e8d3cebfdd8196bfe530954a0c226e5008e",
      decimals: 9,
    },
    {
      name: "AIR",
      address: "0xd8a2ae43fd061d24acd538e3866ffc2c05151b53",
      decimals: 18,
    },
    {
      name: "FTE",
      address: "0x0feb3bdf0d619191a25bfae0b8069164511cd8c9",
      decimals: 18,
    },
    {
      name: "SPIN",
      address: "0x6aa217312960a21adbde1478dc8cbcf828110a67",
      decimals: 18,
    },
    {
      name: "BETA",
      address: "0xbe1a001fe942f96eea22ba08783140b9dcc09d28",
      decimals: 18,
    },
    {
      name: "DFI",
      address: "0x361c60b7c2828fcab80988d00d1d542c83387b50",
      decimals: 18,
    },
    {
      name: "GMM",
      address: "0x5b6bf0c7f989de824677cfbd507d9635965e9cd3",
      decimals: 18,
    },
    {
      name: "SSS",
      address: "0xc3028fbc1742a16a5d69de1b334cbce28f5d7eb3",
      decimals: 18,
    },
    {
      name: "HGHG",
      address: "0xb626213cb1d52caa1ed71e2a0e62c0113ed8d642",
      decimals: 8,
    },
    {
      name: "BIRD",
      address: "0x8780fea4c6b242677d4a397fe1110ac09ce99ad2",
      decimals: 18,
    },
    {
      name: "MLT",
      address: "0x4518231a8fdf6ac553b9bbd51bbb86825b583263",
      decimals: 18,
    },
    {
      name: "BTH",
      address: "0x57bc18f6177cdaffb34ace048745bc913a1b1b54",
      decimals: 18,
    },
    {
      name: "SALE",
      address: "0x04f73a09e2eb410205be256054794fb452f0d245",
      decimals: 18,
    },
    {
      name: "GQ",
      address: "0xf700d4c708c2be1463e355f337603183d20e0808",
      decimals: 18,
    },
    {
      name: "HAPPY",
      address: "0xf5d8a096cccb31b9d7bce5afe812be23e3d4690d",
      decimals: 18,
    },
    {
      name: "VEMP",
      address: "0xedf3ce4dd6725650a8e9398e5c6398d061fa7955",
      decimals: 18,
    },
    {
      name: "RPG",
      address: "0xc2098a8938119a52b1f7661893c0153a6cb116d5",
      decimals: 18,
    },
    {
      name: "CHESS",
      address: "0x20de22029ab63cf9a7cf5feb2b737ca1ee4c82a6",
      decimals: 18,
    },
    {
      name: "MOBY",
      address: "0x47a57a9174fd8e4228e31735238a3059cfe6ecd2",
      decimals: 18,
    },
    {
      name: "RAIN",
      address: "0x6bcd897d4ba5675f860c7418ddc034f6c5610114",
      decimals: 18,
    },
    {
      name: "OM",
      address: "0xf78d2e7936f5fe18308a3b2951a93b6c4a41f5e2",
      decimals: 18,
    },
    {
      name: "XRX",
      address: "0xb25583e5e2db32b7fcbffe3f5e8e305c36157e54",
      decimals: 18,
    },
    {
      name: "JADE",
      address: "0x7ad7242a99f21aa543f9650a56d141c57e4f6081",
      decimals: 9,
    },
    {
      name: "NBL",
      address: "0xfaa0fc7b803919b091dbe5ff709b2dabb61b93d9",
      decimals: 18,
    },
    {
      name: "ACT",
      address: "0x9f3bcbe48e8b754f331dfc694a894e8e686ac31d",
      decimals: 18,
    },
    {
      name: "RFUEL",
      address: "0x69a1913d334b524ea1632461c78797c837ca9fa6",
      decimals: 18,
    },
    {
      name: "KEX",
      address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
      decimals: 6,
    },
    {
      name: "EMBR",
      address: "0x6cb8065f96d63630425fd95a408a0d6cd697c662",
      decimals: 18,
    },
    {
      name: "MILO",
      address: "0xd9de2b1973e57dc9dba90c35d6cd940ae4a3cbe1",
      decimals: 9,
    },
    {
      name: "MMPRO",
      address: "0x6067490d05f3cf2fdffc0e353b1f5fd6e5ccdf70",
      decimals: 18,
    },
    {
      name: "MOD",
      address: "0xd4fbc57b6233f268e7fba3b66e62719d74deecbc",
      decimals: 18,
    },
    {
      name: "DERC",
      address: "0x373e768f79c820aa441540d254dca6d045c6d25b",
      decimals: 18,
    },
    {
      name: "WKD",
      address: "0x5344c20fd242545f31723689662ac12b9556fc3d",
      decimals: 9,
    },
    {
      name: "CLS",
      address: "0x668048e70284107a6afab1711f28d88df3e72948",
      decimals: 18,
    },
    {
      name: "WNK",
      address: "0xb160a5f19ebccd8e0549549327e43ddd1d023526",
      decimals: 18,
    },
    {
      name: "PARA",
      address: "0x076ddce096c93dcf5d51fe346062bf0ba9523493",
      decimals: 18,
    },
    {
      name: "MGC",
      address: "0x7773feaf976599a9d6a3a7b5dc43d02ac166f255",
      decimals: 18,
    },
    {
      name: "AQUA",
      address: "0x72b7d61e8fc8cf971960dd9cfa59b8c829d91991",
      decimals: 18,
    },
    {
      name: "ETERNAL",
      address: "0xd44fd09d74cd13838f137b590497595d6b3feea4",
      decimals: 18,
    },
    {
      name: "YACHTX",
      address: "0x0403d215067cd359f4a9dc124776d262d0896662",
      decimals: 8,
    },
    {
      name: "BEE",
      address: "0xe070cca5cdfb3f2b434fb91eaf67fa2084f324d7",
      decimals: 18,
    },
    {
      name: "MINT",
      address: "0x1f3af095cda17d63cad238358837321e95fc5915",
      decimals: 18,
    },
    {
      name: "INJ",
      address: "0xa2b726b1145a4773f68593cf171187d8ebe4d495",
      decimals: 18,
    },
    {
      name: "POOLZ",
      address: "0x77018282fd033daf370337a5367e62d8811bc885",
      decimals: 18,
    },
    {
      name: "MCT",
      address: "0xe43b00b078463ca246d285be1254767da0003cc8",
      decimals: 18,
    },
    {
      name: "TAD",
      address: "0x9f7229af0c4b9740e207ea283b9094983f78ba04",
      decimals: 18,
    },
    {
      name: "MDAO",
      address: "0x60322971a672b81bcce5947706d22c19daecf6fb",
      decimals: 18,
    },
    {
      name: "MBH",
      address: "0x9d9f777d0f9c1dc2851606611822ba002665e0bf",
      decimals: 18,
    },
    {
      name: "BLID",
      address: "0x766afcf83fd5eaf884b3d529b432ca27a6d84617",
      decimals: 18,
    },
    {
      name: "PAN",
      address: "0x72e3d54293e2912fc66cf4a93625ac8305e3120d",
      decimals: 18,
    },
    {
      name: "Z7",
      address: "0x19e3cad0891595d27a501301a075eb680a4348b6",
      decimals: 18,
    },
    {
      name: "DPR",
      address: "0xa0a2ee912caf7921eaabc866c6ef6fec8f7e90a4",
      decimals: 18,
    },
    {
      name: "POLAR",
      address: "0xc64c9b30c981fc2ee4e13d0ca3f08258e725fd24",
      decimals: 18,
    },
    {
      name: "MCRT",
      address: "0x4b8285ab433d8f69cb48d5ad62b415ed1a221e4f",
      decimals: 9,
    },
    {
      name: "SWAP",
      address: "0x82443a77684a7da92fdcb639c8d2bd068a596245",
      decimals: 18,
    },
    {
      name: "ORBS",
      address: "0xebd49b26169e1b52c04cfd19fcf289405df55f80",
      decimals: 18,
    },
    {
      name: "GYRO",
      address: "0x1b239abe619e74232c827fbe5e49a4c072bd869d",
      decimals: 9,
    },
    {
      name: "BAPE",
      address: "0x70e48eb0881a8c56baad37eb4491ea85eb47b4b2",
      decimals: 18,
    },
    {
      name: "NFTB",
      address: "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
      decimals: 18,
    },
    {
      name: "FUSE",
      address: "0x5857c96dae9cf8511b08cb07f85753c472d36ea3",
      decimals: 18,
    },
    {
      name: "COPI",
      address: "0xfea292e5ea4510881bdb840e3cec63abd43f936f",
      decimals: 18,
    },
    {
      name: "IPAD",
      address: "0xf07dfc2ad28ab5b09e8602418d2873fcb95e1744",
      decimals: 18,
    },
    {
      name: "EOS",
      address: "0x56b6fb708fc5732dec1afc8d8556423a2edccbd6",
      decimals: 18,
    },
    {
      name: "BTA",
      address: "0x5d2436c74b8ab54f3199f76a0761d30ca64a0827",
      decimals: 9,
    },
    {
      name: "MIX",
      address: "0x398f7827dccbefe6990478876bbf3612d93baf05",
      decimals: 18,
    },
    {
      name: "STC",
      address: "0x340724464cf51a551106cc6657606ee7d87b28b9",
      decimals: 18,
    },
    {
      name: "LINKS",
      address: "0xaffeabc20b2cafa80d2d7ff220ad37e4ec7541d7",
      decimals: 18,
    },
    {
      name: "SGLY",
      address: "0x5f50411cde3eec27b0eac21691b4e500c69a5a2e",
      decimals: 18,
    },
    {
      name: "FEVR",
      address: "0x82030cdbd9e4b7c5bb0b811a61da6360d69449cc",
      decimals: 18,
    },
    {
      name: "LEAD",
      address: "0x2ed9e96edd11a1ff5163599a66fb6f1c77fa9c66",
      decimals: 18,
    },
    {
      name: "NFTS",
      address: "0x08037036451c768465369431da5c671ad9b37dbc",
      decimals: 18,
    },
    {
      name: "ATA",
      address: "0xa2120b9e674d3fc3875f415a7df52e382f141225",
      decimals: 18,
    },
    {
      name: "NUARS",
      address: "0x91bc956f064d755db2e4efe839ef0131e0b07e28",
      decimals: 18,
    },
    {
      name: "QANX",
      address: "0xaaa7a10a8ee237ea61e8ac46c50a8db8bcc1baaa",
      decimals: 18,
    },
    {
      name: "IMT",
      address: "0x7b8779e01d117ec7e220f8299a6f93672e8eae23",
      decimals: 18,
    },
    {
      name: "KIRO",
      address: "0xf83c0f6d3a5665bd7cfdd5831a856d85942bc060",
      decimals: 18,
    },
    {
      name: "BTBS",
      address: "0x6fefd97f328342a8a840546a55fdcfee7542f9a8",
      decimals: 18,
    },
    {
      name: "ZINU",
      address: "0x21f9b5b2626603e3f40bfc13d01afb8c431d382f",
      decimals: 9,
    },
    {
      name: "GAFI",
      address: "0x89af13a10b32f1b2f8d1588f93027f69b6f4e27e",
      decimals: 18,
    },
    {
      name: "OOE",
      address: "0x9029fdfae9a03135846381c7ce16595c3554e10a",
      decimals: 18,
    },
    {
      name: "LORD",
      address: "0x2daf1a83aa348afbcbc73f63bb5ee3154d9f5776",
      decimals: 18,
    },
    {
      name: "FARA",
      address: "0xf4ed363144981d3a65f42e7d0dc54ff9eef559a1",
      decimals: 18,
    },
    {
      name: "WWY",
      address: "0x9ab70e92319f0b9127df78868fd3655fb9f1e322",
      decimals: 18,
    },
    {
      name: "KRED",
      address: "0x1c50e72b9b7a44bf7e63fe7735d67d82c3e4bf74",
      decimals: 18,
    },
    {
      name: "XED",
      address: "0x5621b5a3f4a8008c4ccdd1b942b121c8b1944f1f",
      decimals: 18,
    },
    {
      name: "RAINI",
      address: "0xeb953eda0dc65e3246f43dc8fa13f35623bdd5ed",
      decimals: 18,
    },
    {
      name: "POLC",
      address: "0x6ae9701b9c423f40d54556c9a443409d79ce170a",
      decimals: 18,
    },
    {
      name: "ADAM",
      address: "0x59802ac95f2399c929a096171c1bee93c27dae90",
      decimals: 8,
    },
    {
      name: "ZOON",
      address: "0x9d173e6c594f479b4d47001f8e6a95a7adda42bc",
      decimals: 18,
    },
    {
      name: "CAPS",
      address: "0xffba7529ac181c2ee1844548e6d7061c9a597df4",
      decimals: 18,
    },
    {
      name: "ADX",
      address: "0x6bff4fb161347ad7de4a625ae5aa3a1ca7077819",
      decimals: 18,
    },
    {
      name: "SHIBA",
      address: "0xb84cbbf09b3ed388a45cd875ebba41a20365e6e7",
      decimals: 18,
    },
    {
      name: "AFNTY",
      address: "0xface67c5ce2bb48c29779b0dede5360cc9ef5fd5",
      decimals: 9,
    },
    {
      name: "MVS",
      address: "0x98afac3b663113d29dc2cd8c2d1d14793692f110",
      decimals: 18,
    },
    {
      name: "Ari10",
      address: "0x80262f604acac839724f66846f290a2cc8b48662",
      decimals: 18,
    },
    {
      name: "NMX",
      address: "0xd32d01a43c869edcd1117c640fbdcfcfd97d9d65",
      decimals: 18,
    },
    {
      name: "XTM",
      address: "0xcd1faff6e578fa5cac469d2418c95671ba1a62fe",
      decimals: 18,
    },
    {
      name: "CGG",
      address: "0x1613957159e9b0ac6c80e824f7eea748a32a0ae2",
      decimals: 18,
    },
    {
      name: "WIN",
      address: "0xaef0d72a118ce24fee3cd1d43d383897d05b4e99",
      decimals: 18,
    },
    {
      name: "ONG",
      address: "0x308bfaeaac8bdab6e9fc5ead8edcb5f95b0599d9",
      decimals: 9,
    },
    {
      name: "REEF",
      address: "0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e",
      decimals: 18,
    },
    {
      name: "C98",
      address: "0xaec945e04baf28b135fa7c640f624f8d90f1c3a6",
      decimals: 18,
    },
    {
      name: "XTZ",
      address: "0x16939ef78684453bfdfb47825f8a5f714f12623a",
      decimals: 18,
    },
    {
      name: "UNFI",
      address: "0x728c5bac3c3e370e372fc4671f9ef6916b814d8b",
      decimals: 18,
    },
    {
      name: "MNSTRS",
      address: "0x287db351d5230716246cfb46af8153025eda6a0a",
      decimals: 18,
    },
    {
      name: "RBC",
      address: "0x8e3bcc334657560253b83f08331d85267316e08a",
      decimals: 18,
    },
    {
      name: "SEA",
      address: "0x26193c7fa4354ae49ec53ea2cebc513dc39a10aa",
      decimals: 18,
    },
    {
      name: "QMALL",
      address: "0x07e551e31a793e20dc18494ff6b03095a8f8ee36",
      decimals: 18,
    },
    {
      name: "OPUL",
      address: "0x686318000d982bc8dcc1cdcf8ffd22322f0960ed",
      decimals: 18,
    },
    {
      name: "THG",
      address: "0x9fd87aefe02441b123c3c32466cd9db4c578618f",
      decimals: 18,
    },
    {
      name: "RCH",
      address: "0x041e714aa0dce7d4189441896486d361e98bad5f",
      decimals: 9,
    },
    {
      name: "XETA",
      address: "0xbc7370641ddcf16a27eea11230af4a9f247b61f9",
      decimals: 18,
    },
    {
      name: "AIOZ",
      address: "0x33d08d8c7a168333a85285a68c0042b39fc3741d",
      decimals: 18,
    },
    {
      name: "TAG",
      address: "0x717fb7b6d0c3d7f1421cc60260412558283a6ae5",
      decimals: 18,
    },
    {
      name: "HAI",
      address: "0xaa9e582e5751d703f85912903bacaddfed26484c",
      decimals: 8,
    },
    {
      name: "DESU",
      address: "0x32f1518baace69e85b9e5ff844ebd617c52573ac",
      decimals: 18,
    },
    {
      name: "FABRIC",
      address: "0x73ff5dd853cb87c144f463a555dce0e43954220d",
      decimals: 18,
    },
    {
      name: "TLM",
      address: "0x2222227e22102fe3322098e4cbfe18cfebd57c95",
      decimals: 4,
    },
    {
      name: "BAND",
      address: "0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18",
      decimals: 18,
    },
    {
      name: "XFT",
      address: "0xe138c66982fd5c890c60b94fdba1747faf092c20",
      decimals: 18,
    },
    {
      name: "RVF",
      address: "0x872a34ebb2d54af86827810eebc7b9dc6b2144aa",
      decimals: 18,
    },
    {
      name: "AOG",
      address: "0x40c8225329bd3e28a043b029e0d07a5344d2c27c",
      decimals: 18,
    },
    {
      name: "ACH",
      address: "0xbc7d6b50616989655afd682fb42743507003056d",
      decimals: 8,
    },
    {
      name: "SIL",
      address: "0x133bb423d9248a336d2b3086b8f44a7dbff3a13c",
      decimals: 18,
    },
    {
      name: "ATR",
      address: "0x7559c49c3aec50e763a486bb232fa8d0d76078e4",
      decimals: 9,
    },
    {
      name: "CLCT",
      address: "0x3249fa9e11efece7cb03b4ad2994f46e54a35843",
      decimals: 18,
    },
    {
      name: "DXCT",
      address: "0x5b1baec64af6dc54e6e04349315919129a6d3c23",
      decimals: 18,
    },
    {
      name: "ZEE",
      address: "0x44754455564474a89358b2c2265883df993b12f0",
      decimals: 18,
    },
    {
      name: "ZIL",
      address: "0xb86abcb37c3a4b64f74f59301aff131a1becc787",
      decimals: 12,
    },
    {
      name: "TEM",
      address: "0x19e6bfc1a6e4b042fb20531244d47e252445df01",
      decimals: 9,
    },
    {
      name: "RDR",
      address: "0x92da433da84d58dfe2aade1943349e491cbd6820",
      decimals: 18,
    },
    {
      name: "GLCH",
      address: "0xf0902eb0049a4003793bab33f3566a22d2834442",
      decimals: 18,
    },
    {
      name: "YON",
      address: "0xb8c3e8ff71513afc8cfb2dddc5a994a501db1916",
      decimals: 18,
    },
    {
      name: "SHI",
      address: "0x7269d98af4aa705e0b1a5d8512fadb4d45817d5a",
      decimals: 18,
    },
    {
      name: "VIM",
      address: "0x5bcd91c734d665fe426a5d7156f2ad7d37b76e30",
      decimals: 18,
    },
    {
      name: "ORAI",
      address: "0xa325ad6d9c92b55a3fc5ad7e412b1518f96441c0",
      decimals: 18,
    },
    {
      name: "MEGALAND",
      address: "0x7cd8c22d3f4b66230f73d7ffcb48576233c3fe33",
      decimals: 18,
    },
    {
      name: "CTK",
      address: "0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929",
      decimals: 6,
    },
    {
      name: "BLP",
      address: "0xfe1d7f7a8f0bda6e415593a2e4f82c64b446d404",
      decimals: 18,
    },
    {
      name: "DHD",
      address: "0xac55b04af8e9067d6c53785b34113e99e10c2a11",
      decimals: 18,
    },
    {
      name: "ADS",
      address: "0xcfcecfe2bd2fed07a9145222e8a7ad9cf1ccd22a",
      decimals: 11,
    },
    {
      name: "DARK",
      address: "0x12fc07081fab7de60987cad8e8dc407b606fb2f8",
      decimals: 8,
    },
    {
      name: "CHRP",
      address: "0xed00fc7d48b57b81fe65d1ce71c0985e4cf442cb",
      decimals: 18,
    },
    {
      name: "AZY",
      address: "0x7b665b2f633d9363b89a98b094b1f9e732bd8f86",
      decimals: 18,
    },
    {
      name: "NGL",
      address: "0x0f5d8cd195a4539bcf2ec6118c6da50287c6d5f5",
      decimals: 18,
    },
    {
      name: "APRIL",
      address: "0xbfea674ce7d16e26e39e3c088810367a708ef94c",
      decimals: 18,
    },
    {
      name: "CLIMB",
      address: "0x2a1d286ed5edad78befd6e0d8beb38791e8cd69d",
      decimals: 8,
    },
    {
      name: "IMO",
      address: "0x94d79c325268c898d2902050730f27a478c56cc1",
      decimals: 18,
    },
    {
      name: "BCDT",
      address: "0x8683e604cdf911cd72652a04bf9d571697a86a60",
      decimals: 18,
    },
    {
      name: "PMON",
      address: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
      decimals: 18,
    },
    {
      name: "CPO",
      address: "0xea395dfafed39924988b475f2ca7f4c72655203a",
      decimals: 18,
    },
    {
      name: "CRX",
      address: "0x97a30c692ece9c317235d48287d23d358170fc40",
      decimals: 18,
    },
    {
      name: "SHELL",
      address: "0x208cfec94d2ba8b8537da7a9bb361c6baad77272",
      decimals: 18,
    },
    {
      name: "HUB",
      address: "0xee7b7c840de85ad277cdddaef63b3b29672a3c58",
      decimals: 18,
    },
    {
      name: "MSU",
      address: "0xe8377a076adabb3f9838afb77bee96eac101ffb1",
      decimals: 18,
    },
    {
      name: "NNT",
      address: "0x3a2927e68749dd6ad0a568d7c05b587863c0bc10",
      decimals: 18,
    },
    {
      name: "OPTCM",
      address: "0x7a2277f34f275ded630deff758fbc818409ca36d",
      decimals: 18,
    },
    {
      name: "NFT11",
      address: "0x73f67ae7f934ff15beabf55a28c2da1eeb9b56ec",
      decimals: 18,
    },
    {
      name: "RETA",
      address: "0x829555f1197171d35ec51c095e27b47a246ac6a6",
      decimals: 18,
    },
    {
      name: "BULL",
      address: "0xf483af09917ba63f1e274056978036d266eb56e6",
      decimals: 18,
    },
    {
      name: "LENDA",
      address: "0x2d7a47908d817dd359f9aba7feaa89c92a289c7e",
      decimals: 18,
    },
    {
      name: "TITA",
      address: "0x0c1253a30da9580472064a91946c5ce0c58acf7f",
      decimals: 18,
    },
    {
      name: "GMEE",
      address: "0x84e9a6f9d240fdd33801f7135908bfa16866939a",
      decimals: 18,
    },
    {
      name: "CHI",
      address: "0x51d9ab40ff21f5172b33e3909d94abdc6d542679",
      decimals: 18,
    },
    {
      name: "CFi",
      address: "0x6a545f9c64d8f7b957d8d2e6410b52095a9e6c29",
      decimals: 18,
    },
    {
      name: "BETU",
      address: "0x0df1b3f30865c5b324797f8db9d339514cac4e94",
      decimals: 18,
    },
    {
      name: "NINKY",
      address: "0x90422d35496e8ed3391971dbec894e4a8057081f",
      decimals: 18,
    },
    {
      name: "GEAR",
      address: "0xb4404dab7c0ec48b428cf37dec7fb628bcc41b36",
      decimals: 18,
    },
    {
      name: "CELL",
      address: "0xf3e1449ddb6b218da2c9463d4594ceccc8934346",
      decimals: 18,
    },
    {
      name: "ROOM",
      address: "0x3c45a24d36ab6fc1925533c1f57bc7e1b6fba8a4",
      decimals: 18,
    },
    {
      name: "REVO",
      address: "0x155040625d7ae3e9cada9a73e3e44f76d3ed1409",
      decimals: 18,
    },
    {
      name: "UMB",
      address: "0x846f52020749715f02aef25b5d1d65e48945649d",
      decimals: 18,
    },
    {
      name: "RVC",
      address: "0xbcbdecf8e76a5c32dba69de16985882ace1678c6",
      decimals: 18,
    },
    {
      name: "NAFT",
      address: "0xd7730681b1dc8f6f969166b29d8a5ea8568616a3",
      decimals: 18,
    },
    {
      name: "A4",
      address: "0x9767203e89dcd34851240b3919d4900d3e5069f1",
      decimals: 6,
    },
    {
      name: "WANA",
      address: "0x339c72829ab7dd45c3c52f965e7abe358dd8761e",
      decimals: 18,
    },
    {
      name: "BP",
      address: "0xacb8f52dc63bb752a51186d1c55868adbffee9c1",
      decimals: 18,
    },
    {
      name: "ELMON",
      address: "0xe3233fdb23f1c27ab37bd66a19a1f1762fcf5f3f",
      decimals: 18,
    },
    {
      name: "EPIK",
      address: "0x368ce786ea190f32439074e8d22e12ecb718b44c",
      decimals: 18,
    },
    {
      name: "GGG",
      address: "0xd8047afecb86e44eff3add991b9f063ed4ca716b",
      decimals: 18,
    },
    {
      name: "FND",
      address: "0x264387ad73d19408e34b5d5e13a93174a35cea33",
      decimals: 18,
    },
    {
      name: "CRUX",
      address: "0xe0191fefdd0d2b39b1a2e4e029ccda8a481b7995",
      decimals: 18,
    },
    {
      name: "1ART",
      address: "0xd3c325848d7c6e29b574cb0789998b2ff901f17e",
      decimals: 18,
    },
    {
      name: "TRVL",
      address: "0x6a8fd46f88dbd7bdc2d536c604f811c63052ce0f",
      decimals: 18,
    },
    {
      name: "KLING",
      address: "0xcca166e916088cce10f4fb0fe0c8bb3577bb6e27",
      decimals: 18,
    },
    {
      name: "XDOGE",
      address: "0x4c0415a6e340eccebff58131799c6c4127cc39fa",
      decimals: 18,
    },
    {
      name: "VINU",
      address: "0xfebe8c1ed424dbf688551d4e2267e7a53698f0aa",
      decimals: 18,
    },
    {
      name: "UNCL",
      address: "0x0e8d5504bf54d9e44260f8d153ecd5412130cabb",
      decimals: 18,
    },
    {
      name: "CPD",
      address: "0x2406dce4da5ab125a18295f4fb9fd36a0f7879a2",
      decimals: 18,
    },
    {
      name: "AIRI",
      address: "0x7e2a35c746f2f7c240b664f1da4dd100141ae71f",
      decimals: 18,
    },
    {
      name: "MOOV",
      address: "0x0ebd9537a25f56713e34c45b38f421a1e7191469",
      decimals: 18,
    },
    {
      name: "KAI",
      address: "0x39ae8eefb05138f418bb27659c21632dc1ddab10",
      decimals: 18,
    },
    {
      name: "PRL",
      address: "0xd07e82440a395f3f3551b42da9210cd1ef4f8b24",
      decimals: 18,
    },
    {
      name: "ZDC",
      address: "0x5649e392a1bac3e21672203589adf8f6c99f8db3",
      decimals: 18,
    },
    {
      name: "RBP",
      address: "0x563ca064e41f3b5d80adeecfe49ab375fd7afbef",
      decimals: 18,
    },
    {
      name: "XMT",
      address: "0x582c12b30f85162fa393e5dbe2573f9f601f9d91",
      decimals: 18,
    },
    {
      name: "PROM",
      address: "0xaf53d56ff99f1322515e54fdde93ff8b3b7dafd5",
      decimals: 18,
    },
    {
      name: "ZOA",
      address: "0xb2e841894b1c3d638948517f6234c6e06d3b8e1c",
      decimals: 18,
    },
    {
      name: "CREO",
      address: "0x9521728bf66a867bc65a93ece4a543d817871eb7",
      decimals: 18,
    },
    {
      name: "CYC",
      address: "0x810ee35443639348adbbc467b33310d2ab43c168",
      decimals: 18,
    },
    {
      name: "BEL",
      address: "0x8443f091997f06a61670b735ed92734f5628692f",
      decimals: 18,
    },
    {
      name: "MSTR",
      address: "0x2290c6bd9560e6498dfdf10f9ecb17997ca131f2",
      decimals: 18,
    },
    {
      name: "ETNA",
      address: "0x51f35073ff7cf54c9e86b7042e59a8cc9709fc46",
      decimals: 18,
    },
    {
      name: "LOCK",
      address: "0x817b5054392199fed877e1dfdf4bda7234691e8e",
      decimals: 9,
    },
    {
      name: "WAL",
      address: "0xd306c124282880858a634e7396383ae58d37c79c",
      decimals: 18,
    },
    {
      name: "REVV",
      address: "0x833f307ac507d47309fd8cdd1f835bef8d702a93",
      decimals: 18,
    },
    {
      name: "LAUNCH",
      address: "0xb5389a679151c4b8621b1098c6e0961a3cfee8d4",
      decimals: 18,
    },
    {
      name: "MILIT",
      address: "0xeea7c025b1eee9527d631094d45ff9ce5d830b6f",
      decimals: 18,
    },
    {
      name: "STACK",
      address: "0x6855f7bb6287f94ddcc8915e37e73a3c9fee5cf3",
      decimals: 18,
    },
    {
      name: "COP",
      address: "0x8789337a176e6e7223ff115f1cd85c993d42c25c",
      decimals: 18,
    },
    {
      name: "NAOS",
      address: "0x758d08864fb6cce3062667225ca10b8f00496cc2",
      decimals: 18,
    },
    {
      name: "DPET",
      address: "0xfb62ae373aca027177d1c18ee0862817f9080d08",
      decimals: 18,
    },
    {
      name: "NEWB",
      address: "0x545f90dc35ca1e6129f1fed354b3e2df12034261",
      decimals: 18,
    },
    {
      name: "SLD",
      address: "0x1ef6a7e2c966fb7c5403efefde38338b1a95a084",
      decimals: 18,
    },
    {
      name: "SWAPZ",
      address: "0xd522a1dce1ca4b138dda042a78672307eb124cc2",
      decimals: 18,
    },
    {
      name: "XEND",
      address: "0x4a080377f83d669d7bb83b3184a8a5e61b500608",
      decimals: 18,
    },
    {
      name: "SSG",
      address: "0xa0c8c80ed6b7f09f885e826386440b2349f0da7e",
      decimals: 18,
    },
    {
      name: "PHL",
      address: "0x68dd887d012abdf99d3492621e4d576a3f75019d",
      decimals: 18,
    },
    {
      name: "CBT",
      address: "0x7c73967dc8c804ea028247f5a953052f0cd5fd58",
      decimals: 18,
    },
    {
      name: "HZN",
      address: "0xc0eff7749b125444953ef89682201fb8c6a917cd",
      decimals: 18,
    },
    {
      name: "MERKLE",
      address: "0x000000000ca5171087c18fb271ca844a2370fc0a",
      decimals: 18,
    },
    {
      name: "HE",
      address: "0x20d39a5130f799b95b55a930e5b7ebc589ea9ed8",
      decimals: 18,
    },
    {
      name: "AGS",
      address: "0x73ffdf2d2afb3def5b10bf967da743f2306a51db",
      decimals: 18,
    },
    {
      name: "DERI",
      address: "0xe60eaf5a997dfae83739e035b005a33afdcc6df5",
      decimals: 18,
    },
    {
      name: "METAL",
      address: "0x200c234721b5e549c3693ccc93cf191f90dc2af9",
      decimals: 18,
    },
    {
      name: "BUFFS",
      address: "0x140b890bf8e2fe3e26fcd516c75728fb20b31c4f",
      decimals: 4,
    },
    {
      name: "ASTAR",
      address: "0x9eeddb9da3bcbfdcfbf075441a9e14c6a8899999",
      decimals: 18,
    },
    {
      name: "LIQR",
      address: "0x33333ee26a7d02e41c33828b42fb1e0889143477",
      decimals: 18,
    },
    {
      name: "THC",
      address: "0x24802247bd157d771b7effa205237d8e9269ba8a",
      decimals: 18,
    },
    {
      name: "FROYO",
      address: "0xe369fec23380f9f14ffd07a1dc4b7c1a9fdd81c9",
      decimals: 18,
    },
    {
      name: "ARPA",
      address: "0x6f769e65c14ebd1f68817f5f1dcdb61cfa2d6f7e",
      decimals: 18,
    },
    {
      name: "YEL",
      address: "0xd3b71117e6c1558c1553305b44988cd944e97300",
      decimals: 18,
    },
    {
      name: "HOTCROSS",
      address: "0x4fa7163e153419e0e1064e418dd7a99314ed27b6",
      decimals: 18,
    },
    {
      name: "FINE",
      address: "0x4e6415a5727ea08aae4580057187923aec331227",
      decimals: 18,
    },
    {
      name: "TON",
      address: "0x76a797a59ba2c17726896976b7b3747bfd1d220f",
      decimals: 9,
    },
    {
      name: "SIN",
      address: "0x6397de0f9aedc0f7a8fa8b438dde883b9c201010",
      decimals: 18,
    },
    {
      name: "KXA",
      address: "0x2223bf1d7c19ef7c06dab88938ec7b85952ccd89",
      decimals: 18,
    },
    {
      name: "DDD",
      address: "0x84c97300a190676a19d1e13115629a11f8482bd1",
      decimals: 18,
    },
    {
      name: "PUSSY",
      address: "0xd9e8d20bde081600fac0d94b88eafaddce55aa43",
      decimals: 18,
    },
    {
      name: "BBT",
      address: "0xd48474e7444727bf500a32d5abe01943f3a59a64",
      decimals: 8,
    },
    {
      name: "POO",
      address: "0xfc20a257786f2d8a038caca312be0f10e206d15f",
      decimals: 18,
    },
    {
      name: "SON",
      address: "0x3b0e967ce7712ec68131a809db4f78ce9490e779",
      decimals: 18,
    },
    {
      name: "MARS4",
      address: "0x9cd9c5a44cb8fab39b2ee3556f5c439e65e4fddd",
      decimals: 18,
    },
    {
      name: "BLK",
      address: "0xc0e6ad13bd58413ed308729b688d601243e1cf77",
      decimals: 18,
    },
    {
      name: "LIFE",
      address: "0x82190d28e710ea9c029d009fad951c6f1d803bb3",
      decimals: 18,
    },
    {
      name: "NFTY",
      address: "0x5774b2fc3e91af89f89141eacf76545e74265982",
      decimals: 18,
    },
    {
      name: "TAP",
      address: "0x35bedbf9291b22218a0da863170dcc9329ef2563",
      decimals: 18,
    },
    {
      name: "CBD",
      address: "0x0e2b41ea957624a314108cc4e33703e9d78f4b3c",
      decimals: 18,
    },
    {
      name: "RDT",
      address: "0xe9c64384deb0c2bf06d991a8d708c77eb545e3d5",
      decimals: 18,
    },
    {
      name: "FEAR",
      address: "0x9ba6a67a6f3b21705a46b380a1b97373a33da311",
      decimals: 18,
    },
    {
      name: "NBT",
      address: "0x1d3437e570e93581bd94b2fd8fbf202d4a65654a",
      decimals: 18,
    },
    {
      name: "UDO",
      address: "0x70802af0ba10dd5bb33276b5b37574b6451db3d9",
      decimals: 18,
    },
    {
      name: "CHAIN",
      address: "0x35de111558f691f77f791fb0c08b2d6b931a9d47",
      decimals: 18,
    },
    {
      name: "PNL",
      address: "0xb346c52874c7023df183068c39478c3b7b2515bc",
      decimals: 18,
    },
    {
      name: "TRAVA",
      address: "0x0391be54e72f7e001f6bbc331777710b4f2999ef",
      decimals: 18,
    },
    {
      name: "RU",
      address: "0x6dc923900b3000bd074d1fea072839d51c76e70e",
      decimals: 18,
    },
    {
      name: "KGO",
      address: "0x5d3afba1924ad748776e4ca62213bf7acf39d773",
      decimals: 5,
    },
    {
      name: "DDIM",
      address: "0xc9132c76060f6b319764ea075973a650a1a53bc9",
      decimals: 18,
    },
    {
      name: "TENFI",
      address: "0xd15c444f1199ae72795eba15e8c1db44e47abf62",
      decimals: 18,
    },
    {
      name: "SUPS",
      address: "0xc99cfaa8f5d9bd9050182f29b83cc9888c5846c4",
      decimals: 18,
    },
    {
      name: "SHAK",
      address: "0x76e08e1c693d42551dd6ba7c2a659f74ff5ba261",
      decimals: 18,
    },
    {
      name: "ABR",
      address: "0x68784ffaa6ff05e3e04575df77960dc1d9f42b4a",
      decimals: 18,
    },
    {
      name: "ANTA",
      address: "0x9eaf5369c9a9809bad8716591f9b2f68124ccd63",
      decimals: 18,
    },
    {
      name: "ORE",
      address: "0x4ef285c8cbe52267c022c39da98b97ca4b7e2ff9",
      decimals: 18,
    },
    {
      name: "HAPI",
      address: "0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54",
      decimals: 18,
    },
    {
      name: "FAWA",
      address: "0x3a141d768298e9fdaccf9ba59b07d5fa5705f118",
      decimals: 18,
    },
    {
      name: "AXS",
      address: "0x715d400f88c167884bbcc41c5fea407ed4d2f8a0",
      decimals: 18,
    },
    {
      name: "DON",
      address: "0x86b3f23b6e90f5bbfac59b5b2661134ef8ffd255",
      decimals: 18,
    },
    {
      name: "YAE",
      address: "0x4ee438be38f8682abb089f2bfea48851c5e71eaf",
      decimals: 18,
    },
    {
      name: "EQUAD",
      address: "0x564bef31ec942ffe1bff250786f76a5c5141b9f3",
      decimals: 18,
    },
    {
      name: "CPLT",
      address: "0x1ccabe9a0d53636770f0d5c6ce33f797e698c9d0",
      decimals: 18,
    },
    {
      name: "MHT",
      address: "0x5cb2c3ed882e37da610f9ef5b0fa25514d7bc85b",
      decimals: 18,
    },
    {
      name: "HUDI",
      address: "0x83d8ea5a4650b68cd2b57846783d86df940f7458",
      decimals: 18,
    },
    {
      name: "KALI",
      address: "0x950481789959cd6d77f1b88c2e1f61e30608c4e2",
      decimals: 18,
    },
    {
      name: "NRT",
      address: "0x1b2f67679798c764f2c0c69dfb6bda8b30a094cf",
      decimals: 18,
    },
    {
      name: "GMPD",
      address: "0x9720ca160bbd4e7f3dd4bb3f8bd4227ca0342e63",
      decimals: 18,
    },
    {
      name: "GCAKE",
      address: "0x61d5822dd7b3ed495108733e6550d4529480c8f6",
      decimals: 18,
    },
    {
      name: "VST",
      address: "0xacf34edcc424128cccc730bf85cdaceebcb3eece",
      decimals: 18,
    },
    {
      name: "REALM",
      address: "0x464fdb8affc9bac185a7393fd4298137866dcfb8",
      decimals: 18,
    },
    {
      name: "BABI",
      address: "0xec15a508a187e8ddfe572a5423faa82bbdd65120",
      decimals: 18,
    },
    {
      name: "PINK",
      address: "0x9133049fb1fddc110c92bf5b7df635abb70c89dc",
      decimals: 18,
    },
    {
      name: "DUCK",
      address: "0x5d186e28934c6b0ff5fc2fece15d1f34f78cbd87",
      decimals: 18,
    },
    {
      name: "FINA",
      address: "0x426c72701833fddbdfc06c944737c6031645c708",
      decimals: 18,
    },
    {
      name: "SWAPP",
      address: "0x0efe961c733ff46ce34c56a73eba0c6a0e18e0f5",
      decimals: 18,
    },
    {
      name: "FHTN",
      address: "0x87be0b856960f57fb0104ef0922cd1dacbd37f64",
      decimals: 18,
    },
    {
      name: "DECODE",
      address: "0x50bafba28852d2816eb62da5c3137dc9b05858e8",
      decimals: 18,
    },
    {
      name: "DNXC",
      address: "0x3c1748d647e6a56b37b66fcd2b5626d0461d3aa0",
      decimals: 18,
    },
    {
      name: "XP",
      address: "0x180cfbe9843d79bcafcbcdf23590247793dfc95b",
      decimals: 18,
    },
    {
      name: "COTI",
      address: "0xadbaf88b39d37dc68775ed1541f1bf83a5a45feb",
      decimals: 18,
    },
    {
      name: "YSEC",
      address: "0x56a0f16af7c8098141b363094fcf864d52831326",
      decimals: 18,
    },
    {
      name: "SCV",
      address: "0x1ecec64957a7f83f90e77bd1b1816ab40df4f615",
      decimals: 18,
    },
    {
      name: "FOTA",
      address: "0x0a4e1bdfa75292a98c15870aef24bd94bffe0bd4",
      decimals: 18,
    },
    {
      name: "GMR",
      address: "0xadca52302e0a6c2d5d68edcdb4ac75deb5466884",
      decimals: 18,
    },
    {
      name: "DGN",
      address: "0x72f28c09be1342447fa01ebc76ef508473d08c5c",
      decimals: 18,
    },
    {
      name: "RUBY",
      address: "0x76ebfb435364baa45c34f5152173101d0ab64c7d",
      decimals: 6,
    },
    {
      name: "MEPAD",
      address: "0x9d70a3ee3079a6fa2bb16591414678b7ad91f0b5",
      decimals: 18,
    },
    {
      name: "AIRT",
      address: "0x016cf83732f1468150d87dcc5bdf67730b3934d3",
      decimals: 18,
    },
    {
      name: "HC",
      address: "0xa6e78ad3c9b4a79a01366d01ec4016eb3075d7a0",
      decimals: 18,
    },
    {
      name: "CRBN",
      address: "0x5a4fb10e7c4cbb9a2b9d9a942f9a875ebd3489ea",
      decimals: 18,
    },
    {
      name: "XMETA",
      address: "0xb080171c8999c336cc115d4d8224c2de51657a1c",
      decimals: 18,
    },
    {
      name: "LTT",
      address: "0x1dc84fc11e48ae640d48044f22a603bbe914a612",
      decimals: 9,
    },
    {
      name: "CIRUS",
      address: "0x4c888e116d57a32f84865f3789dcb131fdc9fab6",
      decimals: 18,
    },
    {
      name: "TFS",
      address: "0xf4bea2c219eb95c6745983b68185c7340c319d9e",
      decimals: 18,
    },
    {
      name: "FNDZ",
      address: "0x7754c0584372d29510c019136220f91e25a8f706",
      decimals: 18,
    },
    {
      name: "DGS",
      address: "0x4ea636b489f51e2c332e2a6203bf3fcc0954a5f4",
      decimals: 18,
    },
    {
      name: "UMW",
      address: "0xed2f47a7748616f107dd3aace93da5e2d8b17e6f",
      decimals: 18,
    },
    {
      name: "CMD",
      address: "0x8ddd62949700937458a5c6535d1ee5dbebe62b77",
      decimals: 18,
    },
    {
      name: "DVI",
      address: "0x758fb037a375f17c7e195cc634d77da4f554255b",
      decimals: 18,
    },
    {
      name: "MTRG",
      address: "0xbd2949f67dcdc549c6ebe98696449fa79d988a9f",
      decimals: 18,
    },
    {
      name: "ONT",
      address: "0xfd7b3a77848f1c2d67e05e54d78d174a0c850335",
      decimals: 18,
    },
    {
      name: "SRP",
      address: "0xcb2b25e783a414f0d20a65afa741c51b1ad84c49",
      decimals: 18,
    },
    {
      name: "COPYCAT",
      address: "0xd635b32688f36ee4a7fe117b4c91dd811277acb6",
      decimals: 18,
    },
    {
      name: "BONDLY",
      address: "0x5d0158a5c3ddf47d4ea4517d8db0d76aa2e87563",
      decimals: 18,
    },
    {
      name: "LRPS",
      address: "0x57f251706a6e4f5bb0a39ebaeb2335e3af606057",
      decimals: 18,
    },
    {
      name: "AXL",
      address: "0x25b24b3c47918b7962b3e49c4f468367f73cc0e0",
      decimals: 18,
    },
    {
      name: "HIP",
      address: "0xe6ffa2e574a8bbeb5243d2109b6b11d4a459f88b",
      decimals: 18,
    },
    {
      name: "CHTS",
      address: "0x1cdb9b4465f4e65b93d0ad802122c7c9279975c9",
      decimals: 18,
    },
    {
      name: "GSC",
      address: "0x639fc0c006bd7050e2c359295b41a79cb28694ba",
      decimals: 18,
    },
    {
      name: "GS",
      address: "0x9ba4c78b048eeed69f4ed3cfddeda7b51baf7ca8",
      decimals: 18,
    },
    {
      name: "DOSE",
      address: "0x7837fd820ba38f95c54d6dac4ca3751b81511357",
      decimals: 18,
    },
    {
      name: "GAINS",
      address: "0xd9ea58350bf120e2169a35fa1afc31975b07de01",
      decimals: 18,
    },
    {
      name: "SHIH",
      address: "0x1e8150ea46e2a7fbb795459198fbb4b35715196c",
      decimals: 18,
    },
    {
      name: "MSCP",
      address: "0x27d72484f1910f5d0226afa4e03742c9cd2b297a",
      decimals: 18,
    },
    {
      name: "WGC",
      address: "0x1e4ffa373d94c95717fb83ec026b2e0e2f443bb0",
      decimals: 16,
    },
    {
      name: "BSCS",
      address: "0xbcb24afb019be7e93ea9c43b7e22bb55d5b7f45d",
      decimals: 18,
    },
    {
      name: "SPI",
      address: "0x78a18db278f9c7c9657f61da519e6ef43794dd5d",
      decimals: 18,
    },
    {
      name: "FRMX",
      address: "0x8523518001ad5d24b2a04e8729743c0643a316c0",
      decimals: 18,
    },
    {
      name: "MRUN",
      address: "0xca0d640a401406f3405b4c252a5d0c4d17f38ebb",
      decimals: 18,
    },
    {
      name: "WSG",
      address: "0xa58950f05fea2277d2608748412bf9f802ea4901",
      decimals: 18,
    },
    {
      name: "POTS",
      address: "0x3fcca8648651e5b974dd6d3e50f61567779772a8",
      decimals: 18,
    },
    {
      name: "RGOLD",
      address: "0x0496ccd13c9848f9c7d1507d1dd86a360b51b596",
      decimals: 18,
    },
    {
      name: "AMF",
      address: "0xeecd101725b89b66f3e04f953ae0bb647c23fb8d",
      decimals: 18,
    },
    {
      name: "OIN",
      address: "0x658e64ffcf40d240a43d52ca9342140316ae44fa",
      decimals: 8,
    },
    {
      name: "SHL",
      address: "0xbb689057fe1c4bfc573a54c0679ae1a7a1982f26",
      decimals: 18,
    },
    {
      name: "PSR",
      address: "0xb72ba371c900aa68bb9fa473e93cfbe212030fcb",
      decimals: 18,
    },
    {
      name: "ORKL",
      address: "0x36bc1f4d4af21df024398150ad39627fb2c8a847",
      decimals: 18,
    },
    {
      name: "SHAKE",
      address: "0xba8a6ef5f15ed18e7184f44a775060a6bf91d8d0",
      decimals: 18,
    },
    {
      name: "OCC",
      address: "0x2a4dffa1fa0f86ce7f0982f88aecc199fb3476bc",
      decimals: 18,
    },
    {
      name: "QUA",
      address: "0xfd0fd32a20532ad690731c2685d77c351015ebba",
      decimals: 18,
    },
    {
      name: "POWER",
      address: "0x8ce7fc007fc5d1dea63fed829e11eeddd6406dff",
      decimals: 18,
    },
    {
      name: "IRT",
      address: "0xcbe5bca571628894a38836b0bae833ff012f71d8",
      decimals: 18,
    },
    {
      name: "GAT",
      address: "0xf315cfc8550f6fca969d397ca8b807c5033fa122",
      decimals: 18,
    },
    {
      name: "MHUNT",
      address: "0x2c717059b366714d267039af8f59125cadce6d8c",
      decimals: 18,
    },
    {
      name: "ETER",
      address: "0xa7d2e49c1777d294fc6346edc25ca0ecb3577f39",
      decimals: 18,
    },
    {
      name: "HIMO",
      address: "0x469acf8e1f29c1b5db99394582464fad45a1fc6f",
      decimals: 18,
    },
    {
      name: "TNODE",
      address: "0x7f12a37b6921ffac11fab16338b3ae67ee0c462b",
      decimals: 18,
    },
    {
      name: "DUEL",
      address: "0x297817ce1a8de777e7ddbed86c3b7f9dc9349f2c",
      decimals: 18,
    },
    {
      name: "VENT",
      address: "0x872d068c25511be88c1f5990c53eeffcdf46c9b4",
      decimals: 18,
    },
    {
      name: "CSC",
      address: "0xf0fb4a5acf1b1126a991ee189408b112028d7a63",
      decimals: 18,
    },
    {
      name: "1MT",
      address: "0x7c56d81ecb5e1d287a1e22b89b01348f07be3541",
      decimals: 18,
    },
    {
      name: "IOI",
      address: "0x959229d94c9060552daea25ac17193bca65d7884",
      decimals: 6,
    },
    {
      name: "TTK",
      address: "0x39703a67bac0e39f9244d97f4c842d15fbad9c1f",
      decimals: 18,
    },
    {
      name: "CTZN",
      address: "0xa803778ab953d3ffe4fbd20cfa0042ecefe8319d",
      decimals: 18,
    },
    {
      name: "AVN",
      address: "0xbf151f63d8d1287db5fc7a3bc104a9c38124cdeb",
      decimals: 18,
    },
    {
      name: "NORA",
      address: "0x1f39dd2bf5a27e2d4ed691dcf933077371777cb0",
      decimals: 18,
    },
    {
      name: "SOURCE",
      address: "0xea136fc555e695ba96d22e10b7e2151c4c6b2a20",
      decimals: 18,
    },
    {
      name: "XMS",
      address: "0x7859b01bbf675d67da8cd128a50d155cd881b576",
      decimals: 18,
    },
    {
      name: "MAPE",
      address: "0xca044f16afa434c0c17c0478d8a6ce4feef46504",
      decimals: 18,
    },
    {
      name: "FOMO",
      address: "0x5eef8c4320e2bf8d1e6231a31500fd7a87d02985",
      decimals: 18,
    },
    {
      name: "EPW",
      address: "0xf0e5096edf070dc9b1bc8911d63c4e448a3e14c6",
      decimals: 18,
    },
    {
      name: "BZEN",
      address: "0xdacc0417add48b63cbefb77efbe4a3801aad51ba",
      decimals: 9,
    },
    {
      name: "SPW",
      address: "0x1b23340f5221fbd2e14f36e5b3e5d833d4d215b5",
      decimals: 18,
    },
    {
      name: "4MW",
      address: "0xb70d593ef89b707ce05925e1d80fffcd9a655406",
      decimals: 18,
    },
    {
      name: "FRM",
      address: "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc",
      decimals: 18,
    },
    {
      name: "BFG",
      address: "0xbb46693ebbea1ac2070e59b4d043b47e2e095f86",
      decimals: 18,
    },
    {
      name: "COR",
      address: "0xa4b6573c9ae09d81e4d1360e6402b81f52557098",
      decimals: 18,
    },
    {
      name: "OCP",
      address: "0x3c70260eee0a2bfc4b375feb810325801f289fbd",
      decimals: 18,
    },
    {
      name: "ANML",
      address: "0x06fda0758c17416726f77cb11305eac94c074ec0",
      decimals: 18,
    },
    {
      name: "IRON",
      address: "0x7b65b489fe53fce1f6548db886c08ad73111ddd8",
      decimals: 18,
    },
    {
      name: "MILK",
      address: "0xbf37f781473f3b50e82c668352984865eac9853f",
      decimals: 18,
    },
    {
      name: "DKS",
      address: "0x121235cff4c59eec80b14c1d38b44e7de3a18287",
      decimals: 18,
    },
    {
      name: "MONES",
      address: "0xac3050c7cc3bd83fd5b53fb94c0be385b1ca6d15",
      decimals: 18,
    },
    {
      name: "CMCX",
      address: "0xb2343143f814639c9b1f42961c698247171df34a",
      decimals: 18,
    },
    {
      name: "N1",
      address: "0x5989d72a559eb0192f2d20170a43a4bd28a1b174",
      decimals: 18,
    },
    {
      name: "bPRIVA",
      address: "0xd0f4afa85a667d27837e9c07c81169869c16dd16",
      decimals: 8,
    },
    {
      name: "ALGOBLK",
      address: "0xfecca80ff6deb2b492e93df3b67f0c523cfd3a48",
      decimals: 18,
    },
    {
      name: "SWFTC",
      address: "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
      decimals: 18,
    },
    {
      name: "DUW",
      address: "0x70ddef2114b6369656e5b52456bea372901c23b1",
      decimals: 18,
    },
    {
      name: "OASIS",
      address: "0xb19289b436b2f7a92891ac391d8f52580d3087e4",
      decimals: 18,
    },
    {
      name: "ORT",
      address: "0x1d64327c74d6519afef54e58730ad6fc797f05ba",
      decimals: 18,
    },
    {
      name: "MELT",
      address: "0x7eb35225995b097c84ef10501dd6e93a49bdfd63",
      decimals: 8,
    },
    {
      name: "SOFI",
      address: "0x1a28ed8472f644e8898a169a644503b779748d6e",
      decimals: 18,
    },
    {
      name: "SRBP",
      address: "0xd0e98827d675a3231c2ea69d1f3ed12270df1435",
      decimals: 18,
    },
    {
      name: "MGOD",
      address: "0x10a12969cb08a8d88d4bfb5d1fa317d41e0fdab3",
      decimals: 18,
    },
    {
      name: "SEON",
      address: "0x7672843c25c5ba11191da8da40c0881d7e77d9e0",
      decimals: 18,
    },
    {
      name: "LSWAP",
      address: "0x3f8a14f5a3ee2f4a3ed61ccf5eea3c9535c090c8",
      decimals: 18,
    },
    {
      name: "INSUR",
      address: "0x3192ccddf1cdce4ff055ebc80f3f0231b86a7e30",
      decimals: 18,
    },
    {
      name: "CYT",
      address: "0xd9025e25bb6cf39f8c926a704039d2dd51088063",
      decimals: 18,
    },
    {
      name: "SMON",
      address: "0xab15b79880f11cffb58db25ec2bc39d28c4d80d2",
      decimals: 18,
    },
    {
      name: "NTX",
      address: "0x5c4bcc4dbaeabc7659f6435bce4e659314ebad87",
      decimals: 6,
    },
    {
      name: "CHIWA",
      address: "0xc3434677ec3048df655c39a376969ecd7b726ef6",
      decimals: 18,
    },
    {
      name: "MARSH",
      address: "0x2fa5daf6fe0708fbd63b1a7d1592577284f52256",
      decimals: 18,
    },
    {
      name: "RUN",
      address: "0xc643e83587818202e0fff5ed96d10abbc8bb48e7",
      decimals: 18,
    },
    {
      name: "MOO",
      address: "0xa29b6f4e762874846c081e20ed1142ff83faafef",
      decimals: 18,
    },
    {
      name: "EJS",
      address: "0x09f423ac3c9babbff6f94d372b16e4206e71439f",
      decimals: 18,
    },
    {
      name: "FRONT",
      address: "0x928e55dab735aa8260af3cedada18b5f70c72f1b",
      decimals: 18,
    },
    {
      name: "TRIAS",
      address: "0xa4838122c683f732289805fc3c207febd55babdd",
      decimals: 18,
    },
    {
      name: "MPD",
      address: "0xd88c6ec2d3fbd90892c6749cf83de6ad10c30b4b",
      decimals: 18,
    },
    {
      name: "PRQ",
      address: "0xd21d29b38374528675c34936bf7d5dd693d2a577",
      decimals: 18,
    },
    {
      name: "BIST",
      address: "0xbd525e51384905c6c0936a431bc7efb6c4903ea0",
      decimals: 18,
    },
    {
      name: "TDX",
      address: "0x317eb4ad9cfac6232f0046831322e895507bcbeb",
      decimals: 18,
    },
    {
      name: "SFEX",
      address: "0x5392ff4a9bd006dc272c1855af6640e17cc5ec0b",
      decimals: 18,
    },
    {
      name: "BWJ",
      address: "0x83f41c98d028842ccc8060b4ec7738df3eb9a2e6",
      decimals: 9,
    },
    {
      name: "NFTD",
      address: "0xac83271abb4ec95386f08ad2b904a46c61777cef",
      decimals: 18,
    },
    {
      name: "TITI",
      address: "0xe618ef7c64afede59a81cef16d0161c914ebab17",
      decimals: 18,
    },
    {
      name: "MILE",
      address: "0x7aed3e61e67ee1bd10f441f01bf261f6e1c72355",
      decimals: 18,
    },
    {
      name: "MRHB",
      address: "0xd10332818d6a9b4b84bf5d87dbf9d80012fdf913",
      decimals: 18,
    },
    {
      name: "CIFI",
      address: "0x4dcd4700b38ce6562730c27da557f6de819b347b",
      decimals: 18,
    },
    {
      name: "XCN",
      address: "0x7324c7c0d95cebc73eea7e85cbaac0dbdf88a05b",
      decimals: 18,
    },
    {
      name: "CROSS",
      address: "0x5b6ef1f87d5cec1e8508ddb5de7e895869e7a4a3",
      decimals: 18,
    },
    {
      name: "HUNNY",
      address: "0x565b72163f17849832a692a3c5928cc502f46d69",
      decimals: 18,
    },
    {
      name: "KIT",
      address: "0x314593fa9a2fa16432913dbccc96104541d32d11",
      decimals: 18,
    },
    {
      name: "XWG",
      address: "0x6b23c89196deb721e6fd9726e6c76e4810a464bc",
      decimals: 18,
    },
    {
      name: "PROS",
      address: "0xed8c8aa8299c10f067496bb66f8cc7fb338a3405",
      decimals: 18,
    },
    {
      name: "QDX",
      address: "0x9e3a9f1612028eee48f85ca85f8bed2f37d76848",
      decimals: 18,
    },
    {
      name: "DUSK",
      address: "0xb2bd0749dbe21f623d9baba856d3b0f0e1bfec9c",
      decimals: 18,
    },
    {
      name: "VLX",
      address: "0xe9c803f48dffe50180bd5b01dc04da939e3445fc",
      decimals: 18,
    },
    {
      name: "STI",
      address: "0x4f5f7a7dca8ba0a7983381d23dfc5eaf4be9c79a",
      decimals: 10,
    },
    {
      name: "PVU",
      address: "0x31471e0791fcdbe82fbf4c44943255e923f1b794",
      decimals: 18,
    },
    {
      name: "BLZ",
      address: "0x935a544bf5816e3a7c13db2efe3009ffda0acda2",
      decimals: 18,
    },
    {
      name: "MEXI",
      address: "0x70d8d5b3416888fd05e806195312dd2d9597d50c",
      decimals: 18,
    },
    {
      name: "ONI",
      address: "0xea89199344a492853502a7a699cc4230854451b8",
      decimals: 18,
    },
    {
      name: "NUM",
      address: "0xeceb87cf00dcbf2d4e2880223743ff087a995ad9",
      decimals: 18,
    },
    {
      name: "KUNCI",
      address: "0x6cf271270662be1c4fc1b7bb7d7d7fc60cc19125",
      decimals: 6,
    },
    {
      name: "DEXE",
      address: "0x039cb485212f996a9dbb85a9a75d898f94d38da6",
      decimals: 18,
    },
    {
      name: "O5O",
      address: "0xd79ac202089bd317c8b8aa3621caf5c1cf6c6ba6",
      decimals: 18,
    },
    {
      name: "CVZ",
      address: "0x6fbb278c4eaa5218495a1858447b26d905ac0010",
      decimals: 18,
    },
    {
      name: "RAMP",
      address: "0x8519ea49c997f50ceffa444d240fb655e89248aa",
      decimals: 18,
    },
    {
      name: "GAME",
      address: "0x66109633715d2110dda791e64a7b2afadb517abb",
      decimals: 5,
    },
    {
      name: "VITE",
      address: "0x2794dad4077602ed25a88d03781528d1637898b4",
      decimals: 18,
    },
    {
      name: "PULSEDOGE",
      address: "0xd4d55b811d9ede2adce61a98d67d7f91bffce495",
      decimals: 18,
    },
    {
      name: "LFC",
      address: "0xd9474595edb03e35c5843335f90eb18671921246",
      decimals: 9,
    },
    {
      name: "FADO",
      address: "0x827d24bb2aad813fe6f49b798f44cce4c48bd478",
      decimals: 18,
    },
    {
      name: "LUS",
      address: "0xde301d6a2569aefcfe271b9d98f318baee1d30a4",
      decimals: 18,
    },
    {
      name: "DAL",
      address: "0x53e4b7aa6caccb9576548be3259e62de4ddd4417",
      decimals: 18,
    },
    {
      name: "PKR",
      address: "0xc49dde62b4a0810074721faca54aab52369f486a",
      decimals: 18,
    },
    {
      name: "CRACE",
      address: "0xfbb4f2f342c6daab63ab85b0226716c4d1e26f36",
      decimals: 18,
    },
    {
      name: "BBANK",
      address: "0xf4b5470523ccd314c6b9da041076e7d79e0df267",
      decimals: 18,
    },
    {
      name: "XY",
      address: "0x666666661f9b6d8c581602aaa2f76cbead06c401",
      decimals: 18,
    },
    {
      name: "BRKL",
      address: "0x66cafcf6c32315623c7ffd3f2ff690aa36ebed38",
      decimals: 18,
    },
    {
      name: "YFO",
      address: "0xac0c8da4a4748d8d821a0973d00b157aa78c473d",
      decimals: 18,
    },
    {
      name: "PLT",
      address: "0x631c2f0edabac799f07550aee4ff0bf7fd35212b",
      decimals: 18,
    },
    {
      name: "HEROES",
      address: "0x261510dd6257494eea1dda7618dbe8a7b87870dd",
      decimals: 12,
    },
    {
      name: "DARA",
      address: "0x0255af6c9f86f6b0543357bacefa262a2664f80f",
      decimals: 18,
    },
    {
      name: "SKILL",
      address: "0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab",
      decimals: 18,
    },
    {
      name: "MCRN",
      address: "0xacb2d47827c9813ae26de80965845d80935afd0b",
      decimals: 18,
    },
    {
      name: "8PAY",
      address: "0xfeea0bdd3d07eb6fe305938878c0cadbfa169042",
      decimals: 18,
    },
    {
      name: "GAMI",
      address: "0x1236a887ef31b4d32e1f0a2b5e4531f52cec7e75",
      decimals: 6,
    },
    {
      name: "SNACK",
      address: "0x86accc2580da5bd522a0eec7c881a0d4f33de657",
      decimals: 18,
    },
    {
      name: "KSW",
      address: "0x270178366a592ba598c2e9d2971da65f7baa7c86",
      decimals: 18,
    },
    {
      name: "RIPH",
      address: "0x10964c2ffdea1e99b5e26d102516d9b03368915f",
      decimals: 18,
    },
    {
      name: "DRACE",
      address: "0xa6c897caaca3db7fd6e2d2ce1a00744f40ab87bb",
      decimals: 18,
    },
    {
      name: "VICS",
      address: "0x9bcab88763c33a95e73bc6dcf80fcf27a77090b2",
      decimals: 18,
    },
    {
      name: "BR",
      address: "0x7be9e596896b64c88e39b7e88f8dcedda79845c0",
      decimals: 6,
    },
    {
      name: "FBX",
      address: "0xfd57ac98aa8e445c99bc2c41b23997573fadf795",
      decimals: 18,
    },
    {
      name: "FBL",
      address: "0x393c44a497706dde15996bb0c7bdf691a79de38a",
      decimals: 18,
    },
    {
      name: "STZ",
      address: "0x7fe378c5e0b5c32af2ecc8829bedf02245a0e4ef",
      decimals: 18,
    },
    {
      name: "SATOZ",
      address: "0xf4341fa52669cea0c1836095529a7e9b04b8b88d",
      decimals: 8,
    },
    {
      name: "MPC",
      address: "0xd6bb010019c9d3ea177e6d2e9af7938c6e53da55",
      decimals: 18,
    },
    {
      name: "UNO",
      address: "0x474021845c4643113458ea4414bdb7fb74a01a77",
      decimals: 18,
    },
    {
      name: "CTRAIN",
      address: "0x0367035f7114c72141589058d09f11d0e76988e9",
      decimals: 18,
    },
    {
      name: "DOM",
      address: "0x8c282ea9eacd1b95d44a3a18dcdd1d0472868998",
      decimals: 8,
    },
    {
      name: "LEON",
      address: "0x27e873bee690c8e161813de3566e9e18a64b0381",
      decimals: 18,
    },
    {
      name: "ANTEX",
      address: "0xca1acab14e85f30996ac83c64ff93ded7586977c",
      decimals: 8,
    },
    {
      name: "ORYX",
      address: "0x10bb58010cb58e7249099ef2efdffe342928b639",
      decimals: 18,
    },
    {
      name: "FIU",
      address: "0xef7d50069406a2f5a53806f7250a6c0f17ad9dcd",
      decimals: 18,
    },
    {
      name: "BCF",
      address: "0xe78ad8967e523a29d4d3a8e76422aa7ab2b6a47e",
      decimals: 18,
    },
    {
      name: "LIQ",
      address: "0xc7981767f644c7f8e483dabdc413e8a371b83079",
      decimals: 18,
    },
    {
      name: "HECTA",
      address: "0x343915085b919fbd4414f7046f903d194c6f60ee",
      decimals: 9,
    },
    {
      name: "SATA",
      address: "0x6b1c8765c7eff0b60706b0ae489eb9bb9667465a",
      decimals: 18,
    },
    {
      name: "CEEK",
      address: "0xe0f94ac5462997d2bc57287ac3a3ae4c31345d66",
      decimals: 18,
    },
    {
      name: "MITA",
      address: "0xc8f456ae5797bfb754080ab7338fd2836169d239",
      decimals: 8,
    },
    {
      name: "WATCH",
      address: "0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0",
      decimals: 18,
    },
    {
      name: "CWS",
      address: "0xbcf39f0edda668c58371e519af37ca705f2bfcbd",
      decimals: 18,
    },
    {
      name: "FARM",
      address: "0x4b5c23cac08a567ecf0c1ffca8372a45a5d33743",
      decimals: 18,
    },
    {
      name: "MONS",
      address: "0xe4c797d43631f4d660ec67b5cb0b78ef5c902532",
      decimals: 18,
    },
    {
      name: "MTB",
      address: "0x2bad52989afc714c653da8e5c47bf794a8f7b11d",
      decimals: 18,
    },
    {
      name: "PFY",
      address: "0x69083b64988933e8b4783e8302b9bbf90163280e",
      decimals: 9,
    },
    {
      name: "DOMI",
      address: "0xbbca42c60b5290f2c48871a596492f93ff0ddc82",
      decimals: 18,
    },
    {
      name: "TTX",
      address: "0x591127253e40d4f63bf29ccf3d81fd062a149c8c",
      decimals: 18,
    },
    {
      name: "TOWER",
      address: "0xe7c9c6bc87b86f9e5b57072f907ee6460b593924",
      decimals: 18,
    },
    {
      name: "DLTA",
      address: "0x3a06212763caf64bf101daa4b0cebb0cd393fa1a",
      decimals: 18,
    },
    {
      name: "HAKA",
      address: "0xd85ad783cc94bd04196a13dc042a3054a9b52210",
      decimals: 18,
    },
    {
      name: "DRIV",
      address: "0x461dab902f38210b42b7d8b4bfc71296e0629006",
      decimals: 18,
    },
    {
      name: "SRK",
      address: "0xc3440c10c4f36f354eb591b19fafb4906d449b75",
      decimals: 18,
    },
    {
      name: "SCRL",
      address: "0x52c1751c89fc913ed274d72e8d56dce4ee44a5cf",
      decimals: 18,
    },
    {
      name: "CLIQ",
      address: "0xe795347731bc547f4e4643f7945738ce2bc18529",
      decimals: 18,
    },
    {
      name: "ECIO",
      address: "0x327a3e880bf2674ee40b6f872be2050ed406b021",
      decimals: 18,
    },
    {
      name: "XCV",
      address: "0x4be63a9b26ee89b9a3a13fd0aa1d0b2427c135f8",
      decimals: 18,
    },
    {
      name: "DRF",
      address: "0x9400aa8eb5126d20cde45c7822836bfb70f19878",
      decimals: 18,
    },
    {
      name: "CORGI",
      address: "0x450dcf93160a30be156a4600802c91bf64dffd2e",
      decimals: 18,
    },
    {
      name: "TARAL",
      address: "0x0fc812b96de7e910878039121938f6d5471b73dc",
      decimals: 18,
    },
    {
      name: "INVEST",
      address: "0x853a8ab1c365ea54719eb13a54d6b22f1fbe7feb",
      decimals: 18,
    },
    {
      name: "MATH",
      address: "0xf218184af829cf2b0019f8e6f0b2423498a36983",
      decimals: 18,
    },
    {
      name: "PALLA",
      address: "0x8f49733210700d38098d7375c221c7d02f700cc8",
      decimals: 18,
    },
    {
      name: "STARS",
      address: "0xbd83010eb60f12112908774998f65761cf9f6f9a",
      decimals: 18,
    },
    {
      name: "BSCX",
      address: "0x5ac52ee5b2a633895292ff6d8a89bb9190451587",
      decimals: 18,
    },
    {
      name: "GINZA",
      address: "0x32d7da6a7cf25ed1b86e1b0ee9a62b0252d46b16",
      decimals: 18,
    },
    {
      name: "LBL",
      address: "0x77edfae59a7948d66e9911a30cc787d2172343d4",
      decimals: 18,
    },
    {
      name: "CDT",
      address: "0x0cbd6fadcf8096cc9a43d90b45f65826102e3ece",
      decimals: 18,
    },
    {
      name: "PBX",
      address: "0x84febb6e199bf61a7e0277a08edfbbfd6e39b735",
      decimals: 18,
    },
    {
      name: "XCT",
      address: "0xe8670901e86818745b28c8b30b17986958fce8cc",
      decimals: 6,
    },
    {
      name: "ISP",
      address: "0xd2e7b964770fcf51df088a5f0bb2d33a3c60cccf",
      decimals: 18,
    },
    {
      name: "MGP",
      address: "0xa677bc9bdb10329e488a4d8387ed7a08b2fc9005",
      decimals: 18,
    },
    {
      name: "DCS",
      address: "0xeecf92bf5e8f96e174510e9cd2b2a857aa039460",
      decimals: 18,
    },
    {
      name: "BCOIN",
      address: "0x00e1656e45f18ec6747f5a8496fd39b50b38396d",
      decimals: 18,
    },
    {
      name: "WE",
      address: "0x0dd3a140346a94d403ac62385daaf5a86b50e752",
      decimals: 8,
    },
    {
      name: "LOVELY",
      address: "0x9e24415d1e549ebc626a13a482bb117a2b43e9cf",
      decimals: 8,
    },
    {
      name: "HOD",
      address: "0x19a4866a85c652eb4a2ed44c42e4cb2863a62d51",
      decimals: 18,
    },
    {
      name: "WARS",
      address: "0x50e756a22ff5cee3559d18b9d9576bc38f09fa7c",
      decimals: 18,
    },
    {
      name: "LACE",
      address: "0xa3499dd7dbbbd93cb0f8303f8a8ace8d02508e73",
      decimals: 18,
    },
    {
      name: "EBA",
      address: "0x3944ac66b9b9b40a6474022d6962b6caa001b5e3",
      decimals: 18,
    },
    {
      name: "LOWB",
      address: "0x843d4a358471547f51534e3e51fae91cb4dc3f28",
      decimals: 18,
    },
    {
      name: "ONUS",
      address: "0x1851ccd370c444ff494d7505e6103959bce9f9d9",
      decimals: 18,
    },
    {
      name: "KT",
      address: "0x52da44b5e584f730005dac8d2d2acbdee44d4ba3",
      decimals: 18,
    },
    {
      name: "$STARLY",
      address: "0xb0a480e2fa5af51c733a0af9fcb4de62bc48c38b",
      decimals: 8,
    },
    {
      name: "CHARGE",
      address: "0x1c6bc8e962427deb4106ae06a7fa2d715687395c",
      decimals: 18,
    },
    {
      name: "POG",
      address: "0xfcb0f2d2f83a32a847d8abb183b724c214cd7dd8",
      decimals: 18,
    },
    {
      name: "DFAI",
      address: "0xe1a0ce8b94c6a5e4791401086763d7bd0a6c18f5",
      decimals: 18,
    },
    {
      name: "UFT",
      address: "0x2645d5f59d952ef2317c8e0aaa5a61c392ccd44d",
      decimals: 18,
    },
    {
      name: "ATPAD",
      address: "0x48ee0cc862143772feabaf9b4757c36735d1052e",
      decimals: 18,
    },
    {
      name: "CCAR",
      address: "0x50332bdca94673f33401776365b66cc4e81ac81d",
      decimals: 18,
    },
    {
      name: "FINIX",
      address: "0x0f02b1f5af54e04fb6dd6550f009ac2429c4e30d",
      decimals: 18,
    },
    {
      name: "CSS",
      address: "0x3bc5798416c1122bcfd7cb0e055d50061f23850d",
      decimals: 18,
    },
    {
      name: "ARZ",
      address: "0xc10375092343fa84b80d4bdca94488fe3c52101f",
      decimals: 18,
    },
    {
      name: "MFO",
      address: "0xb46049c79d77ff1d555a67835fba6978536581af",
      decimals: 18,
    },
    {
      name: "ZEC",
      address: "0x1ba42e5193dfa8b03d15dd1b86a3113bbbef8eeb",
      decimals: 18,
    },
    {
      name: "ITAM",
      address: "0x04c747b40be4d535fc83d09939fb0f626f32800b",
      decimals: 18,
    },
    {
      name: "CLIST",
      address: "0x7a685c6dbd6c15e6d600f7c713f9252ebb3c472a",
      decimals: 18,
    },
    {
      name: "LUCK",
      address: "0x99f6decbe2346d2ac4f84dd0fd0e883732b46047",
      decimals: 18,
    },
    {
      name: "CHD",
      address: "0xb4cd493f14edaae27fdaab87072f3d55d9289a18",
      decimals: 18,
    },
    {
      name: "KDG",
      address: "0x87a2d9a9a6b2d61b2a57798f1b4b2ddd19458fb6",
      decimals: 18,
    },
    {
      name: "PGALA",
      address: "0x7ddee176f665cd201f93eede625770e2fd911990",
      decimals: 18,
    },
    {
      name: "TOK",
      address: "0xc22b624e5f3fb0ac410d8f2b6d7c77ee60564509",
      decimals: 18,
    },
    {
      name: "MEX",
      address: "0x5c1a012ced995a74bc0b6eb05b571d7f28aa6ce7",
      decimals: 18,
    },
    {
      name: "BHAT",
      address: "0x75ad31aa97ad844e2332d7301f19f32c86845d36",
      decimals: 18,
    },
    {
      name: "RIDE",
      address: "0xdf09d42cfc69e01e1aebf8b57e65974d562fb9ec",
      decimals: 18,
    },
    {
      name: "ITHEUM",
      address: "0x56df7310a12a3270bc75132b467e2eec6edee6ce",
      decimals: 18,
    },
    {
      name: "ZPAY",
      address: "0x293161cec201b4279c487ec07fe22eb29060e224",
      decimals: 18,
    },
    {
      name: "NEST",
      address: "0x98f8669f6481ebb341b522fcd3663f79a3d1a6a7",
      decimals: 18,
    },
    {
      name: "CAF",
      address: "0x5662ac531a2737c3db8901e982b43327a2fde2ae",
      decimals: 18,
    },
    {
      name: "WTO",
      address: "0xced59c3249f20ca36fba764bfdd9d94f471b3154",
      decimals: 18,
    },
    {
      name: "AMA",
      address: "0xe9cd2668fb580c96b035b6d081e5753f23fe7f46",
      decimals: 18,
    },
    {
      name: "WMX",
      address: "0xa75d9ca2a0a1d547409d82e1b06618ec284a2ced",
      decimals: 18,
    },
    {
      name: "LCT",
      address: "0x5c65badf7f97345b7b92776b22255c973234efe7",
      decimals: 18,
    },
    {
      name: "HOOP",
      address: "0xf19cfb40b3774df6eed83169ad5ab0aaf6865f25",
      decimals: 18,
    },
    {
      name: "GDE",
      address: "0x8c2b824b9ed7bc1ee6b83039d341b4f3dd14df97",
      decimals: 18,
    },
    {
      name: "CO",
      address: "0x936b6659ad0c1b244ba8efe639092acae30dc8d6",
      decimals: 6,
    },
    {
      name: "BNBP",
      address: "0x4d9927a8dc4432b93445da94e4084d292438931f",
      decimals: 18,
    },
    {
      name: "SGS",
      address: "0xa6cba90f6246aad9b4f3dcd29918821921a5c1ff",
      decimals: 18,
    },
    {
      name: "SRG",
      address: "0x722f41f6511ff7cda73a1cb0a9ea2f731738c4a0",
      decimals: 18,
    },
    {
      name: "UCON",
      address: "0x96f75b57ba0cf514f932d24e076b6cb52e8fe583",
      decimals: 18,
    },
    {
      name: "KSN",
      address: "0xc8a11f433512c16ed895245f34bcc2ca44eb06bd",
      decimals: 18,
    },
    {
      name: "AVA",
      address: "0x83b79f74f225e8f9a29fc67cb1678e7909d7d73d",
      decimals: 18,
    },
    {
      name: "VIDT",
      address: "0x9c4a515cd72d27a4710571aca94858a53d9278d5",
      decimals: 18,
    },
    {
      name: "DDF",
      address: "0xbae9dc9231acd7f06c64d298f347338313352cbd",
      decimals: 18,
    },
    {
      name: "OKG",
      address: "0x7758a52c1bb823d02878b67ad87b6ba37a0cdbf5",
      decimals: 18,
    },
    {
      name: "FAB",
      address: "0x0ad248f7941fd41f28a4cb2b8b34b3baf0246d96",
      decimals: 8,
    },
    {
      name: "WSI",
      address: "0x837a130aed114300bab4f9f1f4f500682f7efd48",
      decimals: 18,
    },
    {
      name: "STKK",
      address: "0x41fe2441c9eeab2158e29185d128ebab82aa8198",
      decimals: 4,
    },
    {
      name: "GLF",
      address: "0xc8b44fc9e6b8fd806111a04b1f208a0087baf9b1",
      decimals: 18,
    },
    {
      name: "OVR",
      address: "0x7e35d0e9180bf3a1fc47b0d110be7a21a10b41fe",
      decimals: 18,
    },
    {
      name: "MMG",
      address: "0x1c376275791069349fef8bd9f431382d384657a3",
      decimals: 6,
    },
    {
      name: "TPT",
      address: "0xeca41281c24451168a37211f0bc2b8645af45092",
      decimals: 4,
    },
    {
      name: "PRIMAL",
      address: "0xcb5327ed4649548e0d73e70b633cdfd99af6da87",
      decimals: 18,
    },
    {
      name: "BTP",
      address: "0x40f75ed09c7bc89bf596ce0ff6fb2ff8d02ac019",
      decimals: 18,
    },
    {
      name: "ETX",
      address: "0x7d5b6f2e31b1e50e6a45130f4adbb8839fadeb2e",
      decimals: 18,
    },
    {
      name: "TOKO",
      address: "0x45f7967926e95fd161e56ed66b663c9114c5226f",
      decimals: 18,
    },
    {
      name: "STEMX",
      address: "0x26734add0650719ea29087fe5cc0aab81b4f237d",
      decimals: 18,
    },
    {
      name: "IGUP",
      address: "0x522d0f9f3eff479a5b256bb1c1108f47b8e1a153",
      decimals: 18,
    },
    {
      name: "NINO",
      address: "0x6cad12b3618a3c7ef1feb6c91fdc3251f58c2a90",
      decimals: 18,
    },
    {
      name: "DSCPL",
      address: "0xdece0f6864c1511369ae2c30b90db9f5fe92832c",
      decimals: 18,
    },
    {
      name: "METO",
      address: "0xa78775bba7a542f291e5ef7f13c6204e704a90ba",
      decimals: 18,
    },
    {
      name: "SATT",
      address: "0x448bee2d93be708b54ee6353a7cc35c4933f1156",
      decimals: 18,
    },
    {
      name: "XPX",
      address: "0x6f3aaf802f57d045efdd2ac9c06d8879305542af",
      decimals: 6,
    },
    {
      name: "OKSE",
      address: "0x606fb7969fc1b5cad58e64b12cf827fb65ee4875",
      decimals: 18,
    },
    {
      name: "COGI",
      address: "0x6cb755c4b82e11e727c05f697c790fdbc4253957",
      decimals: 18,
    },
    {
      name: "NUSA",
      address: "0xe11f1d5eee6be945bee3fa20dbf46febbc9f4a19",
      decimals: 18,
    },
    {
      name: "CZATS",
      address: "0x56747ed2fca81b25fae112c7a9d4465e947aac56",
      decimals: 18,
    },
    {
      name: "ALCAZAR",
      address: "0x353d0d1b4feb416faaabd5b314d99ef148d56dff",
      decimals: 18,
    },
    {
      name: "CTT",
      address: "0x20b65a45d58cedf6c5b62fb2ba019b24a490ad4e",
      decimals: 18,
    },
    {
      name: "SHIDO",
      address: "0x733af324146dcfe743515d8d77dc25140a07f9e0",
      decimals: 9,
    },
    {
      name: "LVL",
      address: "0xb64e280e9d1b5dbec4accedb2257a87b400db149",
      decimals: 18,
    },
    {
      name: "MNU",
      address: "0x256be284fea694f1bb11f76d556a28ecb496eee9",
      decimals: 18,
    },
    {
      name: "JMZ",
      address: "0x9a442c0f0c6618388f1fa0e2565d365aef520e7a",
      decimals: 18,
    },
    {
      name: "RCM",
      address: "0x7102f5bb8cb3c6e7d085626e7a1347aafdf001f6",
      decimals: 18,
    },
    {
      name: "LIUX",
      address: "0x94ade5a1dd2349e604aeb2c0b2cfac486c7e19ae",
      decimals: 18,
    },
    {
      name: "EZY",
      address: "0xb452bc9cead0b08c4ef99da0feb8e10ef6bb86bb",
      decimals: 18,
    },
    {
      name: "AREA",
      address: "0x3cb26f04223e948b8d810a7bd170620afbd42e67",
      decimals: 18,
    },
    {
      name: "GWINK",
      address: "0x3cc20cf966b25be8538a8bc70e53c720c7133f35",
      decimals: 18,
    },
    {
      name: "BTAF",
      address: "0xcae3d82d63e2b0094bc959752993d3d3743b5d08",
      decimals: 18,
    },
    {
      name: "FUTURE-AI",
      address: "0x0ff534801e98a4976246d1f418e441783fc9aa15",
      decimals: 18,
    },
    {
      name: "GINTO",
      address: "0xdae4722ecdc7a01fe417d76f09b0d18f558ce412",
      decimals: 18,
    },
    {
      name: "MUSICAI",
      address: "0x0ec674fabb4ea1935514a7be760f7e13aa466a39",
      decimals: 18,
    },
    {
      name: "NEURALAI",
      address: "0xb9c255c115636d8cbe107fc953364b243cacdbce",
      decimals: 18,
    },
    {
      name: "GYM AI",
      address: "0xe65725fedb66586cbe32615e097a01c0aa43ae89",
      decimals: 18,
    },
    {
      name: "MPI",
      address: "0x82555cc48a532fa4e2194ab883eb6d465149f80e",
      decimals: 18,
    },
    {
      name: "PSTAKE",
      address: "0x4c882ec256823ee773b25b414d36f92ef58a7c0c",
      decimals: 18,
    },
    {
      name: "IGU",
      address: "0x201bc9f242f74c47bbd898a5dc99cdcd81a21943",
      decimals: 18,
    },
    {
      name: "FIRO",
      address: "0xd5d0322b6bab6a762c79f8c81a0b674778e13aed",
      decimals: 8,
    },
    {
      name: "STAI",
      address: "0xebc148d40313be9c9f214d3beb9f2ddebec0ec52",
      decimals: 18,
    },
    {
      name: "WSAFU",
      address: "0x5c0d3c165dc46cfd5ec80bbb1bf7cb8631f9d6c7",
      decimals: 18,
    },
    {
      name: "MFB",
      address: "0xa528d8b9cd90b06d373373c37f8f188e44cad3be",
      decimals: 18,
    },
    {
      name: "FINANCEAI",
      address: "0x1603441703472aff8cdf1871961176cc494588dc",
      decimals: 18,
    },
    {
      name: "AVAN",
      address: "0xf84c55e79858b448c3015c3a1a55efed9edf69c7",
      decimals: 18,
    },
    {
      name: "TLOS",
      address: "0xb6c53431608e626ac81a9776ac3e999c5556717c",
      decimals: 18,
    },
    {
      name: "TRYV",
      address: "0xef1379d571cd110828eed91dfca75466a8e95862",
      decimals: 18,
    },
    {
      name: "KAKI",
      address: "0x42414624c55a9cba80789f47c8f9828a7974e40f",
      decimals: 18,
    },
    {
      name: "CBYTE",
      address: "0xfdfc1ab8bf1e2d6920caf405aa488987a077fc4b",
      decimals: 18,
    },
    {
      name: "SPORTS-AI",
      address: "0xe1bb77c8e012c1514373a40cfbb8645293075125",
      decimals: 18,
    },
    {
      name: "PANDAI",
      address: "0x550d7984b7adfff88815e5528e12e322df6d3b9b",
      decimals: 6,
    },
    {
      name: "HOPPYINU",
      address: "0x2e7f28f0d27ffa238fdf7517a3bbe239b8189741",
      decimals: 18,
    },
    {
      name: "MSHD",
      address: "0x06ce168ff4ca760768f42c440d4266ba705e2f21",
      decimals: 9,
    },
    {
      name: "CRIMSON",
      address: "0x2ee8ca014fdab5f5d0436c866937d32ef97373b0",
      decimals: 18,
    },
    {
      name: "CATSHIRA",
      address: "0x18d9d0d6e42bb52a13236f4fa33d9d2485d9015a",
      decimals: 18,
    },
    {
      name: "CSIX",
      address: "0x04756126f044634c9a0f0e985e60c88a51acc206",
      decimals: 18,
    },
    {
      name: "GPT",
      address: "0x153c0c947177e631e3dfc594ba28750d3a921fb5",
      decimals: 18,
    },
    {
      name: "RJV",
      address: "0x1135883a1bc6776bf90c97845adc491922106dfb",
      decimals: 6,
    },
    {
      name: "RAB",
      address: "0x24ef78c7092d255ed14a0281ac1800c359af3afe",
      decimals: 18,
    },
    {
      name: "FDAO",
      address: "0x14e0980675ada43085c6c69c3cd207a03e43549b",
      decimals: 18,
    },
    {
      name: "EDX",
      address: "0xda2e636a6b6d3eaacb3a5fb00f86ead84e0d908f",
      decimals: 18,
    },
    {
      name: "WOR",
      address: "0xd6edbb510af7901b2c049ce778b65a740c4aeb7f",
      decimals: 18,
    },
    {
      name: "PTOOLS",
      address: "0x92400f8b8c4658153c10c98500b63ac9f87571c2",
      decimals: 18,
    },
    {
      name: "RAKE",
      address: "0x4c8a3a1025ab87ef184cb7f0691a5a371fe783a6",
      decimals: 6,
    },
    {
      name: "TFLOW",
      address: "0x00ee89f7f21b60b72dd5d4070a4310f796c38c32",
      decimals: 18,
    },
    {
      name: "HUMAI",
      address: "0xf6b52a29671e74e6b3a7592ef79039abb64e2885",
      decimals: 18,
    },
    {
      name: "BCM",
      address: "0xef82f7ba2481a40613921b613143f62f49ed83b8",
      decimals: 18,
    },
    {
      name: "MEDAI",
      address: "0x6a5ef8ccc77dcd5d14f8c6669221ac71b74398aa",
      decimals: 18,
    },
    {
      name: "DIPA",
      address: "0x7a45d24affe81e98a03ee68d10cb2dc1f857676b",
      decimals: 18,
    },
  ],
  heco: [
    {
      name: "CHNG",
      address: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf",
      decimals: 18,
    },
    {
      name: "FSN",
      address: "0xa790b07796abed3cdaf81701b4535014bf5e1a65",
      decimals: 18,
    },
    {
      name: "USDT",
      address: "0xa71edc38d189767582c38a3145b5873052c3e47a",
      decimals: 18,
    },
    {
      name: "ETH",
      address: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x66a79d23e58475d2738179ca52cd0b41d73f0bea",
      decimals: 18,
    },
    { name: "HT", address: nullAddress, decimals: 18 },
    {
      name: "UNI",
      address: "0x22c54ce8321a4015740ee1109d9cbc25815c46e6",
      decimals: 18,
    },
    {
      name: "MDX",
      address: "0x25d2e80cb6b86881fd7e07dd263fb79f4abe033c",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x9e004545c59d359f6b7bfb06a26390b087717b42",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0x202b4936fe1a82a4965220860ae46d7d3939bb25",
      decimals: 18,
    },
    {
      name: "HOT",
      address: "0x26db8742da87d2e74911bfa4a349d4f6f7fc6037",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0x777850281719d5a96c29812ab72f822e0e09f3da",
      decimals: 18,
    },
    {
      name: "LRC",
      address: "0xbf22f76657601a522cf9ac832718a3404302d6bc",
      decimals: 18,
    },
    {
      name: "INCH",
      address: "0xd192f8e3224ff0f48b08db4791576b6878b426a0",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x52e00b2da5bd7940ffe26b609a42f957f31118d5",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0xce0a5ca134fb59402b723412994b30e02f083842",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0xb4f019beac758abbee2f906033aaa2f0f6dacb35",
      decimals: 18,
    },
    {
      name: "MANA",
      address: "0x09006b66d89e5213fc173403aacba30620a91f4e",
      decimals: 18,
    },
    {
      name: "GRT",
      address: "0xfadd0c7762c59cebc5248019dbac652319cebdbd",
      decimals: 18,
    },
    {
      name: "BAT",
      address: "0xb04ee982e6329febe4c70a53d1725469a1f6963a",
      decimals: 18,
    },
    {
      name: "ZRX",
      address: "0x0212da773704cbc4f476ba827406363c87e8d3bd",
      decimals: 18,
    },
    {
      name: "UMA",
      address: "0xe2563f0a1787ac8a9fa67f3124a3d0ae92d574d2",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0x6bce534a02f8347f747124082ef3e35dd696748d",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0x045de15ca76e76426e8fc7cba8392a3138078d0f",
      decimals: 18,
    },
    {
      name: "KNC",
      address: "0x361eb51dfd6fccfe7782c7e7fd93e90d37a68cb9",
      decimals: 18,
    },
    {
      name: "FILDA",
      address: "0xe36ffd17b2661eb57144ceaef942d95295e637f0",
      decimals: 18,
    },
    {
      name: "BAGS",
      address: "0x6868d406a125eb30886a6dd6b651d81677d1f22c",
      decimals: 18,
    },
    {
      name: "SHIB",
      address: "0xdd86dd2dc0aca2a8f41a680fc1f88ec1b7fc9b09",
      decimals: 18,
    },
    {
      name: "ZNC",
      address: "0x5bd53a4104b5bc07feff16225e9b676d8f8947bb",
      decimals: 9,
    },
    {
      name: "MOMAT",
      address: "0x162edc778dfd179a1e54e4bcaaf650dc293bb2c9",
      decimals: 18,
    },
    {
      name: "KSC",
      address: "0x2921bc03cfdf650f078092b1a19f3046b66bfd04",
      decimals: 18,
    },
    {
      name: "LC",
      address: "0x664cb7a0a0a86779f1a8748cc02f9872acad3e0a",
      decimals: 18,
    },
    {
      name: "SOL",
      address: "0x2c73b1e8e02d832033ab1f7d26090331c88c1a7a",
      decimals: 8,
    },
    {
      name: "MATIC",
      address: "0xdb11743fe8b129b49b11236e8a715004bdabe7e5",
      decimals: 18,
    },
    {
      name: "FIL",
      address: "0xae3a768f9ab104c69a7cd6041fe16ffa235d1810",
      decimals: 18,
    },
    {
      name: "DOT",
      address: "0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
      decimals: 6,
    },
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    {
      name: "O3",
      address: "0xee9801669c6138e84bd50deb500827b776777d28",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0xfa18a680bc3a1c9db12822c638808a7f11d8d2cc",
      decimals: 18,
    },
    {
      name: "BIFI",
      address: "0x765277eebeca2e31912c9946eae1021199b39c61",
      decimals: 18,
    },
    {
      name: "RNFT",
      address: "0x2f6fb65bce25d1538dc53a3d17a5ba0efc8a10de",
      decimals: 18,
    },
    {
      name: "LHB",
      address: "0x8f67854497218043e1f72908ffe38d0ed7f24721",
      decimals: 18,
    },
    {
      name: "DEP",
      address: "0x48c859531254f25e57d1c1a8e030ef0b1c895c27",
      decimals: 18,
    },
    {
      name: "BXH",
      address: "0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0",
      decimals: 18,
    },
    {
      name: "CAN",
      address: "0x1e6395e6b059fc97a4dda925b6c5ebf19e05c69f",
      decimals: 18,
    },
    {
      name: "SFC",
      address: "0x295bad2edf1ce14ff27b748a37acac8e6b6f95c6",
      decimals: 6,
    },
    {
      name: "ELA",
      address: "0x102a56e6c2452bcee99df8f61167e3e0f0749dbe",
      decimals: 8,
    },
    {
      name: "NT",
      address: "0x8b70512b5248e7c1f0f6996e2fde2e952708c4c9",
      decimals: 18,
    },
    {
      name: "CRO",
      address: "0xf7e1e39e239c5a920849f435f66097d2e412859e",
      decimals: 8,
    },
    {
      name: "LOVE",
      address: "0x6452961d566449fa5364a182b802a32e17f5cc5f",
      decimals: 0,
    },
    {
      name: "PEOPLE",
      address: "0xe4610f0194a82f23c82b07415330fc4ee9282b5b",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "IMX",
      address: "0x813824db5a0ae172e4691b7a35f8f4c3e79c051c",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x3befb2308bce92da97264077faf37dcd6c8a75e6",
      decimals: 18,
    },
    {
      name: "LTC",
      address: "0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4",
      decimals: 18,
    },
    {
      name: "DOGE",
      address: "0x40280e26a572745b1152a54d1d44f365daa51618",
      decimals: 8,
    },
    {
      name: "VET",
      address: "0x8650c13eeeb89610722b97696ed822ec33b93378",
      decimals: 8,
    },
    {
      name: "ADA",
      address: "0x843af718ef25708765a8e0942f89edeae1d88df0",
      decimals: 6,
    },
    {
      name: "XRP",
      address: "0xa2f3c2446a3e20049708838a779ff8782ce6645a",
      decimals: 6,
    },
    {
      name: "ETC",
      address: "0x1d5e22d77df5bf3edd220b7b3637a7a917756468",
      decimals: 8,
    },
    {
      name: "BCH",
      address: "0xef3cebd77e0c52cb6f60875d9306397b5caca375",
      decimals: 18,
    },
    {
      name: "SALE",
      address: "0x2665375a48a76bb49f6b375844eb88390840c0b8",
      decimals: 18,
    },
    {
      name: "EOS",
      address: "0xae3a94a6dc7fce46b40d63bbf355a3ab2aa2a588",
      decimals: 4,
    },
    {
      name: "OOE",
      address: "0x40817e1ab07fc872b7af6a959c4b7a8febf6c4ab",
      decimals: 18,
    },
    {
      name: "XTM",
      address: "0xcd1faff6e578fa5cac469d2418c95671ba1a62fe",
      decimals: 18,
    },
    {
      name: "XEND",
      address: "0xa649325aa7c5093d12d6f98eb4378deae68ce23f",
      decimals: 18,
    },
    {
      name: "DERI",
      address: "0x2bda3e331cf735d9420e41567ab843441980c4b8",
      decimals: 18,
    },
    {
      name: "ABR",
      address: "0x2d7e64def6c3311a75c2f6eb45e835cd58e52cde",
      decimals: 18,
    },
    {
      name: "HAPI",
      address: "0xad8286fc5d133f177e7711daabd3af5040247e07",
      decimals: 18,
    },
    {
      name: "SWFTC",
      address: "0x329dda64cbc4dfd5fa5072b447b3941ce054ebb3",
      decimals: 8,
    },
    {
      name: "SOVI",
      address: "0x49e16563a2ba84e560780946f0fb73a8b32c841e",
      decimals: 18,
    },
  ],
  okexchain: [
    {
      name: "CHNG",
      address: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf",
      decimals: 18,
    },
    {
      name: "USDT",
      address: "0x382bb369d343125bfb2117af9c149795c6c65c50",
      decimals: 18,
    },
    {
      name: "ETH",
      address: "0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x54e4622dc504176b3bb432dccaf504569699a7ff",
      decimals: 18,
    },
    {
      name: "TRX",
      address: "0x00505505a7576d6734704fabb16f41924e3e384b",
      decimals: 18,
    },
    {
      name: "UNI",
      address: "0x59d226bb0a4d74274d4354ebb6a0e1a1aa5175b6",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0xbeb67de6cc5af652b2d9b0235750ed70f5a2cb0d",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x2218e0d5e0173769f5b4939a3ae423f7e5e4eab7",
      decimals: 18,
    },
    {
      name: "SHIB",
      address: "0xaa27badaa3c9ec9081b8f6c9cdd2bf375f143780",
      decimals: 18,
    },
    {
      name: "BabyDoge",
      address: "0x97513e975a7fa9072c72c92d8000b0db90b163c5",
      decimals: 9,
    },
    {
      name: "FIL",
      address: "0x3f8969be2fc0770dcc174968e4b4ff146e0acdaf",
      decimals: 18,
    },
    {
      name: "DOT",
      address: "0xabc732f6f69a519f6d508434481376b6221eb7d5",
      decimals: 18,
    },
    { name: "OKT", address: nullAddress, decimals: 18 },
    {
      name: "USDC",
      address: "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85",
      decimals: 18,
    },
    {
      name: "CHE",
      address: "0x8179d97eb6488860d816e3ecafe694a4153f216c",
      decimals: 18,
    },
    {
      name: "KST",
      address: "0xab0d1578216a545532882e420a8c61ea07b00b12",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0x664cb7a0a0a86779f1a8748cc02f9872acad3e0a",
      decimals: 18,
    },
    {
      name: "FIN",
      address: "0x8d3573f24c0aa3819a2f5b02b2985dd82b487715",
      decimals: 18,
    },
    {
      name: "RNFT",
      address: "0x602984507a544944e1679459b2d521390ce5c913",
      decimals: 18,
    },
    {
      name: "SFC",
      address: "0x162edc778dfd179a1e54e4bcaaf650dc293bb2c9",
      decimals: 6,
    },
    {
      name: "PEOPLE",
      address: "0xfe668a3d6f05e7799aae04659fc274ac00d094c0",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x5427a224e50a9af4d030aeecd2a686d41f348dfe",
      decimals: 18,
    },
    {
      name: "LTC",
      address: "0xfa520efc34c81bfc1e3dd48b7fe9ff326049f986",
      decimals: 18,
    },
    {
      name: "ETC",
      address: "0x99970778e2715bbc9cf8fb83d10dcbc2d2d551a3",
      decimals: 18,
    },
    {
      name: "RACA",
      address: "0x12bb890508c125661e03b09ec06e404bc9289040",
      decimals: 18,
    },
    {
      name: "OKB",
      address: "0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2",
      decimals: 18,
    },
    {
      name: "VEMP",
      address: "0x2c9a1d0e1226939edb7bbb68c43a080c28743c5c",
      decimals: 18,
    },
    {
      name: "MHUNT",
      address: "0x8057687cbb5d8dde94a0e11557d5355c4aecd322",
      decimals: 18,
    },
    {
      name: "LOWB",
      address: "0x08963db742ab159f27518d1d12188f69aa7387fb",
      decimals: 18,
    },
  ],

  polygon: [
    {
      name: "USDT",
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      decimals: 8,
    },
    {
      name: "UNI",
      address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      decimals: 18,
    },
    {
      name: "MANA",
      address: "0xbd1563046a90f18127fd39f3481fd8d6ab22877f",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0x0b35d852dcb8b59eb1e8d3182ebad4e96e2df8f0",
      decimals: 18,
    },
    { name: "MATIC", address: nullAddress, decimals: 18 },
    {
      name: "USDC",
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      decimals: 6,
    },
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    {
      name: "PQC",
      address: "0x664cb7a0a0a86779f1a8748cc02f9872acad3e0a",
      decimals: 18,
    },
    {
      name: "BIFI",
      address: "0xfbdd194376de19a88118e84e279b977f165d01b8",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      decimals: 18,
    },
    {
      name: "ATOM",
      address: "0xac51c4c48dc3116487ed4bc16542e27b5694da1b",
      decimals: 6,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "APE",
      address: "0xf61eb8999f2f222f425d41da4c2ff4b6d8320c87",
      decimals: 18,
    },
    {
      name: "BANANA",
      address: "0x5d47baba0d66083c52009271faf3f50dcc01023c",
      decimals: 18,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "ELON",
      address: "0xe0339c80ffde91f3e20494df88d4206d86024cdf",
      decimals: 18,
    },
    {
      name: "FOX",
      address: "0x65a05db8322701724c197af82c9cae41195b0aa8",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89",
      decimals: 18,
    },
    {
      name: "GLM",
      address: "0x0b220b82f3ea3b7f6d9a1d8ab58930c064a2b5bf",
      decimals: 18,
    },
    {
      name: "HEX",
      address: "0x23d29d30e35c5e8d321e1dc9a8a61bfd846d4c5c",
      decimals: 8,
    },
    {
      name: "LDO",
      address: "0x25de68ef588cb0c2c8f3537861e828ae699cd0db",
      decimals: 18,
    },
    {
      name: "MM",
      address: "0x5647fe4281f8f6f01e84bce775ad4b828a7b8927",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x9fb9a33956351cf4fa040f65a13b835a3c8764e3",
      decimals: 18,
    },
    {
      name: "REQ",
      address: "0xb25e20de2f2ebb4cffd4d16a55c7b395e8a94762",
      decimals: 18,
    },
    {
      name: "SAND",
      address: "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
      decimals: 18,
    },
    // {
    //   "name": "SMRTR",
    //   "address": "0x6d923f688c7ff287dc3a5943caeefc994f97b290",
    //   "decimals": 18
    // },
    {
      name: "SUPER",
      address: "0xa1428174f516f527fafdd146b883bb4428682737",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0xf8f9efc0db77d8881500bb06ff5d6abc3070e695",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603",
      decimals: 18,
    },
    {
      name: "CHINESE",
      address: "0x03a6eed53b5dcb0395dfbecf4cbc816dc6f93790",
      decimals: 18,
    },
    {
      name: "TIME",
      address: "0xb970bc1bd4fcd639c37aa8efd6713eadc577252f",
      decimals: 8,
    },
    {
      name: "EBOX",
      address: "0xb41c43fabd22a6c6ea135e975769e9051f9ee8ad",
      decimals: 18,
    },
    {
      name: "GDDY",
      address: "0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6",
      decimals: 18,
    },
    {
      name: "DEI",
      address: "0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3",
      decimals: 18,
    },
    {
      name: "KLIMA",
      address: "0x4e78011ce80ee02d2c3e649fb657e45898257815",
      decimals: 9,
    },
    {
      name: "VOXEL",
      address: "0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f",
      decimals: 18,
    },
    {
      name: "MASK",
      address: "0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7",
      decimals: 18,
    },
    {
      name: "IXT",
      address: "0xe06bd4f5aac8d0aa337d13ec88db6defc6eaeefe",
      decimals: 18,
    },
    {
      name: "LCD",
      address: "0xc2a45fe7d40bcac8369371b08419ddafd3131b4a",
      decimals: 18,
    },
    {
      name: "ARDN",
      address: "0xb6ebc3ca1741a8f37551e44a51ec00ad417b38ca",
      decimals: 18,
    },
    {
      name: "DOG",
      address: "0xeee3371b89fc43ea970e908536fcddd975135d8a",
      decimals: 18,
    },
    {
      name: "MMF",
      address: "0x22a31bd4cb694433b6de19e0acc2899e553e9481",
      decimals: 18,
    },
    {
      name: "STG",
      address: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
      decimals: 18,
    },
    {
      name: "XCAD",
      address: "0xa55870278d6389ec5b524553d03c04f5677c061e",
      decimals: 18,
    },
    {
      name: "VIDYA",
      address: "0xfe9ca7cf13e33b23af63fea696f4aae1b7a65585",
      decimals: 18,
    },
    {
      name: "MRST",
      address: "0x411bc96881a62572ff33c9d8ce60df99e3d96cd8",
      decimals: 18,
    },
    {
      name: "CHP",
      address: "0x59b5654a17ac44f3068b3882f298881433bb07ef",
      decimals: 18,
    },
    {
      name: "ROUTE",
      address: "0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4",
      decimals: 18,
    },
    {
      name: "OPT2",
      address: "0x9e25126ebcd57c8eb6eb6c2ffc67810d365cfc3e",
      decimals: 18,
    },
    {
      name: "SPIN",
      address: "0x35f80a39eefe33d0dfd2ad2daa6ad6a9d472cebd",
      decimals: 18,
    },
    {
      name: "GET",
      address: "0xdb725f82818de83e99f1dac22a9b5b51d3d04dd4",
      decimals: 18,
    },
    {
      name: "SARCO",
      address: "0x80ae3b3847e4e8bd27a389f7686486cac9c3f3e8",
      decimals: 18,
    },
    {
      name: "GOVI",
      address: "0x43df9c0a1156c96cea98737b511ac89d0e2a1f46",
      decimals: 18,
    },
    {
      name: "DEUS",
      address: "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44",
      decimals: 18,
    },
    {
      name: "SALE",
      address: "0x8f6196901a4a153d8ee8f3fa779a042f6092d908",
      decimals: 18,
    },
    {
      name: "OM",
      address: "0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea",
      decimals: 18,
    },
    {
      name: "MOD",
      address: "0x8346ab8d5ea7a9db0209aed2d1806afa0e2c4c21",
      decimals: 18,
    },
    {
      name: "DERC",
      address: "0xb35fcbcf1fd489fce02ee146599e893fdcdc60e6",
      decimals: 18,
    },
    {
      name: "HDAO",
      address: "0x72928d5436ff65e57f72d5566dcd3baedc649a88",
      decimals: 18,
    },
    {
      name: "WLD",
      address: "0xa936e1f747d14fc30d08272d065c8aef4ab7f810",
      decimals: 18,
    },
    {
      name: "SWAP",
      address: "0x3809dcdd5dde24b37abe64a5a339784c3323c44f",
      decimals: 18,
    },
    {
      name: "ORBS",
      address: "0x614389eaae0a6821dc49062d56bda3d9d45fa2ff",
      decimals: 18,
    },
    {
      name: "RAIDER",
      address: "0xcd7361ac3307d1c5a46b63086a90742ff44c63b3",
      decimals: 18,
    },
    {
      name: "IQ",
      address: "0xb9638272ad6998708de56bbc0a290a1de534a578",
      decimals: 18,
    },
    {
      name: "ATA",
      address: "0x0df0f72ee0e5c9b7ca761ecec42754992b2da5bf",
      decimals: 18,
    },
    {
      name: "ZINU",
      address: "0x21f9b5b2626603e3f40bfc13d01afb8c431d382f",
      decimals: 9,
    },
    {
      name: "OOE",
      address: "0x9d5565da88e596730522cbc5a918d2a89dbc16d9",
      decimals: 18,
    },
    {
      name: "XED",
      address: "0x2fe8733dcb25bfbba79292294347415417510067",
      decimals: 18,
    },
    {
      name: "DEFIT",
      address: "0x428360b02c1269bc1c79fbc399ad31d58c1e8fda",
      decimals: 18,
    },
    {
      name: "BLANK",
      address: "0xf4c83080e80ae530d6f8180572cbbf1ac9d5d435",
      decimals: 18,
    },
    {
      name: "ADX",
      address: "0xdda7b23d2d72746663e7939743f929a3d85fc975",
      decimals: 18,
    },
    {
      name: "XTM",
      address: "0xe1c42be9699ff4e11674819c1885d43bd92e9d15",
      decimals: 18,
    },
    {
      name: "CGG",
      address: "0x2ab4f9ac80f33071211729e45cfc346c1f8446d5",
      decimals: 18,
    },
    {
      name: "LUXY",
      address: "0xd4945a3d0de9923035521687d4bf18cc9b0c7c2a",
      decimals: 18,
    },
    {
      name: "RBC",
      address: "0xc3cffdaf8f3fdf07da6d5e3a89b8723d5e385ff8",
      decimals: 18,
    },
    {
      name: "ASTRAFER",
      address: "0xdfce1e99a31c4597a3f8a8945cbfa9037655e335",
      decimals: 18,
    },
    {
      name: "MSHEESHA",
      address: "0x88c949b4eb85a90071f2c0bef861bddee1a7479d",
      decimals: 18,
    },
    {
      name: "DFYN",
      address: "0xc168e40227e4ebd8c1cae80f7a55a4f0e6d66c97",
      decimals: 18,
    },
    {
      name: "MV",
      address: "0xa3c322ad15218fbfaed26ba7f616249f7705d945",
      decimals: 18,
    },
    {
      name: "QUICK",
      address: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
      decimals: 18,
    },
    {
      name: "COLLAR",
      address: "0xd5fa77a860fea9cff31da91bbf9e0faea9538290",
      decimals: 18,
    },
    {
      name: "RVF",
      address: "0x2ce13e4199443fdfff531abb30c9b6594446bbc7",
      decimals: 18,
    },
    {
      name: "NITRO",
      address: "0x695fc8b80f344411f34bdbcb4e621aa69ada384b",
      decimals: 18,
    },
    {
      name: "ZEE",
      address: "0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c",
      decimals: 18,
    },
    {
      name: "TEL",
      address: "0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32",
      decimals: 2,
    },
    {
      name: "ADS",
      address: "0x598e49f01befeb1753737934a5b11fea9119c796",
      decimals: 11,
    },
    {
      name: "SOLACE",
      address: "0x501ace9c35e60f03a2af4d484f49f9b1efde9f40",
      decimals: 18,
    },
    {
      name: "PMON",
      address: "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
      decimals: 18,
    },
    {
      name: "MSU",
      address: "0xe8377a076adabb3f9838afb77bee96eac101ffb1",
      decimals: 18,
    },
    {
      name: "GMEE",
      address: "0xcf32822ff397ef82425153a9dcb726e5ff61dca7",
      decimals: 18,
    },
    {
      name: "CFi",
      address: "0xecf8f2fa183b1c4d2a269bf98a54fce86c812d3e",
      decimals: 18,
    },
    {
      name: "XGEM",
      address: "0x02649c1ff4296038de4b9ba8f491b42b940a8252",
      decimals: 18,
    },
    {
      name: "1FLR",
      address: "0x5f0197ba06860dac7e31258bdf749f92b6a636d4",
      decimals: 18,
    },
    {
      name: "A4",
      address: "0x9767203e89dcd34851240b3919d4900d3e5069f1",
      decimals: 6,
    },
    {
      name: "1ART",
      address: "0xd3c325848d7c6e29b574cb0789998b2ff901f17e",
      decimals: 18,
    },
    {
      name: "CPD",
      address: "0x1ce4a2c355f0dcc24e32a9af19f1836d6f4f98ae",
      decimals: 18,
    },
    {
      name: "XMT",
      address: "0xadbe0eac80f955363f4ff47b0f70189093908c04",
      decimals: 18,
    },
    {
      name: "IUX",
      address: "0x346404079b3792a6c548b072b9c4dddfb92948d5",
      decimals: 18,
    },
    {
      name: "CYC",
      address: "0xcfb54a6d2da14abecd231174fc5735b4436965d8",
      decimals: 18,
    },
    {
      name: "BEL",
      address: "0x28c388fb1f4fa9f9eb445f0579666849ee5eeb42",
      decimals: 18,
    },
    {
      name: "ETNA",
      address: "0x015c425f6dfabc31e1464cc4339954339f096061",
      decimals: 18,
    },
    {
      name: "RAZOR",
      address: "0xc91c06db0f7bffba61e2a5645cc15686f0a8c828",
      decimals: 18,
    },
    {
      name: "REVV",
      address: "0x70c006878a5a50ed185ac4c87d837633923de296",
      decimals: 18,
    },
    {
      name: "MASQ",
      address: "0xee9a352f6aac4af1a5b9f467f6a93e0ffbe9dd35",
      decimals: 18,
    },
    {
      name: "STACK",
      address: "0x980111ae1b84e50222c8843e3a7a038f36fecd2b",
      decimals: 18,
    },
    {
      name: "XEND",
      address: "0x86775d0b80b3df266af5377db34ba8f318d715ec",
      decimals: 18,
    },
    {
      name: "PLA",
      address: "0x8765f05adce126d70bcdf1b0a48db573316662eb",
      decimals: 18,
    },
    {
      name: "ARPA",
      address: "0xee800b277a96b0f490a1a732e1d6395fad960a26",
      decimals: 18,
    },
    {
      name: "YEL",
      address: "0xd3b71117e6c1558c1553305b44988cd944e97300",
      decimals: 18,
    },
    {
      name: "HOTCROSS",
      address: "0x3b737a181f7d2532cf49864f8050b3465a310593",
      decimals: 18,
    },
    {
      name: "NFTY",
      address: "0xcc081220542a60a8ea7963c4f53d522b503272c1",
      decimals: 18,
    },
    {
      name: "MOONED",
      address: "0x7e4c577ca35913af564ee2a24d882a4946ec492b",
      decimals: 18,
    },
    {
      name: "PLOT",
      address: "0xe82808eaa78339b06a691fd92e1be79671cad8d3",
      decimals: 18,
    },
    {
      name: "FEAR",
      address: "0xa2ca40dbe72028d3ac78b5250a8cb8c404e7fb8c",
      decimals: 18,
    },
    {
      name: "CHAIN",
      address: "0xd55fce7cdab84d84f2ef3f99816d765a2a94a509",
      decimals: 18,
    },
    {
      name: "BPT",
      address: "0x6863bd30c9e313b264657b107352ba246f8af8e0",
      decimals: 18,
    },
    {
      name: "ORE",
      address: "0xd52f6ca48882be8fbaa98ce390db18e1dbe1062d",
      decimals: 18,
    },
    {
      name: "HAPI",
      address: "0xbe276e3d5060b0e770fe0260bb6be94ac19b4b19",
      decimals: 18,
    },
    {
      name: "EQUAD",
      address: "0xdab625853c2b35d0a9c6bd8e5a097a664ef4ccfb",
      decimals: 18,
    },
    {
      name: "TNDR",
      address: "0x29e3e6ad4eeadf767919099ee23c907946435a70",
      decimals: 18,
    },
    {
      name: "ERP",
      address: "0x28acca4ed2f6186c3d93e20e29e6e6a9af656341",
      decimals: 18,
    },
    {
      name: "XP",
      address: "0x180cfbe9843d79bcafcbcdf23590247793dfc95b",
      decimals: 18,
    },
    {
      name: "SNK",
      address: "0x689f8e5913c158ffb5ac5aeb83b3c875f5d20309",
      decimals: 18,
    },
    {
      name: "$KMC",
      address: "0x44d09156c7b4acf0c64459fbcced7613f5519918",
      decimals: 18,
    },
    {
      name: "CRBN",
      address: "0x89ef0900b0a6b5548ab2ff58ef588f9433b5fcf5",
      decimals: 18,
    },
    {
      name: "CIRUS",
      address: "0x2a82437475a60bebd53e33997636fade77604fc2",
      decimals: 18,
    },
    {
      name: "ONT",
      address: "0xd4814770065f634003a8d8d70b4743e0c3f334ad",
      decimals: 9,
    },
    {
      name: "BONDLY",
      address: "0x64ca1571d1476b7a21c5aaf9f1a750a193a103c0",
      decimals: 18,
    },
    {
      name: "FLAME",
      address: "0x22e3f02f86bc8ea0d73718a2ae8851854e62adc5",
      decimals: 18,
    },
    {
      name: "HID",
      address: "0x87847703d4bb4fcd42db887ffdcb94496e77e3ab",
      decimals: 18,
    },
    {
      name: "FYN",
      address: "0x3b56a704c01d650147ade2b8cee594066b3f9421",
      decimals: 18,
    },
    {
      name: "WNT",
      address: "0x82a0e6c02b91ec9f6ff943c0a933c03dbaa19689",
      decimals: 18,
    },
    {
      name: "MHUNT",
      address: "0x61f95bd637e3034133335c1baa0148e518d438ad",
      decimals: 18,
    },
    {
      name: "VENT",
      address: "0xf21441f9ec4c1fe69cb7cf186eceab31af2b658d",
      decimals: 18,
    },
    {
      name: "IOI",
      address: "0xaf24765f631c8830b5528b57002241ee7eef1c14",
      decimals: 6,
    },
    {
      name: "CIV",
      address: "0x42f6bdcfd82547e89f1069bf375aa60e6c6c063d",
      decimals: 18,
    },
    {
      name: "FRM",
      address: "0xd99bafe5031cc8b345cb2e8c80135991f12d7130",
      decimals: 18,
    },
    {
      name: "COR",
      address: "0x4fdce518fe527439fe76883e6b51a1c522b61b7c",
      decimals: 18,
    },
    {
      name: "ANML",
      address: "0xecc4176b90613ed78185f01bd1e42c5640c4f09d",
      decimals: 18,
    },
    {
      name: "IRON",
      address: "0xd86b5923f3ad7b585ed81b448170ae026c65ae9a",
      decimals: 18,
    },
    {
      name: "STAK",
      address: "0x46a5d492788f8afdfc743ab7d7bd13f996249ed5",
      decimals: 18,
    },
    {
      name: "N1",
      address: "0xacbd826394189cf2623c6df98a18b41fc8ffc16d",
      decimals: 18,
    },
    {
      name: "GFARM2",
      address: "0x7075cab6bcca06613e2d071bd918d1a0241379e2",
      decimals: 18,
    },
    {
      name: "INSUR",
      address: "0x8a0e8b4b0903929f47c3ea30973940d4a9702067",
      decimals: 18,
    },
    {
      name: "DAFI",
      address: "0x638df98ad8069a15569da5a6b01181804c47e34c",
      decimals: 18,
    },
    {
      name: "DIGI",
      address: "0x4d8181f051e617642e233be09cea71cc3308ffd4",
      decimals: 18,
    },
    {
      name: "MPH",
      address: "0x65c9e3289e5949134759119dbc9f862e8d6f2fbe",
      decimals: 18,
    },
    {
      name: "CIFI",
      address: "0x12365293cb6477d4fc2686e46bb97e3fb64f1550",
      decimals: 18,
    },
    {
      name: "KIT",
      address: "0x4d0def42cf57d6f27cd4983042a55dce1c9f853c",
      decimals: 18,
    },
    {
      name: "CHAMP",
      address: "0x8f9e8e833a69aa467e42c46cca640da84dd4585f",
      decimals: 8,
    },
    {
      name: "PROS",
      address: "0x6109cb051c5c64093830121ed76272ab04bbdd7c",
      decimals: 18,
    },
    {
      name: "GLQ",
      address: "0x0cfc9a713a5c17bc8a5ff0379467f6558bacd0e0",
      decimals: 18,
    },
    {
      name: "IXS",
      address: "0x1ba17c639bdaecd8dc4aac37df062d17ee43a1b8",
      decimals: 18,
    },
    {
      name: "XY",
      address: "0x55555555a687343c6ce28c8e1f6641dc71659fad",
      decimals: 18,
    },
    {
      name: "NSFW",
      address: "0x8f006d1e1d9dc6c98996f50a4c810f17a47fbf19",
      decimals: 18,
    },
    {
      name: "8PAY",
      address: "0x3bd9856bf578910b55261d45d9148d61c177b092",
      decimals: 18,
    },
    {
      name: "SFL",
      address: "0xd1f9c58e33933a993a3891f8acfe05a68e1afc05",
      decimals: 18,
    },
    {
      name: "WOMBAT",
      address: "0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd",
      decimals: 18,
    },
    {
      name: "STZ",
      address: "0x2c92a8a41f4b806a6f6f1f7c9d9dec78dcd8c18e",
      decimals: 18,
    },
    {
      name: "GOGO",
      address: "0xdd2af2e723547088d3846841fbdcc6a8093313d6",
      decimals: 18,
    },
    {
      name: "XPND",
      address: "0x03f61137bfb86be07394f0fd07a33984020f96d8",
      decimals: 18,
    },
    {
      name: "ZRO",
      address: "0x6acda5e7eb1117733dc7cb6158fc67f226b32022",
      decimals: 18,
    },
    {
      name: "LIQ",
      address: "0x4036f3d9c45a20f44f0b8b85dd6ca33005ff9654",
      decimals: 18,
    },
    {
      name: "TETU",
      address: "0x255707b70bf90aa112006e1b07b9aea6de021424",
      decimals: 18,
    },
    {
      name: "TRAXX",
      address: "0xd43be54c1aedf7ee4099104f2dae4ea88b18a249",
      decimals: 18,
    },
    {
      name: "TOWER",
      address: "0x2bc07124d8dac638e290f401046ad584546bc47b",
      decimals: 18,
    },
    {
      name: "ORARE",
      address: "0xff2382bd52efacef02cc895bcbfc4618608aa56f",
      decimals: 18,
    },
    {
      name: "RBLS",
      address: "0xe26cda27c13f4f87cffc2f437c5900b27ebb5bbb",
      decimals: 8,
    },
    {
      name: "ISP",
      address: "0x1e289178612f5b6d32f692e312dcf783c74b2162",
      decimals: 18,
    },
    {
      name: "PYR",
      address: "0x430ef9263e76dae63c84292c3409d61c598e9682",
      decimals: 18,
    },
    {
      name: "LOWB",
      address: "0x1c0a798b5a5273a9e54028eb1524fd337b24145f",
      decimals: 18,
    },
    {
      name: "GOO",
      address: "0x6f3cc27e17a0f2e52d8e7693ff0d892cea1854bf",
      decimals: 9,
    },
    {
      name: "ONUS",
      address: "0xc0a1adce1c62daedf1b5f07b31266090bc5cc6d2",
      decimals: 18,
    },
    {
      name: "FISH",
      address: "0x3a3df212b7aa91aa0402b9035b098891d276572b",
      decimals: 18,
    },
    {
      name: "UFT",
      address: "0x5b4cf2c120a9702225814e18543ee658c5f8631e",
      decimals: 18,
    },
    {
      name: "DFX",
      address: "0xe7804d91dfcde7f776c90043e03eaa6df87e6395",
      decimals: 18,
    },
    {
      name: "OKLP",
      address: "0x5d48a5e5a3e737322ae27e25897f1c9e19ecc941",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      decimals: 8,
    },
    {
      name: "$SNOW",
      address: "0xe0f463832295adf63eb6ca053413a3f9cd8bf685",
      decimals: 18,
    },
    {
      name: "MCHC",
      address: "0xee7666aacaefaa6efeef62ea40176d3eb21953b9",
      decimals: 18,
    },
    {
      name: "PFI",
      address: "0xe46b4a950c389e80621d10dfc398e91613c7e25e",
      decimals: 18,
    },
    {
      name: "JEUR",
      address: "0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c",
      decimals: 18,
    },
    {
      name: "MVX",
      address: "0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7",
      decimals: 18,
    },
    {
      name: "ALGB",
      address: "0x0169ec1f8f639b32eec6d923e24c2a2ff45b9dd6",
      decimals: 18,
    },
    {
      name: "GEL",
      address: "0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05",
      decimals: 18,
    },
    {
      name: "SROCKET",
      address: "0x94788309d420ad9f9f16d79fc13ab74de83f85f7",
      decimals: 18,
    },
    {
      name: "FANZ",
      address: "0x124c31a823cdf7cd391adaee4aa32455eb3e76ca",
      decimals: 18,
    },
    {
      name: "MECHA",
      address: "0xacd4e2d936be9b16c01848a3742a34b3d5a5bdfa",
      decimals: 18,
    },
    {
      name: "KITTY",
      address: "0xb4228798ff437ecd8fa43429664e9992256fe6ac",
      decimals: 18,
    },
    {
      name: "GNS",
      address: "0xe5417af564e4bfda1c483642db72007871397896",
      decimals: 18,
    },
    {
      name: "GCOIN",
      address: "0x071ac29d569a47ebffb9e57517f855cb577dcc4c",
      decimals: 18,
    },
    {
      name: "MOV",
      address: "0x6d802ac662b898622f7a13e1f4cb1a50c7085b6e",
      decimals: 18,
    },
    {
      name: "CXO",
      address: "0xf2ae0038696774d65e67892c9d301c5f2cbbda58",
      decimals: 18,
    },
    {
      name: "ADDY",
      address: "0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539",
      decimals: 18,
    },
    {
      name: "CP",
      address: "0xf9d3d8b25b95bcda979025b74fdfa7ac3f380f9f",
      decimals: 18,
    },
    {
      name: "ZED",
      address: "0x5ec03c1f7fa7ff05ec476d19e34a22eddb48acdc",
      decimals: 18,
    },
    {
      name: "ROGUE",
      address: "0x835df131c80cf4b27cefde256498e363cf8a4c27",
      decimals: 8,
    },
    {
      name: "ZKP",
      address: "0x9a06db14d639796b25a6cec6a1bf614fd98815ec",
      decimals: 18,
    },
    {
      name: "MIMATIC",
      address: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
      decimals: 18,
    },
    {
      name: "FACTR",
      address: "0xe0bceef36f3a6efdd5eebfacd591423f8549b9d5",
      decimals: 18,
    },
    {
      name: "RADIO",
      address: "0x613a489785c95afeb3b404cc41565ccff107b6e0",
      decimals: 18,
    },
    {
      name: "RUNY",
      address: "0x578fee9def9a270c20865242cfd4ff86f31d0e5b",
      decimals: 18,
    },
    {
      name: "TSUBASAUT",
      address: "0x5a7bb7b8eff493625a2bb855445911e63a490e42",
      decimals: 8,
    },
    {
      name: "DEOD",
      address: "0xe77abb1e75d2913b2076dd16049992ffeaca5235",
      decimals: 18,
    },
  ],

  avax: [
    {
      name: "USDT",
      address: "0xc7198437980c041c805a1edcba50c1ce5db95118",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x50b7545627a5162f82a992c33b87adc75187b218",
      decimals: 8,
    },
    {
      name: "UNI",
      address: "0x8ebaf22b6f053dffeaf46f4dd9efa95d89ba8580",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x5947bb275c521040051d82396192181b413227a3",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0x63a72806098bd3d9520cc43356dd78afe5d386d9",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0xbec243c995409e6520d7c41e404da5deba4b209b",
      decimals: 18,
    },
    {
      name: "INCH",
      address: "0xd501281565bf7789224523144fe5d98e8b28f267",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x37b608519f91f70f2eeb0e5ed9af4061722e4f76",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0xc3048e19e76cb9a3aa9d77d8c03c29fc906e2437",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0x9eaac1b23d935365bd7b542fe22ceee2922f52dc",
      decimals: 18,
    },
    {
      name: "GRT",
      address: "0x8a0cac13c7da965a312f08ea4229c37869e85cb9",
      decimals: 18,
    },
    {
      name: "BAT",
      address: "0x98443b96ea4b0858fdf3219cd13e98c7a4690588",
      decimals: 18,
    },
    {
      name: "ZRX",
      address: "0x596fa47043f99a4e0f122243b841e55375cde0d2",
      decimals: 18,
    },
    {
      name: "UMA",
      address: "0x3bd2b1c7ed8d396dbb98ded3aebb41350a5b2339",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0x249848beca43ac405b8102ec90dd5f22ca513c06",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      decimals: 6,
    },
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    { name: "AVAX", address: nullAddress, decimals: 18 },
    {
      name: "PNG",
      address: "0x60781c2586d68229fde47564546784ab3faca982",
      decimals: 18,
    },
    {
      name: "JOE",
      address: "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
      decimals: 18,
    },
    {
      name: "BUSD",
      address: "0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
      decimals: 18,
    },
    {
      name: "PEOPLE",
      address: "0x3fca6743e2fb55759fee767f3a68b2c06d699dc4",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "KLAY",
      address: "0x43a934f6058fbeb24620070153267a5f8162207c",
      decimals: 18,
    },
    {
      name: "WEMIX",
      address: "0x00d197d8cfe95498264eaceddb02c79bc0f26d67",
      decimals: 18,
    },
    {
      name: "KLEVA",
      address: "0x9a5331021455708851dd87a8759c82e1f152b09c",
      decimals: 18,
    },
    {
      name: "BORA",
      address: "0x08608ebf81ddab792cd3d75b78bd3e3771d49fa0",
      decimals: 18,
    },
    {
      name: "KSP",
      address: "0x6ee4e858e6167250756235df76db6da7c38d9f7e",
      decimals: 18,
    },
    {
      name: "KFI",
      address: "0x27775ba0673e6d27bf25696ce4087c0d41c48df1",
      decimals: 18,
    },
    {
      name: "ALBT",
      address: "0x9e037de681cafa6e661e6108ed9c2bd1aa567ecd",
      decimals: 18,
    },
    {
      name: "AVAI",
      address: "0x346a59146b9b4a77100d369a3d18e8007a9f46a6",
      decimals: 18,
    },
    {
      name: "AVME",
      address: "0x1ecd47ff4d9598f89721a2866bfeb99505a413ed",
      decimals: 18,
    },
    {
      name: "BOO",
      address: "0xbd83010eb60f12112908774998f65761cf9f6f9a",
      decimals: 18,
    },
    {
      name: "CLY",
      address: "0xec3492a2508ddf4fdc0cd76f31f340b30d1793e6",
      decimals: 18,
    },
    {
      name: "CRA",
      address: "0xa32608e873f9ddef944b24798db69d80bbb4d1ed",
      decimals: 18,
    },
    {
      name: "DCAU",
      address: "0x100cc3a819dd3e8573fd2e46d1e66ee866068f30",
      decimals: 18,
    },
    {
      name: "EGG",
      address: "0x7761e2338b35bceb6bda6ce477ef012bde7ae611",
      decimals: 18,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64",
      decimals: 18,
    },
    {
      name: "FXS",
      address: "0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454",
      decimals: 18,
    },
    {
      name: "GMX",
      address: "0x62edc0692bd897d2295872a9ffcac5425011c661",
      decimals: 18,
    },
    {
      name: "HEC",
      address: "0x0149e2fa4104666f6af136f731757a04df5c8a68",
      decimals: 9,
    },
    {
      name: "ICE",
      address: "0xe0ce60af0850bf54072635e66e79df17082a1109",
      decimals: 18,
    },
    {
      name: "IME",
      address: "0xf891214fdcf9cdaa5fdc42369ee4f27f226adad6",
      decimals: 18,
    },
    {
      name: "KLO",
      address: "0xb27c8941a7df8958a1778c0259f76d1f8b711c35",
      decimals: 18,
    },
    {
      name: "MIM",
      address: "0x130966628846bfd36ff31a822705796e8cb8c18d",
      decimals: 18,
    },
    {
      name: "MKR",
      address: "0x88128fd4b259552a9a1d457f435a6527aab72d42",
      decimals: 18,
    },
    {
      name: "PEFI",
      address: "0xe896cdeaac9615145c0ca09c8cd5c25bced6384c",
      decimals: 18,
    },
    {
      name: "PTP",
      address: "0x22d4002028f537599be9f666d1c4fa138522f9c8",
      decimals: 18,
    },
    {
      name: "QI",
      address: "0x8729438eb15e2c8b576fcc6aecda6a148776c0f5",
      decimals: 18,
    },
    {
      name: "SMRTR",
      address: "0x6d923f688c7ff287dc3a5943caeefc994f97b290",
      decimals: 18,
    },
    {
      name: "SPELL",
      address: "0xce1bffbd5374dac86a2893119683f4911a2f7814",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0x1f1e7c893855525b303f99bdf5c3c05be09ca251",
      decimals: 18,
    },
    {
      name: "TIC",
      address: "0x75739a693459f33b1fbcc02099eea3ebcf150cbe",
      decimals: 18,
    },
    {
      name: "TUS",
      address: "0xf693248f96fe03422fea95ac0afbbbc4a8fdd172",
      decimals: 18,
    },
    {
      name: "VSO",
      address: "0x846d50248baf8b7ceaa9d9b53bfd12d7d7fbb25a",
      decimals: 18,
    },
    {
      name: "WET",
      address: "0xb1466d4cf0dcfc0bcddcf3500f473cdacb88b56d",
      decimals: 18,
    },
    {
      name: "WXT",
      address: "0xfcde4a87b8b6fa58326bb462882f1778158b02f1",
      decimals: 18,
    },
    {
      name: "XAVA",
      address: "0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4",
      decimals: 18,
    },
    {
      name: "YAK",
      address: "0x59414b3089ce2af0010e7523dea7e2b35d776ec7",
      decimals: 18,
    },
    {
      name: "IDIA",
      address: "0xfcaf13227dcbfa2dc2b1928acfca03b85e2d25dd",
      decimals: 18,
    },
    {
      name: "WMEMO",
      address: "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b",
      decimals: 18,
    },
    {
      name: "AKITA",
      address: "0xcaf5191fc480f43e4df80106c7695eca56e48b18",
      decimals: 18,
    },
    {
      name: "OSWAP",
      address: "0xb32ac3c79a94ac1eb258f3c830bbdbc676483c93",
      decimals: 18,
    },
    {
      name: "STG",
      address: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
      decimals: 18,
    },
    {
      name: "NEWO",
      address: "0x4bfc90322dd638f81f034517359bd447f8e0235a",
      decimals: 18,
    },
    {
      name: "THOR",
      address: "0x8f47416cae600bccf9530e9f3aeaa06bdd1caa79",
      decimals: 18,
    },
    {
      name: "FIRE",
      address: "0xfcc6ce74f4cd7edef0c5429bb99d38a3608043a5",
      decimals: 18,
    },
    {
      name: "VPND",
      address: "0x83a283641c6b4df383bcddf807193284c84c5342",
      decimals: 18,
    },
    {
      name: "VTX",
      address: "0x5817d4f0b62a59b17f75207da1848c2ce75e7af4",
      decimals: 18,
    },
    {
      name: "CAI",
      address: "0x48f88a3fe843ccb0b5003e70b4192c1d7448bef0",
      decimals: 18,
    },
    {
      name: "SWAP",
      address: "0xc7b5d72c836e718cda8888eaf03707faef675079",
      decimals: 18,
    },
    {
      name: "ORBS",
      address: "0x340fe1d898eccaad394e2ba0fc1f93d27c7b717a",
      decimals: 18,
    },
    {
      name: "ZOO",
      address: "0x1b88d7ad51626044ec62ef9803ea264da4442f32",
      decimals: 18,
    },
    {
      name: "OOE",
      address: "0x0ebd9537a25f56713e34c45b38f421a1e7191469",
      decimals: 18,
    },
    {
      name: "XETA",
      address: "0x31c994ac062c1970c086260bc61babb708643fac",
      decimals: 18,
    },
    {
      name: "XIO",
      address: "0x2cf51e73c3516f3d86e9c0b4de0971dbf0766fd4",
      decimals: 18,
    },
    {
      name: "YETI",
      address: "0x77777777777d4554c39223c354a05825b2e8faa3",
      decimals: 18,
    },
    {
      name: "NNT",
      address: "0x771c01e1917b5ab5b791f7b96f0cd69e22f6dbcf",
      decimals: 18,
    },
    {
      name: "A4",
      address: "0x9767203e89dcd34851240b3919d4900d3e5069f1",
      decimals: 6,
    },
    {
      name: "PIZZA",
      address: "0x6121191018baf067c6dc6b18d42329447a164f05",
      decimals: 18,
    },
    {
      name: "ECD",
      address: "0xeb8343d5284caec921f035207ca94db6baaacbcd",
      decimals: 18,
    },
    {
      name: "LIQR",
      address: "0x33333ee26a7d02e41c33828b42fb1e0889143477",
      decimals: 18,
    },
    {
      name: "MU",
      address: "0xd036414fa2bcbb802691491e323bff1348c5f4ba",
      decimals: 18,
    },
    {
      name: "RLOOP",
      address: "0x822b906e74d493d07223cf6858620ccda66b2154",
      decimals: 18,
    },
    {
      name: "SNCT",
      address: "0x2905d6d6957983d9ed73bc019ff2782c39dd7a49",
      decimals: 18,
    },
    {
      name: "SHAKE",
      address: "0xc1d02e488a9ce2481bfdcd797d5373dd2e70a9c2",
      decimals: 18,
    },
    {
      name: "HON",
      address: "0xed2b42d3c9c6e97e11755bb37df29b6375ede3eb",
      decimals: 18,
    },
    {
      name: "FRM",
      address: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
      decimals: 18,
    },
    {
      name: "POPS",
      address: "0x240248628b7b6850352764c5dfa50d1592a033a8",
      decimals: 18,
    },
    {
      name: "NFTD",
      address: "0x9e3ca00f2d4a9e5d4f0add0900de5f15050812cf",
      decimals: 18,
    },
    {
      name: "STEAK",
      address: "0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674",
      decimals: 18,
    },
    {
      name: "SATA",
      address: "0xbec0a9aea58b6a0c0f05a03078f7e7dcecc13a95",
      decimals: 18,
    },
    {
      name: "RUG",
      address: "0xb8ef3a190b68175000b74b4160d325fd5024760e",
      decimals: 9,
    },
    {
      name: "DOMI",
      address: "0xfc6da929c031162841370af240dec19099861d3b",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x50b7545627a5162f82a992c33b87adc75187b218",
      decimals: 8,
    },
    {
      name: "X3TA",
      address: "0xfb6523a6799129caf098e8a500a787135a5eae49",
      decimals: 18,
    },
    {
      name: "DCAR",
      address: "0x250bdca7d1845cd543bb55e7d82dca24d48e9f0f",
      decimals: 18,
    },
    {
      name: "RUX",
      address: "0xa1afcc973d44ce1c65a21d9e644cb82489d26503",
      decimals: 18,
    },
    {
      name: "BAY",
      address: "0x18706c65b12595edb43643214eacdb4f618dd166",
      decimals: 18,
    },
  ],
  arbitrum: [
    {
      name: "USDT",
      address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      decimals: 6,
    },
    { name: "ETH", address: nullAddress, decimals: 18 },
    {
      name: "BTC",
      address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
      decimals: 8,
    },
    {
      name: "UNI",
      address: "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0xd4d42f0b6def4ce0383636770ef773390d85c61a",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0x354a6da3fcde098f8389cad84b0182725c6c91de",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0x82e3a8f066a6989666b031d916c43672085b1582",
      decimals: 18,
    },
    {
      name: "GRT",
      address: "0x9623063377ad1b27544c965ccd7342f7ea7e88c7",
      decimals: 18,
    },
    {
      name: "CRV",
      address: "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8",
      decimals: 18,
    },
    {
      name: "BADGER",
      address: "0xbfa641051ba0a0ad1b0acf549a89536a0d76472e",
      decimals: 18,
    },
    {
      name: "DODO",
      address: "0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      decimals: 6,
    },
    {
      name: "DAI",
      address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      decimals: 18,
    },
    {
      name: "EMAX",
      address: "0x123389c2f0e9194d9ba98c21e63c375b67614108",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0x17fc002b466eec40dae837fc4be5c67993ddbd6f",
      decimals: 18,
    },
    {
      name: "GMX",
      address: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
      decimals: 18,
    },
    {
      name: "MIM",
      address: "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x9fb9a33956351cf4fa040f65a13b835a3c8764e3",
      decimals: 18,
    },
    {
      name: "SPELL",
      address: "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af",
      decimals: 18,
    },
    {
      name: "SWPR",
      address: "0xde903e2712288a1da82942dddf2c20529565ac30",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0x080f6aed32fc474dd5717105dba5ea57268f46eb",
      decimals: 18,
    },
    {
      name: "CHINESE",
      address: "0x03a6eed53b5dcb0395dfbecf4cbc816dc6f93790",
      decimals: 18,
    },
    {
      name: "DPX",
      address: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
      decimals: 18,
    },
    {
      name: "MAGIC",
      address: "0x539bde0d7dbd336b79148aa742883198bbf60342",
      decimals: 18,
    },
    {
      name: "RDPX",
      address: "0x32eb7902d4134bf98a28b963d26de779af92a212",
      decimals: 18,
    },
    {
      name: "GOHM",
      address: "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1",
      decimals: 18,
    },
    {
      name: "JONES",
      address: "0x10393c20975cf177a3513071bc110f7962cd67da",
      decimals: 18,
    },
    {
      name: "DOG",
      address: "0x4425742f1ec8d98779690b5a3a6276db85ddc01a",
      decimals: 18,
    },
    {
      name: "PLS",
      address: "0x51318b7d00db7acc4026c88c3952b66278b6a67f",
      decimals: 18,
    },
    {
      name: "STG",
      address: "0x6694340fc020c5e6b96567843da2df01b2ce1eb6",
      decimals: 18,
    },
    {
      name: "LIQD",
      address: "0x93c15cd7de26f07265f0272e0b831c5d7fab174f",
      decimals: 18,
    },
    {
      name: "RDNT",
      address: "0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017",
      decimals: 18,
    },
    {
      name: "IQ",
      address: "0xce4db2ce8cca463f8aa1e2174c244ba4a8d672cb",
      decimals: 18,
    },
    {
      name: "DERI",
      address: "0x21e60ee73f17ac0a411ae5d690f908c3ed66fe12",
      decimals: 18,
    },
    {
      name: "SIS",
      address: "0x9e758b8a98a42d612b3d38b66a22074dc03d7370",
      decimals: 18,
    },
    {
      name: "KSW",
      address: "0xdc7179416c08c15f689d9214a3bec2dd003deabc",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
      decimals: 8,
    },
    {
      name: "BFR",
      address: "0x1a5b0aaf478bf1fda7b934c76e7692d722982a6d",
      decimals: 18,
    },
    {
      name: "UMAMI",
      address: "0x1622bf67e6e5747b81866fe0b85178a93c7f86e3",
      decimals: 9,
    },
    {
      name: "MGN",
      address: "0xfc77b86f3ade71793e1eec1e7944db074922856e",
      decimals: 18,
    },
    {
      name: "L2DAO",
      address: "0x2cab3abfc1670d1a452df502e216a66883cdf079",
      decimals: 18,
    },
    {
      name: "KROM",
      address: "0x55ff62567f09906a85183b866df84bf599a4bf70",
      decimals: 18,
    },
    {
      name: "GNS",
      address: "0x18c11fd286c5ec11c3b683caa813b77f5163a122",
      decimals: 18,
    },
    {
      name: "NYAN",
      address: "0xed3fb761414da74b74f33e5c5a1f78104b188dfc",
      decimals: 18,
    },
    {
      name: "PSI",
      address: "0x602eb0d99a5e3e76d1510372c4d2020e12eaea8a",
      decimals: 9,
    },
    {
      name: "DBL",
      address: "0xd3f1da62cafb7e7bc6531ff1cef6f414291f03d3",
      decimals: 18,
    },
    {
      name: "BRC",
      address: "0xb5de3f06af62d8428a8bf7b4400ea42ad2e0bc53",
      decimals: 18,
    },
    {
      name: "VELA",
      address: "0x088cd8f5ef3652623c22d48b1605dcfe860cd704",
      decimals: 18,
    },
    {
      name: "GRAIL",
      address: "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8",
      decimals: 18,
    },
    {
      name: "HWT",
      address: "0xbcc9c1763d54427bdf5efb6e9eb9494e5a1fbabf",
      decimals: 18,
    },
    {
      name: "POI$ON",
      address: "0x31c91d8fb96bff40955dd2dbc909b36e8b104dde",
      decimals: 18,
    },
    {
      name: "TND",
      address: "0xc47d9753f3b32aa9548a7c3f30b6aec3b2d2798c",
      decimals: 18,
    },
    {
      name: "GOBLIN",
      address: "0xfd559867b6d3445f9589074c3ac46418fdfffda4",
      decimals: 9,
    },
    {
      name: "ZYB",
      address: "0x3b475f6f2f41853706afc9fa6a6b8c5df1a2724c",
      decimals: 18,
    },
    {
      name: "TROVE",
      address: "0x982239d38af50b0168da33346d85fb12929c4c07",
      decimals: 18,
    },
    {
      name: "CARROT",
      address: "0x8418b8bff5a9979e26091922bf8614b78e93c44b",
      decimals: 18,
    },
    {
      name: "ALIEN",
      address: "0x6740acb82ac5c63a7ad2397ee1faed7c788f5f8c",
      decimals: 18,
    },
    {
      name: "SLIZ",
      address: "0x463913d3a3d3d291667d53b8325c598eb88d3b0e",
      decimals: 18,
    },
    {
      name: "ARBI",
      address: "0x9db8a10c7fe60d84397860b3af2e686d4f90c2b7",
      decimals: 18,
    },
    {
      name: "WHEAT",
      address: "0x771146816a0c7d74daf652252d646ab0bff7c21a",
      decimals: 18,
    },
    {
      name: "VOLTA",
      address: "0x417a1afd44250314bffb11ff68e989775e990ab6",
      decimals: 18,
    },
    {
      name: "MMT",
      address: "0x27d8de4c30ffde34e982482ae504fc7f23061f61",
      decimals: 18,
    },
    {
      name: "DSQ",
      address: "0xdb0c6fc9e01cd95eb1d3bbae6689962de489cd7b",
      decimals: 18,
    },
    {
      name: "GRB",
      address: "0x5fd71280b6385157b291b9962f22153fc9e79000",
      decimals: 18,
    },
    {
      name: "DFTL",
      address: "0xcb6460d56825ddc12229c7a7d94b6b26a9f9c867",
      decimals: 18,
    },
    {
      name: "HEI",
      address: "0x7e70e4efbbcc72f21979eb029efa38ecb40238c6",
      decimals: 18,
    },
    {
      name: "TURAI",
      address: "0xc4663f169aafb1d4506ce189d63810e24a8b63ea",
      decimals: 18,
    },
    {
      name: "RAM",
      address: "0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418",
      decimals: 18,
    },
    {
      name: "GDX",
      address: "0x2f27118e3d2332afb7d165140cf1bb127ea6975d",
      decimals: 18,
    },
    {
      name: "EDE",
      address: "0xccd3891c1452b7cb0e4632774b9365dc4ee24f20",
      decimals: 18,
    },
    {
      name: "ACID",
      address: "0x29c1ea5ed7af53094b1a79ef60d20641987c867e",
      decimals: 9,
    },
    {
      name: "MZR",
      address: "0xbbea044f9e7c0520195e49ad1e561572e7e1b948",
      decimals: 18,
    },
    {
      name: "FCTR",
      address: "0x6dd963c510c2d2f09d5eddb48ede45fed063eb36",
      decimals: 18,
    },
    {
      name: "ARB",
      address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
      decimals: 18,
    },
  ],
  aurora: [
    {
      name: "USDT",
      address: "0x4988a896b1227218e4a686fde5eabdcabd91571f",
      decimals: 6,
    },
    { name: "ETH", address: nullAddress, decimals: 18 },
    {
      name: "BTC",
      address: "0xf4eb217ba2454613b15dbdea6e5f22276410e89e",
      decimals: 8,
    },
    {
      name: "UNI",
      address: "0x1bc741235ec0ee86ad488fa49b69bb6c823ee7b7",
      decimals: 18,
    },
    {
      name: "LINK",
      address: "0x94190d8ef039c670c6d6b9990142e0ce2a1e3178",
      decimals: 18,
    },
    {
      name: "AAVE",
      address: "0x4e834cdcc911605227eedddb89fad336ab9dc00a",
      decimals: 18,
    },
    {
      name: "SUSHI",
      address: "0x7821c773a12485b12a2b5b7bc451c3eb200986b1",
      decimals: 18,
    },
    {
      name: "COMP",
      address: "0xdeacf0faa2b80af41470003b5f6cd113d47b4dcd",
      decimals: 18,
    },
    {
      name: "YFI",
      address: "0xa64514a8af3ff7366ad3d5daa5a548eefcef85e0",
      decimals: 18,
    },
    {
      name: "BAL",
      address: "0xb59d0fdaf498182ff19c4e80c00ecfc4470926e2",
      decimals: 18,
    },
    {
      name: "DODO",
      address: "0xe301ed8c7630c9678c39e4e45193d1e7dfb914f7",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
      decimals: 6,
    },
    {
      name: "DAI",
      address: "0xe3520349f477a5f6eb06107066048508498a291b",
      decimals: 18,
    },
    {
      name: "AURORA",
      address: "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79",
      decimals: 18,
    },
    {
      name: "NEAR",
      address: "0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d",
      decimals: 24,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "SYN",
      address: "0xd80d8688b02b3fd3afb81cdb124f188bb5ad0445",
      decimals: 18,
    },
    {
      name: "TRI",
      address: "0xfa94348467f64d5a457f75f8bc40495d33c65abb",
      decimals: 18,
    },
    {
      name: "BSTN",
      address: "0x9f1f933c660a1dc856f0e0fe058435879c5ccef0",
      decimals: 18,
    },
    {
      name: "PLY",
      address: "0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f",
      decimals: 18,
    },
    {
      name: "SOLACE",
      address: "0x501ace9c35e60f03a2af4d484f49f9b1efde9f40",
      decimals: 18,
    },
    {
      name: "SPOLAR",
      address: "0x9d6fc90b25976e40adad5a3edd08af9ed7a21729",
      decimals: 18,
    },
    {
      name: "KSW",
      address: "0xe4eb03598f4dcab740331fa432f4b85ff58aa97e",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0xf4eb217ba2454613b15dbdea6e5f22276410e89e",
      decimals: 8,
    },
  ],
  klaytn: [
    {
      name: "USDT",
      address: "0xde52040146a8e493de5d741feaa503332fde065c",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0xb3044ecd780ab558d71c3ab4bb6984812cf1feb0",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0xd2fcbdd4e82097f782e1cbd3ccf976e03bff643c",
      decimals: 8,
    },
    {
      name: "BNB",
      address: "0x9e0025895c42c120315b58ada0745e94eb9b326b",
      decimals: 18,
    },
    {
      name: "SOL",
      address: "0xfc6792d43e1b2ad0182b2c0d1e33883acc6f1f1e",
      decimals: 9,
    },
    {
      name: "MATIC",
      address: "0x16c82b59a784c96d43081bb7ad576f5ce6f222ed",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x50a01c973199ef98f2213cddd3cfd60f093aba74",
      decimals: 6,
    },
    {
      name: "AVAX",
      address: "0x99e756cc738e092287611ec8b60ae3531c913e53",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0xf1a16c2bc968ee4cb4b1e2f3e09d7c731e3f2da0",
      decimals: 18,
    },
    {
      name: "NEAR",
      address: "0x0c9f28fbdfd79f7c00b805d8c63d053c146d282c",
      decimals: 24,
    },
    {
      name: "ATOM",
      address: "0x0b35d852dcb8b59eb1e8d3182ebad4e96e2df8f0",
      decimals: 6,
    },
    {
      name: "LUNC",
      address: "0xed11c9bcf69fdd2eefd9fe751bfca32f171d53ae",
      decimals: 6,
    },
    { name: "KLAY", address: nullAddress, decimals: 18 },
    {
      name: "WEMIX",
      address: "0x5096db80b21ef45230c9e423c373f1fc9c0198dd",
      decimals: 18,
    },
    {
      name: "KLEVA",
      address: "0x5fff3a6c16c2208103f318f4713d4d90601a7313",
      decimals: 18,
    },
    {
      name: "BORA",
      address: "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa",
      decimals: 18,
    },
    {
      name: "KSP",
      address: "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654",
      decimals: 18,
    },
    {
      name: "KFI",
      address: "0xdb116e2dc96b4e69e3544f41b50550436579979a",
      decimals: 18,
    },
    {
      name: "LUNA",
      address: "0xed11c9bcf69fdd2eefd9fe751bfca32f171d53ae",
      decimals: 6,
    },
  ],
  optimism: [
    {
      name: "USDT",
      address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      decimals: 6,
    },
    { name: "ETH", address: nullAddress, decimals: 18 },
    {
      name: "BTC",
      address: "0x68f180fcce6836688e9084f035309e29bf0a2095",
      decimals: 8,
    },
    {
      name: "LINK",
      address: "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6",
      decimals: 18,
    },
    {
      name: "SNX",
      address: "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
      decimals: 6,
    },
    {
      name: "BUSD",
      address: "0x9c9e5fd8bbc25984b178fdce6117defa39d2db39",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      decimals: 18,
    },
    {
      name: "MKR",
      address: "0xab7badef82e9fe11f6f33f87bc9bc2aa27f2fcb5",
      decimals: 18,
    },
    {
      name: "OP",
      address: "0x4200000000000000000000000000000000000042",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x68f180fcce6836688e9084f035309e29bf0a2095",
      decimals: 8,
    },
    {
      name: "UNIDX",
      address: "0x5d47baba0d66083c52009271faf3f50dcc01023c",
      decimals: 18,
    },
    {
      name: "VELO",
      address: "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05",
      decimals: 18,
    },
    {
      name: "L2DAO",
      address: "0xd52f94df742a6f4b4c8b033369fe13a41782bf44",
      decimals: 18,
    },
    {
      name: "SONNE",
      address: "0x1db2466d9f5e10d7090e7152b68d62703a2245f0",
      decimals: 18,
    },
    {
      name: "AELIN",
      address: "0x61baadcf22d2565b0f471b291c475db5555e0b76",
      decimals: 18,
    },
    {
      name: "KWENTA",
      address: "0x920cf626a271321c151d027030d5d08af699456b",
      decimals: 18,
    },
    {
      name: "OPX",
      address: "0xcdb4bb51801a1f399d4402c61bc098a72c382e65",
      decimals: 18,
    },
    {
      name: "LYRA",
      address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
      decimals: 18,
    },
    {
      name: "HND",
      address: "0x10010078a54396f62c96df8532dc2b4847d47ed3",
      decimals: 18,
    },
  ],
  ethpow: [
    {
      name: "USDT",
      address: "0x2ad7868ca212135c6119fd7ad1ce51cfc5702892",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0x34a9c05b638020a07bb153bf624c8763bf8b4a86",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x4bbd68d8b1f25ae7b460e3347c637fe9e7338e0c",
      decimals: 8,
    },
    {
      name: "BNB",
      address: "0xbd1563046a90f18127fd39f3481fd8d6ab22877f",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x25de68ef588cb0c2c8f3537861e828ae699cd0db",
      decimals: 6,
    },
    {
      name: "BUSD",
      address: "0xf61eb8999f2f222f425d41da4c2ff4b6d8320c87",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0x0b35d852dcb8b59eb1e8d3182ebad4e96e2df8f0",
      decimals: 18,
    },
    {
      name: "DOGE",
      address: "0x3562ddf1f5ce2c02ef109e9d5a72e2fdb702711d",
      decimals: 8,
    },
    { name: "ETHW", address: nullAddress, decimals: 18 },
    {
      name: "BHC",
      address: "0x0c9f28fbdfd79f7c00b805d8c63d053c146d282c",
      decimals: 18,
    },
  ],
  canto: [
    {
      name: "USDT",
      address: "0x3fca6743e2fb55759fee767f3a68b2c06d699dc4",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0xfe668a3d6f05e7799aae04659fc274ac00d094c0",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x5b7f5628814c2e5d31c11d10cfe27c5cbcb174f7",
      decimals: 6,
    },
    {
      name: "ATOM",
      address: "0x71319ee6f41598412701f0d3e987bb1d74921fb3",
      decimals: 6,
    },
    { name: "CANTO", address: nullAddress, decimals: 18 },
    {
      name: "NOTE",
      address: "0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503",
      decimals: 18,
    },
  ],
  core: [
    {
      name: "USDT",
      address: "0x9ebab27608bd64aff36f027049aecc69102a0d1e",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0x15dc8168aa893ee5abf46778ae99fd7ed9225914",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0xe4610f0194a82f23c82b07415330fc4ee9282b5b",
      decimals: 8,
    },
    {
      name: "USDC",
      address: "0x3fca6743e2fb55759fee767f3a68b2c06d699dc4",
      decimals: 6,
    },
    { name: "CORE", address: nullAddress, decimals: 18 },
    {
      name: "LFG",
      address: "0xf7a0b80681ec935d6dd9f3af9826e68b99897d6d",
      decimals: 18,
    },
    {
      name: "CID",
      address: "0x000000000e1d682cc39abe9b32285fdea1255374",
      decimals: 18,
    },
  ],

  fantom: [
    {
      name: "ETH",
      address: "0x74b23882a30290451a17c44f4f05243b6b58c76d",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
      decimals: 6,
    },
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    {
      name: "BIFI",
      address: "0xd6070ae98b8069de6b494332d1a1a81b6179d960",
      decimals: 18,
    },
    { name: "FTM", address: nullAddress, decimals: 18 },
    {
      name: "DAI",
      address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
      decimals: 18,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "ALPACA",
      address: "0xad996a45fd2373ed0b10efa4a8ecb9de445a4302",
      decimals: 18,
    },
    {
      name: "BOO",
      address: "0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
      decimals: 18,
    },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "FRAX",
      address: "0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
      decimals: 18,
    },
    {
      name: "FXS",
      address: "0x82f8cb20c14f134fe6ebf7ac3b903b2117aafa62",
      decimals: 18,
    },
    {
      name: "HEC",
      address: "0x5c4fdfc5233f935f20d2adba572f770c2e377ab0",
      decimals: 9,
    },
    {
      name: "HEX",
      address: "0x5c4fdfc5233f935f20d2adba572f770c2e377ab0",
      decimals: 8,
    },
    {
      name: "ICE",
      address: "0xf16e81dce15b08f326220742020379b855b87df9",
      decimals: 18,
    },
    {
      name: "LQDR",
      address: "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9",
      decimals: 18,
    },
    {
      name: "MIM",
      address: "0x82f0b8b456c1a451378467398982d4834b6829c1",
      decimals: 18,
    },
    {
      name: "MULTI",
      address: "0x9fb9a33956351cf4fa040f65a13b835a3c8764e3",
      decimals: 18,
    },
    {
      name: "PROTO",
      address: "0xa23c4e69e5eaf4500f2f9301717f12b578b948fb",
      decimals: 18,
    },
    // {
    //   "name": "REN",
    //   "address": "0x408e41876cccdc0f92210600ef50372656052a38",
    //   "decimals": 18
    // },
    {
      name: "SCREAM",
      address: "0xe0654c8e6fd4d733349ac7e09f6f23da256bf475",
      decimals: 18,
    },
    {
      name: "SPA",
      address: "0x5602df4a94eb6c680190accfa2a475621e0ddbdc",
      decimals: 9,
    },
    {
      name: "SPELL",
      address: "0x468003b688943977e6130f4f68f23aad939a1040",
      decimals: 18,
    },
    {
      name: "SPIRIT",
      address: "0x5cc61a78f164885776aa610fb0fe1257df78e59b",
      decimals: 18,
    },
    {
      name: "SYN",
      address: "0xe55e19fb4f2d85af758950957714292dac1e25b2",
      decimals: 18,
    },
    {
      name: "TAROT",
      address: "0xc5e2b037d30a390e62180970b3aa4e91868764cd",
      decimals: 18,
    },
    {
      name: "TOMB",
      address: "0x6c021ae822bea943b2e66552bde1d2696a53fbb7",
      decimals: 18,
    },
    {
      name: "TOR",
      address: "0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e",
      decimals: 18,
    },
    {
      name: "TSHARE",
      address: "0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37",
      decimals: 18,
    },
    {
      name: "WOO",
      address: "0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a",
      decimals: 18,
    },
    {
      name: "YOSHI",
      address: "0x3dc57b391262e3aae37a08d91241f9ba9d58b570",
      decimals: 18,
    },
    {
      name: "CREAM",
      address: "0x657a1861c15a3ded9af0b6799a195a249ebdcbc6",
      decimals: 18,
    },
    {
      name: "DEI",
      address: "0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3",
      decimals: 18,
    },
    {
      name: "WMEMO",
      address: "0xddc0385169797937066bbd8ef409b5b3c0dfeb52",
      decimals: 18,
    },
    {
      name: "MIDAS",
      address: "0xb37528da6b4d378305d000a66ad91bd88e626761",
      decimals: 18,
    },
    {
      name: "STG",
      address: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
      decimals: 18,
    },
    {
      name: "KP3R",
      address: "0x2a5062d22adcfaafbd5c541d4da82e4b450d4212",
      decimals: 18,
    },
    {
      name: "DEUS",
      address: "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44",
      decimals: 18,
    },
    {
      name: "MOD",
      address: "0xe64b9fd040d1f9d4715c645e0d567ef69958d3d9",
      decimals: 18,
    },
    {
      name: "MCRT",
      address: "0xe705af5f63fcabdcdf5016aa838eaaac35d12890",
      decimals: 9,
    },
    {
      name: "CHARM",
      address: "0x248cb87dda803028dfead98101c9465a2fbda0d4",
      decimals: 18,
    },
    {
      name: "BEFTM",
      address: "0x7381ed41f6de418dde5e84b55590422a57917886",
      decimals: 18,
    },
    {
      name: "BRUSH",
      address: "0x85dec8c4b2680793661bca91a8f129607571863d",
      decimals: 18,
    },
    {
      name: "XRUNE",
      address: "0xe1e6b01ae86ad82b1f1b4eb413b219ac32e17bf6",
      decimals: 18,
    },
    {
      name: "DKNIGHT",
      address: "0x6cc0e0aedbbd3c35283e38668d959f6eb3034856",
      decimals: 18,
    },
    {
      name: "TREEB",
      address: "0xc60d7067dfbc6f2caf30523a064f416a5af52963",
      decimals: 18,
    },
    {
      name: "GEIST",
      address: "0xd8321aa83fb0a4ecd6348d4577431310a6e0814d",
      decimals: 18,
    },
    {
      name: "BAND",
      address: "0x46e7628e8b4350b2716ab470ee0ba1fa9e76c6c5",
      decimals: 18,
    },
    {
      name: "A4",
      address: "0x9767203e89dcd34851240b3919d4900d3e5069f1",
      decimals: 6,
    },
    {
      name: "LIF3",
      address: "0xbf60e7414ef09026733c1e7de72e7393888c64da",
      decimals: 18,
    },
    {
      name: "1ART",
      address: "0xd3c325848d7c6e29b574cb0789998b2ff901f17e",
      decimals: 18,
    },
    {
      name: "LIQR",
      address: "0x33333ee26a7d02e41c33828b42fb1e0889143477",
      decimals: 18,
    },
    {
      name: "YEL",
      address: "0xd3b71117e6c1558c1553305b44988cd944e97300",
      decimals: 18,
    },
    {
      name: "TRAVA",
      address: "0x477a9d5df9beda06f6b021136a2efe7be242fcc9",
      decimals: 18,
    },
    {
      name: "ABR",
      address: "0x543acd673960041eee1305500893260f1887b679",
      decimals: 18,
    },
    {
      name: "HEGIC",
      address: "0x44b26e839eb3572c5e959f994804a5de66600349",
      decimals: 18,
    },
    {
      name: "BEETS",
      address: "0xf24bcf4d1e507740041c9cfd2dddb29585adce1e",
      decimals: 18,
    },
    {
      name: "POTS",
      address: "0xf7554d17d1c3f09899dcc8b404becae6dfa584fa",
      decimals: 18,
    },
    {
      name: "TNODE",
      address: "0x7fc5670b2041d34414b0b2178fc660b1e1faf801",
      decimals: 18,
    },
    {
      name: "WSHEC",
      address: "0x94ccf60f700146bea8ef7832820800e2dfa92eda",
      decimals: 18,
    },
    {
      name: "ONI",
      address: "0x667c856f1a624baefe89fc4909c8701296c86c98",
      decimals: 18,
    },
    {
      name: "XY",
      address: "0x444444443b0fcb2733b93f23c910580fba52fffa",
      decimals: 18,
    },
    {
      name: "LSHARE",
      address: "0xcbe0ca46399af916784cadf5bcc3aed2052d6c45",
      decimals: 18,
    },
    {
      name: "RNDM",
      address: "0x87d57f92852d7357cf32ac4f6952204f2b0c1a27",
      decimals: 18,
    },
    {
      name: "SATA",
      address: "0x3ebb4a4e91ad83be51f8d596533818b246f4bee1",
      decimals: 18,
    },
    {
      name: "TETU",
      address: "0x65c9d9d080714cda7b5d58989dc27f897f165179",
      decimals: 18,
    },
    {
      name: "SFI",
      address: "0x924828a9fb17d47d0eb64b57271d10706699ff11",
      decimals: 18,
    },
    {
      name: "CHARGE",
      address: "0xe74621a75c6ada86148b62eef0894e05444eae69",
      decimals: 18,
    },
    {
      name: "WIGO",
      address: "0xe992beab6659bff447893641a378fbbf031c5bd6",
      decimals: 18,
    },
    {
      name: "UNIDX",
      address: "0x2130d2a1e51112d349ccf78d2a1ee65843ba36e0",
      decimals: 18,
    },
    {
      name: "MMY",
      address: "0x01e77288b38b416f972428d562454fb329350bac",
      decimals: 18,
    },
    {
      name: "IB",
      address: "0x00a35fd824c717879bf370e70ac6868b95870dfb",
      decimals: 18,
    },
    {
      name: "CONK",
      address: "0xb715f8dce2f0e9b894c753711bd55ee3c04dca4e",
      decimals: 18,
    },
    {
      name: "$CHILL",
      address: "0xe47d957f83f8887063150aaf7187411351643392",
      decimals: 18,
    },
  ],

  elastos: [
    {
      name: "FREE",
      address: "0xd92db487ebc36e53b757357bd5b848db5291e442",
      decimals: 18,
    },
    {
      name: "FMN",
      address: "0x1747c03d15f4ff72d4cd684769069d64206a37e7",
      decimals: 18,
    },
    { name: "ELA", address: nullAddress, decimals: 18 },
    {
      name: "ELK",
      address: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee",
      decimals: 18,
    },
    {
      name: "DIA",
      address: "0x2c8010ae4121212f836032973919e8aec9aeaee5",
      decimals: 18,
    },
    {
      name: "BUNNY",
      address: "0x75740fc7058da148752ef8a9adfb73966deb42a8",
      decimals: 18,
    },
  ],
  metis: [
    { name: "METIS", address: nullAddress, decimals: 18 },
    {
      name: "DOGE",
      address: "0xfe668a3d6f05e7799aae04659fc274ac00d094c0",
      decimals: 8,
    },
  ],
  ethereumclassic: [{ name: "ETC", address: nullAddress, decimals: 18 }],
  rsk: [
    { name: "RBTC", address: nullAddress, decimals: 18 },
    {
      name: "RIF",
      address: "0x2acc95758f8b5f583470ba265eb685a8f45fc9d5",
      decimals: 18,
    },
    {
      name: "RDOC",
      address: "0x2d919f19d4892381d58edebeca66d5642cef1a1f",
      decimals: 18,
    },
  ],
  telos: [{ name: "TLOS", address: nullAddress, decimals: 18 }],
  syscoin: [{ name: "SYS", address: nullAddress, decimals: 18 }],
  cube: [
    {
      name: "USDT",
      address: "0x79f1520268a20c879ef44d169a4e3812d223c6de",
      decimals: 18,
    },
    {
      name: "ETH",
      address: "0x57eea49ec1087695274a9c4f341e414eb64328c2",
      decimals: 18,
    },
    {
      name: "BTC",
      address: "0x040ea5c10e6ba4badb6c433a365ccc4968697230",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0x00f0d8595797943c12605cd59bc0d9f63d750ccf",
      decimals: 18,
    },
    {
      name: "DAI",
      address: "0x3a1f6e3e6f26e92bb0d07841eb68f8e84f39751e",
      decimals: 18,
    },
    { name: "CUBE", address: nullAddress, decimals: 18 },
    {
      name: "CORN",
      address: "0x6f8a58be5497c82e129b31e1d9b7604ed9b59451",
      decimals: 18,
    },
  ],
  cronos: [
    {
      name: "USDT",
      address: "0x66e428c3f67a68878562e79a0234c1f83c208770",
      decimals: 6,
    },
    {
      name: "ETH",
      address: "0xe44fd7fcb2b1581822d0c862b68222998a0c299a",
      decimals: 18,
    },
    {
      name: "BNB",
      address: "0xfa9343c3897324496a05fc75abed6bac29f8a40f",
      decimals: 18,
    },
    {
      name: "MATIC",
      address: "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055",
      decimals: 18,
    },
    {
      name: "USDC",
      address: "0xc21223249ca28397b4b6541dffaecc539bff0c59",
      decimals: 6,
    },
    {
      name: "AVAX",
      address: "0x765277eebeca2e31912c9946eae1021199b39c61",
      decimals: 18,
    },
    {
      name: "BUSD",
      address: "0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8",
      decimals: 18,
    },
    { name: "CRO", address: nullAddress, decimals: 18 },
    {
      name: "ATOM",
      address: "0xb888d8dd1733d72681b30c00ee76bde93ae7aa93",
      decimals: 6,
    },
    {
      name: "FACE",
      address: "0x3335508211d33195f7c961da8967e0447faceda0",
      decimals: 9,
    },
    {
      name: "VVS",
      address: "0x2d03bece6747adc00e1a131bba1469c15fd11e03",
      decimals: 18,
    },
    {
      name: "CRONA",
      address: "0xadbd1231fb360047525bedf962581f3eee7b49fe",
      decimals: 18,
    },
    {
      name: "TONIC",
      address: "0xdd73dea10abc2bff99c60882ec5b2b81bb1dc5b2",
      decimals: 18,
    },
    {
      name: "FIRA",
      address: "0x7aba852082b6f763e13010ca33b5d9ea4eee2983",
      decimals: 18,
    },
    {
      name: "CRK",
      address: "0x065de42e28e42d90c2052a1b49e7f83806af0e1f",
      decimals: 9,
    },
    {
      name: "Tiger",
      address: "0xd6597aa36dd90d7fccbd7b8a228f2d5cdc88ead0",
      decimals: 18,
    },
    {
      name: "MMO",
      address: "0x50c0c5bda591bc7e89a342a3ed672fb59b3c46a7",
      decimals: 18,
    },
    {
      name: "SWAPP",
      address: "0x245a551ee0f55005e510b239c917fa34b41b3461",
      decimals: 18,
    },
    {
      name: "GRVE",
      address: "0x9885488cd6864df90eeba6c5d07b35f08ceb05e9",
      decimals: 18,
    },
    {
      name: "SINGLE",
      address: "0x0804702a4e749d39a35fde73d1df0b1f1d6b8347",
      decimals: 18,
    },
    {
      name: "VSHARE",
      address: "0xdcc261c03cd2f33ebea404318cdc1d9f8b78e1ad",
      decimals: 18,
    },
    {
      name: "MIMAS",
      address: "0x10c9284e6094b71d3ce4e38b8bffc668199da677",
      decimals: 18,
    },
    {
      name: "VERSA",
      address: "0x00d7699b71290094ccb1a5884cd835bd65a78c17",
      decimals: 18,
    },
    {
      name: "FER",
      address: "0x39bc1e38c842c60775ce37566d03b41a7a66c782",
      decimals: 18,
    },
    {
      name: "LIQ",
      address: "0xabd380327fe66724ffda91a87c772fb8d00be488",
      decimals: 18,
    },
    {
      name: "MTD",
      address: "0x0224010ba2d567ffa014222ed960d1fa43b8c8e1",
      decimals: 18,
    },
    {
      name: "WBTC",
      address: "0x062e66477faf219f25d27dced647bf57c3107d52",
      decimals: 8,
    },
    {
      name: "ARGO",
      address: "0x47a9d630dc5b28f75d3af3be3aaa982512cd89aa",
      decimals: 18,
    },
    {
      name: "VNO",
      address: "0xdb7d0a1ec37de1de924f8e8adac6ed338d4404e9",
      decimals: 18,
    },
  ],
  fuse: [{ name: "FUSE", address: nullAddress, decimals: 18 }],
  dogechain: [{ name: "DOGE", address: nullAddress, decimals: 8 }],
};

function getTVLFunction(chain) {
  return async function tvl(timestamp, ethBlock, { [chain]: block }) {
    const balances = {};
    const tokensData = evmChains[chain];
    const tokens = tokensData.map((i) => i.address);
    return sumTokens2({ chain, block, tokens, owner: evmOwner });
  };
}

module.exports = {
  methodology: "All tokens locked in Allbridge contracts.",
  timetravel: false,
};

Object.keys(evmChains).forEach((chain) => {
  module.exports[chain] = {
    tvl: getTVLFunction(chain),
  };
});
