"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { RegisterInput, registerSchema } from "../schemas/auth.schema";
import { registerUser } from "../services/auth-api";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(input: RegisterInput) {
    setServerError(null);

    const result = await registerUser(input);

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
              placeholder="np. wojtek_90"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username ? (
              <p className="text-sm text-destructive">
                Nick musi mieć 3-24 znaki i może zawierać tylko litery, cyfry
                oraz `_`.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 znaków"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                Hasło musi mieć minimum 8 znaków.
              </p>
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
                Zakładanie konta...
              </>
            ) : (
              "Zakładam konto i wbijam do ligi"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
