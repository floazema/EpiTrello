import { initializeDatabase } from '../lib/db.js';

async function main() {
  console.log('Initialisation de la base de données...');
  try {
    await initializeDatabase();
    console.log('✓ Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

main();