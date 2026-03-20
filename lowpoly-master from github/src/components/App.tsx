import React, { FC, useReducer } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Components
import Display from './Display';
import Controls from './Controls';

// Helpers
import theme from '../data/theme';
import defaults, { SettingsState } from '../data/defaults';
import StateContext from '../context/StateContext';
import DispatchContext from '../context/DispatchContext';

const GlobalStyles = createGlobalStyle`
    *,*::before,*::after {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    html {
      font-family: ${theme.fonts.base};
      color: #2d3640;
      background: radial-gradient(circle at top, #f5f7fa, #e6ebf1 55%);
      font-size: 16px;
    }

    a {
      color: ${theme.colours.primary};
      text-decoration: none;
      :hover {
        text-decoration: underline;
      }
    }

    button {
      outline: none !important;
      font-family: inherit;
    }

    input {
      font-family: inherit;
    }
`;

const Container = styled.div``;

const App: FC = () => {
  const [state, dispatch] = useReducer(
    (
      state2: {
        settings: SettingsState;
        output: string;
        outputJson: string;
        controlsOpen: boolean;
      },
      action: { type: string; payload?: any }
    ) => {
      switch (action.type) {
        case 'TOGGLE_CONTROLS':
          return { ...state2, controlsOpen: !state2.controlsOpen };
        case 'SET_DIMENSIONS':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              dimensions: action.payload,
            },
          };
        case 'SET_COLOURS':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              colour: action.payload,
            },
          };
        case 'SET_GEOMETRY':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              geometry: {
                ...state2.settings.geometry,
                [action.payload.option]: action.payload.value,
              },
            },
          };
        case 'SET_IMAGE':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              image: action.payload,
              useImage: true,
            },
          };
        case 'SET_USE_IMAGE':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              useImage: action.payload,
            },
          };
        case 'UPDATE_OUTPUT':
          return {
            ...state2,
            output: action.payload,
          };
        case 'UPDATE_OUTPUT_JSON':
          return {
            ...state2,
            outputJson: action.payload,
          };
        case 'NEW_SEED':
          return {
            ...state2,
            settings: {
              ...state2.settings,
              seed: action.payload,
            },
          };
        default:
          return state2;
      }
    },
    {
      settings: { ...defaults },
      output: '',
      outputJson: '',
      controlsOpen: false,
    }
  );

  const { settings, output, outputJson } = state;

  /**
   * Updates the output dataURI in state
   * @param {string} value The data URL for the generated canvas
   */
  const updateOutput = (value: { dataUrl: string; exportJson: string }) => {
    dispatch({ type: 'UPDATE_OUTPUT', payload: value.dataUrl });
    dispatch({ type: 'UPDATE_OUTPUT_JSON', payload: value.exportJson });
  };

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Container>
          <GlobalStyles />
          {state.settings ? (
            <>
              <Display settings={settings} updateOutput={updateOutput} />
              <Controls
                output={output}
                outputJson={outputJson}
                open={state.controlsOpen}
              />
            </>
          ) : null}
        </Container>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export default App;
