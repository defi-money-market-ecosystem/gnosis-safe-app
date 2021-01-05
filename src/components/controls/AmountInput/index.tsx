import React from "react"
import { BigNumberInput, BigNumberInputProps } from "big-number-input"
import {
  Box,
  Input,
  Link,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@material-ui/core"
import { hasLeadingZeros } from "utils"

const TokenSelect = styled(Select)({
  flexBasis: "100px",
  height: "40px",
  fontWeight: "lighter",
  "&.MuiInput-root .MuiInput-input": {
    padding: "10px 24px 10px 10px",
    height: "100%",
    boxSizing: "border-box",
  },
})

const StyledInput = styled(Input)({
  padding: "0 0 0 15px",
  margin: "0 0 5px",
  background: "#f6f8fb",
  borderRadius: "4px",
  "&$underline": {
    border: "none",
  },
})

const StyledTypography = styled(Typography)({
  padding: "10px 20px 10px 10px",
  height: "40px",
  boxSizing: "border-box",
})

const defaultTokens = ["ETH", "DAI"]

export interface AmountInputProps
  extends Omit<BigNumberInputProps, "onChange"> {
  tokens?: Array<string>
  selectedToken?: string
  fixedToken?: boolean
  onChange?: (value: string) => void
  onTokenChange?:
    | ((
        event: React.ChangeEvent<{
          name?: string | undefined
          value: unknown
        }>,
        child: React.ReactNode
      ) => void)
    | undefined
  onMaxButtonClick?: (event: React.MouseEvent<any, MouseEvent>) => void
  disabled?: boolean
}

const AmountInput = (props: AmountInputProps) => {
  const {
    tokens = defaultTokens,
    selectedToken: selectedTokenValue = "ETH",
    fixedToken = false,
    onTokenChange,
    onMaxButtonClick,
    onChange = () => {},
    disabled = false,
    ...inputProps
  } = props

  return (
    <Box>
      {!!onMaxButtonClick && (
        <div>
          <Link
            variant="caption"
            color="textPrimary"
            style={{ float: "right" }}
            underline="none"
            onClick={onMaxButtonClick}
            component="button"
            type="button"
          >
            MAX
          </Link>
        </div>
      )}
      <BigNumberInput
        onChange={onChange}
        {...inputProps}
        renderInput={(props: React.HTMLProps<HTMLInputElement>) => (
          <StyledInput
            inputProps={{
              ...props,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.currentTarget.value === ".") {
                  event.currentTarget.value = "0."
                } else if (hasLeadingZeros.test(event.currentTarget.value)) {
                  event.currentTarget.value =
                    event.currentTarget.value.replace(/^0+/, "") || "0"
                }

                props.onChange?.(event)
              },
            }}
            disabled={disabled}
            disableUnderline
            endAdornment={
              fixedToken ? (
                <StyledTypography>{selectedTokenValue}</StyledTypography>
              ) : (
                <TokenSelect
                  value={selectedTokenValue}
                  onChange={onTokenChange}
                  disableUnderline
                >
                  {tokens.map((token: string) => (
                    <MenuItem value={token} key={token}>
                      {token}
                    </MenuItem>
                  ))}
                </TokenSelect>
              )
            }
          />
        )}
      />
    </Box>
  )
}

export default AmountInput
