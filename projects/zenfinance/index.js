const ZENSTAKE_CONTRACT = "0x620B2367E630430C615ccF5CA02084c11995Fe25";
const ZENRECHARGE_CONTRACT = "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126";
const ARY_TOKEN = "0x41bc026dABe978bc2FAfeA1850456511ca4B01bc";
const ZENSWAP_CONTRACT = "0xEB401e50e30E770222bDeA6CA6938B237De1f3f9";

async function tvl(api) {
  // Get ARY staked in ZenStake
  const zenStakeBalance = await api.call({
    abi: "uint256:totalStaked",
    target: ZENSTAKE_CONTRACT,
  });
  
  // Add staked ARY from ZenStake
  api.add(ARY_TOKEN, zenStakeBalance);
  
  // Add all tokens from ZenRecharge and ZenSwap
  await api.sumTokens({ 
    owners: [ZENRECHARGE_CONTRACT, ZENSWAP_CONTRACT],
    resolveLP: true,
  });
}

module.exports = {
  methodology: "ZenFinance TVL includes ARY staked in ZenStake and ZenRecharge contracts, plus tokens held in ZenSwap for competitions",
  start: 1726238297, // Sep 13, 2025 - ZenStake deployment date
  cronos: {
    tvl,
  }
};
