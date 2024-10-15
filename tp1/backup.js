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
    function selectRandomMoves(moves) {
        const selectedMoves = [];
        while (selectedMoves.length < 5 && selectedMoves.length < moves.length) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            if (!selectedMoves.includes(move)) {
                selectedMoves.push(move);
            }
        }
        return selectedMoves;
    }

    // Function to get move details
    async function getMoveDetails(moveName) {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
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
                console.log(`${index + 1}. ${move.move.name}`);
            });

            const moveChoice = await promptUser('Choose your move (1-5): ');

            // Validate move choice
            const moveIndex = parseInt(moveChoice) - 1;
            if (moveIndex < 0 || moveIndex >= playerMoves.length) {
                console.log("Invalid move choice! Try again.");
                continue; // Ask for move again
            }

            const playerMove = await getMoveDetails(playerMoves[moveIndex].move.name);
            console.log(`\nPlayer's ${playerPokemon.name} uses ${playerMove.name}!`);

            // Accuracy check
            if (Math.random() * 100 < playerMove.accuracy) {
                botHP -= playerMove.power;
                console.log(`It hits! ${botPokemon.name} takes ${playerMove.power} damage. ${botPokemon.name}'s HP is now ${botHP}.`);
            } else {
                console.log("The move missed!");
            }

            // Check if the bot is defeated
            if (botHP <= 0) {
                console.log(`\n${botPokemon.name} fainted! Player wins!`);
                break;
            }

            // Bot's turn to attack
            const botMove = await getMoveDetails(botMoves[Math.floor(Math.random() * botMoves.length)].move.name);
            console.log(`\nBot's ${botPokemon.name} uses ${botMove.name}!`);

            // Accuracy check
            if (Math.random() * 100 < botMove.accuracy) {
                playerHP -= botMove.power;
                console.log(`It hits! ${playerPokemon.name} takes ${botMove.power} damage. ${playerPokemon.name}'s HP is now ${playerHP}.`);
            } else {
                console.log("The move missed!");
            }

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
            const playerMoves = selectRandomMoves(playerPokemon.moves);

            console.log(`Player chose ${playerPokemon.name}`);
            console.log('Selected Moves:', playerMoves.map(move => move.move.name).join(', '));

            // Bot chooses a Pokémon randomly
            const botPokemonNames = ['bulbasaur', 'charmander', 'squirtle', 'jigglypuff']; // Add more options if desired
            const botPokemonName = botPokemonNames[Math.floor(Math.random() * botPokemonNames.length)];
            const botPokemon = await getPokemonData(botPokemonName);
            const botMoves = selectRandomMoves(botPokemon.moves);

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
