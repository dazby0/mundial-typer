"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { LoginInput, loginSchema } from "../schemas/auth.schema";
import { loginUser } from "../services/auth-api";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(input: LoginInput) {
    setServerError(null);

    const result = await loginUser(input);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError ? (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="username">Nick</Label>
            <Input
              id="username"
              placeholder="Twój legendarny nick"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              {...register("username")}
            />
            {errors.username ? (
              <p className="text-sm text-destructive">Podaj poprawny nick.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Hasło do strefy piwnej"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">Podaj poprawne hasło.</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logowanie...
              </>
            ) : (
              "Wchodzę sprawdzić, kto pajacuje"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
