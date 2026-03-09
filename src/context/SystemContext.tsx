import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface LogEntry {
  ts: string;
  level: "INFO" | "WARN" | "ERROR";
  source: "LSPosed" | "Zygisk" | "UVC" | "System";
  msg: string;
}

export interface CameraDevice {
  id: number;
  originalName: string;
  mappedTo: string;
  status: "redirected" | "blocked" | "native";
}

export interface SystemState {
  // UVC
  uvcConnected: boolean;
  v4l2Nodes: boolean;
  streamActive: boolean;
  streamFps: number;
  streamResolution: string;
  streamFormat: string;
  streamLatency: number;

  // Modules
  lsposedEnabled: boolean;
  zygiskEnabled: boolean;
  nativeBlocking: boolean;

  // Camera config
  hideInternal: boolean;
  autoRedirect: boolean;
  forceResolution: boolean;
  cameraDevices: CameraDevice[];

  // Target apps
  targetApps: { name: string; hooked: boolean }[];

  // Logs
  logs: LogEntry[];
}

interface SystemContextType {
  state: SystemState;
  toggleLsposed: () => void;
  toggleZygisk: () => void;
  toggleNativeBlocking: () => void;
  toggleHideInternal: () => void;
  toggleAutoRedirect: () => void;
  toggleForceResolution: () => void;
  rescanDevices: () => void;
  clearLogs: () => void;
  addLog: (log: Omit<LogEntry, "ts">) => void;
  hookApp: (name: string) => void;
  toggleStream: () => void;
  setResolution: (res: string) => void;
  setFrameFormat: (fmt: string) => void;
  updateCameraMapping: (id: number, mappedTo: string) => void;
  addCameraDevice: (originalName: string, mappedTo: string) => void;
  removeCameraDevice: (id: number) => void;
  toggleCameraRedirect: (id: number) => void;
  exportConfig: () => string;
}

const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
};

const initialLogs: LogEntry[] = [
  { ts: "14:32:01.234", level: "INFO", source: "System", msg: "UVC Override Dashboard initialized" },
  { ts: "14:32:01.256", level: "INFO", source: "System", msg: "Pixel 8a (akita) – Android 15 – Magisk detected" },
  { ts: "14:32:01.301", level: "INFO", source: "UVC", msg: "V4L2 /dev/video* nodes detected" },
  { ts: "14:32:01.315", level: "WARN", source: "System", msg: "ExternalCameraProvider ABSENT – hook strategy required" },
  { ts: "14:32:01.320", level: "INFO", source: "System", msg: "Active provider: @2.7-service-google" },
];

const defaultState: SystemState = {
  uvcConnected: true,
  v4l2Nodes: true,
  streamActive: false,
  streamFps: 0,
  streamResolution: "1920x1080",
  streamFormat: "MJPEG",
  streamLatency: 0,
  lsposedEnabled: true,
  zygiskEnabled: true,
  nativeBlocking: true,
  hideInternal: true,
  autoRedirect: true,
  forceResolution: false,
  cameraDevices: [
    { id: 0, originalName: "Back Camera (IMX890)", mappedTo: "UVC Camera", status: "redirected" },
    { id: 1, originalName: "Front Camera (IMX615)", mappedTo: "UVC Camera", status: "redirected" },
  ],
  targetApps: [
    { name: "com.android.camera", hooked: false },
    { name: "com.whatsapp", hooked: false },
    { name: "com.google.android.apps.meetings", hooked: false },
    { name: "org.webrtc.demo", hooked: false },
    { name: "Browser (WebRTC)", hooked: false },
  ],
  logs: initialLogs,
};

