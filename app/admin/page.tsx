"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "../components/Button"
import { Input } from "../components/Input"

type Row = {
  id: string
  email: string
  source?: string
  created_at?: string
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<boolean>(false) // 🟢 جعلناها false ابتدائياً لشاشة Sign in
  const [error, setError] = useState<string>("")

  // 1️⃣ متابعة حالة الجلسة (Auth Session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // 2️⃣ جلب البيانات عند وجود الجلسة والاشتراك في التحديثات الفورية
  useEffect(() => {
    if (!session) return

    void loadRows()

    const channel = supabase
      .channel("waitlist-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waitlist" },
        () => {
          void loadRows()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  // دالة جلب البيانات من Supabase
  async function loadRows() {
    setLoading(true)
    setError("")
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRows((data as Row[]) ?? [])
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  // دالة تسجيل الدخول
  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  // 🟢 3️⃣ إضافة دالة تسجيل الخروج (المفقودة التي تسببت بخطأ السطر 142)
  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRows([])
  }

  // 🔴 1. إذا لم يسجل الدخول: اعرض شاشة الـ Login
  if (!session) {
    return (
      <main className="page center">
        <div className="card">
          <h1 className="title">Admin Login 🔒</h1>
          <p className="subtitle">يرجى تسجيل الدخول للوصول إلى قائمة الانتظار.</p>

          <form onSubmit={signIn} className="field">
            <div className="field">
              <label className="label">البريد الإلكتروني</label>
              <Input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">كلمة المرور</label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} disabled={loading}>
              Sign in
            </Button>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>
      </main>
    )
  }

  // 🟢 2. إذا تم تسجيل الدخول: اعرض قائمة المسجلين
  return (
    <main className="page wrap-wide">
      <div className="head">
        <div>
          <h1 className="title">قائمة المسجلين</h1>
          <span className="count">الإجمالي: {rows.length}</span>
        </div>
        <Button onClick={signOut} className="btn-ghost">
          تسجيل الخروج
        </Button>
      </div>

      {/* أ) حالة التحميل */}
      {loading && (
        <div className="state">
          <p>جاري تحميل البيانات...</p>
        </div>
      )}

      {/* ب) حالة الخطأ */}
      {!loading && error && (
        <div className="state">
          <p>{error}</p>
          <Button onClick={loadRows}>إعادة المحاولة</Button>
        </div>
      )}

      {/* جـ) حالة القائمة الفارغة */}
      {!loading && !error && rows.length === 0 && (
        <div className="state">
          <p className="big">📭</p>
          <p>لا يوجد مسجلين في القائمة حتى الآن.</p>
        </div>
      )}

      {/* د) حالة عرض البيانات */}
      {!loading && !error && rows.length > 0 && (
        <ul className="list">
          {rows.map((item) => (
            <li key={item.id} className="row">
              <span className="email">{item.email}</span>
              {item.source && <span className="badge">{item.source}</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}