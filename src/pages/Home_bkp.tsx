export default function Home() {
  return (
    <section aria-labelledby="home-titulo">
      <h1 id="home-titulo" className="text-2xl sm:text-3xl font-bold text-gray-900">
        Reusa Sarandi
      </h1>
      <p className="mt-3 text-gray-700 max-w-2xl">
        Plataforma digital para intermediar doações de móveis, roupas, brinquedos e
        utensílios domésticos, com foco na redução do descarte irregular em terrenos
        baldios no município de Sarandi/PR.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="p-4 rounded-lg bg-white shadow-sm border">
          <h2 className="font-semibold text-gray-900">Para quem quer doar</h2>
          <p className="mt-2 text-sm text-gray-700">
            Cadastre itens em bom estado ou que possam ser reutilizados após pequenos
            reparos. Ajude a prolongar a vida útil dos objetos e apoiar outras pessoas.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white shadow-sm border">
          <h2 className="font-semibold text-gray-900">Para quem precisa</h2>
          <p className="mt-2 text-sm text-gray-700">
            Encontre móveis e objetos disponíveis em seu bairro, reduzindo custos e
            incentivando o consumo consciente.
          </p>
        </div>
      </div>
    </section>
  );
}
