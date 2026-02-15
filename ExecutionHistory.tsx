import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ExecutionHistoryProps {
  language: "ar" | "fr";
}

export function ExecutionHistory({ language }: ExecutionHistoryProps) {
  const history = useQuery(api.codeRunner.getExecutionHistory) || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {language === "ar" ? "سجل التنفيذ" : "Historique d'exécution"}
      </h3>
      
      {history.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {language === "ar" 
              ? "لا يوجد سجل تنفيذ بعد"
              : "Aucun historique d'exécution pour le moment"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((execution) => (
            <div key={execution._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(execution._creationTime).toLocaleString(
                    language === "ar" ? "ar-SA" : "fr-FR"
                  )}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  execution.error 
                    ? "bg-red-100 text-red-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {execution.error 
                    ? (language === "ar" ? "خطأ" : "Erreur")
                    : (language === "ar" ? "نجح" : "Succès")
                  }
                </span>
              </div>
              
              <div className="bg-gray-50 rounded p-3 mb-3">
                <h4 className="text-sm font-medium mb-2">
                  {language === "ar" ? "الكود:" : "Code:"}
                </h4>
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {execution.code}
                </pre>
              </div>
              
              {execution.output && (
                <div className="bg-green-50 rounded p-3 mb-3">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    {language === "ar" ? "المخرجات:" : "Sortie:"}
                  </h4>
                  <pre className="text-xs font-mono text-green-700 whitespace-pre-wrap">
                    {execution.output}
                  </pre>
                </div>
              )}
              
              {execution.error && (
                <div className="bg-red-50 rounded p-3 mb-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    {language === "ar" ? "خطأ:" : "Erreur:"}
                  </h4>
                  <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap">
                    {execution.error}
                  </pre>
                </div>
              )}
              
              {execution.aiSuggestion && (
                <div className="bg-blue-50 rounded p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    {language === "ar" ? "اقتراح الذكاء الاصطناعي:" : "Suggestion IA:"}
                  </h4>
                  <div className="text-xs text-blue-700 whitespace-pre-wrap">
                    {execution.aiSuggestion}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
