# RV Refrigeração

Site estático em HTML, CSS e JavaScript. Não requer instalação de dependências ou build.

## Executar localmente

No diretório do projeto: `python3 -m http.server 8000 --bind 0.0.0.0`.

## Publicar na Vercel

Envie os arquivos para seu repositório GitHub e importe esse repositório na Vercel. Selecione o preset **Other**, deixe o comando de build vazio e use a raiz do projeto como diretório de saída. A publicação não foi realizada por este projeto.

## Imagens e conteúdo

`assets/identidade-rv.jpg` é o print fornecido pelo cliente. O CSS exibe somente a região do logotipo. Substitua por um arquivo original SVG ou PNG para melhorar definição e reduzir tamanho; ajuste `.logo-crop` para a nova imagem. As imagens `instalacao.webp`, `manutencao.webp` e `higienizacao.webp` foram criadas com IA a pedido do cliente e otimizadas em WebP. Estão identificadas como ilustrativas no site; não retratam a equipe real ou trabalhos da RV. O hero usa fotografia em tela cheia com texto sobreposto; a apresentação, os cards, a seção de cuidados e a composição do Instagram também usam essas imagens. A interface alterna fundos claros, escuros e azul para criar ritmo visual.

Sem fotografias originais, a seção de trabalhos apresenta o Instagram oficial. Não há galeria, comparador antes/depois, depoimentos, certificações, anos de experiência ou números inventados. Ao receber fotografias reais, use WebP/AVIF com dimensões explícitas, texto alternativo e lazy loading abaixo do hero; adicione a galeria somente com imagens autorizadas.

Confirmar com a empresa os dias/horários, a área atendida e condições de orçamento antes de acrescentar essas informações. O endereço, telefone e perfil vêm dos prints fornecidos. Os serviços foram aprovados pelo cliente.

Para validar Safari e iPhone, teste o link publicado em um aparelho físico. A emulação WebKit não substitui essa validação.
