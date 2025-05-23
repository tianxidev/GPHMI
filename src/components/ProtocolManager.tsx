import { Trash2, Download, Upload, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useTranslation } from "react-i18next";

interface Protocol {
  id: string;
  name: string;
  description: string;
  handler: string;
  registration: {
    type: "active" | "passive";
    // 主动注册配置
    active?: {
      command: string; // 注册指令
      expectedResponse: string; // 预期响应
    };
    // 被动注册配置
    passive?: {
      matchType: "content" | "ip" | "ipRange"; // 匹配类型
      matchPattern: string; // 匹配模式（内容、IP或IP段）
    };
  };
}

interface ProtocolManagerProps {
  protocols: Protocol[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProtocol: (protocol: Protocol) => void;
  onRemoveProtocol: (id: string) => void;
  onUpdateProtocol: (protocol: Protocol) => void;
}

export function ProtocolManager({
  protocols,
  isOpen,
  onOpenChange,
  onAddProtocol,
  onRemoveProtocol,
  onUpdateProtocol,
}: ProtocolManagerProps) {
  const { t } = useTranslation();
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
    null
  );
  const [newProtocol, setNewProtocol] = useState<Omit<Protocol, "id">>({
    name: "",
    description: "",
    handler: t("protocol.example"),
    registration: {
      type: "active",
      active: {
        command: "",
        expectedResponse: "",
      },
    },
  });

  const handleAddProtocol = () => {
    if (newProtocol.name.trim()) {
      onAddProtocol({
        id: crypto.randomUUID(),
        ...newProtocol,
      });
      setNewProtocol({
        name: "",
        description: "",
        handler: t("protocol.example"),
        registration: {
          type: "active",
          active: {
            command: "",
            expectedResponse: "",
          },
        },
      });
    }
  };

  const handleSaveProtocol = () => {
    if (selectedProtocol) {
      onUpdateProtocol(selectedProtocol);
    }
  };

