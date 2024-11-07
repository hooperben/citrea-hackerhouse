import { Wallet } from "ethers";
import { SimpleMerkleTree } from "../typechain-types";
import hre, { ethers } from "hardhat";

export const getTestingAPI = async () => {
  let simpleMerkleTree: SimpleMerkleTree;

  let alice: Wallet;
  let bob: Wallet;

  const [funder] = await hre.ethers.getSigners();

  const alice_private_key =
    "0x91b1ba753a83576e85b0bc41b3335e58a8f5a064bd4379c70b5295221277aa8e";
  const bob_private_key =
    "0x04b84dc399d3384bc4b7d5e88567160a897e0cd1bb382713c4db0f4a95d1825f";

  alice = new ethers.Wallet(alice_private_key, hre.ethers.provider);
  bob = new ethers.Wallet(bob_private_key, hre.ethers.provider);

  // Fund alice and bob with 10 ETH each
  await funder.sendTransaction({
    to: alice.address,
    value: ethers.parseEther("10.0"),
  });

  await funder.sendTransaction({
    to: bob.address,
    value: ethers.parseEther("10.0"),
  });

  // expect(alice.privateKey).equal(BigInt(alice_private_key));
  // expect(bob.privateKey).equal(BigInt(bob_private_key));

  const SimpleMerkleTree = await hre.ethers.getContractFactory(
    "SimpleMerkleTree",
  );
  simpleMerkleTree = await SimpleMerkleTree.deploy(5);

  return { simpleMerkleTree, alice, bob };
};

export const loadPoseidon = async () => {
  // Use Function constructor to avoid CommonJS static analysis
  const importModule = new Function(
    'return import("@aztec/foundation/crypto")',
  );
  const module = await importModule();
  return module.poseidon2Hash;
};