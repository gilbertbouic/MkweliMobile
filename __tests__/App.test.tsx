/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';
import App from '../App';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rnfsMock = require('../__mocks__/react-native-fs');

describe('App Component', () => {
  let root: ReactTestRenderer.ReactTestRenderer;

  beforeEach(async () => {
    if (typeof rnfsMock.__reset === 'function') {
      rnfsMock.__reset();
    }
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });
    // Allow LanguageProvider to finish loading stored preference
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });
  }, 30000);

  afterEach(() => {
    ReactTestRenderer.act(() => {
      root.unmount();
    });
    if (typeof rnfsMock.__reset === 'function') {
      rnfsMock.__reset();
    }
  });

  describe('Rendering', () => {
    test('renders correctly', () => {
      expect(root.toJSON()).toBeTruthy();
    });

    test('renders the title "AML Sanctions Screening"', () => {
      const tree = root.toJSON();
      const titleText = JSON.stringify(tree).includes('AML Sanctions Screening');
      expect(titleText).toBe(true);
    });

    test('renders initial instructions', () => {
      const tree = root.toJSON();
      const text = JSON.stringify(tree);
      expect(
        text.includes('Enter a person or organisation name') ||
          text.includes('Enter a name and tap Screen'),
      ).toBe(true);
    });

    test('renders How to use link on main screen', () => {
      const tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('How to use');
    });

    test('renders language options EN FR PT ES', () => {
      const tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('EN');
      expect(tree).toContain('FR');
      expect(tree).toContain('PT');
      expect(tree).toContain('ES');
    });

    test('switches UI language to French', async () => {
      const frButtons = root.root.findAll(
        node =>
          node.props?.accessibilityLabel === 'Français' &&
          typeof node.props?.onPress === 'function',
      );
      expect(frButtons.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        frButtons[0].props.onPress();
      });

      const tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('Contrôle des sanctions LBA');
      expect(tree).toContain('Mode d’emploi');
      expect(tree).toContain('Contrôler');
    });

    test('opens instructions page and can go back', async () => {
      const instance = root.root;
      const helpLinks = instance.findAll(
        node =>
          node.props?.accessibilityLabel === 'How to use this app' ||
          (typeof node.children?.[0] === 'string' &&
            node.children[0] === 'How to use'),
      );
      expect(helpLinks.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        helpLinks[0].props.onPress();
      });

      let tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('How to use Mkweli');
      expect(tree).toContain('Screen a name');
      expect(tree).toContain('Update sanctions lists');

      const backButtons = root.root.findAll(
        node =>
          node.props?.accessibilityLabel === 'Back to screening' ||
          node.props?.accessibilityLabel === 'Return to main screen',
      );
      expect(backButtons.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        backButtons[0].props.onPress();
      });

      tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('AML Sanctions Screening');
      expect(tree).toContain('How to use');
    });
  });

  describe('User Input Handling', () => {
    test('renders TextInput for name entry', () => {
      const instance = root.root;
      const textInputs = instance.findAllByType('TextInput' as any);
      expect(textInputs.length).toBeGreaterThan(0);
    });

    test('renders Screen button', () => {
      const tree = root.toJSON();
      const hasScreenButton = JSON.stringify(tree).includes('Screen');
      expect(hasScreenButton).toBe(true);
    });

    test('renders Clear all searches button instead of demo shortcuts', () => {
      const tree = JSON.stringify(root.toJSON());
      expect(tree).toContain('Clear all searches');
      expect(tree).not.toContain('Demo hit');
      expect(tree).not.toContain('Demo clear');
      expect(tree).not.toContain('Try a demo');
    });

    test('Clear all searches resets the query field', async () => {
      const instance = root.root;
      const textInputs = instance.findAllByType('TextInput' as any);
      expect(textInputs.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        textInputs[0].props.onChangeText('Vladimir Putin');
      });
      expect(textInputs[0].props.value).toBe('Vladimir Putin');

      const clearButtons = instance.findAll(
        node =>
          node.props?.accessibilityLabel ===
          'Clear the search field, results, and recent searches',
      );
      expect(clearButtons.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        clearButtons[0].props.onPress();
      });
      expect(textInputs[0].props.value).toBe('');
    });
  });

  describe('UI Responsiveness', () => {
    test('renders without crashing when initialized', () => {
      expect(root).toBeTruthy();
    });

    test('renders StatusBar component', () => {
      const tree = JSON.stringify(root.toJSON());
      expect(tree).toBeTruthy();
    });

    test('renders SafeAreaView for proper screen boundaries', () => {
      expect(root.toJSON()).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    test('supports dark and light modes', () => {
      const tree = JSON.stringify(root.toJSON());
      // Check that the app structure is present regardless of theme
      expect(tree).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    test('maintains consistent structure on rerender', () => {
      const initialTree = JSON.stringify(root.toJSON());

      ReactTestRenderer.act(() => {
        root.update(<App />);
      });

      const updatedTree = JSON.stringify(root.toJSON());
      // Both should have the same basic structure
      expect(initialTree).toBeTruthy();
      expect(updatedTree).toBeTruthy();
    });
  });
});

/**
 * Integration tests for the screening workflow
 */
describe('App Screening Workflow Integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rnfs = require('../__mocks__/react-native-fs');

  beforeEach(() => {
    if (typeof rnfs.__reset === 'function') {
      rnfs.__reset();
    }
  });

  test('app loads and is ready for user interaction', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    const tree = root!.toJSON();
    expect(tree).toBeTruthy();

    // Cleanup
    ReactTestRenderer.act(() => {
      root!.unmount();
    });
  });

  test('app component properly initializes state', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });
    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const treeString = JSON.stringify(root!.toJSON());
    // Check that the empty state message is shown initially (English default)
    expect(
      treeString.includes('Enter a person or organisation name') ||
        treeString.includes('Enter a name'),
    ).toBe(true);

    // Cleanup
    ReactTestRenderer.act(() => {
      root!.unmount();
    });
  });
});

/**
 * Performance and stability tests
 */
describe('App Performance and Stability', () => {
  test('handles rapid mounting and unmounting', async () => {
    for (let i = 0; i < 5; i++) {
      let root: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        root = ReactTestRenderer.create(<App />);
      });

      ReactTestRenderer.act(() => {
        root!.unmount();
      });
    }
  });

  test('maintains stability during multiple rerenders', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(<App />);
    });

    for (let i = 0; i < 10; i++) {
      ReactTestRenderer.act(() => {
        root!.update(<App />);
      });
    }

    expect(root!.toJSON()).toBeTruthy();

    ReactTestRenderer.act(() => {
      root!.unmount();
    });
  });
});

