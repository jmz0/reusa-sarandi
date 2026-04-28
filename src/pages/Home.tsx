import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section aria-labelledby="home-titulo" className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/85 shadow-sm">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative grid gap-8 px-6 py-9 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              Projeto de extensão • Tecnologia e reaproveitamento
            </span>

            <h1
              id="home-titulo"
              className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-950"
            >
              Reusa Sarandi
            </h1>

            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-8 text-slate-700">
              Plataforma digital para intermediar doações de móveis, roupas,
              brinquedos e utensílios domésticos, com foco na redução do
              descarte irregular em terrenos baldios no município de Sarandi/PR.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/itens"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Ver itens disponíveis
              </Link>

              <Link
                to="/cadastrar"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                Cadastrar item
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fluxo da plataforma
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Anuncie o item
                  </h3>
                  <p className="text-xs leading-5 text-slate-600">
                    Cadastre descrição, bairro, estado de conservação e fotos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Receba interessados
                  </h3>
                  <p className="text-xs leading-5 text-slate-600">
                    A conversa começa pela Caixa de Entrada, sem expor contato.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-white">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Atualize o status
                  </h3>
                  <p className="text-xs leading-5 text-slate-600">
                    Controle se o item está disponível, em negociação ou doado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700 ring-1 ring-emerald-100">
            ♻
          </div>
          <h2 className="font-semibold text-slate-950">Para quem quer doar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre itens em bom estado ou que possam ser reutilizados após
            pequenos reparos. Ajude a prolongar a vida útil dos objetos e
            apoiar outras pessoas.
          </p>
        </div>

        <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700 ring-1 ring-blue-100">
            🤝
          </div>
          <h2 className="font-semibold text-slate-950">Para quem precisa</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Encontre móveis e objetos disponíveis em seu bairro, reduzindo
            custos e incentivando o consumo consciente.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Meio ambiente
          </p>
          <h3 className="mt-2 font-semibold text-slate-950">
            Menos descarte irregular
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Itens que ainda podem ser utilizados deixam de ir para terrenos
            baldios e ganham nova função.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Comunidade
          </p>
          <h3 className="mt-2 font-semibold text-slate-950">
            Doação organizada
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A plataforma aproxima moradores que desejam doar de pessoas que
            precisam receber.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Protótipo
          </p>
          <h3 className="mt-2 font-semibold text-slate-950">
            Fluxo validável
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O sistema demonstra cadastro, busca, interesse, mensagens e controle
            do status de doação.
          </p>
        </div>
      </div>
    </section>
  );
}
