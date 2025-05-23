import { Settings } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SystemSettingsProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    port: number;
    onPortChange: (port: number) => void;
    isServerRunning: boolean;
}

export function SystemSettings({
    isOpen,
    onOpenChange,
    port,
    onPortChange,
    isServerRunning,
}: SystemSettingsProps) {
    const { t, i18n } = useTranslation();

    const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && value < 65536) {
            onPortChange(value);
        }
    };

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
        localStorage.setItem("language", value);
    };

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{t("settings.title")}</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="port">{t("server.port")}</Label>
                        <Input
                            id="port"
                            type="number"
                            value={port}
                            onChange={handlePortChange}
                            disabled={isServerRunning}
                            min={1}
                            max={65535}
                            className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                            {isServerRunning
                                ? t("server.port.running")
                                : t("server.port.range")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("settings.language")}</Label>
                        <Select
                            value={i18n.language}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{t("settings.language.en")}</SelectItem>
                                <SelectItem value="zh">{t("settings.language.zh")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
} 