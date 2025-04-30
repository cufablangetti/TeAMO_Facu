import React, { useState } from 'react';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';

function App() {
  const [currentScreen, setCurrentScreen] = useState(1);

  const navigateToScreen2 = () => {
    setCurrentScreen(2);
  };

  return (
    <div className="app-container">
      {currentScreen === 1 ? (
        <Screen1 onNavigate={navigateToScreen2} />
      ) : (
        <Screen2 />
      )}
    </div>
  );
}

export default App;