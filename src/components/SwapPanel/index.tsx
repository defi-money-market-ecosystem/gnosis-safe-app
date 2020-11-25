import React, { useState } from "react"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import styled from "styled-components"
import { Theme, withStyles } from "@material-ui/core"
import MintTab from "components/MintTab"
import RedeemTab from "components/RedeemTab"

interface StyledTabsProps {
  value: number
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void
}

interface SwapPanelProps {}

const Panel = styled.div`
  width: 500px;
  height: 292px;
  margin: ${(props) => props.theme.spacing(2)}rem;
  padding: ${(props) => props.theme.spacing(2)}rem;
  box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 8px -4px,
    rgba(0, 0, 0, 0.5) 1px 1px 4px -4px;
  border-radius: 5px;
`

const tabData = [
  {
    label: "Exchange",
    tab: "",
  },
  {
    label: "Mint",
    tab: MintTab,
  },
  {
    label: "Redeem",
    tab: RedeemTab,
  },
]

const StyledTabs = withStyles((theme: Theme) => ({
  indicator: {
    backgroundColor: theme.palette.primary.main,
    "& > span": {
      maxWidth: 40,
      width: "100%",
    },
  },
}))((props: StyledTabsProps) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />
))

const SwapPanel = (props: SwapPanelProps) => {
  const [activeTab, setActiveTab] = useState(1)
  const TabPanel = tabData[activeTab].tab || "div"

  return (
    <Panel>
      <StyledTabs
        value={activeTab}
        onChange={(e: React.ChangeEvent<{}>, newSelectedIndex: any) => {
          setActiveTab(newSelectedIndex)
          // reset numbers
        }}
        aria-label="Swap Tabs"
      >
        {tabData.map((tab) => (
          <Tab label={tab.label} key={tab.label} />
        ))}
      </StyledTabs>
      <TabPanel />
    </Panel>
  )
}

export default SwapPanel
