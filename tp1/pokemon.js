(async () => {
    const fetch = (await import('node-fetch')).default;
    const readline = require('readline');

    // Helper function to get Pokémon data
    async function getPokemonData(pokemonName) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Could not fetch Pokémon data.');
        }
        return await response.json();
    }

    // Function to select 5 random moves for a Pokémon
    async function selectRandomMoves(moves) {
        const selectedMoves = [];
        while (selectedMoves.length < 5 && selectedMoves.length < moves.length) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            const moveDetails = await getMoveDetails(move.move.name); // Fetch detailed move data
            selectedMoves.push({ 
                move: moveDetails, // Store the full move details
                pp: 5 // Initialize PP to 5
            });
        }
        return selectedMoves;
    }

    // Function to get move details
    async function getMoveDetails(moveName) {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
        if (!response.ok) {
            throw new Error('Could not fetch move data.');
        }
        return await response.json();
    }

    // Function to simulate the battle
    async function battle(playerPokemon, botPokemon, playerMoves, botMoves) {
        let playerHP = 300;
        let botHP = 300;

        console.log(`Battle Start: ${playerPokemon.name} vs ${botPokemon.name}!`);

        while (playerHP > 0 && botHP > 0) {
            // Player's turn to choose a move
            console.log(`\nYour Moves:`);
            playerMoves.forEach((move, index) => {
                console.log(`${index + 1}. ${move.move.name} (PP: ${move.pp}, accuracy: ${move.move.accuracy}, power: ${move.move.power})`);
            });

            const moveChoice = await promptUser('Choose your move (1-5): ');

            // Validate move choice
            const moveIndex = parseInt(moveChoice) - 1;
            if (moveIndex < 0 || moveIndex >= playerMoves.length || playerMoves[moveIndex].pp <= 0) {
                console.log("Invalid move choice or no PP left! Try again.");
                continue; // Ask for move again
            }

            const playerMove = playerMoves[moveIndex];
            console.log(`\nPlayer's ${playerPokemon.name} uses ${playerMove.move.name}!`);

            // Accuracy check
            if (Math.random() * 100 < playerMove.move.accuracy) {
                botHP -= playerMove.move.power;
                console.log(`It hits! ${botPokemon.name} takes ${playerMove.move.power} damage. ${botPokemon.name}'s HP is now ${botHP}.`);
            } else {
                console.log("The move missed!");
            }

            // Decrease PP of the used move
            playerMoves[moveIndex].pp--;

            // Check if the bot is defeated
            if (botHP <= 0) {
                console.log(`\n${botPokemon.name} fainted! Player wins!`);
                break;
            }

            // Bot's turn to attack
            const botMoveIndex = Math.floor(Math.random() * botMoves.length);
            const botMove = botMoves[botMoveIndex];
            console.log(`\nBot's ${botPokemon.name} uses ${botMove.move.name}!`);

            // Accuracy check
            if (Math.random() * 100 < botMove.move.accuracy) {
                playerHP -= botMove.move.power;
                console.log(`It hits! ${playerPokemon.name} takes ${botMove.move.power} damage. ${playerPokemon.name}'s HP is now ${playerHP}.`);
            } else {
                console.log("The move missed!");
            }

            // Decrease PP of the bot's move
            botMoves[botMoveIndex].pp--; // Assume bot moves have PP

            // Check if the player is defeated
            if (playerHP <= 0) {
                console.log(`\n${playerPokemon.name} fainted! Bot wins!`);
                break;
            }
        }
    }

    // Function to prompt the user for input
    function promptUser(query) {
        return new Promise((resolve) => {
            rl.question(query, (answer) => {
                resolve(answer);
            });
        });
    }

    // Set up readline for user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Player chooses a Pokémon
    rl.question('Choose your Pokémon (e.g., pikachu, bulbasaur): ', async (playerPokemonName) => {
        try {
            const playerPokemon = await getPokemonData(playerPokemonName);
            const playerMoves = await selectRandomMoves(playerPokemon.moves); // Await the async function

            console.log(`Player chose ${playerPokemon.name}`);
            console.log('Selected Moves:', playerMoves.map(move => move.move.name).join(', '));

            // Bot chooses a Pokémon randomly
            const botPokemonNames = ['bulbasaur', 'charmander', 'squirtle', 'jigglypuff']; // Add more options if desired
            const botPokemonName = botPokemonNames[Math.floor(Math.random() * botPokemonNames.length)];
            const botPokemon = await getPokemonData(botPokemonName);
            const botMoves = await selectRandomMoves(botPokemon.moves); // Await the async function

            console.log(`Bot chose ${botPokemon.name}`);
            console.log('Bot Moves:', botMoves.map(move => move.move.name).join(', '));

            // Start the battle
            await battle(playerPokemon, botPokemon, playerMoves, botMoves);
        } catch (error) {
            console.error(error.message);
        } finally {
            rl.close();
        }
    });
})();
