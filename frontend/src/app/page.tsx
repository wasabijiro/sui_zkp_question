"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/zkquiz");
  }, []);

  return <div></div>;
};

export default Page;
