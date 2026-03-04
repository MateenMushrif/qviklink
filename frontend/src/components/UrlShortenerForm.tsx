"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Link2, Calendar, Tag, Loader2 } from "lucide-react";

interface UrlShortenerFormProps {
  onSubmit: (data: {
    longUrl: string;
    customAlias?: string;
    expiresAt?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

interface FormErrors {
  longUrl?: string;
  customAlias?: string;
}

export default function UrlShortenerForm({
  onSubmit,
  isLoading,
}: UrlShortenerFormProps) {
  const [longUrl, setLongUrl] = useState<string>("");
  const [customAlias, setCustomAlias] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateAlias = (alias: string): boolean => {
    if (!alias) return true;
    return /^[a-zA-Z0-9-_]+$/.test(alias) && alias.length <= 50;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!longUrl.trim()) {
      newErrors.longUrl = "URL is required";
    } else if (!validateUrl(longUrl)) {
      newErrors.longUrl = "Please enter a valid URL (include https://)";
    }

    if (customAlias && !validateAlias(customAlias)) {
      newErrors.customAlias =
        "Alias can only contain letters, numbers, hyphens and underscores";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    await onSubmit({
      longUrl: longUrl.trim(),
      customAlias: customAlias.trim() || undefined,
      expiresAt: expiryDate
        ? new Date(expiryDate).toISOString()
        : undefined,
    });
  };

  const handleLongUrlChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setLongUrl(e.target.value);
    if (errors.longUrl) {
      setErrors((prev) => ({ ...prev, longUrl: undefined }));
    }
  };

  const handleAliasChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setCustomAlias(e.target.value);
    if (errors.customAlias) {
      setErrors((prev) => ({ ...prev, customAlias: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main URL Input */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Link2 className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={longUrl}
            onChange={handleLongUrlChange}
            placeholder="Paste your long URL here..."
            className={`input-field pl-12 text-lg ${
              errors.longUrl
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.longUrl && (
          <p className="error-text">{errors.longUrl}</p>
        )}
      </div>

      {/* Optional Fields Toggle */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="btn-ghost text-sm"
      >
        {showOptions
          ? "Hide options"
          : "Add custom alias or expiry date"}
      </button>

      {/* Optional Fields */}
      {showOptions && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Custom Alias */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Custom alias
              </label>
              <input
                type="text"
                value={customAlias}
                onChange={handleAliasChange}
                placeholder="my-custom-link"
                className={`input-field ${
                  errors.customAlias
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={isLoading}
              />
              {errors.customAlias && (
                <p className="error-text">
                  {errors.customAlias}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiry date
              </label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(e.target.value)
                }
                min={new Date().toISOString().slice(0, 16)}
                className="input-field"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Short URL"
        )}
      </button>
    </form>
  );
}
