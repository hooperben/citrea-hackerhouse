import { expect } from "chai";
import { SimpleMerkleTree } from "../typechain-types";
import { Wallet } from "ethers";
import { MerkleTree } from "merkletreejs";
import { getTestingAPI, loadPoseidon } from "../helpers";

describe("Merkle Tree Test", function () {
  let simpleMerkleTree: SimpleMerkleTree;

  let alice: Wallet;
  let bob: Wallet;

  let poseidon2Hash: any;

  before(async () => {
    ({ alice, bob, simpleMerkleTree } = await getTestingAPI());

    poseidon2Hash = await loadPoseidon();

    const aliceBal = await alice.provider?.getBalance(alice.address);
    expect(aliceBal).equal(10000000000000000000n);
  });

  it("merkle tree changes should track", async () => {
    const emptyNote = poseidon2Hash([BigInt(57_69_240)]).toString();
    const emptyNotes = Array(32).fill(emptyNote);
    const noteHashes = emptyNotes;

    const hasherFn = (input: string) => {
      const [left, right] = [
        input.slice(0, input.length / 2) as unknown as Buffer,
        input.slice(input.length / 2) as unknown as Buffer,
      ];

      const leftBigInt = BigInt("0x" + left.toString("hex"));
      const rightBigInt = BigInt("0x" + right.toString("hex"));

      const hash = poseidon2Hash([leftBigInt, rightBigInt]).toString();
      return hash;
    };

    const tree = new MerkleTree(noteHashes, hasherFn, {
      sort: false,
      complete: true,
    });

    const root = tree.getRoot().toString("hex");

    expect(await simpleMerkleTree.isKnownRoot("0x" + root)).to.be.true;

    const btcAssetId = 69_57_420n;
    const notes = [
      [alice.address, 50n, btcAssetId],
      [alice.address, 100n, btcAssetId],
      [bob.address, 10n, btcAssetId],
      [alice.address, 69n, btcAssetId],
    ];

    const newNoteHashes = notes.map((note) =>
      poseidon2Hash([BigInt(note[0]), note[1], note[2]]).toString(),
    );

    console.log(BigInt(alice.address).toString(16));
    console.log(newNoteHashes[0]);

    tree.updateLeaf(0, newNoteHashes[0]);

    const newRoot = "0x" + tree.getRoot().toString("hex");

    await simpleMerkleTree.deposit(newNoteHashes[0], newRoot);

    expect(await simpleMerkleTree.isKnownRoot(newRoot)).to.be.true;
  });

  it("poseidon solidity test", async () => {
    const test = await simpleMerkleTree.poseidonHash2(12341241n, 12341241n);
    expect(test).eql(
      "0x0dd8218a93222c13ac6228d4190bc19d01234b5f99e33cc43a16cc0db0759e57",
    );
  });

  it("poseidon ts test", async () => {
    const test = await poseidon2Hash([12341241n, 12341241n]).toString();

    expect(test).eql(
      "0x0dd8218a93222c13ac6228d4190bc19d01234b5f99e33cc43a16cc0db0759e57",
    );
  });
});
