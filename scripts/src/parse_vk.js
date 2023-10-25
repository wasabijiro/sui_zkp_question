"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sui_js_1 = require("@mysten/sui.js");
const fs_1 = __importDefault(require("fs"));
globalThis.fetch = fetch;
const loadLocalJSON = (filePath) => {
    try {
        return JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
    }
    catch (error) {
        console.error("Error loading local JSON file:", error);
        return null;
    }
};
const getKeypair = () => {
    const privatekey0x = process.env.SUI_PRIVATE_KEY;
    const privatekey = privatekey0x.replace(/^0x/, "");
    const privateKeyBase64 = Buffer.from(privatekey, "hex").toString("base64");
    return sui_js_1.Ed25519Keypair.fromSecretKey((0, sui_js_1.fromB64)(privateKeyBase64));
};
const setupTransactionBlock = (vk_bytes, public_inputs_bytes, proof_points_bytes) => {
    const pkgID = "0x550b6cc5e577fdab7b3a65e6e6beaef5594488ff13bb3c67b929d86059b0a15f";
    let txb = new sui_js_1.TransactionBlock();
    txb.moveCall({
        target: `${pkgID}::verifier::parse_pvk_from_vk`,
        typeArguments: [],
        arguments: [
            txb.pure(vk_bytes, "vector<u8>"),
        ],
    });
    return txb;
};
const main = async () => {
    const localData = loadLocalJSON('../utils/output_data.json');
    if (!localData)
        return;
    const { vk_bytes, public_inputs_bytes, proof_points_bytes } = localData;
    console.log({ vk_bytes, public_inputs_bytes, proof_points_bytes });
    const provider = new sui_js_1.JsonRpcProvider(new sui_js_1.Connection({
        fullnode: "https://sui-testnet.nodeinfra.com",
    }));
    const signer = new sui_js_1.RawSigner(getKeypair(), provider);
    const address = await signer.getAddress();
    console.log({ address });
    const txb = setupTransactionBlock(vk_bytes, public_inputs_bytes, proof_points_bytes);
    const dryRunResult = await signer.dryRunTransactionBlock({
        transactionBlock: txb,
    });
    console.log(dryRunResult);
    console.log("hello");
};
main();
