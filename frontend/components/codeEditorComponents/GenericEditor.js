import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { editorConfigs } from "@/config/EditorConfig";
import Terminal from "./Terminal";
import DialogBox from "../dialogBoxes/DialogBox";
import ConformationBox from "../dialogBoxes/ConformationBox";
import JoinDeniedBox from "../dialogBoxes/JoinDeniedBox";
import WaitingBox from "../dialogBoxes/Waiting";
import Noowner from "../dialogBoxes/Noowner";
import OwnerRemovedDialog from "../dialogBoxes/OwnerRemovedDialog";

const GenericEditor = ({
  socket,
  roomId,
  codingLang,
  themeMap,
  room,
  termialfunc,
  UserID,

  fileCodes,
  setFileCodes,
  compiledCode,
  fontSize,
  theme,
  setCursorPosition,
  terminal,
  openDialog,
  joinRequest,
  handleResponse,
  setJoinRequest,
  handleJoinReq,
  setJoindenied,
  joindenied,
  noOwnerDialog,
  ownerRemovedDialog,
}) => {
  const terminalWrapperRef = useRef(null);
  const [mode, setMode] = useState("split");
  const handleCodeChange = (value, file, viewUpdate) => {
    const updated = { ...fileCodes, [file]: value };
    setFileCodes(updated);

    if (socket) {
      socket.emit("code-change", {
        roomId: roomId,
        code: value,
        file,
        lang: codingLang,
      });
    } else {
      return;
    }
  };

  // Cursor Position
  const handleUpdate = (viewUpdate) => {
    const view = viewUpdate.view;
    const pos = view.state.selection.main.head;
    const lineInfo = view.state.doc.lineAt(pos);
    const line = lineInfo.number;
    const column = pos - lineInfo.from + 1;

    setCursorPosition((prev) => {
      if (prev.line !== line || prev.column !== column) {
        return { line, column };
      }
      return prev;
    });
  };
  // Handiling the incoming Change
  useEffect(() => {
    if (!socket) return;
    const handleIncomingChange = ({ file, code }) => {
      setFileCodes((prev) => ({
        ...prev,
        [file]: code,
      }));
    };

    socket.on("changes", handleIncomingChange);

    return () => {
      socket.off("changes", handleIncomingChange);
    };
  }, []);

  const renderEditor = () => {
    return Object.entries(editorConfigs)
      .filter(([key, config]) => config.language === codingLang)
      .map(([key, config]) => (
        <div key={key} className=" w-full h-full">
          <CodeMirror
            value={fileCodes[key]}
            height="100%"
            width="100%"
            extensions={[config.extension]}
            onChange={(value) => {
              handleCodeChange(value, key);
            }}
            onUpdate={handleUpdate}
            theme={themeMap[theme]}
            className={`w-full h-[100%]`}
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>
      ));
  };

  return (
    <div
      ref={terminalWrapperRef}
      className="flex relative w-full h-full overflow-hidden"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex w-full h-full overflow-auto bg-zinc-900">
          {openDialog === true && <DialogBox />}

          {room.createdBy === UserID && (
            <ConformationBox
              setJoinRequest={setJoinRequest}
              handleResponse={handleResponse}
              joinRequest={joinRequest}
            />
          )}
          {room.createdBy !== UserID && (
            <JoinDeniedBox
              setJoindenied={setJoindenied}
              joindenied={joindenied}
              handleJoinReq={handleJoinReq}
            />
          )}

          {room.createdBy !== UserID && (
            <Noowner noOwnerDialog={noOwnerDialog} />
          )}
          {room.createdBy !== UserID && (
            <OwnerRemovedDialog ownerRemovedDialog={ownerRemovedDialog} />
          )}

          {/* {waiting && room.createdBy !== UserID && <WaitingBox />} */}

          {renderEditor()}
        </div>
      </div>
      {terminal === true ? (
        <Terminal
          termialfunc={termialfunc}
          room={room}
          compiledCode={compiledCode}
          dragBoundsRef={terminalWrapperRef}
          mode={mode}
          setMode={setMode}
        />
      ) : (
        ""
      )}
      {codingLang === "webDev" && (
        <div className="w-1/2 bg-white">
          {/* Output Preview for WebDev */}
          <iframe
            className="border-2 border-black"
            srcDoc={`<html><head><style>${fileCodes.css}</style></head><body>${fileCodes.html}<script>${fileCodes.js}<\/script></body></html>`}
            sandbox="allow-scripts"
            width="100%"
            height="100%"
          />
        </div>
      )}
    </div>
  );
};

export default GenericEditor;
