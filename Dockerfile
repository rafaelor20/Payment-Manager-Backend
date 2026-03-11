# Versão do node recomendada.
FROM node:24-alpine

# Define um diretório raiz.
WORKDIR /usr/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala as dependências.
RUN npm install

# Copia todos os arquivos necessários da aplicação.
COPY . .

# Executa o build/compilação dos arquivos.
RUN npm run build

# Porta que o app é executado.
EXPOSE 3333
