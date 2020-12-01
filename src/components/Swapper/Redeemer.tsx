import { MToken } from "types"
import { connect } from "DmmContext"
import { map } from "lodash"
import Big from "big.js"
import { changeToken, redeem, reload } from "actions"
import { REVERSE_M_TOKEN_MAP } from "consts"
import NumberUtil from "utils/NumberUtil"
import Swap, { SwapPropsType } from "components/Swapper"

export default connect<SwapPropsType>(
  ({ tokens, selectedToken, safeInfo, loading }) => ({
    tokenKeys: map(tokens, "dmmTokenSymbol")
      .filter((t) => !!t)
      .sort(),
    tokens,
    tokenPair:
      selectedToken && tokens[selectedToken]
        ? [tokens[selectedToken]?.dmmTokenSymbol, tokens[selectedToken]?.symbol]
        : [],
    selectedToken,
    safeInfo,
    loading,
    balance: tokens?.[selectedToken]?.dmmBalance || "",
    exchangeRateBig: new Big(NumberUtil._1).div(
      tokens?.[selectedToken]?.exchangeRate || "1"
    ),
    decimals: tokens?.[selectedToken]?.decimals || 18,
    description: "Redeem your mTokens back to tokens with interest.",
    actionLabel: "Redeem",
  }),
  (dispatch, { selectedToken: token }) => ({
    reload: () => dispatch(reload()),
    changeToken: (newToken: string) =>
      dispatch(changeToken(REVERSE_M_TOKEN_MAP[newToken as MToken])),
    action: (amount: string) => dispatch(redeem(token, amount)),
  })
)(Swap)