const SystemContext = createContext<SystemContextType | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemState>(defaultState);

  const addLog = useCallback((log: Omit<LogEntry, "ts">) => {
    setState((s) => ({
      ...s,
      logs: [...s.logs, { ...log, ts: now() }],
    }));
  }, []);

  const toggleLsposed = useCallback(() => {
    setState((s) => {
      const enabled = !s.lsposedEnabled;
      return {
        ...s,
        lsposedEnabled: enabled,
        logs: [...s.logs, { ts: now(), level: "INFO", source: "System", msg: `LSPosed module ${enabled ? "enabled" : "disabled"}` }],
      };
    });
  }, []);

  const toggleZygisk = useCallback(() => {
    setState((s) => {
      const enabled = !s.zygiskEnabled;
      return {
        ...s,
        zygiskEnabled: enabled,
        logs: [...s.logs, { ts: now(), level: "INFO", source: "System", msg: `Zygisk module ${enabled ? "enabled" : "disabled"}` }],
      };
    });
  }, []);

  const toggleNativeBlocking = useCallback(() => {
    setState((s) => {
      const enabled = !s.nativeBlocking;
      return {
        ...s,
        nativeBlocking: enabled,
        logs: [...s.logs, { ts: now(), level: enabled ? "INFO" : "WARN", source: "Zygisk", msg: `Native device node blocking ${enabled ? "activated" : "deactivated"}` }],
      };
    });
  }, []);

  const toggleHideInternal = useCallback(() => {
    setState((s) => {
      const enabled = !s.hideInternal;
      return {
        ...s,
        hideInternal: enabled,
        logs: [...s.logs, { ts: now(), level: "INFO", source: "LSPosed", msg: `Internal cameras ${enabled ? "hidden" : "visible"} in getCameraIdList()` }],
      };
    });
  }, []);

  const toggleAutoRedirect = useCallback(() => {
    setState((s) => {
      const enabled = !s.autoRedirect;
      return {
        ...s,
        autoRedirect: enabled,
        logs: [...s.logs, { ts: now(), level: "INFO", source: "LSPosed", msg: `Auto-redirect ${enabled ? "enabled" : "disabled"}` }],
      };
    });
  }, []);

  const toggleForceResolution = useCallback(() => {
    setState((s) => {
      const enabled = !s.forceResolution;
      return {
        ...s,
        forceResolution: enabled,
        logs: [...s.logs, { ts: now(), level: "INFO", source: "LSPosed", msg: `Resolution override ${enabled ? "active" : "inactive"}` }],
      };
    });
  }, []);

  const rescanDevices = useCallback(() => {
    setState((s) => ({
      ...s,
      logs: [
        ...s.logs,
        { ts: now(), level: "INFO", source: "UVC", msg: "Rescanning USB devices..." },
        { ts: now(), level: "INFO", source: "UVC", msg: "Found /dev/video0 – UVC device connected" },
        { ts: now(), level: "INFO", source: "System", msg: "V4L2 capability check: VIDEO_CAPTURE ✓" },
      ],
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setState((s) => ({
      ...s,
      logs: [{ ts: now(), level: "INFO", source: "System", msg: "Logs cleared" }],
    }));
  }, []);

  const hookApp = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      targetApps: s.targetApps.map((a) => (a.name === name ? { ...a, hooked: true } : a)),
      logs: [
        ...s.logs,
        { ts: now(), level: "INFO", source: "LSPosed", msg: `Hook initialized for ${name}` },
        { ts: now(), level: "INFO", source: "LSPosed", msg: `getCameraIdList() → returning [0: UVC]` },
        { ts: now(), level: "INFO", source: "Zygisk", msg: `CameraService::connect intercepted for ${name}` },
      ],
    }));
  }, []);

  const toggleStream = useCallback(() => {
    setState((s) => {
      const active = !s.streamActive;
      return {
        ...s,
        streamActive: active,
        streamFps: active ? 30 : 0,
        streamLatency: active ? 8 : 0,
        logs: [
          ...s.logs,
          {
            ts: now(),
            level: "INFO",
            source: "UVC",
            msg: active
              ? `V4L2 stream started: ${s.streamResolution} @ 30fps MJPEG`
              : "V4L2 stream stopped",
          },
        ],
      };
    });
  }, []);

  const setResolution = useCallback((res: string) => {
    setState((s) => ({
      ...s,
      streamResolution: res,
      logs: [...s.logs, { ts: now(), level: "INFO", source: "UVC", msg: `Resolution set to ${res}` }],
    }));
  }, []);

  const setFrameFormat = useCallback((fmt: string) => {
    setState((s) => ({
      ...s,
      streamFormat: fmt,
      logs: [...s.logs, { ts: now(), level: "INFO", source: "UVC", msg: `Frame format set to ${fmt}` }],
    }));
  }, []);

  const updateCameraMapping = useCallback((id: number, mappedTo: string) => {
    setState((s) => ({
      ...s,
      cameraDevices: s.cameraDevices.map((cam) => cam.id === id ? { ...cam, mappedTo } : cam),
      logs: [...s.logs, { ts: now(), level: "INFO", source: "LSPosed", msg: `Camera ${id} mapped to "${mappedTo}"` }],
    }));
  }, []);

  const addCameraDevice = useCallback((originalName: string, mappedTo: string) => {
    setState((s) => {
      const newId = Math.max(...s.cameraDevices.map((c) => c.id), -1) + 1;
      return {
        ...s,
        cameraDevices: [...s.cameraDevices, { id: newId, originalName, mappedTo, status: "native" as const }],
        logs: [...s.logs, { ts: now(), level: "INFO" as const, source: "LSPosed" as const, msg: `Camera ${newId} added: "${originalName}" → "${mappedTo}"` }],
      };
    });
  }, []);

  const removeCameraDevice = useCallback((id: number) => {
    setState((s) => ({
      ...s,
      cameraDevices: s.cameraDevices.filter((c) => c.id !== id),
      logs: [...s.logs, { ts: now(), level: "INFO" as const, source: "LSPosed" as const, msg: `Camera ${id} removed` }],
    }));
  }, []);

  const toggleCameraRedirect = useCallback((id: number) => {
    setState((s) => ({
      ...s,
      cameraDevices: s.cameraDevices.map((c) =>
        c.id === id ? { ...c, status: c.status === "redirected" ? "native" as const : "redirected" as const } : c
      ),
      logs: [...s.logs, { ts: now(), level: "INFO" as const, source: "LSPosed" as const, msg: `Camera ${id} ${s.cameraDevices.find(c => c.id === id)?.status === "redirected" ? "detached" : "attached"} redirect` }],
    }));
  }, []);

  const exportConfig = useCallback(() => {
    const config = {
      device: "Pixel 8a (akita)",
      android: 15,
      modules: {
        lsposed: state.lsposedEnabled,
        zygisk: state.zygiskEnabled,
        nativeBlocking: state.nativeBlocking,
      },
      camera: {
        hideInternal: state.hideInternal,
        autoRedirect: state.autoRedirect,
        forceResolution: state.forceResolution,
        mappings: state.cameraDevices,
      },
      stream: {
        resolution: state.streamResolution,
        format: state.streamFormat,
      },
      targetApps: state.targetApps,
    };
    return JSON.stringify(config, null, 2);
  }, [state]);

  return (
    <SystemContext.Provider
      value={{
        state,
        toggleLsposed,
        toggleZygisk,
        toggleNativeBlocking,
        toggleHideInternal,
        toggleAutoRedirect,
        toggleForceResolution,
        rescanDevices,
        clearLogs,
        addLog,
        hookApp,
        toggleStream,
        setResolution,
        setFrameFormat,
        updateCameraMapping,
        addCameraDevice,
        removeCameraDevice,
        toggleCameraRedirect,
        exportConfig,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used within SystemProvider");
  return ctx;
}
