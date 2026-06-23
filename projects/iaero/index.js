const { sumTokens2 } = require('../helper/unwrapLPs');

// --- CONSTANTS ---
const AERO_TOKEN = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
const iAERO_TOKEN = '0x81034fb34009115f215f5d5f564aac9ffa46a1dc';
const VE_AERO_CONTRACT = '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4'; // Aerodrome Voting Escrow

const VAULT_ADDRESS = '0x180DAB53968e599Dd43CF431E27CB01AA5C37909';
const PEG_DEFENDER = '0x7961523a81cc89beb33f2f140255213a6433cdbd';

const POOL_V2 = '0x08d49da370ecffbc4c6fdd2ae82b2d6ae238affd';

// --- ABIs ---
const ABI = {
  // Standard
  balanceOf: "erc20:balanceOf",
  token0: "function token0() view returns (address)",
  token1: "function token1() view returns (address)",
  totalSupply: "function totalSupply() view returns (uint256)",
  tokenOfOwnerByIndex: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",

  // veAERO Specific
  ownerToNFTokenIdList: "function ownerToNFTokenIdList(address, uint256) view returns (uint256)",
  locked: "function locked(uint256) view returns (int128 amount, uint256 end)",

  // V2 Pool Reserves
  getReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
};

async function tvl(api) {

  await sumTokens2({ api, owner: PEG_DEFENDER, tokens: [POOL_V2], resolveLP: true })
  api.removeTokenBalance(iAERO_TOKEN)  // we dont treat project's own token as TVL


  // --- PART A: veAERO in Vault ---
  const vaultBalance = await api.call({ target: VE_AERO_CONTRACT, params: [VAULT_ADDRESS], abi: ABI.balanceOf });
  const calls = [];


  for (let i = 0; i < vaultBalance; i++) {
    calls.push({ target: VE_AERO_CONTRACT, params: [VAULT_ADDRESS, i] });
  }
  const vaultTokenIds = await api.multiCall({ abi: ABI.ownerToNFTokenIdList, calls });

    const lockedCalls = vaultTokenIds.map(id => ({ target: VE_AERO_CONTRACT, params: [id] }));
    const lockedData = await api.multiCall({ abi: ABI.locked, calls: lockedCalls });

    lockedData.forEach((data) => {
      api.add(AERO_TOKEN, data.amount);
    });
}

module.exports = {
  methodology: 'TVL includes veAERO locked in the protocol vault and V2 liquidity held by the Peg Defender. iAERO is priced internally via the AERO peg.',
  base: {
    tvl
  }
};