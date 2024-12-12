import { Box, Button, Flex, Grid, HStack, Heading } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

const TOKENS_I_HAVE: TokenIhaveType = {
  amount: 3520.506,
  symbol: "sonic-2",
};

const TOKEN_TO_SWAP: TokensToSwap = {
  symbol: "internet-computer",
};

const getStartValue = (initialValue: number) => {
  const valueFromStorage = localStorage.getItem("value");
  if (!valueFromStorage || isNaN(parseFloat(valueFromStorage))) {
    localStorage.setItem("value", initialValue.toString());
    return initialValue;
  }
  return parseFloat(valueFromStorage);
};

const getPriceChanges = (percentage?: number) => {
  const history = localStorage.getItem("price");
  const formatted: string[] = history ? JSON.parse(history) : [];
  if (percentage) formatted.push(percentage.toString());
  localStorage.setItem("price", JSON.stringify(formatted.slice(-2)));
  return formatted.slice(-2);
};
const getThreshold = () => {
  const val = localStorage.getItem("thresh");
  return val ? parseFloat(val) : DEFAULT_THRESHOLD;
};
const DEFAULT_THRESHOLD = 20;

const getIcp = () => {
  const icp = localStorage.getItem("icp") || "25";
  return parseFloat(icp);
};

const getPrice = () => {
  const icp = localStorage.getItem("pricetarget") || "0";
  return parseFloat(icp);
};
const Price: React.FC<{
  priceChange: number;
  swap: number;
  inr: number;
  initialPrice: number;
}> = ({ priceChange, swap, initialPrice, inr }) => {
  const [color, setColor] = useState("green");
  const audio = useRef<HTMLAudioElement>(null);
  const [threshHold, setThresh] = useState(getThreshold());
  const [targetICP, setIcp] = useState(getIcp());
  const [price, setPrice] = useState(getPrice());
  useEffect(() => {
    const [lastPrice, currentPrice] = getPriceChanges(priceChange);
    const p1 = parseFloat(lastPrice),
      p2 = parseFloat(currentPrice);
    if ((!p1 || !p2 || p2 >= p1) && p2 > 0) {
      setColor("green");
    } else {
      setColor("red");
    }

    if (priceChange > threshHold || priceChange < 5) {
      if (audio.current) {
        audio.current.play();
      }
    }
  }, [priceChange, threshHold]);

  const priceChangeAlert = useRef<HTMLAudioElement>(null);

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

  useEffect(() => {
    if (priceChangeAlert.current) {
      priceChangeAlert.current.play();
    }
  }, [color]);

  useEffect(() => {
    if (swap >= targetICP || inr >= price) {
      play();
    }
  }, [swap, targetICP, price, inr]);

  const setLocalStorageVal = (
    name: string,
    initialValue?: string | number,
    callback?: (value: number) => void
  ) => {
    const val = prompt("Enter value", initialValue?.toString() || "");
    if (val && parseFloat(val) > 0) {
      localStorage.setItem(name, parseFloat(val).toString());
      if (callback && "function" === typeof callback) callback(parseFloat(val));
      window.location.reload();
    }
  };

  const isPriceChange = inr >= price;
  const isIcpHit = swap >= targetICP;
  const percentageHit = priceChange > threshHold || priceChange < 5;
  return (
    <Box fontWeight={"bold"} color={color}>
      <Button onClick={play}>Play</Button>
      <Button onClick={stop}>Stop</Button>
      <Button
        onClick={() => {
          setLocalStorageVal("value", initialPrice);
        }}
      >
        Set initial Price {initialPrice}
      </Button>
      <Button
        onClick={() => {
          setLocalStorageVal("thresh", threshHold, (value) => {
            setThresh(value);
          });
        }}
      >
        Alert When {threshHold}
      </Button>
      <Button
        onClick={() => {
          setLocalStorageVal("icp", targetICP, (value) => setIcp(value));
        }}
      >
        ICP Alert {targetICP}
      </Button>

      <Button
        onClick={() => {
          setLocalStorageVal("pricetarget", price, (value) => setPrice(value));
        }}
      >
        Price Alert {price}
      </Button>
      <audio
        style={{ display: "none" }}
        loop
        src="../alarm.wav"
        controls
        ref={audio}
      ></audio>

      <audio
        style={{ display: "none" }}
        src="../price-drop-alert.wav"
        controls
        ref={priceChangeAlert}
      ></audio>
      <Box
        className={isPriceChange ? "blink-me" : ""}
        fontSize={140}
        color={"#000"}
      >
        {inr.toFixed(3)}
      </Box>
      <Box className={percentageHit ? "blink-me" : ""} fontSize={140}>
        {priceChange.toFixed(2)}%
      </Box>
      <Box
        className={isIcpHit ? "blink-me" : ""}
        fontSize={140}
        color={"#57467a"}
      >
        {swap.toFixed(3)} ICP
      </Box>
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

  const SWAP_WILL_GET = INR_VALUE / data[TOKEN_TO_SWAP.symbol].inr;
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
          <Box fontSize={100}>{SWAP_WILL_GET.toFixed(3)}</Box>
        </Flex>
        <Flex>
          <Price
            priceChange={priceChange}
            swap={SWAP_WILL_GET}
            inr={INR_VALUE}
            initialPrice={startValue}
          />
        </Flex>
      </HStack>
    </Grid>
  );
};
