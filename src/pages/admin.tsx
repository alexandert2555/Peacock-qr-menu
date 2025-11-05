import { useEffect, useMemo, useState } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type MenuRow = Database["public"]["Tables"]["menu_items"]["Row"];

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rows, setRows] = useState<MenuRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    adminSupabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setSessionReady(true);
    });
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    void fetchRows();
  }, [isLoggedIn]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await adminSupabase
      .from("menu_items")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      console.error(error);
    } else if (data) {
      setRows(data);
    }
    setLoading(false);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const { error } = await adminSupabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const onLogout = async () => {
    await adminSupabase.auth.signOut();
  };

  const updateRow = async (id: string, patch: Partial<Pick<MenuRow, "image_urls" | "is_available">>) => {
    const { error } = await adminSupabase
      .from("menu_items")
      .update(patch)
      .eq("id", id);
    if (error) {
      console.error(error);
    } else {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } as MenuRow : r)));
    }
  };

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2">name</th>
            <th className="text-left py-3 px-2">image_urls (comma separated)</th>
            <th className="text-left py-3 px-2">is_available</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const imageUrlsString = (row.image_urls || []).join(", ");
            return (
              <tr key={row.id} className="border-b align-top">
                <td className="py-3 px-2 min-w-[220px]">
                  <div className="font-medium">{row.name_en}</div>
                  <div className="text-muted-foreground">{row.name_cn}</div>
                </td>
                <td className="py-3 px-2 min-w-[360px]">
                  <Input
                    value={imageUrlsString}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      void updateRow(row.id, { image_urls: parsed });
                    }}
                    placeholder="https://... , https://..."
                  />
                </td>
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={!!row.is_available}
                    onChange={(e) => void updateRow(row.id, { is_available: e.target.checked })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ), [rows]);

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <form className="space-y-4" onSubmit={onLogin}>
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin: Menu Items</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchRows()} disabled={loading}>
            Refresh
          </Button>
          <Button variant="destructive" onClick={() => void onLogout()}>Logout</Button>
        </div>
      </div>
      <Card className="p-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          table
        )}
      </Card>
      <p className="text-xs text-muted-foreground mt-3">
        Note: Only image_urls and is_available are editable. Uses public anon key.
      </p>
    </div>
  );
};

export default Admin;


