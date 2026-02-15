import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface CodeSnippetsProps {
  language: "ar" | "fr";
}

export function CodeSnippets({ language }: CodeSnippetsProps) {
  const snippets = useQuery(api.codeRunner.getCodeSnippets) || [];
  const saveSnippet = useMutation(api.codeRunner.saveCodeSnippet);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    code: "",
    description: "",
  });

  const handleSaveSnippet = async () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim()) {
      toast.error(language === "ar" ? "يرجى ملء العنوان والكود" : "Veuillez remplir le titre et le code");
      return;
    }

    try {
      await saveSnippet({
        title: newSnippet.title,
        code: newSnippet.code,
        description: newSnippet.description || undefined,
      });
      
      setNewSnippet({ title: "", code: "", description: "" });
      setShowAddForm(false);
      toast.success(language === "ar" ? "تم حفظ المقطع" : "Extrait sauvegardé");
    } catch (err) {
      toast.error(language === "ar" ? "خطأ في الحفظ" : "Erreur de sauvegarde");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(language === "ar" ? "تم نسخ الكود" : "Code copié");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {language === "ar" ? "المقاطع المحفوظة" : "Extraits de Code"}
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          {showAddForm 
            ? (language === "ar" ? "إلغاء" : "Annuler")
            : (language === "ar" ? "إضافة مقطع" : "Ajouter un extrait")
          }
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <input
            type="text"
            placeholder={language === "ar" ? "عنوان المقطع" : "Titre de l'extrait"}
            value={newSnippet.title}
            onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          <textarea
            placeholder={language === "ar" ? "وصف المقطع (اختياري)" : "Description (optionnel)"}
            value={newSnippet.description}
            onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={2}
          />
          
          <textarea
            placeholder={language === "ar" ? "كود Python" : "Code Python"}
            value={newSnippet.code}
            onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
            rows={6}
            dir="ltr"
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleSaveSnippet}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              {language === "ar" ? "حفظ" : "Sauvegarder"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSnippet({ title: "", code: "", description: "" });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {language === "ar" ? "إلغاء" : "Annuler"}
            </button>
          </div>
        </div>
      )}
      
      {snippets.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {language === "ar" 
              ? "لا توجد مقاطع محفوظة بعد"
              : "Aucun extrait sauvegardé pour le moment"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snippets.map((snippet) => (
            <div key={snippet._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{snippet.title}</h4>
                <button
                  onClick={() => copyToClipboard(snippet.code)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {language === "ar" ? "نسخ" : "Copier"}
                </button>
              </div>
              
              {snippet.description && (
                <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
              )}
              
              <div className="bg-gray-50 rounded p-3">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {snippet.code}
                </pre>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                {language === "ar" ? "تم الحفظ في:" : "Sauvegardé le:"} {" "}
                {new Date(snippet._creationTime).toLocaleString(
                  language === "ar" ? "ar-SA" : "fr-FR"
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
