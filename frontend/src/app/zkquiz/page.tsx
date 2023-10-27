"use client";

import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import { createMintTransactionBlock } from "@/libs/movecall";
import { usePasscodeStore, useVerifierInputsStore } from "@/libs/store";
import { TransactionBlock } from "@mysten/sui.js";
import { VerifierInputs } from "@/types";

export default function Home() {
  const { signAndExecuteTransactionBlock } = useWallet();

  const [num1, setNum1] = useState("0");
  const [num2, setNum2] = useState("0");
  const [answer, setAnswer] = useState("0");

  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");

  const [message, setMessage] = useState("");
  const { verifierInputs, setVerifierInputs } = useVerifierInputsStore();

  const fetchProofData = async (num1: number, num2: number, answer: number) => {
    const res = await fetch("http://localhost:8080/generate-proof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [num1, num2, answer] }),
    });

    return await res.json();
  };

  const exctuteMintNFT = async () => {
    setMessage("");
    setLoading(true);
    setMessage("Loading...");

    if (parseInt(num1) * parseInt(num2) !== parseInt(answer)) {
      setMessage("Incorrect answer. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const proofData: VerifierInputs = await fetchProofData(
        parseInt(num1),
        parseInt(num2),
        parseInt(answer)
      );

      console.log({ proofData });

      setMessage("Proof Generated!");

      const txb = new TransactionBlock();

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
      console.log(result.effects.status);
      setMessage("Mint Success!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      setDigest(result.digest);
      setUrl(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center p-4">
      <header className="mb-10 flex justify-end items-start">
        <ConnectButton />
      </header>

      <div className="flex mb-4 items-center justify-center">
        <input
          type="number"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          placeholder="Number 1"
          className="border p-2 mr-2"
        />
        <span className="mr-2">×</span>
        <input
          type="number"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          placeholder="Number 2"
          className="border p-2 mr-2"
        />
        <span className="mr-2">=</span>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          className="border p-2"
        />
      </div>

      <button
        className="mx-auto text-white bg-blue-500 rounded-md px-4 py-2"
        onClick={exctuteMintNFT}
        disabled={loading}
      >
        Mint
      </button>
      <div className="mt-4">
        {message}
        {message === "Mint Success!" && (
          <div className="mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {digest}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
