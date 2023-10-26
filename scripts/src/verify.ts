import {
  Connection,
  Ed25519Keypair,
  fromB64,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
} from "@mysten/sui.js";
import * as fs from "fs";

globalThis.fetch = fetch;

const loadLocalJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error("Error loading local JSON file:", error);
    return null;
  }
};

const getKeypair = () => {
  const privatekey0x = process.env.SUI_PRIVATE_KEY as string;
  const privatekey = privatekey0x.replace(/^0x/, "");
  const privateKeyBase64 = Buffer.from(privatekey, "hex").toString("base64");
  return Ed25519Keypair.fromSecretKey(fromB64(privateKeyBase64));
};

const verifiedInputsSample = {
  vk: "a4326d5ff1474cd06ee11ca3433f804f662c781727e75b10e72f2493d881988606f99b8486f8b505983234f4c32b41d7e3d1fa3bffcbbc0892a7a54d072f452d5f18ad328d0f64de38523bd894b33a3b9162dc72bc8a41cf04796a20e527d1a6a568f44d4763c93d23ab4dc6eefe7670f82662e01a4b9745a1482372b72c3517f25db660e2098c3e6f6d69631aa9212b1ecff35e1f57a6742465fdeb57325e84977d59c92ddfebe18b10130e634408bf2a79d936ba26f113b512b3e2aaeecc245d8a89ddd962ec8666601e5c42ae6d203c9cc34f84f92383b81bd69982140e9b02000000000000000d9e05995d7910b0429876f28a640c831032650a817433907e8191243638518be23e2b067d1adaa05786f4f149a1dab9d760208843c7890ca82c79e46236bf92",
  public_inputs:
    "0000000000000000000000000000000000000000000000000000000000000000",
  proof_points:
    "263128d20958514e73e8ecb4a769ee5bb5f8707b12d7e2e34be916008000378f91c9c59a41076596a9ebb061a8af7d3e1174a1191ec3e4b77264ff0856df5512ccb3526df05fceae3e6b8609ab71ae3a32492ed235eaee514eca16f0b76de280faf174264fc960b12da5f17ea9ee3d71408399af42be2bf7190450ba75cace1d",
};

const setupTransactionBlock = (
  vk_bytes,
  public_inputs_bytes,
  proof_points_bytes
) => {
  const pkgID =
    "0xd8ef23f578e8652df24b871adbd92cb2a7248239405dce22621bf0224a2ef95d";
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${pkgID}::verifier::verify_proof`,
    typeArguments: [],
    arguments: [
      txb.pure(vk_bytes, "vector<u8>"),
      txb.pure(public_inputs_bytes, "vector<u8>"),
      txb.pure(proof_points_bytes, "vector<u8>"),
    ],
  });
  return txb;
};

const setupMintTransactionBlock = (
  vk_bytes,
  public_inputs_bytes,
  proof_points_bytes,
  name,
  descripton,
  url
) => {
  const pkgID =
    "0x6ddf191f62765f55265ba62bee40197ec7a127815e0d1a2402499d721aac75b4";
  console.log(Array.from(Buffer.from(verifiedInputsSample.vk, "hex")));
  console.log(
    Array.from(Buffer.from(verifiedInputsSample.public_inputs, "hex"))
  );
  console.log(
    Array.from(Buffer.from(verifiedInputsSample.proof_points, "hex"))
  );
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${pkgID}::verifier::issue_certificate`,
    typeArguments: [],
    arguments: [
      // txb.pure(vk_bytes, "vector<u8>"),
      // txb.pure(public_inputs_bytes, "vector<u8>"),
      // txb.pure(proof_points_bytes, "vector<u8>"),
      txb.pure(
        Array.from(Buffer.from(verifiedInputsSample.vk, "hex")),
        "vector<u8>"
      ),
      txb.pure(
        Array.from(Buffer.from(verifiedInputsSample.public_inputs, "hex")),
        "vector<u8>"
      ),
      txb.pure(
        Array.from(Buffer.from(verifiedInputsSample.proof_points, "hex")),
        "vector<u8>"
      ),
      txb.pure(name),
      txb.pure(descripton),
      txb.pure(url),
    ],
  });
  return txb;
};

const main = async () => {
  const localData = loadLocalJSON("../prover/output_data.json");
  if (!localData) return;

  const { vk_bytes, public_inputs_bytes, proof_points_bytes } = localData;
  console.log({ vk_bytes, public_inputs_bytes, proof_points_bytes });

  const provider = new JsonRpcProvider(
    new Connection({
      fullnode: "https://sui-testnet.nodeinfra.com",
    })
  );

  const signer = new RawSigner(getKeypair(), provider);
  const address = await signer.getAddress();
  console.log({ address });

  const txb = setupMintTransactionBlock(
    vk_bytes,
    public_inputs_bytes,
    proof_points_bytes,
    "wasabi",
    "wasabi's icon",
    "https://pbs.twimg.com/profile_images/1538981748478214144/EUjTgb0v_400x400.jpg"
  );
  const dryRunResult = await signer.dryRunTransactionBlock({
    transactionBlock: txb,
  });

  console.log(dryRunResult);

  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
  });
  console.log(result);

  console.log("hello");
};

main();
