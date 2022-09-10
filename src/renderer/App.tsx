import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

const Hello = () => {
  const handleGetData = () => {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
  };
  useEffect(() => {
    window.electron.ipcRenderer.once('status-update', (arg) => {
      // eslint-disable-next-line no-console
      console.log(arg);
    });
    window.electron.ipcRenderer.on('opperation-progress', (arg) => {
      // eslint-disable-next-line no-console
      console.log(arg);
    });
  }, []);
  return <div className="text-red-500 ">test</div>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
