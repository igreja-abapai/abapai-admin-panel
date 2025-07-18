# Abapai Admin - Vue 3

Este é o painel administrativo da Abapai, desenvolvido em Vue 3 com TypeScript.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática para JavaScript
- **Vue Router** - Roteamento oficial do Vue
- **Pinia** - Gerenciamento de estado
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **Heroicons** - Ícones SVG
- **Headless UI** - Componentes acessíveis

## 📋 Funcionalidades

- ✅ **Autenticação** - Login/logout com JWT
- ✅ **Dashboard** - Visão geral com estatísticas
- ✅ **Gestão de Membros** - Lista, detalhes e cadastro
- ✅ **Pedidos de Oração** - Gestão de pedidos de oração
- ✅ **Layout Responsivo** - Funciona em desktop e mobile
- ✅ **Navegação** - Sidebar com menu de navegação
- ✅ **Filtros e Busca** - Pesquisa e filtros nas listagens

## 🛠️ Instalação

1. **Clone o repositório**

   ```bash
   git clone <repository-url>
   cd abapai-admin
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com a URL da sua API:

   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizáveis
├── config/          # Configurações
├── guards/          # Guardas de rota
├── layouts/         # Layouts da aplicação
├── router/          # Configuração de rotas
├── services/        # Serviços e APIs
├── stores/          # Stores do Pinia
└── views/           # Páginas da aplicação
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código

## 🎨 Design System

O projeto utiliza Tailwind CSS com uma paleta de cores personalizada:

- **Primary**: Azul (#3b82f6)
- **Neutral**: Tons de cinza
- **Success**: Verde para status ativo
- **Warning**: Amarelo para pendente
- **Error**: Vermelho para inativo/fechado

## 🔐 Autenticação

O sistema utiliza JWT tokens para autenticação:

- Tokens são armazenados no localStorage
- Interceptadores automáticos para adicionar Authorization header
- Redirecionamento automático para login em caso de 401
- Guardas de rota para proteger páginas administrativas

## 📱 Responsividade

- Layout responsivo que funciona em desktop e mobile
- Sidebar colapsável em telas menores
- Menu mobile com overlay
- Cards e listas adaptáveis

## 🚀 Deploy

Para fazer deploy:

1. Configure as variáveis de ambiente de produção
2. Execute `npm run build`
3. Faça upload dos arquivos da pasta `dist/`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
