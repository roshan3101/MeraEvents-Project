"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorRetryProps {
  error: Error;
  onRetry: () => void;
  title?: string;
  description?: string;
}

export function ErrorRetry({
  error,
  onRetry,
  title = "Failed to load data",
  description,
}: ErrorRetryProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description || error.message || "An error occurred while loading data"}
          </p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

