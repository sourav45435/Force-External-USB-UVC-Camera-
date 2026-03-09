import { useState, useRef, useCallback } from "react";
import { Camera, RefreshCw, Usb, Download, Pencil, Check, X, Plus, Trash2, Link, Unlink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSystem } from "@/context/SystemContext";
import { toast } from "sonner";

const CameraConfig = () => {
  const {
    state,
    toggleHideInternal,
    toggleAutoRedirect,
    toggleForceResolution,
    rescanDevices,
    updateCameraMapping,
    addCameraDevice,
    removeCameraDevice,
    toggleCameraRedirect,
    exportConfig,
  } = useSystem();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newOriginal, setNewOriginal] = useState("");
  const [newMapped, setNewMapped] = useState("");
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: number; name: string; timestamp: string; preview: string }[]>([]);
  const [capturing, setCapturing] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCapturePhoto = useCallback(async (cam: { id: number; originalName: string; mappedTo: string; status: string }) => {
    setCapturing(cam.id);
    const isBack = cam.originalName.includes("Back") || cam.id === 0;
    const source = state.autoRedirect || cam.status === "redirected" ? cam.mappedTo : cam.originalName;
    toast.info(`Opening ${isBack ? "back" : "front"} camera...`);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isBack ? "environment" : "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      // Create a video element to grab a frame
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      // Wait a moment for the camera to adjust exposure
      await new Promise((r) => setTimeout(r, 500));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      // Stop stream
      stream.getTracks().forEach((t) => t.stop());

      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

      setCapturedPhotos((prev) => [
        { id: cam.id, name: source, timestamp: ts, preview: dataUrl },
        ...prev,
      ]);
      setCapturing(null);
      toast.success("Photo captured!", {
        description: `${source} – ${video.videoWidth}x${video.videoHeight} – ${ts}`,
      });
    } catch (err: any) {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCapturing(null);
      toast.error("Camera access failed", {
        description: err?.message || "Could not access camera. Check permissions.",
      });
    }
  }, [state.autoRedirect]);

  const handleRescan = () => {
    rescanDevices();
    toast.success("USB device rescan complete", { description: "Found /dev/video0 – UVC device connected" });
  };

  const handleExportConfig = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uvc-camera-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Config exported", { description: "uvc-camera-config.json downloaded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">
            Camera <span className="text-primary text-glow">Configuration</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure UVC device and camera ID mapping</p>
        </div>
        <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5" onClick={handleExportConfig}>
          <Download className="h-3 w-3" /> Export Config
        </Button>
      </div>

      {/* UVC Device Info */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            USB Device
          </h2>
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5" onClick={handleRescan}>
            <RefreshCw className="h-3 w-3" /> Rescan
          </Button>
        </div>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Device Nodes</span>
            <span className={state.v4l2Nodes ? "text-success" : "text-destructive"}>
              {state.v4l2Nodes ? "/dev/video* present" : "Not found"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">libuvc Status</span>
            <span className={state.uvcConnected ? "text-success" : "text-destructive"}>
              {state.uvcConnected ? "Working in USB Camera app" : "Not available"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Driver</span>
            <span className="text-foreground">uvcvideo (V4L2)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Camera Provider</span>
            <span className="text-destructive">ExternalCameraProvider ABSENT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Provider</span>
            <span className="text-foreground">@2.7-service-google</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stream Status</span>
            <span className={state.streamActive ? "text-success" : "text-muted-foreground"}>
              {state.streamActive ? `Active – ${state.streamResolution} @ ${state.streamFps}fps` : "Idle"}
            </span>
          </div>
        </div>
      </div>

      {/* Camera ID Mapping */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            Camera ID Mapping
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-1.5"
            onClick={() => {
              setIsAdding(true);
              setNewOriginal("");
              setNewMapped("UVC Camera");
            }}
          >
            <Plus className="h-3 w-3" /> Add Camera
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground py-2 pr-4">Original ID</th>
                <th className="text-left text-muted-foreground py-2 pr-4">Original Device</th>
                <th className="text-left text-muted-foreground py-2 pr-4">Mapped To</th>
                <th className="text-left text-muted-foreground py-2 pr-4">Status</th>
                <th className="text-left text-muted-foreground py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {state.cameraDevices.map((cam) => (
                <tr
                  key={cam.id}
                  className="border-b border-border/50 cursor-pointer hover:bg-accent/30 transition-colors group"
                  onClick={() => {
                    if (editingId !== cam.id) {
                      setEditingId(cam.id);
                      setEditValue(cam.mappedTo);
                    }
                  }}
                >
                  <td className="py-2.5 pr-4 text-foreground">{cam.id}</td>
                  <td className={`py-2.5 pr-4 ${state.autoRedirect ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {cam.originalName}
                  </td>
                  <td className="py-2.5 pr-4">
                    {editingId === cam.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-6 text-xs font-mono px-1.5 w-36"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateCameraMapping(cam.id, editValue);
                              setEditingId(null);
                              toast.success("Mapping updated", { description: `Camera ${cam.id} → ${editValue}` });
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { updateCameraMapping(cam.id, editValue); setEditingId(null); toast.success("Mapping updated"); }}>
                          <Check className="h-3 w-3 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-primary inline-flex items-center gap-1.5">
                        {state.autoRedirect ? cam.mappedTo : cam.originalName}
                        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 text-xs font-mono gap-1 px-2 ${cam.status === "redirected" ? "text-success hover:text-destructive" : "text-muted-foreground hover:text-success"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCameraRedirect(cam.id);
                        toast.success(cam.status === "redirected" ? "Camera detached" : "Camera attached", {
                          description: `${cam.originalName} → ${cam.status === "redirected" ? "Native" : "UVC Redirect"}`,
                        });
                      }}
                    >
                      {cam.status === "redirected" ? (
                        <><Link className="h-3 w-3" /> Attached</>
                      ) : (
                        <><Unlink className="h-3 w-3" /> Detached</>
                      )}
                    </Button>
                  </td>
                  <td className="py-2.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCameraDevice(cam.id);
                        toast.success("Camera removed", { description: `Camera ${cam.id} deleted` });
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {isAdding && (
                <tr className="border-b border-border/50 bg-accent/20">
                  <td className="py-2.5 pr-4 text-muted-foreground">auto</td>
                  <td className="py-2.5 pr-4">
                    <Input
                      value={newOriginal}
                      onChange={(e) => setNewOriginal(e.target.value)}
                      placeholder="Device name"
                      className="h-6 text-xs font-mono px-1.5 w-36"
                      autoFocus
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Input
                      value={newMapped}
                      onChange={(e) => setNewMapped(e.target.value)}
                      placeholder="Map to"
                      className="h-6 text-xs font-mono px-1.5 w-36"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOriginal.trim()) {
                          addCameraDevice(newOriginal.trim(), newMapped.trim() || "UVC Camera");
                          setIsAdding(false);
                          toast.success("Camera added");
                        } else if (e.key === "Escape") {
                          setIsAdding(false);
                        }
                      }}
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { if (newOriginal.trim()) { addCameraDevice(newOriginal.trim(), newMapped.trim() || "UVC Camera"); setIsAdding(false); toast.success("Camera added"); } }}>
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                  </td>
                  <td className="py-2.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsAdding(false)}>
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera Capture */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-4">
          Capture Photo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {state.cameraDevices.map((cam) => (
            <Button
              key={cam.id}
              variant="outline"
              className="h-auto py-3 px-4 flex flex-col items-center gap-2 font-mono text-xs"
              disabled={capturing !== null}
              onClick={(e) => {
                e.preventDefault();
                handleCapturePhoto(cam);
              }}
            >
              <Camera className={`h-5 w-5 ${capturing === cam.id ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
              <span className="text-foreground font-medium">
                {cam.originalName.includes("Back") || cam.id === 0 ? "📷 Back Camera" : "🤳 Front Camera"}
              </span>
              <span className="text-muted-foreground">
                {cam.status === "redirected" ? `→ ${cam.mappedTo}` : cam.originalName}
              </span>
            </Button>
          ))}
        </div>

        {capturedPhotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground">Recent captures</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono h-6 px-2 text-muted-foreground"
                onClick={() => setCapturedPhotos([])}
              >
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {capturedPhotos.slice(0, 8).map((photo, i) => (
                <div
                  key={`${photo.timestamp}-${i}`}
                  className="rounded-md border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setPreviewPhoto(photo.preview)}
                >
                  {photo.preview.startsWith("data:") ? (
                    <img src={photo.preview} alt={`Capture ${photo.name}`} className="h-20 w-full object-cover" />
                  ) : (
                    <div className="h-20 flex items-center justify-center" style={{ backgroundColor: photo.preview }}>
                      <Camera className="h-4 w-4 text-foreground/40" />
                    </div>
                  )}
                  <div className="p-1.5 bg-card">
                    <p className="text-[10px] font-mono text-foreground truncate">{photo.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{photo.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl p-2">
          <DialogTitle className="sr-only">Photo Preview</DialogTitle>
          {previewPhoto && (
            <img src={previewPhoto} alt="Captured photo" className="w-full rounded-md" />
          )}
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs gap-1.5"
              onClick={() => {
                if (!previewPhoto) return;
                const a = document.createElement("a");
                a.href = previewPhoto;
                a.download = `capture-${Date.now()}.jpg`;
                a.click();
                toast.success("Photo downloaded");
              }}
            >
              <Download className="h-3 w-3" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggles */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-2">
          Behavior
        </h2>
        {[
          {
            label: "Hide internal cameras",
            desc: "Remove internal cameras from getCameraIdList()",
            checked: state.hideInternal,
            onChange: () => {
              toggleHideInternal();
              toast(state.hideInternal ? "Internal cameras visible" : "Internal cameras hidden");
            },
          },
          {
            label: "Auto-redirect streams",
            desc: "Redirect all camera open requests to UVC device",
            checked: state.autoRedirect,
            onChange: () => {
              toggleAutoRedirect();
              toast(state.autoRedirect ? "Auto-redirect disabled" : "Auto-redirect enabled");
            },
          },
          {
            label: "Force resolution override",
            desc: "Advertise UVC resolutions as native camera resolutions",
            checked: state.forceResolution,
            onChange: () => {
              toggleForceResolution();
              toast(state.forceResolution ? "Resolution override disabled" : "Resolution override enabled");
            },
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={item.checked} onCheckedChange={item.onChange} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraConfig;
