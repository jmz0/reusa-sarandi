export default function Sobre() {
  return (
    <section aria-labelledby="sobre-titulo" className="max-w-3xl">
      <h1
        id="sobre-titulo"
        className="text-2xl sm:text-3xl font-bold text-gray-900"
      >
        Sobre o projeto Reusa Sarandi
      </h1>

      <p className="mt-3 text-gray-700">
        O <strong>Reusa Sarandi</strong> é um projeto de extensão desenvolvido
        no âmbito do <strong>Curso de Tecnologia da Informação</strong> da
        <strong> Universidade Federal de Mato Grosso do Sul (UFMS)</strong>. 
        Ele tem como objetivo central contribuir para a redução do descarte
        inadequado de móveis, eletrodomésticos e objetos em terrenos baldios no
        município de Sarandi/PR, por meio de uma plataforma digital de
        intermediação de doações.
      </p>

      <p className="mt-2 text-gray-700">
        A iniciativa conecta universidade, comunidade e poder público local,
        fomentando práticas de <strong>economia circular</strong> e estímulo ao
        reaproveitamento de bens que, embora descartados por alguns moradores,
        podem ser extremamente úteis para outras famílias. Dessa forma, o
        projeto atua tanto na dimensão ambiental quanto na social.
      </p>

      <p className="mt-2 text-gray-700">
        Sob a perspectiva acadêmica, o projeto funciona como um{" "}
        <strong>laboratório prático de desenvolvimento de software</strong>,
        permitindo que estudantes planejem, projetem e implementem uma solução
        tecnológica completa aplicada a um problema real do território,
        consolidando habilidades técnicas e de extensão universitária.
      </p>

      <p className="mt-2 text-gray-700">
        A plataforma contempla, nesta versão protótipo:
      </p>

      <ul className="mt-2 list-disc list-inside text-gray-700 text-sm space-y-1">
        <li>
          <strong>Cadastro de usuários</strong> com autenticação local.
        </li>
        <li>
          <strong>Cadastro de itens para doação</strong> com fotos,
          descrição detalhada, estado de conservação e bairro.
        </li>
        <li>
          <strong>Listagem de itens disponíveis</strong> com filtros por
          categoria, condição e busca por palavras-chave.
        </li>
        <li>
          <strong>Área “Meus itens”</strong> para gerenciamento completo do
          doador: atualizar status (disponível, em negociação, doado) ou remover.
        </li>
        <li>
          <strong>Caixa de Entrada</strong> permitindo troca de mensagens
          entre doadores e interessados, preservando dados pessoais.
        </li>
      </ul>

      <p className="mt-2 text-gray-700">
        Em etapas futuras, o Reusa Sarandi poderá evoluir com backend completo,
        integração com banco de dados, métricas de impacto socioambiental e
        recursos avançados de comunicação entre usuários — ampliando sua
        contribuição como ferramenta cidadã e de formação tecnológica na UFMS.
      </p>
    </section>
  );
}
