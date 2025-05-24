import { Users, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Client {
    address: string;
    connectedAt: Date;
    lastMessage?: string;
    protocol?: {
        name: string;
        description: string;
    };
}

interface ClientsListProps {
    clients: Client[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDisconnect?: (address: string) => void;
}

export function ClientsList({ clients, isOpen, onOpenChange, onDisconnect }: ClientsListProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredClients = clients.filter(client =>
        client.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <Users className="w-4 h-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{t("clients.title")}</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("clients.search")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredClients.map((client, index) => (
                            <div key={index} className="p-2 border rounded">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div>{t("clients.address")}: {client.address}</div>
                                        <div>{t("clients.connected")}: {client.connectedAt.toLocaleString()}</div>
                                        {client.protocol && (
                                            <div className="text-sm text-muted-foreground">
                                                {t("protocol.name")}: {client.protocol.name}
                                                {client.protocol.description && (
                                                    <div className="text-xs">{client.protocol.description}</div>
                                                )}
                                            </div>
                                        )}
                                        {client.lastMessage && (
                                            <div>{t("clients.lastMessage")}: {client.lastMessage}</div>
                                        )}
                                    </div>
                                    {onDisconnect && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDisconnect(client.address)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredClients.length === 0 && (
                            <div className="text-center text-muted-foreground">
                                {searchQuery ? t("clients.noResults") : t("clients.empty")}
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
} 