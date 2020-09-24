import walkSync from 'walk-sync'
import { driver } from './driver'
import retryPromise from './utils/retryPromise'
import chalk from 'chalk'

/**
 * Run migrations by reading the `./migrations` directory and running all *.js files using transactions
 * @returns {Promise<void>}
 */
export const runMigrations = async () => {
  const migrationFiles = walkSync(`${__dirname}/migrations`, {
    directories: false,
    includeBasePath: true,
    globs: ['*.js']
  })

  console.log(chalk.gray('Running migrations'))
  console.log(chalk.gray('------------------'))

  try {
    await retryPromise(() => {
      console.log(chalk.gray('Verifying Neo4j connectivity...'))

      return driver.verifyConnectivity()
    }, 15, 2500)

    console.log(chalk.gray('Connected to Neo4j instance, running migrations...'))
  } catch (error) {
    console.log(chalk.red(`Failed to connect with the Neo4j server: ${error.message}`))

    throw error
  }

  const session = driver.session()

  for (let i = 0; i < migrationFiles.length; i++) {
    const migrationFn = require(migrationFiles[i]).default

    console.log(chalk.blue(`${i + 1}. ${migrationFiles[i]}`))

    try {
      await session.writeTransaction((tx) => migrationFn(tx, driver))
    } catch (error) {
      console.log(chalk.red(`Failed to run migration: ${migrationFiles[i]}`))
      console.log(chalk.red(error.message))

      await session.close()
      throw error
    }
  }

  await session.close()
  console.log(chalk.green(`Successfully applied ${migrationFiles.length} migrations`))
}
