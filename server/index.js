const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  // private key: 0x0b633c603e44492ea2abdc58f42f8c48bdf6418f9afb212c80421d69597529d5
  // publicKey: 04d8bfe965b2b1fd4cd09d5b68224e12fae7b86b0439491de170f1b0569be07983df1a266edeefbd9af7c785ac0a7ab57727af48b615e601461a6c096691908b0b
  // address:  871e0bcfed414b0ed345fe366a607a5c3d48cac0
  "871e0bcfed414b0ed345fe366a607a5c3d48cac0": 75,

  // private key: 0x486e6f47fc36ca8371224a5682e5da69fc19fe50506a6041a0d7e23e94dcc74e
  // publicKey: 04a1d762bdfb4950389395a95401209eee9e54decac7e419361ce85eb93c5e826ccd02084a9fee090695c6707cf50a88ae745a3a4ac0c8972db6f54af724ad2ea1
  // address:  306763da0e8fd71aed49036db20dfc1b43d7056c
  "306763da0e8fd71aed49036db20dfc1b43d7056c": 100,

  // private key: 5fef25cce318e04263e86decacdb959d2b9b1204524b74b20cb1749e0168573e
  // public key: 045b22ca7664aa8247fea80f1b62ab651f4e3629e964ed5cd3d3672f30b663f658849bbf62e43031e5e536bacfa5e83a6256c2262333ab3454f75030977acfc84b
  // address:  62b7b2ea7a10894d9c36f314b9c029c28c2c19c3
  "62b7b2ea7a10894d9c36f314b9c029c28c2c19c3": 200,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;

  console.log(balances);
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { transaction, signature, recoveryBit } = req.body;

  // Hash the transaction received
  const hashMsg = keccak256(utf8ToBytes(transaction));
  // Convert the signature into Unit8Array type
  const sig = Uint8Array.from(Object.values(signature));
  // Recover the public key associated with the signature
  const publicKey = secp.recoverPublicKey(hashMsg, sig, recoveryBit);
  // Transform the public key to an address
  const address = toHex(keccak256(publicKey.slice(1)).slice(-20));

  // Validate the signature
  const isValid = secp.verify(sig, hashMsg, publicKey);
  if (!isValid) {
    console.log("Invalid Signature");
    return res.status(400).send({ message: "Invalid Signature!" });
  }

  // parse the transaction received from the client into an object
  const msg = JSON.parse(transaction);
  setInitialBalance(msg.sender);
  setInitialBalance(msg.recipient);

  if (msg.sender === address) {
    console.log("Valid ");
  } else {
    console.log("Invalid and not equal ");
  }

  if (balances[msg.sender] < msg.amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[msg.sender] -= msg.amount;
    balances[msg.recipient] += msg.amount;
    console.log({ balance: balances[msg.sender] });
    res.send({ balance: balances[msg.sender] });
  }
  console.log(address, isValid, msg.sender);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
