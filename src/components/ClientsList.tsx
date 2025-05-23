import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";

interface Client {
    address: string;
    connectedAt: Date;
    lastMessage?: string;
}

interface ClientsListProps {
    clients: Client[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientsList({ clients, isOpen, onOpenChange }: ClientsListProps) {
    const { t } = useTranslation();

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
                <div className="space-y-2 p-4">
                    {clients.map((client, index) => (
                        <div key={index} className="p-2 border rounded">
                            <div>{t("clients.address")}: {client.address}</div>
                            <div>{t("clients.connected")}: {client.connectedAt.toLocaleString()}</div>
                            {client.lastMessage && (
                                <div>{t("clients.lastMessage")}: {client.lastMessage}</div>
                            )}
                        </div>
                    ))}
                    {clients.length === 0 && (
                        <div className="text-center text-muted-foreground">
                            {t("clients.empty")}
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
} 