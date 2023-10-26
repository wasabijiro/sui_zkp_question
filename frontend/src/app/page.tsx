// app/page.tsx

"use client";

import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import { createMintTransactionBlock } from "@/libs/movecall";
import { usePasscodeStore, useVerifierInputsStore } from "@/libs/store";
import { TransactionBlock } from "@mysten/sui.js";
import { VerifierInputs } from "@/types";

export default function Home() {
  const { signAndExecuteTransactionBlock } = useWallet();

  const [message, setMessage] = useState("");
  const { verifierInputs, setVerifierInputs } = useVerifierInputsStore();

  const fetchProofData = async () => {
    const res = await fetch("http://localhost:8080/generate-proof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [2, 3, 6] }),
    });

    return await res.json();
  };

  const exctuteMintNFT = async () => {
    const proofData: VerifierInputs = await fetchProofData();

    console.log({ proofData });

    const txb = new TransactionBlock();
    setMessage("");

    try {
      createMintTransactionBlock({
        txb,
        verifierInputs: proofData,
        name: "wasabi",
        descripton: "wasabi's icon",
        url: "https://pbs.twimg.com/profile_images/1538981748478214144/EUjTgb0v_400x400.jpg",
      });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint failed ${err}`);
    }
  };

  return (
    <div className="flex flex-col justify-center p-4">
      <header className="mb-10 flex justify-end items-start">
        <ConnectButton />
      </header>
      <button onClick={exctuteMintNFT}>NFTを発行</button>
    </div>
  );
}
