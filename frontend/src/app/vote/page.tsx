"use client";

import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import {
  createVoteObject,
  movecallVoteA,
  movecallVoteB,
} from "@/libs/movecall";
import { usePasscodeStore, useVerifierInputsStore } from "@/libs/store";
import { TransactionBlock } from "@mysten/sui.js";
import { VerifierInputs } from "@/types";
import { PACKAGE_ID } from "@/config/sui";

export default function Home() {
  const { signAndExecuteTransactionBlock } = useWallet();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");
  const [objectId, setObjectId] = useState("");
  const [voted, setVoted] = useState(false);
  const [votedA, setVotedA] = useState(false);
  const [votedB, setVotedB] = useState(false);

  const getObjectId = (data: any, desiredObjectType: string): string | null => {
    for (const change of data.objectChanges) {
      if (change.objectType === desiredObjectType) {
        return change.objectId;
      }
    }
    return null;
  };

  const exctuteCreateObj = async () => {
    setMessage("");
    setLoading(true);
    setMessage("Loading...");
    try {
      const txb = new TransactionBlock();
      createVoteObject({ txb });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      const targetType = `${PACKAGE_ID}::vote::Vote`;
      console.log(result.effects.status);
      const objectId = getObjectId(result, targetType);
      console.log({ objectId });
      if (objectId !== null) {
        setObjectId(objectId as string);
      }
      setMessage("Shared Object Created!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      const obj_url = `https://suiexplorer.com/object/${objectId}?module=vote&network=testnet`;
      console.log(obj_url);
      setDigest(result.digest);
      setUrl(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const exctuteVoteA = async () => {
    setMessage("");
    if (!objectId || votedA || votedB) {
      setMessage("Please try again!");
      return;
    }
    setLoading(true);
    setMessage("Loading...");
    try {
      const txb = new TransactionBlock();
      movecallVoteA({
        txb,
        vote_obj: objectId,
      });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      console.log(result.effects.status);
      setMessage("A Voted!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      setDigest(result.digest);
      setUrl(url);
      setVotedA(true);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const exctuteVoteB = async () => {
    setMessage("");
    if (!objectId || votedA || votedB) {
      setMessage("Please try again!");
      return;
    }
    setLoading(true);
    setMessage("Loading...");
    try {
      const txb = new TransactionBlock();
      movecallVoteB({
        txb,
        vote_obj: objectId,
      });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      console.log(result.effects.status);
      setMessage("A Voted!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      setDigest(result.digest);
      setUrl(url);
      setVotedB(true);
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
      <button onClick={exctuteCreateObj} disabled={loading} className="">
        Create
      </button>
      <div className="">
        <button
          className={`mx-auto ${
            votedA ? "text-white bg-blue-500" : "text-black bg-white"
          } rounded-md px-4 py-2`}
          onClick={exctuteVoteA}
          disabled={loading}
        >
          Vote A
        </button>
        <button
          className={`mx-auto ${
            votedB ? "text-white bg-blue-500" : "text-black bg-white"
          } rounded-md px-4 py-2`}
          onClick={exctuteVoteB}
          disabled={loading}
        >
          Vote B
        </button>
      </div>
      <div className="mt-4">
        {message}
        {message !== "" && (
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
