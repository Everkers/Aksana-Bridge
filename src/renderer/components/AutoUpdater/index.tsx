import { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { InboxIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

const AutoUpdater = () => {
  const [show, setShow] = useState<boolean>(false);
  const [status, setStatus] = useState<string>();
  useEffect(() => {
    window.electron.ipcRenderer.on('update_available', () => {
      setStatus('available');
      setShow(true);
    });
    window.electron.ipcRenderer.on('update_downloaded', () => {
      setStatus('downloaded');
      setShow(true);
    });
  }, []);
  const handleRestart = () => {
    window.electron.ipcRenderer.sendMessage('restart-app', []);
  };
  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <InboxIcon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="font-semibold text-gray-900">
                      {status === 'available'
                        ? 'A new update is downloading...'
                        : status === 'downloaded' && 'New update installed🎉'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {status === 'available'
                        ? 'A new update usally includes bug fixes or new features'
                        : status === 'downloaded' &&
                          ' Update have been downloaded, restart to install'}
                    </p>
                    <div className="mt-3 flex space-x-7">
                      {status === 'available' ? (
                        <button
                          onClick={() => setShow(false)}
                          type="button"
                          className="text-sm"
                        >
                          Close
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleRestart}
                            className="rounded-md bg-primary text-sm font-medium  text-[#fff] py-2 px-3"
                          >
                            Restart
                          </button>
                          <button
                            onClick={() => setShow(false)}
                            type="button"
                            className="text-sm"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default AutoUpdater;
