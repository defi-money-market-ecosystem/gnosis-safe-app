import React from "react"
import Tabs from "@material-ui/core/Tabs"
import { fade, Tab, Theme, withStyles } from "@material-ui/core"

export const StyledTab = withStyles((theme: Theme) => ({
  selected: {},
  disabled: {},
  root: {
    minWidth: 0,
    minHeight: 0,
    fontSize: 23,
    textTransform: "none",
    padding: 0,
    margin: "0 6px",
  },
  textColorPrimary: {
    color: fade(theme.palette.text.primary, 0.7),
    "&$selected": {
      color: theme.palette.text.primary,
    },
    "&$disabled": {
      color: theme.palette.text.primary,
    },
  },
}))(Tab)

const StyledTabs = withStyles((theme: Theme) => ({
  root: {
    minHeight: 0,
  },
  indicator: {
    backgroundColor: theme.palette.primary.main,
    width: "100%",
    maxWidth: (props: any) => props.indicatorSize || "none",
  },
}))(({ indicatorSize, ...props }: any) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />
))

export default StyledTabs
