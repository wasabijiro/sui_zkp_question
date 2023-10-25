import path from "path";
import * as snarkjs from "snarkjs";

export const generateProof = async (
  input0: number,
  input1: number,
  input2: number
): Promise<any> => {
  console.log(`Generating proof with inputs: ${input0}, ${input1}, ${input2}`);

  const inputs = {
    in: [input0, input1, input2],
  };

  // Paths to the .wasm file and proving key
  const wasmPath = path.join(
    process.cwd(),
    "../../circuits/build/multiplier_js/multiplier.wasm"
  );
  const provingKeyPath = path.join(
    process.cwd(),
    "../../circuits/build/proving_key.zkey"
  );

  try {
    console.log("generating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      provingKeyPath
    );

    console.log("proof generation done!");

    console.log({ proof });
    console.log({ publicSignals });

    return {
      proof: proof,
      publicSignals: publicSignals,
    };
  } catch (err) {
    console.log(`Error:`, err);
    return {
      proof: "",
      publicSignals: [],
    };
  }
};

generateProof(2, 3, 6);
