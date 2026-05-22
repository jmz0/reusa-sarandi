import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

type FeedbackTipo = "sucesso" | "erro" | "info";

type FeedbackMessage = {
  id: number;
  tipo: FeedbackTipo;
  texto: string;
};

type FeedbackContextType = {
  mostrarFeedback: (texto: string, tipo?: FeedbackTipo) => void;
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

type FeedbackProviderProps = {
  children: ReactNode;
};

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [mensagem, setMensagem] = useState<FeedbackMessage | null>(null);

  const mostrarFeedback = useCallback(
    (texto: string, tipo: FeedbackTipo = "info") => {
      setMensagem({
        id: Date.now(),
        texto,
        tipo,
      });
    },
    []
  );

  useEffect(() => {
    if (!mensagem) return;

    const timeoutId = window.setTimeout(() => {
      setMensagem(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [mensagem]);

  return (
    <FeedbackContext.Provider value={{ mostrarFeedback }}>
      {children}

      {mensagem && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-20 z-50 max-w-sm rounded-lg border bg-white p-4 text-sm shadow-lg"
        >
          <div className="flex items-start gap-3">
            <span
              className={
                "mt-1 h-2.5 w-2.5 rounded-full " +
                (mensagem.tipo === "sucesso"
                  ? "bg-emerald-500"
                  : mensagem.tipo === "erro"
                  ? "bg-red-500"
                  : "bg-blue-500")
              }
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">
                {mensagem.tipo === "sucesso"
                  ? "Sucesso"
                  : mensagem.tipo === "erro"
                  ? "Atencao"
                  : "Informacao"}
              </p>
              <p className="mt-1 text-slate-700">{mensagem.texto}</p>
            </div>
            <button
              type="button"
              onClick={() => setMensagem(null)}
              className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar mensagem"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback deve ser usado dentro de FeedbackProvider");
  }
  return ctx;
}
