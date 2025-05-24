import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "app.title": "TCP Server",
      "app.version": "Version",
      "app.settings": "Settings",
      "app.save": "Save",
      "app.cancel": "Cancel",
      "app.add": "Add",
      "app.edit": "Edit",
      "app.delete": "Delete",
      "app.import": "Import",
      "app.export": "Export",

      // Server
      "server.status": "Server Status",
      "server.running": "Running",
      "server.stopped": "Stopped",
      "server.start": "Start Server",
      "server.stop": "Stop Server",
      "server.connected": "Connected Clients",
      "server.port": "Listen Port",
      "server.port.range": "Port range: 1-65535",
      "server.port.running": "Port cannot be changed while server is running",

      // Log
      "log.timestamp": "Timestamp",
      "log.clear": "Clear Logs",

      // Clients
      "clients.title": "Connected Clients",
      "clients.address": "Address",
      "clients.connected": "Connected At",
      "clients.lastMessage": "Last Message",
      "clients.empty": "No clients connected",
      "clients.search": "Search by address...",
      "clients.noResults": "No matching clients found",

      // Protocol
      "protocol.title": "Protocol Manager",
      "protocol.new": "New Protocol",
      "protocol.name": "Name",
      "protocol.description": "Description",
      "protocol.handler": "Handler",
      "protocol.select": "Please choose a protocol",
      "protocol.example":
        "// Example protocol handler\nfunction(data) {\n  // Process the data\n  return {\n    type: 'data',\n    value: data\n  };\n}",
      "protocol.import": "Import Protocol",
      "protocol.export": "Export Protocol",
      "protocol.registration": "Registration",
      "protocol.registration.type": "Type",
      "protocol.registration.active": "Active",
      "protocol.registration.passive": "Passive",
      "protocol.registration.command": "Command",
      "protocol.registration.expectedResponse": "Expected Response",
      "protocol.registration.matchType": "Match Type",
      "protocol.registration.matchPattern": "Match Pattern",
      "protocol.registration.matchType.content": "Content",
      "protocol.registration.matchType.ip": "IP",
      "protocol.registration.matchType.ipRange": "IP Range",
      "protocol.registration.contentPatternPlaceholder":
        "Enter content pattern to match",
      "protocol.registration.ipPatternPlaceholder":
        "Enter IP address (e.g., 192.168.1.100)",
      "protocol.registration.ipRangePatternPlaceholder":
        "Enter IP range (e.g., 192.168.1.1-192.168.1.255)",

      // Settings
      "settings.title": "System Settings",
      "settings.language": "Language",
      "settings.language.en": "English",
      "settings.language.zh": "Chinese",
      "settings.port": "Server Port",
    },
  },
  zh: {
    translation: {
      "app.title": "TCP 服务器",
      "app.version": "版本",
      "app.settings": "设置",
      "app.save": "保存",
      "app.cancel": "取消",
      "app.add": "添加",
      "app.edit": "编辑",
      "app.delete": "删除",
      "app.import": "导入",
      "app.export": "导出",

      // Server
      "server.status": "服务器状态",
      "server.running": "运行中",
      "server.stopped": "已停止",
      "server.start": "启动服务器",
      "server.stop": "停止服务器",
      "server.connected": "已连接客户端",
      "server.port": "监听端口",
      "server.port.range": "端口范围：1-65535",
      "server.port.running": "服务器运行时无法修改端口",

      // Log
      "log.timestamp": "时间戳",
      "log.clear": "清除日志",

      // Clients
      "clients.title": "已连接客户端",
      "clients.address": "地址",
      "clients.connected": "连接时间",
      "clients.lastMessage": "最后消息",
      "clients.empty": "没有已连接的客户端",
      "clients.search": "按地址搜索...",
      "clients.noResults": "未找到匹配的客户端",

      // Protocol
      "protocol.title": "协议管理器",
      "protocol.new": "新建协议",
      "protocol.name": "名称",
      "protocol.description": "描述",
      "protocol.handler": "处理器",
      "protocol.select": "请选择一个协议",
      "protocol.example":
        "// 协议处理器示例\nfunction(data) {\n  // 处理数据\n  return {\n    type: 'data',\n    value: data\n  };\n}",
      "protocol.import": "导入协议",
      "protocol.export": "导出协议",
      "protocol.registration": "注册方式",
      "protocol.registration.type": "类型",
      "protocol.registration.active": "主动",
      "protocol.registration.passive": "被动",
      "protocol.registration.command": "命令",
      "protocol.registration.expectedResponse": "预期响应",
      "protocol.registration.matchType": "匹配类型",
      "protocol.registration.matchPattern": "匹配模式",
      "protocol.registration.matchType.content": "内容",
      "protocol.registration.matchType.ip": "IP",
      "protocol.registration.matchType.ipRange": "IP范围",
      "protocol.registration.contentPatternPlaceholder": "输入要匹配的内容模式",
      "protocol.registration.ipPatternPlaceholder":
        "输入IP地址（例如：192.168.1.100）",
      "protocol.registration.ipRangePatternPlaceholder":
        "输入IP范围（例如：192.168.1.1-192.168.1.255）",

      // Settings
      "settings.title": "系统设置",
      "settings.language": "语言",
      "settings.language.en": "英文",
      "settings.language.zh": "中文",
      "settings.port": "服务器端口",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "zh",
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
