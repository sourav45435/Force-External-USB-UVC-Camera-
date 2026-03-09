import { useSystem } from "@/context/SystemContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Cpu, Camera, RefreshCw, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const ProviderSettings = () => {
  const {
    state,
    toggleLsposed,
    toggleZygisk,
    toggleNativeBlocking,
    toggleHideInternal,
    toggleAutoRedirect,
    toggleForceResolution,
    rescanDevices,
    exportConfig,
    setResolution,
    setFrameFormat,
  } = useSystem();

  const [fallbackBehavior, setFallbackBehavior] = useState("block");

  const modulesReady = state.lsposedEnabled && state.zygiskEnabled;

  const handleExport = () => {
    const config = exportConfig();
    navigator.clipboard.writeText(config);
    toast.success("Configuration copied to clipboard");
  };

  const handleRescan = () => {
    rescanDevices();
    toast.success("Device rescan initiated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          Provider <span className="text-primary text-glow">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure ExternalCameraProvider override behavior
        </p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 ${modulesReady ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
        {modulesReady ? (
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-mono font-semibold ${modulesReady ? "text-success" : "text-warning"}`}>
            {modulesReady ? "Override Active" : "Override Inactive — Enable Required Modules"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {modulesReady
              ? "All modules enabled. UVC frames are being injected into CameraService."
              : "LSPosed and Zygisk must both be enabled for the override to function."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Toggles */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider uppercase flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Hook Modules
            </CardTitle>
            <CardDescription className="text-xs">
              Enable or disable the core injection modules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">LSPosed Module</Label>
                <p className="text-xs text-muted-foreground">Java-level Camera2 API hooks</p>
              </div>
              <Switch checked={state.lsposedEnabled} onCheckedChange={toggleLsposed} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Zygisk Module</Label>
                <p className="text-xs text-muted-foreground">Native CameraService interception</p>
              </div>
              <Switch checked={state.zygiskEnabled} onCheckedChange={toggleZygisk} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Native Device Blocking</Label>
                <p className="text-xs text-muted-foreground">Block access to internal camera nodes</p>
              </div>
              <Switch checked={state.nativeBlocking} onCheckedChange={toggleNativeBlocking} />
            </div>
          </CardContent>
        </Card>

        {/* Camera Behavior */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider uppercase flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Camera Behavior
            </CardTitle>
            <CardDescription className="text-xs">
              Configure how the override handles camera requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Hide Internal Cameras</Label>
                <p className="text-xs text-muted-foreground">Remove internal cameras from getCameraIdList()</p>
              </div>
              <Switch checked={state.hideInternal} onCheckedChange={toggleHideInternal} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Auto-Redirect</Label>
                <p className="text-xs text-muted-foreground">Redirect all camera opens to UVC device</p>
              </div>
              <Switch checked={state.autoRedirect} onCheckedChange={toggleAutoRedirect} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-sm">Force Resolution</Label>
                <p className="text-xs text-muted-foreground">Override reported capabilities with UVC resolution</p>
              </div>
              <Switch checked={state.forceResolution} onCheckedChange={toggleForceResolution} />
            </div>
          </CardContent>
        </Card>

        {/* Stream Configuration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider uppercase flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Stream Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              UVC stream parameters and format settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-sm">Resolution</Label>
              <Select value={state.streamResolution} onValueChange={setResolution}>
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">1920×1080 (Full HD)</SelectItem>
                  <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
                  <SelectItem value="640x480">640×480 (VGA)</SelectItem>
                  <SelectItem value="320x240">320×240 (QVGA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-sm">Frame Format</Label>
              <Select value={state.streamFormat} onValueChange={setFrameFormat}>
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MJPEG">MJPEG</SelectItem>
                  <SelectItem value="NV21">NV21 (YUV)</SelectItem>
                  <SelectItem value="YUY2">YUY2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fallback & Recovery */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider uppercase flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" /> Fallback & Recovery
            </CardTitle>
            <CardDescription className="text-xs">
              Behavior when UVC device is disconnected or unavailable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-sm">Fallback Behavior</Label>
              <Select value={fallbackBehavior} onValueChange={setFallbackBehavior}>
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block — return error to app</SelectItem>
                  <SelectItem value="passthrough">Passthrough — use internal camera</SelectItem>
                  <SelectItem value="black">Black frame — return blank frames</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 flex-1" onClick={handleRescan}>
                <RefreshCw className="h-3 w-3" /> Rescan Devices
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 flex-1" onClick={handleExport}>
                <Download className="h-3 w-3" /> Export Config
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderSettings;
