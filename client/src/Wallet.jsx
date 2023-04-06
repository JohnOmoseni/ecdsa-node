import { useRef } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, setPrivateKey }) {
  const inputRef = useRef();

  async function onChange(evt) {
    const privateKey = inputRef.current.value.trim();
    setPrivateKey(privateKey);

    try {
      const privateKeyToBytes = hexToBytes(privateKey);
      const publicKey = secp.getPublicKey(privateKeyToBytes);
      address = toHex(keccak256(publicKey.slice(1)).slice(-20));
      setAddress(address);

      console.log(toHex(publicKey), address);
    } catch (err) {
      console.log("Invalid private key: Expected 32 bytes of private key");
    }

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          ref={inputRef}
          placeholder="Type an address, for example: 0x1"
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
