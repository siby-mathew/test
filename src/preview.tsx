import { Box, Button, Flex, Grid, HStack, Heading } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

const TOKENS_I_HAVE: TokenIhaveType = {
  amount: 3520.506,
  symbol: "sonic-2",
};

// const TOKEN_TO_SWAP: TokensToSwap = {
//   symbol: "internet-computer",
// };

const getStartValue = (initialValue: number) => {
  const valueFromStorage = localStorage.getItem("value");
  if (!valueFromStorage || isNaN(parseFloat(valueFromStorage))) {
    localStorage.setItem("value", initialValue.toString());
    return initialValue;
  }
  return parseFloat(valueFromStorage);
};

const getPriceChanges = (percentage: number) => {
  const history = localStorage.getItem("price");
  const formatted: string[] = history ? JSON.parse(history) : [];
  formatted.push(percentage.toString());
  localStorage.setItem("price", JSON.stringify(formatted.slice(-2)));
  return formatted.slice(-2);
};
const getThreshold = () => {
  const val = localStorage.getItem("thresh");
  return val ? parseFloat(val) : DEFAULT_THRESHOLD;
};
const DEFAULT_THRESHOLD = 20;
const Price: React.FC<{ priceChange: number }> = ({ priceChange }) => {
  const [color, setColor] = useState("green");
  const audio = useRef<HTMLAudioElement>(null);
  const [threshHold, setThresh] = useState(getThreshold());
  useEffect(() => {
    const [lastPrice, currentPrice] = getPriceChanges(priceChange);
    const p1 = parseFloat(lastPrice),
      p2 = parseFloat(currentPrice);
    if ((!p1 || !p2 || p2 >= p1) && p2 > 0) {
      setColor("green");
    } else {
      setColor("red");
    }

    if (priceChange > threshHold) {
      if (audio.current) {
        audio.current.play();
      }
    }
  }, [priceChange, threshHold]);

  const stop = () => {
    if (audio.current) {
      audio.current.pause();
    }
  };
  const play = () => {
    if (audio.current) {
      audio.current.play();
    }
  };

  const setThreshhold = () => {
    const val = prompt("Enter target", threshHold.toString());
    let thresh = threshHold || DEFAULT_THRESHOLD;
    if (val && parseFloat(val) > 0) {
      thresh = parseFloat(val);
    }
    localStorage.setItem("thresh", thresh.toString());
    setThresh(thresh);
  };
  return (
    <Box fontSize={250} fontWeight={"bold"} color={color}>
      <Button onClick={play}>Play</Button>
      <Button onClick={stop}>Stop</Button>

      <Button onClick={setThreshhold}>Alert When {threshHold}</Button>
      <audio loop src="../alarm.wav" controls ref={audio}></audio>
      {priceChange.toFixed(2)}
    </Box>
  );
};
export const Preview: React.FC<ApiResponse> = (data) => {
  const INR_VALUE = TOKENS_I_HAVE.amount * data[TOKENS_I_HAVE.symbol].inr;
  const [startValue] = useState(getStartValue(data[TOKENS_I_HAVE.symbol].inr));

  const priceChange = useMemo(() => {
    const price1 = startValue; // Old Value
    const price2 = data[TOKENS_I_HAVE.symbol].inr; // New Value

    // Calculate percentage change
    const percentageChange = ((price2 - price1) / price1) * 100;
    return percentageChange;
  }, [data, startValue]);

  return (
    <Grid gap={2} flexDirection={"row"}>
      <HStack>
        <Flex direction={"column"}>
          <Box>
            <Heading variant={"h1"}>TOKEN IN HAND</Heading>
          </Box>

          <Box>
            <Heading variant={"h2"}>
              {TOKENS_I_HAVE.amount} {TOKENS_I_HAVE.symbol}
            </Heading>
          </Box>
          <Box>
            <Heading variant={"h2"}>
              ₹{INR_VALUE} - ₹{data[TOKENS_I_HAVE.symbol].inr}
            </Heading>
          </Box>
        </Flex>
        <Flex>
          <Price priceChange={priceChange} />
        </Flex>
      </HStack>
    </Grid>
  );
};
