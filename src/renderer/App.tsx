import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ClimbingBoxLoader, HashLoader } from 'react-spinners';
import './App.css';

const Main = () => {
  const [status, setStatus] = useState<string>();
  const [progress, setProgress] = useState<number>();
  useEffect(() => {
    window.electron.ipcRenderer.on('status-update', (arg) => {
      setStatus(arg as string);
    });
    window.electron.ipcRenderer.on('opperation-progress', (arg) => {
      setProgress(arg as number);
    });
  }, []);
  const handleTryAgain = () => {
    window.electron.ipcRenderer.sendMessage('fetch-data', [true]);
  };
  return (
    <div className="w-full h-screen bg-neutral-focus ">
      <div className="w-full flex h-full flex-col items-center justify-center py-32">
        {(status === 'ready' || !status) && (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <ClimbingBoxLoader size={20} color="#6941C6" />
            <h1 className="text-xl mt-5">Waiting for a request</h1>
            <p className="opacity-50 mt-1 text-center max-w-lg">
              To add a new account go to the main website and click on add
              account.
            </p>
          </div>
        )}
        {status === 'starting' && (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <HashLoader size={100} color="#6941C6" />
            <h1 className="text-xl mt-5">Packing Your Account&apos;s Data</h1>
            <p className="opacity-50 mt-1 text-center max-w-lg">
              This process may take sometime, depending on how much skins and
              champions your account have.
            </p>
          </div>
        )}
        {status === 'invalidToken' && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-36 h-36 text-error"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>

            <h1 className="text-xl">Invalid or expired token</h1>
            <p className="opacity-50 text-center mt-1 max-w-lg">
              You may be using an expired token, try to logout and loging in
              again!
            </p>
          </>
        )}
        {status === 'done' && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-36 h-36 text-success"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-xl">Profile has been added</h1>
            <p className="opacity-50 mt-1 text-center max-w-lg">
              Go back to the website and your account should appear there
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-36 h-36 text-error"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>

            <h1 className="text-xl">Something went wrong!</h1>
            <p className="opacity-50 text-center mt-1 max-w-lg">
              We had issues retrieving your profile&apos;s data, restart your
              client and try again
            </p>
            <button
              type="button"
              onClick={handleTryAgain}
              className={`btn gap-2 mt-5 ${
                progress !== 100 && progress ? 'loading' : ''
              }`}
            >
              {progress === 100 || !progress ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              ) : (
                ''
              )}
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
