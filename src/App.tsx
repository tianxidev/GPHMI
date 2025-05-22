import { disconnect, send, listen } from "@kuyoonjo/tauri-plugin-tcp";
import { useEffect, useState } from "react";
import { bind, unbind } from "@kuyoonjo/tauri-plugin-tcp";

const sid = "unique-server-id";

function App() {
  // 日志窗口
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs((prevLogs: any) => [...prevLogs, log]);
  };

  const startTcp = async () => {
    await bind(sid, "0.0.0.0:19090");
    let clientAddr = "";
    await listen(async (x) => {
      console.log("recive=>", x.payload);
      if (x.payload.id === sid && x.payload.event.connect) {
        clientAddr = x.payload.event.connect;
        addLog(`Client connected: ${clientAddr}`);
      }
      if (x.payload.id === sid && x.payload.event.message) {
        const data = x.payload.event.message.data;
        addLog(`Received from ${clientAddr}: ${data}`);
      }
    });
    await unbind(sid);
  };

  const stopTcp = async () => {
    await disconnect(sid);
  };

  useEffect(() => {
    startTcp();
    return () => {
      stopTcp();
    };
  }, []);

  return (
    <div className="flex flex-col justify-between h-screen select-none">
      <div className="flex-1 flex flex-col p-2">
        <div>TCP Server Listening: 19090</div>
        <div className="border p-2 rounded-lg flex-1">
          <div className="flex-1 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center h-[30px] bg-gray-200 px-2">
        <div className="flex items-center gap-2">
          <div className="hover:bg-gray-300 p-1 rounded-full cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>Version: 0.0.1</div>
        </div>
      </div>
    </div>
  );
}

export default App;
