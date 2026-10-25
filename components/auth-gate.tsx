import { startOAuthLogin } from "@/constants/oauth";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { StoreProvider } from "@/lib/motodiag/store";
import { usePathname } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof Api.getMe>>>;

type AuthContextValue = { user: AuthenticatedUser; refresh: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthGate");
  return value;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCallback = pathname.includes("/oauth/callback");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    const current = await Api.getMe();
    setUser(current);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (isCallback) return;
    let active = true;
    Api.getMe().then(current => { if (active) setUser(current); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [isCallback]);

  const login = async () => {
    setLoginError(null);
    try {
      await startOAuthLogin();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível iniciar o login.");
    }
  };

  const logout = useCallback(async () => {
    await Api.logout().catch(() => undefined);
    await Auth.removeSessionToken();
    await Auth.clearUserInfo();
    setUser(null);
  }, []);

  const authValue = useMemo(() => user ? { user, refresh, logout } : null, [logout, refresh, user]);
  if (isCallback) return <>{children}</>;
  if (checking) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={login} error={loginError} />;

  return <AuthContext.Provider value={authValue!}><StoreProvider scopeKey={user.openId}>{children}</StoreProvider></AuthContext.Provider>;
}

function LoadingScreen() {
  return <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#fb923c" size="large" /><Text style={{ color: "#cbd5e1", marginTop: 16 }}>Verificando sua sessão…</Text></SafeAreaView>;
}

function LoginScreen({ onLogin, error }: { onLogin: () => void; error: string | null }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}><View style={{ flex: 1, justifyContent: "center", padding: 26 }}><View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: "#e11d48", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontSize: 30, fontWeight: "900" }}>M</Text></View><Text style={{ color: "#fff", fontSize: 36, fontWeight: "900", marginTop: 18 }}>Moto<Text style={{ color: "#fb923c" }}>Diag</Text></Text><Text style={{ color: "#fdba74", fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginTop: 8 }}>OFICINA · DIAGNÓSTICO SEGURO</Text><Text style={{ color: "#cbd5e1", fontSize: 16, lineHeight: 24, marginTop: 28 }}>Entre com sua conta para acessar o catálogo, registrar atendimentos e manter os dados da sua oficina protegidos.</Text><Pressable onPress={onLogin} style={({ pressed }) => ({ marginTop: 30, backgroundColor: "#f97316", borderRadius: 14, minHeight: 54, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.8 : 1 })}><Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Entrar com Manus</Text></Pressable>{error && <Text style={{ color: "#fecaca", marginTop: 16, lineHeight: 20 }}>{error}</Text>}<Text style={{ color: "#94a3b8", fontSize: 12, lineHeight: 18, marginTop: 28 }}>O MotoDiag não armazena sua senha. O acesso é validado pelo provedor OAuth e a sessão é protegida pelo servidor.</Text></View></SafeAreaView>;
}
