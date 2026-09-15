import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

const loginSchema = z.object({
  email: z.string().min(1, "Introdu adresa de email").email("Introdu o adresă de email validă"),
  password: z.string().min(1, "Introdu parola"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (data) => {
    setAuthError(null)
    try {
      await login(data.email, data.password)
    } catch {
      setAuthError("Email sau parolă greșite. Încearcă din nou.")
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-md px-8 py-10">
          <h1 className="font-display text-xl text-[var(--foreground)] mb-1">
            JT Gospodărie <span className="text-[var(--muted-foreground)]">|</span> Matca
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            Conectează-te pentru a-ți gestiona gospodăria.
          </p>

          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@ferma.ro"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Parolă</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {authError && <p className="text-sm text-[var(--destructive)]">{authError}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
              >
                {isSubmitting ? "Se conectează…" : "Conectare"}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}
