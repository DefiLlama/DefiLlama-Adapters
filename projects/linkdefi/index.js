// projects/linkdefi/index.js

// Base 체인 Split4626 Vault 하나만 TVL로 잡는 간단 어댑터

const VAULT = '0x806Ea0e218d24410e24533fB68810440E3b618e1';

// 우리가 필요한 view 함수 2개만 미니 ABI로 정의
const VAULT_ABI = {
  asset: {
    name: 'asset',
    inputs: [],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  totalAssets: {
    name: 'totalAssets',
    inputs: [],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
};

// tvl(api) 함수: DefiLlama SDK가 api를 넣어줌
async function tvl(api) {
  // 1) 볼트 컨트랙트에서 underlying 토큰 주소 + totalAssets 읽기
  const [asset, totalAssets] = await Promise.all([
    api.call({ target: VAULT, abi: VAULT_ABI.asset }),
    api.call({ target: VAULT, abi: VAULT_ABI.totalAssets }),
  ]);

  // 2) TVL에 "asset 토큰을 totalAssets 만큼 보유"로 추가
  //    decimals 처리는 라마 쪽에서 알아서 해줌
  api.add(asset, totalAssets);
}

// DefiLlama가 읽어가는 export 형식
module.exports = {
  methodology:
    'Base 체인의 Split4626 Vault(0x806E...)에 예치된 underlying 자산 수량을 TVL로 카운트합니다.',
  // start 블록은 대충 대략적인 시작 블록 넣어도 되고, 모르면 생략해도 돌아감
  // start: 12345678,

  base: {
    tvl,
  },
};
