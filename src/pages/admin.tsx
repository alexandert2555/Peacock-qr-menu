import { useEffect, useMemo, useState, useCallback } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

type MenuRow = Database["public"]["Tables"]["menu_items"]["Row"];

type RowEditState = {
  image_urls: string;
  is_available: boolean;
};

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rows, setRows] = useState<MenuRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, RowEditState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "success" | "error" | null>>({});

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
      // Initialize edit state for each row
      const initialEdits: Record<string, RowEditState> = {};
      data.forEach((row) => {
        initialEdits[row.id] = {
          image_urls: (row.image_urls || []).join(", "),
          is_available: !!row.is_available,
        };
      });
      setEdits(initialEdits);
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

  const saveRow = useCallback(async (id: string) => {
    const edit = edits[id];
    if (!edit) return;

    setSaving((prev) => ({ ...prev, [id]: true }));
    setSaveStatus((prev) => ({ ...prev, [id]: null }));

    const imageUrlsArray = edit.image_urls
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { data, error } = await adminSupabase
      .from("menu_items")
      .update({
        image_urls: imageUrlsArray,
        is_available: edit.is_available,
      })
      .eq("id", id)
      .select()
      .single();

    setSaving((prev) => ({ ...prev, [id]: false }));

    if (error) {
      console.error("Error updating row:", error);
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [id]: null }));
      }, 3000);
    } else if (data) {
      setSaveStatus((prev) => ({ ...prev, [id]: "success" }));
      // Update the row in state
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [id]: null }));
      }, 2000);
    }
  }, [edits]);

  const updateAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    // Update local state immediately for better UX
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], is_available: isAvailable },
    }));

    setSaving((prev) => ({ ...prev, [id]: true }));
    setSaveStatus((prev) => ({ ...prev, [id]: null }));

    const { data, error } = await adminSupabase
      .from("menu_items")
      .update({ is_available: isAvailable })
      .eq("id", id)
      .select()
      .single();

    setSaving((prev) => ({ ...prev, [id]: false }));

    if (error) {
      console.error("Error updating availability:", error);
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      // Revert the change on error
      setEdits((prev) => ({
        ...prev,
        [id]: { ...prev[id], is_available: !isAvailable },
      }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [id]: null }));
      }, 3000);
    } else if (data) {
      setSaveStatus((prev) => ({ ...prev, [id]: "success" }));
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [id]: null }));
      }, 2000);
    }
  }, []);

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2">Name</th>
            <th className="text-left py-3 px-2">image_urls (comma separated)</th>
            <th className="text-left py-3 px-2">is_available</th>
            <th className="text-left py-3 px-2">actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const edit = edits[row.id];
            const isSaving = saving[row.id];
            const status = saveStatus[row.id];
            const hasChanges = edit && (
              edit.image_urls !== (row.image_urls || []).join(", ") ||
              edit.is_available !== !!row.is_available
            );

            return (
              <tr key={row.id} className="border-b align-top">
                <td className="py-3 px-2 min-w-[220px]">
                  <div className="font-medium">{row.name_en}</div>
                  <div className="text-muted-foreground">{row.name_cn}</div>
                </td>
                <td className="py-3 px-2 min-w-[360px]">
                  <Input
                    value={edit?.image_urls || ""}
                    onChange={(e) => {
                      setEdits((prev) => ({
                        ...prev,
                        [row.id]: {
                          ...prev[row.id],
                          image_urls: e.target.value,
                          is_available: edit?.is_available ?? !!row.is_available,
                        },
                      }));
                    }}
                    placeholder="https://... , https://..."
                    disabled={isSaving}
                  />
                </td>
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={edit?.is_available ?? !!row.is_available}
                    onChange={(e) => void updateAvailability(row.id, e.target.checked)}
                    disabled={isSaving}
                  />
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => void saveRow(row.id)}
                      disabled={isSaving || !hasChanges}
                      className="min-w-[80px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    {status === "success" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {status === "error" && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ), [rows, edits, saving, saveStatus, saveRow, updateAvailability]);

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
        Note: Only image_urls and is_available are editable. Click "Save" to update changes. Checkboxes save automatically. Uses public anon key.
      </p>
    </div>
  );
};

export default Admin;


