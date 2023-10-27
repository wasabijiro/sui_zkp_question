import type { VerifierInputs } from "@/types";
import { TransactionBlock } from "@mysten/sui.js";
import { PACKAGE_ID } from "@/config/sui";

const verifiedInputsSample: VerifierInputs = {
  vk: "c082896bf98f4cce77732dc5f0e69013e5bdbb9b2fdb6441b3d6dcf6410cf5176ba38baa9a4409b826b7e1b5772ea516074147865c8626ea57acb4efe1168b078017f533673b99e222da00e6119e8cdee361866ef4b8b1802c744a0ce7a627ae134c35e63dd5d8cc180465abe155b68f7d8a0f772b8a450eef985f5635c34821c907dc4ba9ce507f280fee54949e778296286be3355b1d46744b7415cef24d29cc10b89f623e5e961ad1c2e71244f504df059aee5ed1b33f212a27f5569fc1000601b8e6e4ec506dd77a0b77f151be65a4259f5a0d5795109abec9f98cdc9d270200000000000000d834513f4455d989da91d51892cb3a44995165036f9c040db4e72d37b91cd40ae8a005a6226fc0213203f83230c5b83e0c867e97c0cb458e36b0233b3c93342f",
  public_inputs:
    "01000000000000000000000000000000000000000000000000000000000000000000000000000000",
  proof_points:
    "890c80d78a10cd98e77d59fcff3a5e561edc98c27aa517b6f87d00f853e05d88a30b3b4b3cbaafd81f97ce98aa0f1be39480ebd4d7cd0960f52ec94995d3f0206ad500c6fcb816c017a5531ee949d2889f641c1d420bff9cfa2d19912ab1ea2c82fa55eeab217bf42d5128caba7daeac0e037253719526fad59206532c28c328",
};

export const createMintTransactionBlock = (props: {
  txb: TransactionBlock;
  // vk_bytes: string;
  // public_inputs_bytes: string;
  // proof_points_bytes: string;
  verifierInputs: VerifierInputs;
  name: string;
  descripton: string;
  url: string;
}) => {
  props.txb.moveCall({
    target: `${PACKAGE_ID}::verifier::issue_certificate`,
    typeArguments: [],
    arguments: [
      props.txb.pure(
        Array.from(Buffer.from(props.verifierInputs.vk, "hex")),
        "vector<u8>"
      ),
      props.txb.pure(
        Array.from(Buffer.from(props.verifierInputs.public_inputs, "hex")),
        "vector<u8>"
      ),
      props.txb.pure(
        Array.from(Buffer.from(props.verifierInputs.proof_points, "hex")),
        "vector<u8>"
      ),
      props.txb.pure(props.name),
      props.txb.pure(props.descripton),
      props.txb.pure(props.url),
    ],
  });
};

export const createVoteObject = (props: { txb: TransactionBlock }) => {
  props.txb.moveCall({
    target: `${PACKAGE_ID}::vote::new_vote`,
    typeArguments: [],
    arguments: [],
  });
};

export const movecallVoteA = (props: {
  txb: TransactionBlock;
  vote_obj: string;
}) => {
  props.txb.moveCall({
    target: `${PACKAGE_ID}::vote::vote_a`,
    typeArguments: [],
    arguments: [props.txb.pure(props.vote_obj)],
  });
};

export const movecallVoteB = (props: {
  txb: TransactionBlock;
  vote_obj: string;
}) => {
  props.txb.moveCall({
    target: `${PACKAGE_ID}::vote::vote_b`,
    typeArguments: [],
    arguments: [props.txb.pure(props.vote_obj)],
  });
};

// export const moveCallMintNft = async (props: {
//   txb: TransactionBlock;
//   name: string;
//   description: string;
//   url: string;
// }) => {
//   const moduleName = "dev_nft";
//   const methodName = "mint_to_sender";

//   props.txb.moveCall({
//     target: `${NFT_PACKAGE_ID}::${moduleName}::${methodName}`,
//     arguments: [
//       props.txb.pure(props.name),
//       props.txb.pure(props.description),
//       props.txb.pure(props.url),
//     ],
//   });
// };
