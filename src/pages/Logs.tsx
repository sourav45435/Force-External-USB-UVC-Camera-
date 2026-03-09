import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, ArrowDown } from "lucide-react";
import { useSystem } from "@/context/SystemContext";
import { toast } from "sonner";

const levelColors: Record<string, string> = {
  INFO: "text-foreground",
  WARN: "text-warning",
  ERROR: "text-destructive",
};

const sourceColors: Record<string, string> = {
  LSPosed: "text-info",
  Zygisk: "text-primary",
  UVC: "text-accent-foreground",
  System: "text-muted-foreground",
};

const Logs = () => {
  const { state, clearLogs } = useSystem();
  const [filter, setFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = state.logs
    .filter((l) => filter === "ALL" || l.source === filter)
    .filter((l) => levelFilter === "ALL" || l.level === levelFilter);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.logs, autoScroll]);

  const handleExport = () => {
    const text = filtered.map((l) => `${l.ts} [${l.level}] [${l.source}] ${l.msg}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uvc-override-logs.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported", { description: `${filtered.length} entries saved` });
  };

  const handleClear = () => {
    clearLogs();
    toast("Logs cleared");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">
            System <span className="text-primary text-glow">Logs</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Runtime hook and capture engine output · {state.logs.length} entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5" onClick={handleExport}>
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-1.5 text-destructive hover:text-destructive"
            onClick={handleClear}
          >
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>
      </div>

      {/* Source Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5">
          {["ALL", "LSPosed", "Zygisk", "UVC", "System"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-border self-center" />
        <div className="flex gap-1.5">
          {["ALL", "INFO", "WARN", "ERROR"].map((f) => (
            <button
              key={f}
              onClick={() => setLevelFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                levelFilter === f
                  ? f === "ERROR" ? "bg-destructive text-destructive-foreground"
                  : f === "WARN" ? "bg-warning text-warning-foreground"
                  : "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
              autoScroll ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            <ArrowDown className="h-3 w-3" /> Auto-scroll
          </button>
        </div>
      </div>

      {/* Log Output */}
      <div
        ref={scrollRef}
        className="rounded-lg border border-border bg-card p-4 font-mono text-xs overflow-auto max-h-[60vh]"
      >
        <div className="space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No log entries match current filters</p>
          ) : (
            filtered.map((log, i) => (
              <div key={i} className="flex gap-3 py-1 hover:bg-secondary/50 px-2 rounded">
                <span className="text-muted-foreground shrink-0">{log.ts}</span>
                <span className={`shrink-0 w-12 ${levelColors[log.level]}`}>{log.level}</span>
                <span className={`shrink-0 w-16 ${sourceColors[log.source]}`}>[{log.source}]</span>
                <span className="text-foreground">{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
