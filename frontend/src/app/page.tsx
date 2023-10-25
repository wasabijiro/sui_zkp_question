// app/page.tsx

"use client";

import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import { usePasscodeStore, useVerifierInputsStore } from "@/libs/store";

export default function Home() {
  const { passcode } = usePasscodeStore();
  const { verifierInputs, setVerifierInputs } = useVerifierInputsStore();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8080/generate-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: [2, 3, 6] }),
      });

      const data = await res.json();
      console.log({ data });
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col justify-center p-4">
      <header className="mb-10 flex justify-end items-start">
        <ConnectButton />
      </header>
    </div>
  );
}
