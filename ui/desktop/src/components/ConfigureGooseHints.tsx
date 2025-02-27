import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check } from './icons';

const Modal = ({ children }) => (
  <div className="fixed inset-0 bg-black/20 dark:bg-white/20 backdrop-blur-sm transition-colors animate-[fadein_200ms_ease-in_forwards]">
    <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-bgApp rounded-xl overflow-hidden shadow-none px-8 pt-[24px] pb-0">
      <div className="flex flex-col space-y-8 text-base text-textStandard h-full">{children}</div>
    </Card>
  </div>
);

const ModalHeader = () => (
  <div className="space-y-8">
    <div className="flex">
      <h2 className="text-2xl font-regular text-textStandard">Configure .goosehints</h2>
    </div>
  </div>
);

const ModalHelpText = () => (
  <div className="text-sm flex-col space-y-4">
    <p>
      .goosehints is a text file used to provide additional context about your project and improve
      the communication with Goose.
    </p>
    <p>You'll need to restart your session for .goosehints updates to take effect.</p>
    <p>
      See{' '}
      <Button
        variant="link"
        className="text-blue-500 hover:text-blue-600 p-0 h-auto"
        onClick={() =>
          window.open('https://block.github.io/goose/docs/guides/using-goosehints/', '_blank')
        }
      >
        using .goosehints
      </Button>{' '}
      for more information.
    </p>
  </div>
);

const ModalError = ({ error }) => (
  <div className="text-sm text-textSubtle">
    <div className="text-red-600">Error reading .goosehints file: {JSON.stringify(error)}</div>
  </div>
);

const ModalFileInfo = ({ filePath, found }) => (
  <div className="text-sm font-medium">
    {found ? (
      <div className="text-green-600">
        <Check className="w-4 h-4 inline-block" /> .goosehints file found at: {filePath}
      </div>
    ) : (
      <div>Creating new .goosehints file at: {filePath}</div>
    )}
  </div>
);

const ModalButtons = ({ onSubmit, onCancel }) => (
  <div className="-ml-8 -mr-8">
    <Button
      type="submit"
      variant="ghost"
      onClick={onSubmit}
      className="w-full h-[60px] rounded-none border-t border-borderSubtle text-base hover:bg-bgSubtle text-textProminent font-regular"
    >
      Submit
    </Button>
    <Button
      type="button"
      variant="ghost"
      onClick={onCancel}
      className="w-full h-[60px] rounded-none border-t border-borderSubtle hover:text-textStandard text-textSubtle hover:bg-bgSubtle text-base font-regular"
    >
      Cancel
    </Button>
  </div>
);

const GoosehintsModal = ({ directory, setIsGoosehintsModalOpen }) => {
  const [goosehintsFile, setGoosehintsFile] = useState<string>(null);
  const [goosehintsFileFound, setGoosehintsFileFound] = useState<boolean>(false);
  const [goosehintsFilePath, setGoosehintsFilePath] = useState<string>(null);
  const [goosehintsFileReadError, setGoosehintsFileReadError] = useState<string>(null);

  useEffect(() => {
    const fetchGoosehintsFile = async () => {
      try {
        const { file, filePath, error, found } = await getGoosehintsFile(directory);
        setGoosehintsFile(file);
        setGoosehintsFilePath(filePath);
        setGoosehintsFileFound(found);
        setGoosehintsFileReadError(error);
      } catch (error) {
        console.error('Error fetching .goosehints file:', error);
      }
    };
    if (directory) fetchGoosehintsFile();
  }, [directory]);

  const writeFile = async () => {
    await window.electron.writeLocalGoosehintsFile(directory, goosehintsFile);
    setIsGoosehintsModalOpen(false);
  };

  return (
    <Modal>
      <ModalHeader />
      <ModalHelpText />
      <div className="flex-1">
        {goosehintsFileReadError ? (
          <ModalError error={goosehintsFileReadError} />
        ) : (
          <div className="flex flex-col space-y-2 h-full">
            <ModalFileInfo filePath={goosehintsFilePath} found={goosehintsFileFound} />
            <textarea
              defaultValue={goosehintsFile}
              autoFocus
              className="w-full flex-1 border rounded-md min-h-40 p-2 text-sm resize-none"
              onChange={(event) => {
                setGoosehintsFile(event.target.value);
              }}
            />
          </div>
        )}
      </div>
      <ModalButtons onSubmit={writeFile} onCancel={() => setIsGoosehintsModalOpen(false)} />
    </Modal>
  );
};

const getGoosehintsFile = async (directory) =>
  await window.electron.readLocalGoosehintsFile(directory);

export const ConfigureGooseHints = ({ directory }) => {
  const [isGooseHintsModalOpen, setIsGoosehintsModalOpen] = useState<boolean>(false);
  return (
    <span>
      <div
        className="cursor-pointer ml-4 hover:opacity-75"
        onClick={() => setIsGoosehintsModalOpen(true)}
      >
        Configure .goosehints
      </div>

      {isGooseHintsModalOpen ? (
        <GoosehintsModal
          directory={directory}
          setIsGoosehintsModalOpen={setIsGoosehintsModalOpen}
        />
      ) : null}
    </span>
  );
};
