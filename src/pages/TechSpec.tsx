import { Shield, Cpu, Camera, Package, CheckCircle, AlertTriangle, FileText, Smartphone, Terminal } from "lucide-react";

const TechSpec = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          Technical <span className="text-primary text-glow">Specification</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Force External USB UVC Camera — Runtime Override Module
        </p>
      </div>

      {/* Important Notice */}
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-mono font-semibold text-destructive">NOT A DESIGN CONTEST</p>
          <p className="text-xs text-muted-foreground mt-1">
            This is a highly technical Android development task. Only serious Android developers with experience in LSPosed, Zygisk, Magisk modules and Camera2 internals should participate. Generic diagrams, flowcharts, AI-generated explanations or conceptual images will NOT be considered valid submissions.
          </p>
        </div>
      </div>

      {/* Target Device */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            Target Device
          </h2>
        </div>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="text-foreground">Pixel 8a (akita)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ROM</span><span className="text-foreground">EvolutionX 15 (Android 15)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Root</span><span className="text-foreground">Magisk + Zygisk + LSPosed</span></div>
        </div>
      </div>

      {/* Goal */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-mono font-semibold text-primary tracking-wider uppercase">
            Goal
          </h2>
        </div>
        <p className="text-sm text-foreground font-mono">
          Force a USB UVC external camera to behave as the <span className="text-primary font-bold">ONLY</span> usable system camera.
        </p>
      </div>

      {/* Requirements */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            Requirements
          </h2>
        </div>
        <div className="space-y-3">
          {[
            "Any app requesting a camera must open ONLY the external USB UVC camera",
            "Internal physical cameras must be unusable or invisible",
            "No ROM building",
            "No vendor modifications",
            "No HAL or external provider changes",
            "Runtime-only solution",
          ].map((req, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-mono text-foreground">{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            Implementation Must Use
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border border-border bg-secondary/50 p-4">
            <Shield className="h-5 w-5 text-info mb-2" />
            <p className="text-sm font-mono font-semibold text-foreground">LSPosed Module</p>
            <p className="text-xs text-muted-foreground mt-1">Java hooks for Camera2 API interception</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/50 p-4">
            <Cpu className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-mono font-semibold text-foreground">Zygisk Module</p>
            <p className="text-xs text-muted-foreground mt-1">Native C/C++ hooks for CameraService</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/50 p-4">
            <Package className="h-5 w-5 text-warning mb-2" />
            <p className="text-sm font-mono font-semibold text-foreground">Magisk Module ZIP</p>
            <p className="text-xs text-muted-foreground mt-1">Flashable package with both modules</p>
          </div>
        </div>
      </div>

      {/* Required Deliverables */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-warning" />
          <h2 className="text-sm font-mono font-semibold text-warning tracking-wider uppercase">
            Required Final Deliverables
          </h2>
        </div>
        <div className="space-y-3">
          {[
            "Working LSPosed module (APK)",
            "Working Magisk module ZIP including native Zygisk (.so arm64)",
            "Source code for both modules",
            "Clear installation instructions",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <span className="text-sm font-mono text-foreground">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border bg-card p-3">
          <p className="text-xs font-mono font-semibold text-foreground mb-2">Demo video must show:</p>
          <div className="space-y-1.5">
            {[
              "Camera apps only open UVC",
              "Internal cameras are not accessible",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary text-xs">▸</span>
                <span className="text-xs font-mono text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs font-mono text-destructive mt-3">
          Submissions without actual working modules will NOT be considered. Conceptual diagrams, generic architecture images, or text explanations alone are not valid entries.
        </p>
      </div>

      {/* Acceptance Criteria */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-success" />
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase">
            Acceptance Criteria
          </h2>
        </div>
        <div className="space-y-3">
          {[
            "Only camera 0 and 1 mapped to UVC are usable",
            "No app can open internal cameras",
            "System remains stable",
            "No Play Integrity degradation compared to baseline",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span className="text-sm font-mono text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Warning */}
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm font-mono font-semibold text-destructive">
          Only submit if you are capable of delivering real Android native development.
        </p>
      </div>
    </div>
  );
};

export default TechSpec;
