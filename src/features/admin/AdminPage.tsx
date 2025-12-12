import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export function AdminPage() {
  const [codeType, setCodeType] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [lastCodeType, setLastCodeType] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [excludeTest, setExcludeTest] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = async () => {
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeType: codeType || undefined }),
      });
      const data = await res.json();
      setGeneratedCode(data.code);
      setLastCodeType(data.codeType);
      toast.success("Invite code generated");
    } catch (_e) {
      toast.error("Failed to generate code");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) {
        params.append("fromDate", new Date(fromDate).toISOString());
      }
      if (excludeTest) {
        params.append("excludeTypes", "test");
      }

      const res = await fetch(`/api/admin/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deep-interviewer-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export downloaded");
    } catch (_e) {
      toast.error("Failed to download data");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen max-w-2xl space-y-8 bg-background p-8 text-foreground">
      <h1 className="font-bold text-3xl">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Code Type (optional, e.g. 'test')"
              value={codeType}
              onChange={(e) => setCodeType(e.target.value)}
            />
            <Button onClick={handleGenerate}>Generate</Button>
          </div>
          {generatedCode && (
            <div className="rounded-md bg-muted p-4 text-center">
              <p className="text-muted-foreground text-sm">
                Generated Code ({lastCodeType || "standard"}):
              </p>
              <p className="mt-2 select-all font-bold font-mono text-4xl">{generatedCode}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="fromDate" className="font-medium text-sm">
              From Date
            </label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="excludeTest"
              checked={excludeTest}
              onChange={(e) => setExcludeTest(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="excludeTest"
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exclude "test" codes
            </label>
          </div>

          <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
            {isDownloading ? "Downloading..." : "Download Export JSON"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
