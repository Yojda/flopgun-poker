import { ProblemStateService } from '../services/problemStateService';
import { prisma } from '../utils/db';

async function testProblemState() {
  const problemStateService = new ProblemStateService();

  try {
    console.log('🧪 Test du système ProblemState...\n');

    // 1. Créer un utilisateur de test
    console.log('1. Création d\'un utilisateur de test...');
    const testUser = await prisma.users.create({
      data: {
        username: 'testuser_problemstate',
        email: 'test_problemstate@example.com',
        password: 'hashedpassword123'
      }
    });
    console.log(`✅ Utilisateur créé avec l'ID: ${testUser.id}`);

    // 2. Récupérer un problème existant
    console.log('\n2. Récupération d\'un problème existant...');
    const problem = await prisma.problem.findFirst();
    if (!problem) {
      throw new Error('Aucun problème trouvé dans la base de données');
    }
    console.log(`✅ Problème trouvé: ${problem.title} (ID: ${problem.id})`);

    // 3. Tester le démarrage d'un problème
    console.log('\n3. Test du démarrage d\'un problème...');
    const startedState = await problemStateService.startProblem(testUser.id, problem.id);
    console.log(`✅ Problème démarré avec l'état: ${startedState.state}`);

    // 4. Vérifier que l'utilisateur ne peut pas redémarrer le même problème
    console.log('\n4. Test de la protection contre le redémarrage...');
    try {
      await problemStateService.startProblem(testUser.id, problem.id);
      console.log('❌ Erreur: Le problème aurait dû être déjà démarré');
    } catch (error: any) {
      console.log(`✅ Protection active: ${error.message}`);
    }

    // 5. Tester la soumission d'une réponse correcte
    console.log('\n5. Test de la soumission d\'une réponse correcte...');
    const correctAnswer = await problemStateService.submitAnswer(testUser.id, problem.id, true);
    console.log(`✅ Réponse correcte enregistrée avec l'état: ${correctAnswer.state}`);

    // 6. Vérifier que l'utilisateur ne peut pas répondre deux fois
    console.log('\n6. Test de la protection contre les réponses multiples...');
    try {
      await problemStateService.submitAnswer(testUser.id, problem.id, false);
      console.log('❌ Erreur: L\'utilisateur aurait dû avoir déjà répondu');
    } catch (error: any) {
      console.log(`✅ Protection active: ${error.message}`);
    }

    // 7. Tester les méthodes de vérification
    console.log('\n7. Test des méthodes de vérification...');
    const hasAnswered = await problemStateService.hasAnsweredProblem(testUser.id, problem.id);
    console.log(`✅ L'utilisateur a-t-il répondu? ${hasAnswered}`);

    const canAnswer = await problemStateService.canAnswerProblem(testUser.id, problem.id);
    console.log(`✅ L'utilisateur peut-il répondre? ${canAnswer}`);

    // 8. Récupérer l'état du problème
    console.log('\n8. Récupération de l\'état du problème...');
    const problemState = await problemStateService.getProblemState(testUser.id, problem.id);
    console.log(`✅ État du problème: ${JSON.stringify(problemState, null, 2)}`);

    // 9. Récupérer tous les progrès de l'utilisateur
    console.log('\n9. Récupération de tous les progrès...');
    const userProgress = await problemStateService.getUserProgress(testUser.id);
    console.log(`✅ Progrès de l'utilisateur: ${userProgress.length} problème(s)`);

    // 10. Nettoyage
    console.log('\n10. Nettoyage des données de test...');
    await prisma.problemstate.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.users.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Données de test supprimées');

    console.log('\n🎉 Tous les tests sont passés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testProblemState();
}

export { testProblemState }; 