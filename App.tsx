import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { CodeEditor } from "./components/CodeEditor";
import { ExecutionHistory } from "./components/ExecutionHistory";
import { CodeSnippets } from "./components/CodeSnippets";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"editor" | "history" | "snippets">("editor");
  const [language, setLanguage] = useState<"ar" | "fr">("ar");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">
            {language === "ar" ? "محرر الأكواد" : "Éditeur de Code"}
          </h2>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as "ar" | "fr")}
            className="px-3 py-1 rounded border border-gray-300 text-sm"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <SignOutButton />
      </header>
      
      <main className="flex-1 flex flex-col p-4">
        <Authenticated>
          <div className="w-full max-w-7xl mx-auto">
            <nav className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "editor" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {language === "ar" ? "المحرر" : "Éditeur"}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "history" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {language === "ar" ? "السجل" : "Historique"}
              </button>
              <button
                onClick={() => setActiveTab("snippets")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "snippets" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {language === "ar" ? "المقاطع المحفوظة" : "Extraits"}
              </button>
            </nav>

            {activeTab === "editor" && <CodeEditor language={language} />}
            {activeTab === "history" && <ExecutionHistory language={language} />}
            {activeTab === "snippets" && <CodeSnippets language={language} />}
          </div>
        </Authenticated>

        <Unauthenticated>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                {language === "ar" ? "محرر أكواد Python" : "Éditeur Python"}
              </h1>
              <p className="text-xl text-secondary mb-8">
                {language === "ar" 
                  ? "اكتب وشغل أكواد Python مع تصحيح الأخطاء بالذكاء الاصطناعي"
                  : "Écrivez et exécutez du code Python avec correction d'erreurs par IA"
                }
              </p>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      <Toaster />
    </div>
  );
}
