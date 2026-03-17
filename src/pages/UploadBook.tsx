import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, Image, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUploadBook, generateSlug, useSlugCheck } from "@/hooks/useBookProcessing";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

const ACCEPTED_FILE_TYPES = ["application/pdf", "application/epub+zip", "text/plain", "text/markdown"];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const uploadBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  author: z.string().max(255, "Author name is too long").optional(),
  description: z.string().max(5000, "Description is too long").optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  is_public: z.boolean(),
});

type UploadBookForm = z.infer<typeof uploadBookSchema>;

export default function UploadBook() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [slug, setSlug] = useState("");

  const { mutate: uploadBook, isPending } = useUploadBook();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UploadBookForm>({
    resolver: zodResolver(uploadBookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category_id: "",
      is_public: true,
    },
  });

  const title = watch("title");

  useEffect(() => {
    if (title) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const { data: isSlugAvailable } = useSlugCheck(slug);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      setCover(selected);
      const url = URL.createObjectURL(selected);
      setCoverPreview(url);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      alert("Please upload a PDF, EPUB, TXT, or Markdown file");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File size must be less than 100MB");
      return;
    }
    setFile(selectedFile);
  };

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const onSubmit = (data: UploadBookForm) => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    if (!slug) {
      alert("Please enter a title to generate a slug");
      return;
    }

    if (isSlugAvailable === false) {
      alert("A book with this title already exists. Please choose a different title.");
      return;
    }

    uploadBook(
      {
        file,
        coverFile: cover || undefined,
        title: data.title,
        slug,
        author: data.author,
        description: data.description,
        category_id: data.category_id || undefined,
        is_public: data.is_public,
        priority: "medium",
      },
      {
        onSuccess: (result) => {
          navigate(`/book/${result.book.id}`);
        },
      }
    );
  };

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in max-w-2xl mx-auto">
      <Link
        to="/library"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Link>

      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-6">Upload a Book</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Photo (optional)</label>
          <div
            onClick={() => document.getElementById("cover-input")?.click()}
            className="w-32 h-44 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden"
          >
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Image className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Upload cover</span>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Book Title *</label>
          <input
            {...register("title")}
            type="text"
            placeholder="Enter book title"
            className={cn(
              "w-full h-11 px-4 rounded-xl bg-card border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all",
              errors.title ? "border-destructive" : "border-border"
            )}
          />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
          )}
          {slug && (
            <p className={cn(
              "text-xs mt-1",
              isSlugAvailable === false ? "text-destructive" : "text-muted-foreground"
            )}>
              URL slug: {slug} {isSlugAvailable === false && "(already taken)"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
          <input
            {...register("author")}
            type="text"
            placeholder="Enter author name"
            className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
          <textarea
            {...register("description")}
            placeholder="Enter book description"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
          <select
            {...register("category_id")}
            className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Book File *</label>
          <p className="text-xs text-muted-foreground mb-2">
            Upload a PDF, EPUB, TXT, or Markdown file (max 20MB). Only one file per book.
          </p>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40"
            )}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.epub,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              {file ? file.name : "Drop file here or click to browse"}
            </p>
            {!file && (
              <p className="text-xs text-muted-foreground mt-1">PDF, EPUB, TXT, Markdown supported (max 100MB)</p>
            )}
          </div>

          {file && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm">
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Visibility</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                isPublic
                  ? "border-primary bg-lavender-light text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              <Eye className="h-4 w-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                !isPublic
                  ? "border-primary bg-lavender-light text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              <EyeOff className="h-4 w-4" />
              Private
            </button>
          </div>
          <input type="hidden" {...register("is_public")} value={String(isPublic)} />
        </div>

        <button
          type="submit"
          disabled={isPending || !file || isSlugAvailable === false}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Book"
          )}
        </button>
      </form>
    </div>
  );
}
