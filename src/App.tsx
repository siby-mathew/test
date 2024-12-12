import { useQuery } from "@tanstack/react-query";
import { Preview } from "./preview";
import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
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
  const { data, isRefetching } = useQuery<ApiResponse>({
    queryFn: fetchPrice,
    queryKey: ["price"],
    refetchInterval: 1000 * 30,
    refetchOnMount: true,
  });

  const [updated, setUpdated] = useState(new Date());
  useEffect(() => {
    setUpdated(new Date());
  }, [isRefetching]);
  return (
    <Box>
      <Box>
        Updated At : {updated.toLocaleDateString()} at{" "}
        {updated.toLocaleTimeString()}
      </Box>
      {data && <Preview {...data} />}
    </Box>
  );
}

export default App;
