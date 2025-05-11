async function tvl(api) {
  const abis = {
    want: "function want() view returns (address)",
    balance: "function balance() external view returns (uint256)",
  };

  const vaults = [
    "0x25ddfB3831b5a1099932E4cA9CD2Ea9cB6665F1B",
    "0x32294e130181F31c6286B4B5AaA3697f538C3Bd7",
    "0x3ad7d10085C7243a19c6589056A58EB94334CB52",
    "0x43703b0FD253e1172A0F18e65d097bd7b120B7bf",
    "0x4606E0fED3Daa8D175274103e37C070dA70C53F4",
    "0x4fD28eabb44474aF1da36c7c4ea5441616D98076",
    "0xB2Be0a666d4c34ded06242178E8138F7CEc72100",
    "0xB761673116D7B1840CB94bbF7Adb673b4F4a18b4",
    "0xD1d9C7be232920BFD971b2F3B83b1C5EFe4B15d8",
    "0xD1FC69F097141189A4d46ee84E11992e6be87Cae",
    "0xeB244CC3Fc3C3ca391D453def40CF78eaf3B7373",
  ];

  const wants = await api.multiCall({ abi: abis.want, calls: vaults });
  const balances = await api.multiCall({ abi: abis.balance, calls: vaults });
  vaults.forEach((v, i) => {
    api.add(wants[i], balances[i]);
  });
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL accounts for all assets deposited into the Vaults.',
  mantle: { tvl },
};