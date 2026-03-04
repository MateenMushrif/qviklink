"use client";

import { useState } from "react";
import { Link2, Zap, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import UrlShortenerForm from "./UrlShortenerForm";
import ShortUrlResult from "./ShortUrlResult";

interface ShortUrlData {
  id: number;
  shortCode: string;
  longUrl: string;
  expiresAt: string | null;
  createdAt: string;
}

const API_BASE_URL = "";

export default function ShortenerClient() {
  const [result, setResult] = useState<ShortUrlData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleSubmit = async (data: {
    longUrl: string;
    customAlias?: string;
    expiresAt?: string;
  }): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          longUrl: data.longUrl,
          customAlias: data.customAlias,
          expiresAt: data.expiresAt,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || "Failed to create short URL"
        );
      }

      setResult(responseData as ShortUrlData);
      toast.success("Short URL created successfully!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!result) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/${result.shortCode}`, {
          method: "DELETE",
        }
      );

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to delete short URL"
        );
      }

      setResult(null);
      toast.success("Short URL deleted successfully!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Qviklink
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Shorten your links,
              <br />
              <span className="text-primary">
                amplify your reach
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Create short, memorable links in seconds. No sign-up required.
            </p>
          </div>

          {/* Form Card */}
          <div className="card-elevated p-6 sm:p-8 shadow-soft">
            <UrlShortenerForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {result && (
              <div className="mt-6 pt-6 border-t border-border">
                <ShortUrlResult
                  shortCode={result.shortCode}
                  longUrl={result.longUrl}
                  baseUrl={process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}
                  expiresAt={result.expiresAt}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-foreground text-sm sm:text-base">
                Lightning Fast
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Generate in milliseconds
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-foreground text-sm sm:text-base">
                Secure
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Your links are safe
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-foreground text-sm sm:text-base">
                Custom Expiry
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Set link lifetimes
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Simple, fast, and free URL shortening
          </p>
        </div>
      </footer>
    </div>
  );
}
