import { disconnect, send, listen } from "@kuyoonjo/tauri-plugin-tcp";
import { useState, useEffect } from "react";
import { bind, unbind } from "@kuyoonjo/tauri-plugin-tcp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Power, Users } from "lucide-react";
import { ClientsList } from "@/components/ClientsList";
import { ProtocolManager } from "@/components/ProtocolManager";
import { SystemSettings } from "@/components/SystemSettings";
import { useTranslation } from "react-i18next";
import "@/i18n";

const sid = "unique-server-id";
const SERVER_STATE_KEY = "tcp-server-state";
const PROTOCOLS_KEY = "protocol-handlers";
const PORT_KEY = "server-port";

interface Protocol {
  id: string;
  name: string;
  description: string;
  handler: string;
  registration: {
    type: 'active' | 'passive';
    active?: {
      command: string;
      expectedResponse: string;
    };
    passive?: {
      matchType: 'content' | 'ip' | 'ipRange';
      matchPattern: string;
    };
  };
}

interface Client {
  address: string;
  connectedAt: Date;
  lastMessage?: string;
  protocol?: Protocol;
}

function App() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<Array<{
    type: 'RECV' | 'SEND' | 'INFO' | 'ERROR';
    content: string;
    address?: string;
    protocol?: string;
    timestamp: Date;
  }>>([]);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(() => {
    const savedState = localStorage.getItem(SERVER_STATE_KEY);
    return savedState === "true";
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>(() => {
    const savedProtocols = localStorage.getItem(PROTOCOLS_KEY);
    return savedProtocols ? JSON.parse(savedProtocols) : [];
  });
  const [port, setPort] = useState(() => {
    const savedPort = localStorage.getItem(PORT_KEY);
    return savedPort ? parseInt(savedPort) : 19090;
  });
  const [showClients, setShowClients] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const formatLog = (log: typeof logs[0]) => {
    const timestamp = showTimestamp ? `[${log.timestamp.toLocaleString()}] ` : '';
    const addr = log.address ? ` ${log.address}` : '';
    const proto = log.protocol ? ` [${log.protocol}]` : '';
    return `${timestamp}[${log.type}]${addr}${proto} -> ${log.content}`;
  };

  const addLog = (type: 'RECV' | 'SEND' | 'INFO' | 'ERROR', content: string, address?: string, protocol?: string) => {
    setLogs((prevLogs) => [...prevLogs, {
      type,
      content,
      address,
      protocol,
      timestamp: new Date()
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    localStorage.setItem(SERVER_STATE_KEY, isServerRunning.toString());
    if (isServerRunning) {
      startTcp();
    }
  }, [isServerRunning]);

  useEffect(() => {
    localStorage.setItem(PROTOCOLS_KEY, JSON.stringify(protocols));
  }, [protocols]);

  useEffect(() => {
    localStorage.setItem(PORT_KEY, port.toString());
  }, [port]);

  const startTcp = async () => {
    try {
      await bind(sid, `0.0.0.0:${port}`);
      addLog('INFO', `TCP Server started on port ${port}`);
      setClients([]);
      let clientAddr = "";
      await listen(async (x) => {
        console.log("recive=>", x.payload);
        if (x.payload.id === sid && x.payload.event.connect) {
          clientAddr = x.payload.event.connect;
          addLog('INFO', `Client connected`, clientAddr);
          setClients((prev) => {
            if (prev.some(client => client.address === clientAddr)) {
              return prev;
            }
            const newClient = {
              address: clientAddr,
              connectedAt: new Date(),
              protocol: undefined
            };
            return [...prev, newClient];
          });

          // Check passive registration for IP and IP range immediately
          for (const protocol of protocols) {
            if (protocol.registration.type === 'passive') {
              const { matchType, matchPattern } = protocol.registration.passive!;
              let isMatch = false;

              if (matchType === 'ip') {
                isMatch = clientAddr === matchPattern;
              } else if (matchType === 'ipRange') {
                const [start, end] = matchPattern.split('-').map(ip => ip.trim());
                isMatch = clientAddr >= start && clientAddr <= end;
              }

              if (isMatch) {
                setClients(prev => prev.map(c =>
                  c.address === clientAddr ? { ...c, protocol } : c
                ));
                addLog('INFO', `Client ${clientAddr} matched with protocol: ${protocol.name} (${matchType})`, clientAddr, protocol.name);
                break;
              }
            }
          }

          // Send active registration commands
          if (protocols.length > 0) {
            for (const protocol of protocols) {
              if (protocol.registration.type === 'active' && protocol.registration.active?.command) {
                try {
                  await send(sid, clientAddr, protocol.registration.active.command);
                  addLog('SEND', protocol.registration.active.command, clientAddr, protocol.name);
                } catch (error) {
                  console.error(`Error sending registration command:`, error);
                  addLog('ERROR', `Failed to send registration command`, clientAddr, protocol.name);
                }
              }
            }
          }
        }
        if (x.payload.id === sid && x.payload.event.disconnect) {
          const disconnectedAddr = x.payload.event.disconnect;
          addLog('INFO', `Client disconnected`, disconnectedAddr);
          setClients((prev) => prev.filter((client) => client.address !== disconnectedAddr));
        }
        if (x.payload.id === sid && x.payload.event.message) {
          const data = x.payload.event.message.data;
          const dataStr =
            typeof data === "string"
              ? data
              : new TextDecoder().decode(new Uint8Array(data));
          addLog('RECV', dataStr, clientAddr);

          const client = clients.find(c => c.address === clientAddr);
          if (!client?.protocol) {
            for (const protocol of protocols) {
              if (protocol.registration.type === 'active' && protocol.registration.active?.expectedResponse) {
                if (dataStr.includes(protocol.registration.active.expectedResponse)) {
                  setClients(prev => prev.map(c =>
                    c.address === clientAddr ? { ...c, protocol } : c
                  ));
                  addLog('INFO', `Client ${clientAddr} registered with protocol: ${protocol.name}`, clientAddr, protocol.name);
                  break;
                }
              } else if (protocol.registration.type === 'passive' && protocol.registration.passive?.matchType === 'content') {
                const { matchPattern } = protocol.registration.passive;
                if (dataStr.includes(matchPattern)) {
                  setClients(prev => prev.map(c =>
                    c.address === clientAddr ? { ...c, protocol } : c
                  ));
                  addLog('INFO', `Client ${clientAddr} matched with protocol: ${protocol.name} (content)`, clientAddr, protocol.name);
                  break;
                }
              }
            }
          }

          if (client?.protocol) {
            try {
              const handler = new Function("data", client.protocol.handler);
              const result = handler(dataStr);
              if (result) {
                addLog('INFO', `Protocol processed: ${JSON.stringify(result)}`, clientAddr, client.protocol.name);
              }
            } catch (error) {
              addLog('ERROR', `Protocol processing error: ${error}`, clientAddr, client.protocol.name);
            }
          }

          setClients((prev) =>
            prev.map((client) =>
              client.address === clientAddr
                ? { ...client, lastMessage: dataStr }
                : client
            )
          );
        }
      });
    } catch (error) {
      addLog('ERROR', `Error starting server: ${error}`);
      setIsServerRunning(false);
    }
  };

  const processProtocol = (data: string) => {
    for (const protocol of protocols) {
      try {
        const handler = new Function("data", protocol.handler);
        const result = handler(data);
        if (result) return result;
      } catch (error) {
        console.error(`Error processing protocol ${protocol.name}:`, error);
      }
    }
    return null;
  };

  const stopTcp = async () => {
    try {
      await disconnect(sid);
      await unbind(sid);
      addLog('INFO', "TCP Server stopped");
      setClients([]);
    } catch (error) {
      addLog('ERROR', `Error stopping server: ${error}`);
    }
  };

  const toggleServer = async () => {
    if (isServerRunning) {
      await stopTcp();
      setIsServerRunning(false);
    } else {
      setIsServerRunning(true);
    }
  };

  const addProtocol = (protocol: Protocol) => {
    setProtocols((prev) => [...prev, protocol]);
  };

  const removeProtocol = (id: string) => {
    setProtocols((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProtocol = (updatedProtocol: Protocol) => {
    setProtocols((prev) =>
      prev.map((p) => (p.id === updatedProtocol.id ? updatedProtocol : p))
    );
  };

  const handleDisconnect = async (address: string) => {
    try {
      await disconnect(sid);
      addLog('INFO', `Client disconnected`, address);
      setClients((prev) => prev.filter((client) => client.address !== address));
    } catch (error) {
      addLog('ERROR', `Error disconnecting client: ${error}`, address);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col p-4 space-y-4 min-h-0">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isServerRunning ? "bg-green-500" : "bg-red-500"
                    }`}
                />
                <span className="font-medium">
                  {t("server.status")}: {isServerRunning ? t("server.running") : t("server.stopped")}
                </span>
              </div>
              <div
                className={`flex items-center space-x-2 text-sm ${isServerRunning && clients.length > 0
                  ? "text-foreground"
                  : "text-muted-foreground"
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>{clients.length} {t("server.connected")}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ClientsList
                clients={clients}
                isOpen={showClients}
                onOpenChange={setShowClients}
                onDisconnect={handleDisconnect}
              />

              <ProtocolManager
                protocols={protocols}
                isOpen={showProtocols}
                onOpenChange={setShowProtocols}
                onAddProtocol={addProtocol}
                onRemoveProtocol={removeProtocol}
                onUpdateProtocol={updateProtocol}
              />

              <SystemSettings
                isOpen={showSettings}
                onOpenChange={setShowSettings}
                port={port}
                onPortChange={setPort}
                isServerRunning={isServerRunning}
              />

              <Button
                onClick={toggleServer}
                variant="outline"
                className={`gap-2 ${isServerRunning ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"}`}
              >
                <Power className="w-4 h-4" />
                {isServerRunning ? t("server.stop") : t("server.start")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex-1 p-4 min-h-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimestamp(!showTimestamp)}
                className={showTimestamp ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500" : ""}
              >
                {t("log.timestamp")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
              >
                {t("log.clear")}
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]" type="always">
            <div className="space-y-1 font-mono text-sm pr-4">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground whitespace-pre-wrap break-all">
                  {formatLog(log)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <div className="border-t mt-auto">
        <div className="flex justify-between items-center h-12 px-4">
          <div className="text-sm text-muted-foreground">{t("app.version")}: 0.0.1</div>
        </div>
      </div>
    </div>
  );
}

export default App;
