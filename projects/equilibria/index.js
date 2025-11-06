const config = {
  ethereum: {
    pendleBooster: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    pendleProxy: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqb: "0xfE80D611c6403f70e5B1b9B722D2B3510B740B2B",
    vlEqb: "0xd8967B2B15b3CDF96039b7407813B4037f73ec27",
    pendle: "0x808507121b80c02388fad14726482e061b8da827",
    ePendle: "0x22Fc5A29bd3d6CCe19a06f844019fd506fCe4455",
    ePendleReward: "0x357F55b46821A6C6e476CC32EBB2674cD125e849",
  },
  arbitrum: {
    pendleBooster: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    pendleProxy: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqb: "0xBfbCFe8873fE28Dfa25f1099282b088D52bbAD9C",
    vlEqb: "0x70f61901658aAFB7aE57dA0C30695cE4417e72b9",
    pendle: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
    ePendle: "0x3EaBE18eAE267D1B57f917aBa085bb5906114600",
    ePendleReward: "0x9739d1E515C5291faA26D92a5D02761b6BbB4D6F",
  },
  bsc: {
    pendleBooster: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    pendleProxy: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqb: "0x374Ca32fd7934c5d43240E1e73fa9B2283468609",
    vlEqb: "0x0140dE476f49B6B42f7b73612b6dc317aB91D3BC",
    pendle: "0xb3Ed0A426155B79B898849803E3B36552f7ED507",
    ePendle: "0x898CA9B3ef8b6a30dA5fc7202f70E7992b3602B3",
    ePendleReward: "0xE2dB20ce7D845f99338BbA4bdFF00e733801Dde7",
  },
  optimism: {
    pendleBooster: "0x18C61629E6CBAdB85c29ba7993f251b3EbE2B356",
    pendleProxy: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    eqb: "0xaf3A6f67Af1624d3878A8d30b09FAe7915DcA2a0",
    vlEqb: "0x22Fc5A29bd3d6CCe19a06f844019fd506fCe4455",
    pendle: "0xBC7B1Ff1c6989f006a1185318eD4E7b5796e66E1",
    ePendle: "0x86a20111fEae36f3511A30c0640d2099b3A818C5",
    ePendleReward: "0x898CA9B3ef8b6a30dA5fc7202f70E7992b3602B3",
  },
  mantle: {
    pendleBooster: "0x920873E5b302A619C54c908aDFB77a1C4256A3B8",
    pendleProxy: "0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d",
    eqb: "0x3e7eF8f50246f725885102E8238CBba33F276747",
    vlEqb: "0x71e0ce200a10f0bBFB9F924fE466ACf0B7401EbF",
    pendle: "0xd27B18915e7acc8FD6Ac75DB6766a80f8D2f5729",
    ePendle: "0x6EE066b813cd8C2586D86F79eD0025e81801b923",
    ePendleReward: "0x741620136cf08a782c1Df1Fc9E3cAA760Cc4Fecc",
  },
  base: {
    pendleBooster: "0x2583A2538272f31e9A15dD12A432B8C96Ab4821d",
    pendleProxy: "0x920873E5b302A619C54c908aDFB77a1C4256A3B8",
    eqb: "0x010cd9b9be7E416E07793dc6Ce2F45868A80a50a",
    vlEqb: "0x70f61901658aAFB7aE57dA0C30695cE4417e72b9",
    pendle: "0xA99F6e6785Da0F5d6fB42495Fe424BCE029Eeb3E",
    ePendle: "0x741620136cf08a782c1Df1Fc9E3cAA760Cc4Fecc",
    ePendleReward: "0xB2D167EB1Fff17EbD727B0a21e7f5F50424264c8",
  },
  sonic: {
    pendleBooster: "0x920873E5b302A619C54c908aDFB77a1C4256A3B8",
    pendleProxy: "0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d",
    eqb: "0x9cacb579227d10a9fbe0951861b9fcb4847e8c6b",
    vlEqb: "0x71e0ce200a10f0bBFB9F924fE466ACf0B7401EbF",
    pendle: "0xf1eF7d2D4C0c881cd634481e0586ed5d2871A74B",
    ePendle: "0x6EE066b813cd8C2586D86F79eD0025e81801b923",
    ePendleReward: "0x741620136cf08a782c1Df1Fc9E3cAA760Cc4Fecc",
  },
  berachain: {
    pendleBooster: "0x18C61629E6CBAdB85c29ba7993f251b3EbE2B356",
    pendleProxy: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    eqb: "0xf9ee98099f5078078bb8e17e6b4a4f95137e2037",
    vlEqb: "0x22Fc5A29bd3d6CCe19a06f844019fd506fCe4455",
    pendle: "0xFf9c599D51C407A45D631c6e89cB047Efb88AeF6",
    ePendle: "0x7700eB46bB40163985C5337DE39704482aed33B1",
    ePendleReward: "0x2350Ea954113B1a1EeBAaCCC47f3a4985F709913",
  },
  hyperliquid: {
    pendleBooster: "0xad29951cdA3dcd0E570e65A6Ee34aa455C53421C",
    pendleProxy: "0x18C61629E6CBAdB85c29ba7993f251b3EbE2B356",
    eqb: "0x3CE8426DC0B90a36f0e20D7c2acaaF4578ad4e50",
    vlEqb: "0x357F55b46821A6C6e476CC32EBB2674cD125e849",
    pendle: "0xD6Eb81136884713E843936843E286FD2a85A205A",
    ePendle: "0x2350Ea954113B1a1EeBAaCCC47f3a4985F709913",
    ePendleReward: "0x500D5E0D9d7337963ed6449E81CB52928184d3d6",
  },
  plasma: {
    pendleBooster: "0xd6eCfD0d5f1Dfd3ad30f267a3a29b3E1bC4fd54f",
    pendleProxy: "0xfE80D611c6403f70e5B1b9B722D2B3510B740B2B",
    eqb: "0xD51d2517D11BFD7017C162A219D5E026F886Aef1",
    vlEqb: "0x4f1cDF43f5E407abD569878976960d4d0A3d3452",
    pendle: "0x17bac5f906c9a0282ac06a59958d85796c831f24",
    ePendle: "0xa6ec3C5A9124F9FD9CE02B24Ed41CfD3489f05C3",
    ePendleReward: "0x55F140ABbf87EF957263F04Ed75d1691980433A8",
  }
};

