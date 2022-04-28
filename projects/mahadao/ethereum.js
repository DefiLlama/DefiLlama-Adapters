const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const chain = "ethereum";

const eth = {
  ethMahaSLP: "0xB73160F333b563f0B8a0bcf1a25ac7578A10DE96",
  ethMahaSLP2: "0xC0897d6Ba893E31F42F658eeAD777AA15B8f824d",
  ethMahaSushiStaking: "0x20257283d7B8Aa42FC00bcc3567e756De1E7BF5a",
  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  frax: "0x853d955acef822db058eb8505911ed77f175b99e",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  "arth.usd": "0x973F054eDBECD287209c36A2651094fA52F99a71",
  frxArthLP: "0x5a59fd6018186471727faaeae4e57890abc49b08",
  frxArthStaking: "0x7B2F31Fe97f32760c5d6A4021eeA132d44D22039"
}

const getBalanceOfLP = async (
  balances,
  lpAddress,
  tokenAddresses,
  tokenNames,
) => {

  const token1Balance = await balanceOf({
    target: tokenAddresses[0],
    owner: lpAddress,
    chain: 'ethereum'
  })

  const token2Balance = await balanceOf({
    target: tokenAddresses[1],
    owner: lpAddress,
    chain: 'ethereum'
  })

  if (tokenNames[0] == 'arth.usd')
    balances['arth'] = balances[tokenNames[0]] ? balances[tokenNames[0]] + (token1Balance.output / 1e18) / 2 : (token1Balance.output / 1e18) / 2
  else
    balances[tokenNames[0]] = balances[tokenNames[0]] ? balances[tokenNames[0]] + token1Balance.output / 1e18 : token1Balance.output / 1e18

  if (tokenNames[1] == 'arth.usd')
    balances['arth'] = balances[tokenNames[1]] ? balances[tokenNames[1]] + (token2Balance.output / 1e18) / 2 : (token2Balance.output / 1e18) / 2
  else
    balances[tokenNames[1]] = balances[tokenNames[1]] ? balances[tokenNames[1]] + token2Balance.output / 1e18 : token2Balance.output / 1e18

};


function pool2s() {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const balances = {};

    // calculate tvl for regular uniswap lp tokens
    await getBalanceOfLP(
      balances,
      eth.ethMahaSLP,
      [eth.weth, eth.maha],
      ['weth', 'mahadao']
    );

    await getBalanceOfLP(
      balances,
      eth.ethMahaSLP2,
      [eth.weth, eth.maha],
      ['weth', 'mahadao']
    );

    await getBalanceOfLP(
      balances,
      eth.frxArthLP,
      [eth.frax, eth['arth.usd']],
      ['frax', 'arth.usd']
    );

    return balances;
  };
}

async function getTVLv1(ret, troves, collaterals, chainBlocks) {
  const block = chainBlocks[chain];

  const tvls = await Promise.all(
    troves.map((trove) =>
      sdk.api.abi.call({
        target: trove,
        abi: getEntireSystemCollAbi,
        block,
        chain,
      })
    )
  );

  collaterals.forEach((collateral, index) => {
    let key = chain + ":" + collateral;
    let val = tvls[index].output;

    if (ret[key] == undefined) ret[key] = BigNumber(0);
    ret[key] = ret[key].plus(BigNumber(val));
  });

  return ret;
}

function getEthereumTvl() {
  return async (_, ethBlock, chainBlocks) => {
    const ret = {};


    await getTVLv1(
      ret,
      [
        // trove
        "0x4a47a8EB52c6213963727BF93baaa1CF66CBdF38", // FRAX Trove
      ],
      [
        // collaterals
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", // FRAX shares
      ],
      chainBlocks
    );

    return ret;
  };
}
module.exports = {
  pool2: pool2s(),
  tvl: getEthereumTvl(

  )
};
