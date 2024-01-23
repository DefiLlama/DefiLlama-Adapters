const BigNumber = require("bignumber.js");

const FACTORY_ETH_CONTRACT = '0x91af681C85Ca98Efc5D69C1B62E6F435030969Db';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const FACTORY_IDSTOS_ABI = "function idSTOs() view returns (uint256)"; 
const FACTORY_STOTOKENS_ABI = "function stoTokens(uint256) view returns (address)"; 
const FACTORY_STOESCROWS_ABI = "function stoEscrows(uint256) view returns (address)"; 
const TOKEN_TOTALSUPPLY_ABI = "function totalSupply() view returns(uint256)";
const ESCROW_LATEST_OFFERING_ABI = "function issuanceIndex() view returns(uint256)";
const ESCROW_LATEST_PRICE_ABI = "function issuances(uint256) view returns(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)";
const ESCROW_PAYMENT_TOKEN_ABI = "function paymentToken() view returns(address)";

async function ethTVL(_, _1, _2, {api}) {

  const totalLenghtOfTokenizations = await api.call({
    target: FACTORY_ETH_CONTRACT,
    abi: FACTORY_IDSTOS_ABI,
    chain: 'ethereum'
  });

  let tokenAddress;
  let escrowAddress;
  let totalSupply;
  let latestPublicPrice;
  let paymentToken;
  let totalTVL = BigNumber(0);

  // Get list of all tokens/escrows and get their totalsupply and latest market price
  for(var i = 1; i<= totalLenghtOfTokenizations; i++) {
    // Get token address
    tokenAddress = await api.call({
      target: FACTORY_ETH_CONTRACT,
      abi: FACTORY_STOTOKENS_ABI,
      params: [i],
      chain: 'ethereum'
    });

    // Get escrow address
    escrowAddress = await api.call({
        target: FACTORY_ETH_CONTRACT,
        abi: FACTORY_STOESCROWS_ABI,
        params: [i],
        chain: 'ethereum'
    });

    // Get token total supply
    totalSupply = await api.call({
      target: tokenAddress,
      abi: TOKEN_TOTALSUPPLY_ABI,
      chain: 'ethereum'
    });

    if(BigNumber(totalSupply).isZero()) continue;

    // Get latest offering index
    latestOfferingIndex = await api.call({
      target: escrowAddress,
      abi: ESCROW_LATEST_OFFERING_ABI,
      chain: 'ethereum'
    });

    // Get latest public price
    latestPublicPrice = (await api.call({
      target: escrowAddress,
      abi: ESCROW_LATEST_PRICE_ABI,
      params: [latestOfferingIndex],
      chain: 'ethereum'
    }))[9];

    if(BigNumber(latestPublicPrice).isZero()) continue;

    // Make sure that the denomination is in either USDC or USDT
    // Will update this script to retrieve also from non-standard denominations
    paymentToken = await api.call({
      target: escrowAddress,
      abi: ESCROW_PAYMENT_TOKEN_ABI,
      chain: 'ethereum'
    });

    if(
      paymentToken == USDC_ADDRESS ||
      paymentToken == USDT_ADDRESS
    ) {
      // Multiply price by supply and cumulate
      totalTVL = totalTVL.plus(
        BigNumber(totalSupply).multipliedBy(BigNumber(latestPublicPrice))
      )
    } else {
      // TODO: retrieve price of the specific paymentToken by other sources
      // Right now there are no cases, but there will be.
    }
  }

  // totalTVL is now an amount of tokens (18 decimals) * their USD price (18 decimals)
  // We scale this down to 6 decimals and account for it as USDT
  totalTVL = totalTVL.dividedBy(1e30).integerValue(BigNumber.ROUND_CEIL); 

  api.add(USDT_ADDRESS, totalTVL)
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: ethTVL,
  },
  methodology: `We get the TVL as the sum of all total supplies of all tokens issued by our factory multiplied by the price of their latest public price.`
}; 