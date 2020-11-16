import React from "react"
import styled from "styled-components"
import SwapPanel from "./components/SwapPanel"

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1100px;

  display: flex;
  justify-items: space-between;
`

const App: React.FC = () => {
  return (
    <Container>
      <SwapPanel />
    </Container>
  )
}

export default App
