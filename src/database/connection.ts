import knex from 'knex'
import path from 'path'

const connection = knex({
    client: 'sqlite3',
    connection: {
        // __dirname é uma paravra reservada que retorna o diretorio do 
        // caminho que está executando ele;
        // se esquecer o que o path.resolve faz pesquisar no google 
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true
})

export default connection