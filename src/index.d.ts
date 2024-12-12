type Symbols = "sonic-2" | "internet-computer";

type TokenIhaveType = {
  amount: number;
  symbol: Symbols;
};
type TokensToSwap = {
  symbol: Symbols;
};

type ApiResponse = {
  [K in Symbols]: { inr: number }; // Dynamically define the properties based on Symbols
};
