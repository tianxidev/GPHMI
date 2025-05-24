import { Trash2, Download, FileCode, X, FileUp } from "lucide-react";
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
import { useState, useEffect, useRef } from "react";
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

interface ProtocolEditorProps {
  protocol: Protocol;
  onSave: (protocol: Protocol) => void;
  onClose: () => void;
}

function ProtocolEditor({ protocol, onSave, onClose }: ProtocolEditorProps) {
  const { t } = useTranslation();
  const [editedProtocol, setEditedProtocol] = useState<Protocol>(protocol);

  const handleSave = () => {
    onSave(editedProtocol);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("protocol.edit")}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>{t("protocol.name")}</Label>
        <Input
          value={editedProtocol.name}
          onChange={(e) =>
            setEditedProtocol((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <Label>{t("protocol.description")}</Label>
        <Input
          value={editedProtocol.description}
          onChange={(e) =>
            setEditedProtocol((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <Label>{t("protocol.handler")}</Label>
        <div className="border rounded-lg overflow-hidden">
          <Editor
            height="250px"
            defaultLanguage="javascript"
            value={editedProtocol.handler}
            onChange={(value) =>
              setEditedProtocol((prev) => ({ ...prev, handler: value || "" }))
            }
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              theme: "vs-dark",
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>{t("protocol.registration.type")}</Label>
          <div className="flex gap-4">
            <Button
              variant={editedProtocol.registration.type === "active" ? "default" : "outline"}
              onClick={() =>
                setEditedProtocol((prev) => ({
                  ...prev,
                  registration: {
                    type: "active",
                    active: {
                      command: "",
                      expectedResponse: "",
                    },
                  },
                }))
              }
            >
              {t("protocol.registration.active")}
            </Button>
            <Button
              variant={editedProtocol.registration.type === "passive" ? "default" : "outline"}
              onClick={() =>
                setEditedProtocol((prev) => ({
                  ...prev,
                  registration: {
                    type: "passive",
                    passive: {
                      matchType: "content",
                      matchPattern: "",
                    },
                  },
                }))
              }
            >
              {t("protocol.registration.passive")}
            </Button>
          </div>
        </div>

        {editedProtocol.registration.type === "active" ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>{t("protocol.registration.command")}</Label>
              <Input
                value={editedProtocol.registration.active?.command || ""}
                onChange={(e) =>
                  setEditedProtocol((prev) => ({
                    ...prev,
                    registration: {
                      ...prev.registration,
                      active: {
                        ...prev.registration.active!,
                        command: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>{t("protocol.registration.expectedResponse")}</Label>
              <Input
                value={editedProtocol.registration.active?.expectedResponse || ""}
                onChange={(e) =>
                  setEditedProtocol((prev) => ({
                    ...prev,
                    registration: {
                      ...prev.registration,
                      active: {
                        ...prev.registration.active!,
                        expectedResponse: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>{t("protocol.registration.matchType")}</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    editedProtocol.registration.passive?.matchType === "content"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setEditedProtocol((prev) => ({
                      ...prev,
                      registration: {
                        ...prev.registration,
                        passive: {
                          ...prev.registration.passive!,
                          matchType: "content",
                        },
                      },
                    }))
                  }
                >
                  {t("protocol.registration.matchType.content")}
                </Button>
                <Button
                  variant={
                    editedProtocol.registration.passive?.matchType === "ip"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setEditedProtocol((prev) => ({
                      ...prev,
                      registration: {
                        ...prev.registration,
                        passive: {
                          ...prev.registration.passive!,
                          matchType: "ip",
                        },
                      },
                    }))
                  }
                >
                  {t("protocol.registration.matchType.ip")}
                </Button>
                <Button
                  variant={
                    editedProtocol.registration.passive?.matchType === "ipRange"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setEditedProtocol((prev) => ({
                      ...prev,
                      registration: {
                        ...prev.registration,
                        passive: {
                          ...prev.registration.passive!,
                          matchType: "ipRange",
                        },
                      },
                    }))
                  }
                >
                  {t("protocol.registration.matchType.ipRange")}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("protocol.registration.matchPattern")}</Label>
              <Input
                placeholder={
                  editedProtocol.registration.passive?.matchType === "content"
                    ? t("protocol.registration.contentPatternPlaceholder")
                    : editedProtocol.registration.passive?.matchType === "ip"
                      ? t("protocol.registration.ipPatternPlaceholder")
                      : t("protocol.registration.ipRangePatternPlaceholder")
                }
                value={editedProtocol.registration.passive?.matchPattern || ""}
                onChange={(e) =>
                  setEditedProtocol((prev) => ({
                    ...prev,
                    registration: {
                      ...prev.registration,
                      passive: {
                        ...prev.registration.passive!,
                        matchPattern: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {t("app.cancel")}
        </Button>
        <Button onClick={handleSave}>
          {t("app.save")}
        </Button>
      </div>
    </div>
  );
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
  const [newProtocol, setNewProtocol] = useState<Omit<Protocol, "id">>({
    name: "",
    description: "",
    handler: `function message(data) {\n  // Process the data here\n  return data;\n}`,
    registration: {
      type: "active",
      active: {
        command: "",
        expectedResponse: "",
      },
    },
  });
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setLayout(width < 768 ? 'vertical' : 'horizontal');
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddProtocol = () => {
    if (newProtocol.name.trim()) {
      onAddProtocol({
        id: crypto.randomUUID(),
        ...newProtocol,
      });
      setNewProtocol({
        name: "",
        description: "",
        handler: `function message(data) {\n  // Process the data here\n  return data;\n}`,
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
              handler: importedProtocol.handler.includes('function')
                ? importedProtocol.handler
                : `function message(data) {\n  ${importedProtocol.handler}\n}`,
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
      <DrawerContent>
        <div className="flex flex-col h-full">
          <DrawerHeader className="flex-none">
            <div className="flex items-center justify-between">
              <DrawerTitle>{t("protocol.title")}</DrawerTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <label>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportProtocol}
                    />
                    <FileUp className="w-4 h-4" />
                  </label>
                </Button>
              </div>
            </div>
          </DrawerHeader>
          <div ref={containerRef} className="flex-1 overflow-hidden p-4">
            <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-6 h-full`}>
              {/* Left Sidebar - Protocol List */}
              <div className={`${layout === 'vertical' ? 'w-full' : 'w-80'} flex flex-col border rounded-lg overflow-hidden`}>
                <div className="p-4 border-b flex-none">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t("protocol.new")}
                      value={newProtocol.name}
                      onChange={(e) =>
                        setNewProtocol((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddProtocol}
                      disabled={!newProtocol.name.trim()}
                    >
                      {t("app.add")}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {protocols.map((protocol) => (
                      <div
                        key={protocol.id}
                        className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${editingProtocol?.id === protocol.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent/50"
                          }`}
                        onClick={() => setEditingProtocol(protocol)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{protocol.name}</div>
                          {protocol.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {protocol.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
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
                            className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveProtocol(protocol.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {protocols.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        {t("protocol.select")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel - Protocol Editor */}
              <div className={`${layout === 'vertical' ? 'w-full' : 'flex-1'} flex flex-col border rounded-lg overflow-hidden`}>
                {editingProtocol ? (
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{editingProtocol.name}</h3>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExportProtocol(editingProtocol)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <Label>{t("protocol.description")}</Label>
                        <Input
                          value={editingProtocol.description}
                          onChange={(e) =>
                            setEditingProtocol((prev) =>
                              prev ? { ...prev, description: e.target.value } : null
                            )
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>{t("protocol.handler")}</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <Editor
                            height="250px"
                            defaultLanguage="javascript"
                            value={editingProtocol.handler}
                            onChange={(value) =>
                              setEditingProtocol((prev) =>
                                prev ? { ...prev, handler: value || "" } : null
                              )
                            }
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: "on",
                              roundedSelection: false,
                              scrollBeyondLastLine: false,
                              readOnly: false,
                              theme: "vs-dark",
                              wordWrap: "on",
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label>{t("protocol.registration.type")}</Label>
                          <div className="flex gap-4">
                            <Button
                              variant={editingProtocol.registration.type === "active" ? "default" : "outline"}
                              onClick={() =>
                                setEditingProtocol((prev) =>
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
                            >
                              {t("protocol.registration.active")}
                            </Button>
                            <Button
                              variant={editingProtocol.registration.type === "passive" ? "default" : "outline"}
                              onClick={() =>
                                setEditingProtocol((prev) =>
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
                            >
                              {t("protocol.registration.passive")}
                            </Button>
                          </div>
                        </div>

                        {editingProtocol.registration.type === "active" ? (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <Label>{t("protocol.registration.command")}</Label>
                              <Input
                                value={editingProtocol.registration.active?.command || ""}
                                onChange={(e) =>
                                  setEditingProtocol((prev) =>
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
                            <div className="space-y-1">
                              <Label>{t("protocol.registration.expectedResponse")}</Label>
                              <Input
                                value={editingProtocol.registration.active?.expectedResponse || ""}
                                onChange={(e) =>
                                  setEditingProtocol((prev) =>
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
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <Label>{t("protocol.registration.matchType")}</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant={
                                    editingProtocol.registration.passive?.matchType === "content"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setEditingProtocol((prev) =>
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
                                >
                                  {t("protocol.registration.matchType.content")}
                                </Button>
                                <Button
                                  variant={
                                    editingProtocol.registration.passive?.matchType === "ip"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setEditingProtocol((prev) =>
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
                                >
                                  {t("protocol.registration.matchType.ip")}
                                </Button>
                                <Button
                                  variant={
                                    editingProtocol.registration.passive?.matchType === "ipRange"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setEditingProtocol((prev) =>
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
                                >
                                  {t("protocol.registration.matchType.ipRange")}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>{t("protocol.registration.matchPattern")}</Label>
                              <Input
                                placeholder={
                                  editingProtocol.registration.passive?.matchType === "content"
                                    ? t("protocol.registration.contentPatternPlaceholder")
                                    : editingProtocol.registration.passive?.matchType === "ip"
                                      ? t("protocol.registration.ipPatternPlaceholder")
                                      : t("protocol.registration.ipRangePatternPlaceholder")
                                }
                                value={editingProtocol.registration.passive?.matchPattern || ""}
                                onChange={(e) =>
                                  setEditingProtocol((prev) =>
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
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => onUpdateProtocol(editingProtocol)}>
                          {t("app.save")}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    <p>{t("protocol.select")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
