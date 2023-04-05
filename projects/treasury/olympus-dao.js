const { nullAddress, treasuryExports } = require("../helper/treasury");
const { blockQuery, graphQuery } = require("../helper/http");

const OHM = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
const gOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x6b175474e89094c44da98b954eedeac495271d0f", //DAI
      "0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0", //FXS - Staked (veFXS)
      "0xa693b19d2931d498c5b318df961919bb4aee87a5", //UST
      "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b", //TRIBE
      "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", //SushiSwap (SUSHI)
      "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490", //Curve 3Pool (3CRV)
      "0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c9", //Balancer V2 OHM-DAI Liquidity Pool
      "0x1a7e4e63778b4f12a199c062f3efdd288afcbce8", //agEUR
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //wETH
      "0x8798249c2e607446efb7ad49ec89dd1865ff4272", //SUSHI - Staked (xSUSHI)
      "0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a", //Redacted Cartel V1 (BTRFLY)
      "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad", //PrimeDAO (D2D)
      "0xed1480d12be41d92f36f5f7bdd88212e381a3677", //FDT
      "0xd533a949740bb3306d119cc777fa900ba034cd52", //Curve (CRV)
      "0x2e9d63788249371f1dfc918a52f8d799f4a38c94", //TOKE
      "0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d", //LQTY
      "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", //wstETH
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", //wBTC
      "0x742b70151cd3bc7ab598aaff1d54b90c3ebc6027", //Redacted Cartel V2 - Staked (rlBTRFLY)
      "0x5a98fcbea516cf06857215779fd812ca3bef1b32", //Lido (LDO)
      "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", //Convex (CVX)
      "0x0391d2021f89dc339f60fff84546ea23e337750f", //BarnBridge Governance (BOND)
      "0x0ef97ef0e20f84e82ec2d79cbd9eda923c3daf09", //Balancer V2 OHM-wstETH Liquidity Pool
      "0xa02d8861fbfd0ba3d8ebafa447fe7680a3fa9a93", //Balancer V2 OHM-WETH Liquidity Pool
      "0x0f2d719407fdbeff09d87557abb7232601fd9f29", //SYN
      "0xc770eefad204b5180df6a14ee197d99d808ee52d", //FOX
      "0xdbdb4d16eda451d0503b854cf79d55697f90c8df", //Alchemix (ALCX)
      "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", //FXS
      "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7", //Curve - Staked in Convex - Convex CRV Reward Pool (cvxCRV)
      "0x72a19342e8f1838460ebfccef09f6585e32db86e", //Convex - Vote-Locked (vlCVX)
      "0x81b0dcda53482a2ea9eb496342dc787643323e95", //Curve OHM-FraxBP - Staked in Frax
      "0x8a53ee42fb458d4897e15cc7dea3f75d0f1c3475", //Curve FraxBP - Staked in Frax
      "0xbe0f6478e0e4894cfb14f32855603a083a57c7da", //Curve FRAX3Pool - Staked in Convex - Convex FRAX3CRV Reward Pool (cvxFRAX3CRV)
      "0x5f98805a4e8be255a32880fdec7f6728c6568ba0", //LUSD
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
      "0xba100000625a3754423978a60c9317c58a424e3d", //Balancer - Rewards from auraBAL Staking Vault (BAL)
      "0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac", //Aura Finance - Vote-Locked (vlAURA)
      "0x616e8bfa43f920657b3497dbf40d6b1a02d4608d", //auraBAL - Staked in auraBAL Staking Vault
      "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68", //INV
    ],
    owners: [
      "0x83234a159dbd60a32457df158fafcbdf3d1ccc08", //Vendor Finance Allocator
      "0xde7b85f52577b113181921a7aa8fc0c22e309475", //VeFXS Allocator
      "0x9a315bdf513367c0377fb36545857d12e85813ef", //Treasury Wallet V3
      "0x31f8cc382c9898b273eff4e0b7626a6987c846e8", //Treasury Wallet V2
      "0x0483de8c11ee2f0538a29f0c294246677cbc92f5", //Tokemak Allocator
      "0xb339953fc028b9998775c00594a74dd1488ee2c6", //Myso Finance Allocator
      "0x5db0761487e26b555f5bfd5e40f4cbc3e1a7d11e", //Maker DSR Allocator Proxy
      "0x97b3ef4c558ec456d59cb95c65bfb79046e31fca", //LUSD Allocator
      "0x245cc372c84b3645bf0ffe6538620b04a217988b", //DAO Wallet
      "0xe06efa3d9ee6923240ee1195a16ddd96b5cce8f7", //Cross-Chain Polygon
      "0x2d643df5de4e9ba063760d475beaa62821c71681", //Convex vlCVX Allocator
      "0x75e7f7d871f4b5db0fa9b0f01b7422352ec9618f", //Convex Staking Proxy OHM-FraxBP
      "0x943c1dfa7da96e54242bd2c78dd3ef5c7b24b18c", //Convex Staking Proxy - FraxBP
      "0xdfc95aaf0a107daae2b350458ded4b7906e7f728", //Convex Allocato
      "0x408a9a09d97103022f53300a3a14ca6c3ff867e8", //Convex Allocator 2
      "0x3df5a355457db3a4b5c744b8623a7721bf56df78", //Convex Allocator 1
      "0xa8687a15d4be32cc8f0a8a7b9704a4c3993d9613", //Bophades Treasury
      "0xba42be149e5260eba4b82418a6306f55d532ea47", //Bond (Inverse) Depository
      "0x9025046c6fb25fb39e720d97a8fd881ed69a1ef6", //Bond Depository
      "0x8caf91a6bb38d55fb530dec0fab535fa78d98fad", //AURA Allocator V2
      "0x0d33c811d0fcc711bcb388dfb3a152de445be66f", //Aave Allocator V2
      "0x0e1177e47151be72e5992e0975000e73ab5fd9d4", //Aave Allocator V1
    ],
    ownTokens: [OHM, gOHM],
  },
  polygon: {
    tokens: [
      "0xb0c22d8d350c67420f06f48936654f567c73e8c8", //KlimaDAO - Staked (sKLIMA)
      "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89", //FRAX
    ],
    owners: ["0xe06efa3d9ee6923240ee1195a16ddd96b5cce8f7"], //Cross-Chain Polygon
    ownTokens: ["0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195"], //gOHM
  },
  arbitrum: {
    tokens: [
      "0x10393c20975cf177a3513071bc110f7962cd67da", //Jones
      "0xaa5bd49f2162ffdc15634c87a77ac67bd51c6a6d", //gOHM-wETH Liquidity Pool
      "0xa684cd057951541187f288294a1e1c2646aa2d24", //Vesta (VSTA)
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", //Wrapped ETH (wETH)
    ],
    owners: ["0x012bbf0481b97170577745d2167ee14f63e2ad4c"], //Cross-Chain Arbitrum
    ownTokens: ["0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1"], //gOHM
  },
  fantom: {
    tokens: [
      "0xf24bcf4d1e507740041c9cfd2dddb29585adce1e", //BEETS
      "0x841fad6eae12c286d1fd18d1d525dffa75c7effe", //BOO
      "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", //DAI
      "0xdc301622e621166bd8e82f2ca0a26c13ad0be355", //FRAX
      "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9", //LQDR
      "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", //wFTM
    ],
    owners: ["0x2bc001ffeb862d843e0a02a7163c7d4828e5fb10"], //Cross-Chain Fantom
    ownTokens: ["0x91fa20244fb509e8289ca630e5db3e9166233fdc"], //gOHM
  },
});
