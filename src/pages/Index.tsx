import { Camera, Cpu, Shield, Usb, Activity, Wifi, AlertTriangle, Play, Square, Zap, CheckCircle2 } from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { useSystem } from "@/context/SystemContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Index = () => {
  const { state, hookApp, toggleStream } = useSystem();
  const [tick, setTick] = useState(0);

  // Simulate live FPS jitter
  useEffect(() => {
    if (!state.streamActive) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [state.streamActive]);

  const liveFps = state.streamActive ? 28 + Math.floor(Math.random() * 5) : 0;
  const liveLatency = state.streamActive ? 6 + Math.floor(Math.random() * 6) : 0;

  const hookedCount = state.targetApps.filter((a) => a.hooked).length;
  const modulesReady = state.lsposedEnabled && state.zygiskEnabled;

  const handleHookAll = () => {
    state.targetApps.filter((a) => !a.hooked).forEach((a) => hookApp(a.name));
    toast.success("All target applications hooked successfully");
  };

  const handleToggleStream = () => {
    toggleStream();
    toast(state.streamActive ? "UVC stream stopped" : "UVC stream started", {
      description: state.streamActive ? "V4L2 capture deactivated" : `${state.streamResolution} @ 30fps MJPEG`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">
            System <span className="text-primary text-glow">Overview</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pixel 8a (akita) · Android 15 · Magisk · Zygisk · LSPosed
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-1.5"
            onClick={handleToggleStream}
          >
            {state.streamActive ? (
              <><Square className="h-3 w-3" /> Stop Stream</>
            ) : (
              <><Play className="h-3 w-3" /> Start Stream</>
            )}
          </Button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="UVC Camera"
          value={state.uvcConnected ? "V4L2 Ready" : "Disconnected"}
          subtitle={state.streamActive ? `Streaming ${state.streamResolution}` : "/dev/video* nodes present"}
          icon={Usb}
          status={state.uvcConnected ? "active" : "error"}
        />
        <StatusCard
          title="Hook Engine"
          value={modulesReady ? "Active" : "Partial"}
          subtitle={`LSPosed ${state.lsposedEnabled ? "✓" : "✗"} · Zygisk ${state.zygiskEnabled ? "✓" : "✗"}`}
          icon={Shield}
          status={modulesReady ? "active" : "warning"}
        />
        <StatusCard
          title="Hooked Apps"
          value={`${hookedCount}/${state.targetApps.length}`}
          subtitle={hookedCount === state.targetApps.length ? "All apps intercepted" : `${state.targetApps.length - hookedCount} awaiting hook`}
          icon={Cpu}
          status={hookedCount === state.targetApps.length ? "active" : hookedCount > 0 ? "warning" : "error"}
        />
        <StatusCard
          title="Stream"
          value={state.streamActive ? `${liveFps} FPS` : "Inactive"}
          subtitle={state.streamActive ? `${liveLatency}ms latency · NV21` : "No active capture"}
          icon={Camera}
          status={state.streamActive ? "active" : "inactive"}
        />
      </div>

      {/* Critical Issue Banner */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 ${modulesReady ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
        {modulesReady ? (
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-mono font-semibold ${modulesReady ? "text-success" : "text-warning"}`}>
            {modulesReady ? "ExternalCameraProvider Override Active" : "ExternalCameraProvider Absent"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {modulesReady ? (
              <>LSPosed + Zygisk hooks are injecting UVC frames into CameraService. Override is <code className="text-success">ACTIVE</code>.</>
            ) : (
              <>Only <code className="text-foreground">@2.7-service-google</code> is present. UVC frames must be injected via LSPosed + Zygisk runtime hooks directly into CameraService.</>
            )}
          </p>
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded ${modulesReady ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {modulesReady ? "RESOLVED" : "MODULES REQUIRED"}
        </span>
      </div>

      {/* Architecture Flow */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-4">
          Data Flow Pipeline
        </h2>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { label: "Applications", icon: Activity, active: hookedCount > 0 },
            { label: "Camera2 API", icon: Camera, active: hookedCount > 0 },
            { label: "LSPosed Hook", icon: Shield, active: state.lsposedEnabled },
            { label: "Zygisk Native", icon: Cpu, active: state.zygiskEnabled },
            { label: "CameraService", icon: Activity, active: modulesReady },
            { label: "UVC Engine", icon: Usb, active: state.streamActive },
            { label: "USB Camera", icon: Camera, active: state.uvcConnected },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all ${
                  step.active
                    ? "bg-primary/10 border-primary/30 glow-primary"
                    : "bg-secondary border-border"
                }`}
              >
                <step.icon className={`h-3 w-3 ${step.active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={step.active ? "text-primary" : "text-foreground"}>{step.label}</span>
              </div>
              {i < 6 && (
                <span className={`font-bold ${step.active ? "text-primary text-glow" : "text-muted-foreground"}`}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Stats + Target Apps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            Device State
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">V4L2 Nodes</span>
              <span className="text-success">/dev/video* present</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UVC Stream</span>
              <span className={state.streamActive ? "text-success" : "text-muted-foreground"}>
                {state.streamActive ? `Active – ${liveFps}fps / ${liveLatency}ms` : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Camera Provider</span>
              <span className="text-destructive">External absent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">dumpsys media.camera</span>
              <span className="text-destructive">2 internal only</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hook Status</span>
              <span className={modulesReady ? "text-success" : "text-warning"}>
                {modulesReady ? "Ready ✓" : "Modules incomplete"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Internal Blocking</span>
              <span className={state.nativeBlocking ? "text-success" : "text-warning"}>
                {state.nativeBlocking ? "Active ✓" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
              Target Applications
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs gap-1.5"
              onClick={handleHookAll}
              disabled={hookedCount === state.targetApps.length}
            >
              <Zap className="h-3 w-3" /> Hook All
            </Button>
          </div>
          <div className="space-y-2">
            {state.targetApps.map((app) => (
              <div key={app.name} className="flex items-center justify-between font-mono text-xs">
                <span className="text-foreground">{app.name}</span>
                {app.hooked ? (
                  <span className="text-success">● hooked</span>
                ) : (
                  <button
                    onClick={() => {
                      hookApp(app.name);
                      toast.success(`Hooked ${app.name}`);
                    }}
                    className="text-warning hover:text-primary transition-colors cursor-pointer"
                  >
                    ○ click to hook
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
