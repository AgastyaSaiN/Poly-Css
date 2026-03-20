import React, { FC } from 'react';
import styled from 'styled-components';
import theme, { topbar } from '../data/theme';

const StyledHeader = styled.header`
  background-color: #e5e9ef;
  padding: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 900;
    color: ${theme.colours.primary};
    margin: 0;
    line-height: ${topbar.height};
  }

  p {
    color: #5a6470;
  }
`;

const Header: FC = () => (
  <StyledHeader>
    <h1>LowPoly Generator</h1>
    <p>
      Create lowpoly images free to use in personal and commercial projects.
    </p>
  </StyledHeader>
);

export default Header;
