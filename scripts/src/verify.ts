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
  let txb = new TransactionBlock();
  txb.moveCall({
    target: `${pkgID}::verifier::issue_certificate`,
    typeArguments: [],
    arguments: [
      txb.pure(vk_bytes, "vector<u8>"),
      txb.pure(public_inputs_bytes, "vector<u8>"),
      txb.pure(proof_points_bytes, "vector<u8>"),
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
