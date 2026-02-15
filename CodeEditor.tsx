import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CodeEditorProps {
  language: "ar" | "fr";
}

export function CodeEditor({ language }: CodeEditorProps) {
  const [code, setCode] = useState(`# ${language === "ar" ? "اكتب كودك هنا" : "Écrivez votre code ici"}
print("${language === "ar" ? "مرحبا بالعالم!" : "Bonjour le monde!"}")

# ${language === "ar" ? "مثال على دالة" : "Exemple de fonction"}
def ${language === "ar" ? "جمع" : "addition"}(a, b):
    return a + b

result = ${language === "ar" ? "جمع" : "addition"}(5, 3)
print(f"${language === "ar" ? "النتيجة: {result}" : "Résultat: {result}"}")
`);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = useMutation(api.codeRunner.executeCode);
  const saveSnippet = useMutation(api.codeRunner.saveCodeSnippet);

  const handleExecute = async () => {
    if (!code.trim()) {
      toast.error(language === "ar" ? "يرجى كتابة بعض الكود أولاً" : "Veuillez écrire du code d'abord");
      return;
    }

    setIsExecuting(true);
    setOutput("");
    setError("");
    setAiSuggestion("");

    try {
      const result = await executeCode({
        code,
        preferredLanguage: language,
      });

      if (result.output) {
        setOutput(result.output);
      }
      if (result.error) {
        setError(result.error);
      }
      if (result.aiSuggestion) {
        setAiSuggestion(result.aiSuggestion);
      }

      toast.success(language === "ar" ? "تم تنفيذ الكود" : "Code exécuté");
    } catch (err) {
      toast.error(language === "ar" ? "خطأ في تنفيذ الكود" : "Erreur d'exécution");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveSnippet = async () => {
    const title = prompt(language === "ar" ? "اسم المقطع:" : "Nom de l'extrait:");
    if (!title) return;

    try {
      await saveSnippet({
        title,
        code,
        description: language === "ar" ? "مقطع محفوظ" : "Extrait sauvegardé",
      });
      toast.success(language === "ar" ? "تم حفظ المقطع" : "Extrait sauvegardé");
    } catch (err) {
      toast.error(language === "ar" ? "خطأ في الحفظ" : "Erreur de sauvegarde");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Code Input */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {language === "ar" ? "محرر الكود" : "Éditeur de Code"}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSaveSnippet}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              {language === "ar" ? "حفظ" : "Sauver"}
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isExecuting 
                ? (language === "ar" ? "جاري التنفيذ..." : "Exécution...")
                : (language === "ar" ? "تشغيل" : "Exécuter")
              }
            </button>
          </div>
        </div>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 min-h-[400px] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={language === "ar" ? "اكتب كود Python هنا..." : "Écrivez du code Python ici..."}
          dir="ltr"
        />
      </div>

      {/* Output Panel */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-4">
          {language === "ar" ? "النتائج" : "Résultats"}
        </h3>
        
        <div className="flex-1 space-y-4">
          {/* Output */}
          {output && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                {language === "ar" ? "المخرجات:" : "Sortie:"}
              </h4>
              <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono">
                {output}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">
                {language === "ar" ? "خطأ:" : "Erreur:"}
              </h4>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                {error}
              </pre>
            </div>
          )}

          {/* AI Suggestion */}
          {aiSuggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {language === "ar" ? "اقتراح الذكاء الاصطناعي:" : "Suggestion IA:"}
              </h4>
              <div className="text-sm text-blue-700 whitespace-pre-wrap">
                {aiSuggestion}
              </div>
            </div>
          )}

          {/* Default message */}
          {!output && !error && !aiSuggestion && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                {language === "ar" 
                  ? "اضغط على 'تشغيل' لرؤية النتائج هنا"
                  : "Cliquez sur 'Exécuter' pour voir les résultats ici"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
