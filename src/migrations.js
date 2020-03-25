import walkSync from 'walk-sync'
import { readFileSync } from 'fs'
import { driver } from './driver'
import retryPromise from './utils/retryPromise'
import chalk from 'chalk'

/**
 * Run migrations by reading the `./migrations` directory and running all *.cypher files using transactions
 * @returns {Promise<void>}
 */
export const runMigrations = () => {
  const migrationFiles = walkSync(`${__dirname}/migrations`, {
    directories: false,
    includeBasePath: true,
    globs: ['*.cypher']
  })

  console.log(chalk.gray('Running migrations'))
  console.log(chalk.gray('------------------'))

  return retryPromise(() => {
    console.log(chalk.gray('Verifying Neo4j connectivity...'))

    return driver.verifyConnectivity()
  }, 15, 2500)
    .then(() => {
      console.log(chalk.gray('Connected to Neo4j instance, running migrations...'))

      const tx = driver.session().beginTransaction()

      const transactions = migrationFiles.map((migrationFile, index) => {
        console.log(chalk.blue(`${index + 1}. ${migrationFile}`))

        return tx.run(readFileSync(migrationFile).toString()).catch(error => {
          console.log(chalk.red(`Failed to run migration: ${migrationFile}`))
          throw error
        })
      })

      return Promise.all(transactions)
        .then(() => tx.commit())
        .catch(error => {
          console.log(chalk.red(`Error while running transactions: ${error.message}`))
        })
        .then(() => {
          console.log(chalk.green(`Successfully run ${transactions.length} migrations`))
        })
    })
    .catch(error => {
      console.log(chalk.red(`Failed to run migrations: ${error.message}`))
    })
}