const abi = {
    "poolLength": "uint256:poolLength",
    "poolInfo": "function poolInfo(uint256) view returns (address market, address token, address rewardPool, bool shutdown)"
};

const { staking } = require('../helper/staking')

async function tvl(api) {
  const { pendleBooster, vlEqb, pendleProxy, pendle } = config[api.chain];

  if (api.chain === "ethereum") {
    const pendleLocked = await api.call({
      target: "0x4f30A9D41B80ecC5B94306AB4364951AE3170210",
      params: pendleProxy,
      abi: "erc20:balanceOf",
    });
    api.add(
      pendle,
      pendleLocked
    );
  }

  const poolInfos = await api.fetchList({
    lengthAbi: abi.poolLength,
    itemAbi: abi.poolInfo,
    target: pendleBooster,
  });
  const poolTokens = poolInfos.map(pool => pool.market);
  const blacklistedTokens = [];
  if (vlEqb) blacklistedTokens.push(vlEqb);
  return api.sumTokens({ tokens: poolTokens, owner: pendleProxy, blacklistedTokens });
}

Object.keys(config).forEach((chain) => {
  const { eqb, vlEqb, ePendle, ePendleReward } = config[chain];

  module.exports[chain] = {
    tvl,
  };

  const stakingContracts = [];
  const stakingTokens= [];
  if (eqb && vlEqb) {
    stakingContracts.push(vlEqb);
    stakingTokens.push(eqb);
  }

  if (ePendle && ePendleReward) {
    stakingContracts.push(ePendleReward);
    stakingTokens.push(ePendle);
  }

  if (stakingContracts.length) module.exports[chain].staking = staking(stakingContracts, stakingTokens);
});

module.exports.doublecounted = true;
