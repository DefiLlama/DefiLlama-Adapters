const ZENTEREST_LENS_ADDRESS = "0x491bF5613F23bfaF9a6Cc9B2CD6fedEBa7ab803e";

const zenTokens = [
  // zenETH
  {
    zenToken: "0x4F905f75F5576228eD2D0EA508Fb0c32a0696090",
    underlyingId: "ethereum",
  },
  // zenUSDT
  {
    zenToken: "0xF76cc2dc02F56B27761dBdb7a62e2B1C4a22aFcd",
    underlyingId: "tether",
  },
  // zenUSDC -
  {
    zenToken: "0x0968c90198f08b67365840fa37631b29fe2aa9fc",
    underlyingId: "usd-coin",
  },
  // zenWBTC -
  {
    zenToken: "0x5b4463bbd7b2e870601e91161e0f1f7f84cde214",
    underlyingId: "wrapped-bitcoin",
  },
  // zenCOMP -
  {
    zenToken: "0x3f2e9a93428a22d2f4cacc3f184f1aad85054e1c",
    underlyingId: "compound-governance-token",
  },
  // zenDAI -
  {
    zenToken: "0x3bafa9cd93c7bdc07fd9609e95e04a8904eacf7d",
    underlyingId: "dai",
  },
  // zenCREAM -
  {
    zenToken: "0x66d696474784ded49b5d0a43e50bf59d63402d74",
    underlyingId: "cream",
  },
  // zenOM -
  {
    zenToken: "0x11c70CAA910647d820bD014d676Dcd97EDD64A99",
    underlyingId: "mantra-dao",
  },
  // zenRFUEL -
  {
    zenToken: "0xf533c78c0790676008d576c5cc2e63e0856ed4f0",
    underlyingId: "rio-defi",
  },
  // zenLINK -
  {
    zenToken: "0x27d15446176b469ee7fbdec1e5a4b506fd77c0cd",
    underlyingId: "chainlink",
  },
  // zenAAVE -
  {
    zenToken: "0x57a8cb15e9575bf9bf80f3531183395703912f57",
    underlyingId: "aave",
  },
  // zenUNI -
  {
    zenToken: "0x391f902c8979050ba8036e3d61d13d79cf545db8",
    underlyingId: "uniswap",
  },
  // zenSUSHI -
  {
    zenToken: "0xb3c114d12cc260ff0a07a2cf22a910625367b403",
    underlyingId: "sushi",
  },
  // zenSNX -
  {
    zenToken: "0xc4bdaa3b4f2c9a78baa4442cd81874881850ff2e",
    underlyingId: "havven",
  },
  // zenYFI -
  {
    zenToken: "0xb595a7715d7d5a0252e5d3cdddfa2e1c7c1feebe",
    underlyingId: "yearn-finance",
  },
  // zenDSD -
  {
    zenToken: "0x1c1bb5efec38b1b01e0e72fa0c8521d695299b60",
    underlyingId: "dynamic-set-dollar",
  },
  // zenBONDLY -
  {
    zenToken: "0x53bafba543f8f1283ed5b21cafe7925c367ec3bd",
    underlyingId: "bondly",
  },
  // zenPOLS -
  {
    zenToken: "0x5b37c72dde4c4efc3e2eeff4107ef6eb61f5de10",
    underlyingId: "polkastarter",
  },
  // zen1INCH -
  {
    zenToken: "0x2ddfd56221568b6d4350b68432569a57bc1f9572",
    underlyingId: "1inch",
  },
  // zenRSR -
  {
    zenToken: "0xa0998fc7dcf51169d97a74f0b0b7d97e4af8e873",
    underlyingId: "reserve-rights-token",
  },
  // zenROYA -
  {
    zenToken: "0x0e0055bf26f4bdde57b112112e5db25d56706580",
    underlyingId: "royale",
  },
  // zenFTX -
  {
    zenToken: "0x650D62FCB1F22A10a2b810BFe305C1312a24A367",
    underlyingId: "ftx-token",
  },
  // zenSRM -
  {
    zenToken: "0x290a565ec7C28557AE872de2f3a5Ce500F46A5d2",
    underlyingId: "serum",
  },
  // zenBAL -
  {
    zenToken: "0x31b992fda33C6c52c602cF379B9bBe1745A903f7",
    underlyingId: "balancer",
  },
  // zenCRV -
  {
    zenToken: "0x144bdF52690c59B510DA5DBc09BB5f145FbdB8E1",
    underlyingId: "curve-dao-token",
  },
  // zenUMA -
  {
    zenToken: "0x1BAdCB0833072B986c845681D3C73603Adc5bA54",
    underlyingId: "uma",
  },
  // zenRUNE -
  {
    zenToken: "0x3bdBd2B661560Bcdf59BDC74576f65E2F714b836",
    underlyingId: "thorchain-erc20",
  },
  // zenFRAX -
  {
    zenToken: "0xa8e31aD81D609ff616645849987feF30A3FfABd9",
    underlyingId: "frax",
  },
  // zenHEGIC -
  {
    zenToken: "0x15Fcfd53fec9B72cF3725649F3eC4603077ad21e",
    underlyingId: "hegic",
  },
  // zenMPH -
  {
    zenToken: "0x4dD6D5D861EDcD361455b330fa28c4C9817dA687",
    underlyingId: "88mph",
  },
  // zenzLOT -
  {
    zenToken: "0x8eC3E4978E531565A46C22fbE0423Be1BB8E1156",
    underlyingId: "zlot",
  },
  // zenWHITE -
  {
    zenToken: "0xE3334e66634acF17B2b97ab560ec92D6861b25fa",
    underlyingId: "whiteheart",
  },
  // zenWNXM -
  {
    zenToken: "0xa07Be94D721DF448B63EC6C3160138A2b2619e1D",
    underlyingId: "wrapped-nxm",
  },
  // zenRENBTC -
  {
    zenToken: "0x7a665de4b80835295901dd84ece07e942a9fe400",
    underlyingId: "renbtc",
  },
  // zenBNT -
  {
    zenToken: "0x1b6d730a1dCAeB870BA3b0c6e51F801C1cCa0499",
    underlyingId: "bancor",
  },
  // zenKNC -
  {
    zenToken: "0x180087A6a87Fd6b09a78C9b9B87b71335906c61D",
    underlyingId: "kyber-network",
  },
  // zenCEL -
  {
    zenToken: "0xa6b8cbB493fe5682d627bdB9A6B361488086a2fD",
    underlyingId: "celsius-degree-token",
  },
  // zenCORN -
  {
    zenToken: "0x4E50972850822f8be8A034e23891B7063893Cc34",
    underlyingId: "cornichon",
  },
  // zenAPI3 -
  {
    zenToken: "0xA24c0E9195481821f9b5292E8c6A4209cc8cc3c9",
    underlyingId: "api3",
  },
  // zenMATIC -
  {
    zenToken: "0xa3968dAbF386D99F67c92c4E3c7cfDf2c0ccc396",
    underlyingId: "matic-network",
  },
  // zenBAO -
  {
    zenToken: "0x132E549262f2b2AD48AA306c3d389e55BB510419",
    underlyingId: "bao-finance",
  },
  // zenUST -
  {
    zenToken: "0xaB576bCBB0C3303C9e680fbFDeCa67e062eAE59c",
    underlyingId: "terrausd",
  },
  // zenDVG
  {
    zenToken: "0x07d22cd5d483b1242518d5cd26b21b552f0cfcdb",
    underlyingId: "daoventures",
  },
  // zenGRT
  {
    zenToken: "0x90ea640fd96b10d79b95166ea9d4b5fb2fb4f4be",
    underlyingId: "the-graph",
  },
  // zenOX
  {
    zenToken: "0x33a9f9bace23cfb8dad597a564d055ad415648ff",
    underlyingId: "0x",
  },
  // zenOMG
  {
    zenToken: "0x7283fe6ae81f39d07850b78f282037b65448a2bc",
    underlyingId: "omisego",
  },
  // zenINJ
  {
    zenToken: "0xd7756be9aedc211a9d5677d7d67295e6d7dd86c7",
    underlyingId: "injective-protocol",
  },
  // zenBADGER
  {
    zenToken: "0x4a5b823592c2a1e95502c0b55afba2397e71799d",
    underlyingId: "badger-dao",
  },
  // zenROOK
  {
    zenToken: "0xf9aea09993e1a43b5f7dcdbd67cda89690a51491",
    underlyingId: "rook",
  },
  // zenUTK
  {
    zenToken: "0x8fb35c58e48660a29c80452d3c7bf98fe81de921",
    underlyingId: "utrust",
  },
  // zenALPHA
  {
    zenToken: "0x49a39e062aaf28950f9d0d5fd423dfb3175c0bb1",
    underlyingId: "alpha-finance",
  },
  // zenRGT
  {
    zenToken: "0x223f6fc2696beeb0d096a72b8db674e6bd520398",
    underlyingId: "rari-governance-token",
  },
  // zenFXF
  {
    zenToken: "0x01A8F03E4EFb1ceF12D796d21468C5903A6ed5D6",
    underlyingId: "finxflo",
  },
  // zenKYL
  {
    zenToken: "0x6A4e7Daf7E1244944BDA17390B1ec5F44C9DF671",
    underlyingId: "kylin-network",
  },
  // zenPAID
  {
    zenToken: "0x2dD28391d7552363eED30eb172116cf3E13ECa23",
    underlyingId: "paid-network",
  },
  // zenENJ
  {
    zenToken: "0x25942b9496282ce18c3B8d8c722ccF8e5112b252",
    underlyingId: "enjincoin",
  },
  // zenLABS
  {
    zenToken: "0xaaB14c2115aaD338cEDb93e423834897651a3Ee2",
    underlyingId: "labs-group",
  },
];

module.exports = {
  zenTokens,
  ZENTEREST_LENS_ADDRESS,
};
