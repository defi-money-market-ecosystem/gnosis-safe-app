import Big from "big.js"
import { Erc20Token } from "types"
import Swap, { SwapPropsType } from "components/Swapper"
import { connect } from "DmmContext"
import { changeToken, mint, reload } from "actions"
import NumberUtil from "utils/NumberUtil"
import { map } from "lodash"

export default connect<SwapPropsType>(
  ({ tokens, selectedToken, safeInfo, loading }) => ({
    tokenKeys: map(tokens, "symbol").sort(),
    tokens,
    tokenPair:
      selectedToken && tokens[selectedToken]
        ? [tokens[selectedToken]?.symbol, tokens[selectedToken]?.dmmTokenSymbol]
        : [],
    selectedToken,
    safeInfo,
    loading,
    balance: tokens?.[selectedToken]?.balance || "",
    exchangeRateBig: new Big(tokens?.[selectedToken]?.exchangeRate || "1").div(
      NumberUtil._1
    ),
    decimals: tokens?.[selectedToken]?.decimals || 18,
    description: "Mint your tokens into mTokens so it can earn interest.",
    actionLabel: "Mint",
  }),
  (dispatch, { selectedToken: token }) => ({
    reload: () => dispatch(reload()),
    changeToken: (newToken: string) =>
      dispatch(changeToken(newToken as Erc20Token)),
    action: (amount: string) => dispatch(mint(token, amount)),
  })
)(Swap)
