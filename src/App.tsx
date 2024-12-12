import { useQuery } from "@tanstack/react-query";
import { Preview } from "./preview";
// import { useEffect, useState } from "react";
const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=internet-computer,sonic-2&vs_currencies=inr`;
const fetchPrice = async () => {
  const response = await fetch(API_URL);

  // Check if the response is ok (status code 200-299)
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};

function App() {
  const { data } = useQuery<ApiResponse>({
    queryFn: fetchPrice,
    queryKey: ["price"],
    refetchInterval: 1000 * 60,
  });
  // const [s, set] = useState({ "sonic-2": { inr: Math.random() * 9 } });
  // useEffect(() => {
  //   setInterval(() => {
  //     set({ "sonic-2": { inr: Math.random() * 9 } });
  //   }, 1000);
  // }, []);

  return <>{data && <Preview {...data} />}</>;
}

export default App;
