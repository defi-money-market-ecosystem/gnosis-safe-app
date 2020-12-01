import React, { useState } from "react"
import StyledTabs, { StyledTab } from "components/Tabs"
import Panel from "components/Panel"
import Minter from "components/Swapper/Minter"
import Redeemer from "components/Swapper/Redeemer"

const tabData = [
  {
    label: "Mint",
    tab: Minter,
  },
  {
    label: "Redeem",
    tab: Redeemer,
  },
]

const SwapPanel = () => {
  const [activeTab, setActiveTab] = useState(0)
  const TabPanel = tabData[activeTab].tab || "div"

  return (
    <Panel style={{ maxHeight: 285 }}>
      <StyledTabs
        value={activeTab}
        onChange={(e: React.ChangeEvent<{}>, newSelectedIndex: any) =>
          setActiveTab(newSelectedIndex)
        }
        aria-label="Swap Tabs"
        textColor="primary"
      >
        {tabData.map((tab) => (
          <StyledTab label={tab.label} key={tab.label} />
        ))}
      </StyledTabs>
      <TabPanel />
    </Panel>
  )
}

export default SwapPanel
