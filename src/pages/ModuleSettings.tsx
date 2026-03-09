import { Cpu, Shield, Package, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSystem } from "@/context/SystemContext";
import { toast } from "sonner";

const ModuleSettings = () => {
  const { state, toggleLsposed, toggleZygisk, toggleNativeBlocking } = useSystem();

  const handleExportZip = () => {
    toast.success("Magisk module package exported", {
      description: "uvc-camera-override-v1.2.0.zip ready for flashing",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          Module <span className="text-primary text-glow">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage LSPosed and Zygisk runtime modules</p>
      </div>

      {/* Warning if modules disabled */}
      {(!state.lsposedEnabled || !state.zygiskEnabled) && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-mono font-semibold text-warning">Modules Incomplete</p>
            <p className="text-xs text-muted-foreground mt-1">
              Both LSPosed and Zygisk modules must be enabled for the UVC camera override to function.
              {!state.lsposedEnabled && " LSPosed is disabled."}
              {!state.zygiskEnabled && " Zygisk is disabled."}
            </p>
          </div>
        </div>
      )}

      {/* Module Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-lg border bg-card p-5 transition-all ${state.lsposedEnabled ? "border-primary/30 glow-primary" : "border-border"}`}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className={`h-5 w-5 ${state.lsposedEnabled ? "text-primary" : "text-muted-foreground"}`} />
            <h2 className="font-mono font-semibold text-foreground">LSPosed Module</h2>
            <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${state.lsposedEnabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {state.lsposedEnabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
          <div className="space-y-2 font-mono text-xs mb-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="text-foreground">1.2.0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Package</span><span className="text-foreground">UvcCameraHook.apk</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scope</span><span className="text-foreground">System Framework</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hooked Methods</span>
              <span className="text-primary">getCameraIdList, openCamera, getCameraCharacteristics</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-foreground">Enabled</span>
            <Switch
              checked={state.lsposedEnabled}
              onCheckedChange={() => {
                toggleLsposed();
                toast(state.lsposedEnabled ? "LSPosed module disabled" : "LSPosed module enabled");
              }}
            />
          </div>
        </div>

        <div className={`rounded-lg border bg-card p-5 transition-all ${state.zygiskEnabled ? "border-primary/30 glow-primary" : "border-border"}`}>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className={`h-5 w-5 ${state.zygiskEnabled ? "text-primary" : "text-muted-foreground"}`} />
            <h2 className="font-mono font-semibold text-foreground">Zygisk Module</h2>
            <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${state.zygiskEnabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {state.zygiskEnabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
          <div className="space-y-2 font-mono text-xs mb-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="text-foreground">1.2.0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Library</span><span className="text-foreground">uvc_camera_hook.so</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Architecture</span><span className="text-foreground">arm64-v8a</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Hook Targets</span><span className="text-primary">CameraService, ICameraDevice</span></div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-foreground">Enabled</span>
            <Switch
              checked={state.zygiskEnabled}
              onCheckedChange={() => {
                toggleZygisk();
                toast(state.zygiskEnabled ? "Zygisk module disabled" : "Zygisk module enabled");
              }}
            />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          Security & Blocking
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Native device node blocking</p>
            <p className="text-xs text-muted-foreground">Deny access to /dev/video* for internal cameras</p>
          </div>
          <Switch
            checked={state.nativeBlocking}
            onCheckedChange={() => {
              toggleNativeBlocking();
              toast(state.nativeBlocking ? "Native blocking disabled" : "Native blocking enabled");
            }}
          />
        </div>
      </div>

      {/* Magisk Module Package */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground font-mono">Magisk Module Package</p>
              <p className="text-xs text-muted-foreground">uvc-camera-override-v1.2.0.zip</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5" onClick={handleExportZip}>
            <Download className="h-3 w-3" /> Export ZIP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSettings;
