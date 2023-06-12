const nftsAndOwners = [
  ["0x5f0A4a59C8B39CDdBCf0C683a6374655b4f5D76e","0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"],
  ["0x32EcC1de70dCeCeEB5b745e9a039a12bA6ae7F42","0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6"],
  ["0x27e49962E2C8Ffd7cb7b4501fc2D967a1ec2ee7d","0x790B2cF29Ed4F310bf7641f013C65D4560d28371"],
  ["0x7514799CB447752D145b6D176a453F59375b2eE8","0xE012Baf811CF9c05c408e879C399960D1f305903"],
  ["0x7d0B6fB139408Af77f1c5bfdc8BD9166F5901304","0x60E4d786628Fea6478F785A6d7e704777c86a7c6"],
  ["0x25d6fe0d7bFB59924F08027eDA334073A552A400","0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B"],
  ["0x5eEAEF7D88D805AD080Bc6F8Fe5c22F4F0c4a7D2","0xED5AF388653567Af2F388E6224dC7C4b3241C544"],
  ["0x23012599f9ABBA61Cb1A62D3785af7E434F692C6","0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623"],
]
  
module.exports = {
  ethereum: {
    tvl: async function tvl(_, _b, _cb, { api, }) {
      
      const result = await api.multiCall({
        calls: nftsAndOwners.map(([owner,nft]) => ({
          target: nft,
          params: [owner],
        })),
        abi: "function balanceOf(address account) view returns (uint256)",
      })

      const balances = []
      nftsAndOwners.forEach((item,index)=>{
        balances[item[1]] = result[index]
      })

      return balances;
    }
  }
}
