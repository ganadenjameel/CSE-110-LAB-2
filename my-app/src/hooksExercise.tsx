import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext, themes } from "./themeContext";

export function ClickCounter() {
  const [count, setCount] = useState(0);

  // Access the current theme from ThemeContext
  const theme = useContext(ThemeContext);

  const handleClick = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);

  return (
    <div
      style={{
        background: theme.background, // Use theme's background color
        color: theme.foreground,      // Use theme's foreground color
        padding: "20px",
        borderRadius: "5px",
      }}
    >
      <p>You clicked {count} times</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          background: theme.foreground, // Button's background should be theme's foreground
          color: theme.background,      // Button's text color should be theme's background
          padding: "10px 15px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Click me
      </button>
    </div>
  );
}

// Wrapper component to provide context
function ToggleTheme() {
  const [currentTheme, setCurrentTheme] = useState(themes.light);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === themes.light ? themes.dark : themes.light);
  };

  return (
    <ThemeContext.Provider value={currentTheme}>
      <button onClick={toggleTheme}> Toggle Theme </button>
      <ClickCounter />
    </ThemeContext.Provider>
  );
}

export default ToggleTheme;
