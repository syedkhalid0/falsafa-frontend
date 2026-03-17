import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { db } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminCategories() {
  const { data: categories, isLoading, refetch } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formSlug, setFormSlug] = useState("");

  const openCreate = () => {
    setEditingCat(null);
    setFormName("");
    setFormCover("");
    setFormSlug("");
    setDialogOpen(true);
  };

  const openEdit = (cat: { id: string; name: string; cover_image_url: string | null; slug: string }) => {
    setEditingCat(cat.id);
    setFormName(cat.name);
    setFormCover(cat.cover_image_url || "");
    setFormSlug(cat.slug);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!formName.trim()) return;

    if (editingCat) {
      const { error } = await db
        .from("categories")
        .update({ name: formName, cover_image_url: formCover || null })
        .eq("id", editingCat);

      if (error) {
        toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
        return;
      }
      toast({ title: "Category updated", description: `"${formName}" has been updated.` });
    } else {
      const slug = formSlug || formName.toLowerCase().replace(/\s+/g, "-");
      const { error } = await db.from("categories").insert({
        name: formName,
        slug,
        cover_image_url: formCover || null,
        is_active: true,
        sort_order: 0,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
        return;
      }
      toast({ title: "Category created", description: `"${formName}" has been added.` });
    }
    setDialogOpen(false);
    refetch();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await db
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
      return;
    }
    refetch();
  };

  const deleteCat = async (id: string) => {
    const { error } = await db
      .from("categories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
      return;
    }
    refetch();
    toast({ title: "Category deleted" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold mb-1">Categories</h2>
          <p className="text-sm text-muted-foreground">{categories?.length || 0} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories?.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "rounded-2xl bg-card border border-border overflow-hidden transition-opacity",
              !cat.is_active && "opacity-50"
            )}
          >
            <div className="relative h-32 bg-muted">
              {cat.cover_image_url ? (
                <img src={cat.cover_image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <h3 className="text-sm font-serif font-semibold text-primary-foreground">{cat.name}</h3>
              </div>
              {!cat.is_active && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-medium">
                  Disabled
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-1 p-2">
              <button
                onClick={() => toggleActive(cat.id, cat.is_active)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={cat.is_active ? "Disable" : "Enable"}
              >
                {cat.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="p-2 rounded-lg hover:bg-lavender-light text-muted-foreground hover:text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteCat(cat.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingCat ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Thriller" />
            </div>
            {!editingCat && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. thriller"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input value={formCover} onChange={(e) => setFormCover(e.target.value)} placeholder="https://..." />
            </div>
            {formCover && (
              <div className="h-32 rounded-xl overflow-hidden bg-muted">
                <img src={formCover} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!formName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {editingCat ? "Save Changes" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