  const handleExportProtocol = (protocol: Protocol) => {
    const dataStr = JSON.stringify(protocol, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${protocol.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportProtocol = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProtocol = JSON.parse(e.target?.result as string);
          if (importedProtocol.name && importedProtocol.handler) {
            onAddProtocol({
              id: crypto.randomUUID(),
              name: importedProtocol.name,
              description: importedProtocol.description || "",
              handler: importedProtocol.handler,
              registration: {
                type: "active",
                active: {
                  command: "",
                  expectedResponse: "",
                },
              },
            });
          }
        } catch (error) {
          console.error("Failed to import protocol:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <FileCode className="w-4 h-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{t("protocol.manager")}</DrawerTitle>
        </DrawerHeader>
        <div className="flex p-2 pb-4">
          {/* left */}
          <div className="w-[270px] p-4 flex flex-col">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protocol-name">{t("protocol.new")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="protocol-name"
                    value={newProtocol.name}
                    onChange={(e) =>
                      setNewProtocol((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder={t("protocol.name")}
                    className="flex-1"
                  />
                  <Button onClick={handleAddProtocol}>{t("app.add")}</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <label>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportProtocol}
                    />
                    <Upload className="w-4 h-4" />
                  </label>
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-2">
                {protocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className={`p-3 border rounded-lg space-y-2 cursor-pointer transition-colors ${
                      selectedProtocol?.id === protocol.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{protocol.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {protocol.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportProtocol(protocol);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveProtocol(protocol.id);
                            if (selectedProtocol?.id === protocol.id) {
                              setSelectedProtocol(null);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* right */}
          <div className="flex-1 p-4 flex flex-col h-full border rounded shadow-gray-400 shadow-xl mr-2">
            {selectedProtocol ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">{t("protocol.name")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-name"
                        value={selectedProtocol.name}
                        onChange={(e) =>
                          setSelectedProtocol((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                        className="flex-1"
                      />
                      <Button onClick={handleSaveProtocol}>
                        {t("app.save")}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">
                      {t("protocol.description")}
                    </Label>
                    <Input
                      id="edit-description"
                      value={selectedProtocol.description}
                      onChange={(e) =>
                        setSelectedProtocol((prev) =>
                          prev ? { ...prev, description: e.target.value } : null
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("protocol.registration.type")}</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="active"
                          checked={
                            selectedProtocol.registration.type === "active"
                          }
                          onChange={() =>
                            setSelectedProtocol((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    registration: {
                                      type: "active",
                                      active: {
                                        command: "",
                                        expectedResponse: "",
                                      },
                                    },
                                  }
                                : null
                            )
                          }
                        />
                        <Label htmlFor="active">
                          {t("protocol.registration.active")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="passive"
                          checked={
                            selectedProtocol.registration.type === "passive"
                          }
                          onChange={() =>
                            setSelectedProtocol((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    registration: {
                                      type: "passive",
                                      passive: {
                                        matchType: "content",
                                        matchPattern: "",
                                      },
                                    },
                                  }
                                : null
                            )
                          }
                        />
                        <Label htmlFor="passive">
                          {t("protocol.registration.passive")}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {selectedProtocol.registration.type === "active" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="edit-command">
                          {t("protocol.registration.command")}
                        </Label>
                        <Input
                          id="edit-command"
                          value={
                            selectedProtocol.registration.active?.command || ""
                          }
                          onChange={(e) =>
                            setSelectedProtocol((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    registration: {
                                      ...prev.registration,
                                      active: {
                                        ...prev.registration.active!,
                                        command: e.target.value,
                                      },
                                    },
                                  }
                                : null
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-expected-response">
                          {t("protocol.registration.expectedResponse")}
                        </Label>
                        <Input
                          id="edit-expected-response"
                          value={
                            selectedProtocol.registration.active
                              ?.expectedResponse || ""
                          }
                          onChange={(e) =>
                            setSelectedProtocol((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    registration: {
                                      ...prev.registration,
                                      active: {
                                        ...prev.registration.active!,
                                        expectedResponse: e.target.value,
                                      },
                                    },
                                  }
                                : null
                            )
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>{t("protocol.registration.matchType")}</Label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="content"
                              checked={
                                selectedProtocol.registration.passive
                                  ?.matchType === "content"
                              }
                              onChange={() =>
                                setSelectedProtocol((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        registration: {
                                          ...prev.registration,
                                          passive: {
                                            ...prev.registration.passive!,
                                            matchType: "content",
                                          },
                                        },
                                      }
                                    : null
                                )
                              }
                            />
                            <Label htmlFor="content">
                              {t("protocol.registration.content")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="ip"
                              checked={
                                selectedProtocol.registration.passive
                                  ?.matchType === "ip"
                              }
                              onChange={() =>
                                setSelectedProtocol((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        registration: {
                                          ...prev.registration,
                                          passive: {
                                            ...prev.registration.passive!,
                                            matchType: "ip",
                                          },
                                        },
                                      }
                                    : null
                                )
                              }
                            />
                            <Label htmlFor="ip">
                              {t("protocol.registration.ip")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="ipRange"
                              checked={
                                selectedProtocol.registration.passive
                                  ?.matchType === "ipRange"
                              }
                              onChange={() =>
                                setSelectedProtocol((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        registration: {
                                          ...prev.registration,
                                          passive: {
                                            ...prev.registration.passive!,
                                            matchType: "ipRange",
                                          },
                                        },
                                      }
                                    : null
                                )
                              }
                            />
                            <Label htmlFor="ipRange">
                              {t("protocol.registration.ipRange")}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-match-pattern">
                          {t("protocol.registration.matchPattern")}
                        </Label>
                        <Input
                          id="edit-match-pattern"
                          value={
                            selectedProtocol.registration.passive
                              ?.matchPattern || ""
                          }
                          onChange={(e) =>
                            setSelectedProtocol((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    registration: {
                                      ...prev.registration,
                                      passive: {
                                        ...prev.registration.passive!,
                                        matchPattern: e.target.value,
                                      },
                                    },
                                  }
                                : null
                            )
                          }
                          placeholder={
                            selectedProtocol.registration.passive?.matchType ===
                            "content"
                              ? t(
                                  "protocol.registration.contentPatternPlaceholder"
                                )
                              : selectedProtocol.registration.passive
                                  ?.matchType === "ip"
                              ? t("protocol.registration.ipPatternPlaceholder")
                              : t(
                                  "protocol.registration.ipRangePatternPlaceholder"
                                )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-1 mt-4 flex flex-col">
                  <Label>{t("protocol.handler")}</Label>
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="350px"
                      defaultLanguage="javascript"
                      value={selectedProtocol.handler}
                      onChange={(value) =>
                        setSelectedProtocol((prev) =>
                          prev ? { ...prev, handler: value || "" } : null
                        )
                      }
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("protocol.select")}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
