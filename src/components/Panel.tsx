import styled from "styled-components"

const Panel = styled.div`
  margin: ${(props: any) => props.theme.spacing(2)}rem;
  padding: ${(props: any) => props.theme.spacing(2)}rem;
  box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 8px -4px,
    rgba(0, 0, 0, 0.5) 1px 1px 4px -4px;
  border-radius: 5px;
`

export default Panel
