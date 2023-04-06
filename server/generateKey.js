const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

// Generate a random private key
const privateKey = secp.utils.randomBytes();

// Get the associated public key from the generated private key
const publicKey = secp.getPublicKey(privateKey);

// Transform the public keyto an address
const address = keccak256(publicKey.slice(1)).slice(-20);

// Use the hex value of the address, public and private key
console.log(
  `Private-Key: ${toHex(privateKey)} \nPublic-Key: ${toHex(publicKey)} \nAddress: ${toHex(address)}`
);
