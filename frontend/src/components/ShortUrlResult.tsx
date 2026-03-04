"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface ShortUrlResultProps {
  shortCode: string;
  longUrl: string;
  baseUrl: string;
  expiresAt?: string | null;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export default function ShortUrlResult({
  shortCode,
  longUrl,
  baseUrl,
  expiresAt,
  onDelete,
  isDeleting,
}: ShortUrlResultProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const shortUrl: string = `${baseUrl}/${shortCode}`;

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="result-card animate-scale-in space-y-4">
      {/* Short URL */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">
            Your short URL
          </p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-2 truncate"
          >
            {shortUrl}
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* Original URL */}
      <div className="pt-3 border-t border-primary/10">
        <p className="text-sm text-muted-foreground mb-1">
          Original URL
        </p>
        <p className="text-sm text-foreground/80 truncate">
          {longUrl}
        </p>
      </div>

      {/* Expiry */}
      {expiresAt && (
        <div className="pt-3 border-t border-primary/10">
          <p className="text-sm text-muted-foreground">
            Expires on{" "}
            <span className="text-foreground/80">
              {formatDate(expiresAt)}
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleCopy}
          disabled={isDeleting}
          className={`btn-primary flex-1 ${
            copied ? "bg-success hover:bg-success" : ""
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy URL
            </>
          )}
        </button>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="btn-secondary px-4 text-destructive hover:bg-destructive/10"
          title="Delete short URL"
        >
          {isDeleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
