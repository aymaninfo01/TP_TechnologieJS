const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'https://pokeapi.co/api/v2';
const MAX_HP = 300;

async function getPokemon(pokemonName) {
    try {
        const response = await axios.get(`${BASE_URL}/pokemon/${pokemonName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        return null;
    }
}

async function getMoveDetails(moveUrl) {
    try {
        const response = await axios.get(moveUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching move details:', error);
        return null;
    }
}

async function selectMoves(moves) {
    const validMoves = moves
        .filter(move => move.move.name && move.version_group_details[0].move_learn_method.name === 'level-up')
        .slice(0, 5);
    
    const moveDetailsPromises = validMoves.map(m => getMoveDetails(m.move.url));
    const detailedMoves = await Promise.all(moveDetailsPromises);

    return detailedMoves.map(m => ({
        name: m.name,
        accuracy: m.accuracy || 100,
        power: m.power || 50,
        pp: m.pp
    }));
}

function calculateDamage(accuracy, power) {
    const hit = Math.random() * 100 < accuracy;
    return hit ? power : 0;
}

function chooseMove(moves) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log("\nChoose a move:");
        moves.forEach((move, index) => {
            console.log(`${index + 1}. ${move.name} (Accuracy: ${move.accuracy}, Power: ${move.power}, PP: ${move.pp})`);
        });

        rl.question('Enter the number of the move: ', (answer) => {
            const moveIndex = parseInt(answer) - 1;
            if (moveIndex >= 0 && moveIndex < moves.length) {
                rl.close();
                resolve(moves[moveIndex]);
            } else {
                console.log('Invalid choice. Defaulting to the first move.');
                rl.close();
                resolve(moves[0]);
            }
        });
    });
}

async function battle(playerPokemon, botPokemon) {
    let playerHP = MAX_HP;
    let botHP = MAX_HP;

    while (playerHP > 0 && botHP > 0) {
        console.log(`\nPlayer's ${playerPokemon.name} HP: ${playerHP}`);
        console.log(`Bot's ${botPokemon.name} HP: ${botHP}`);

        let playerMove = await chooseMove(playerPokemon.moves);

        
        if (playerMove.pp > 0) {
            playerMove.pp--; 
            const playerDamage = calculateDamage(playerMove.accuracy, playerMove.power);
            botHP -= playerDamage;
            if (playerDamage > 0) {
                console.log(`Player used ${playerMove.name} and dealt ${playerDamage} damage!`);
            } else {
                console.log(`Player used ${playerMove.name} but it missed!`);
            }
        } else {
            console.log(`${playerMove.name} has no PP left! Choose another move.`);
            continue; 
        }

        if (botHP <= 0) break;

        let botMove = botPokemon.moves[Math.floor(Math.random() * botPokemon.moves.length)];

        
        if (botMove.pp > 0) {
            botMove.pp--; 
            const botDamage = calculateDamage(botMove.accuracy, botMove.power);
            playerHP -= botDamage;
            if (botDamage > 0) {
                console.log(`Bot used ${botMove.name} and dealt ${botDamage} damage!`);
            } else {
                console.log(`Bot used ${botMove.name} but it missed!`);
            }
        } else {
            console.log(`Bot tried to use ${botMove.name}, but it has no PP left!`);
        }
    }

    if (playerHP <= 0) {
        console.log("\nBot wins the battle!");
    } else {
        console.log("\nPlayer wins the battle!");
    }
}

async function choosePokemon() {
    const availablePokemons = ['pikachu', 'charmander', 'bulbasaur', 'squirtle', 'jigglypuff'];
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log("Available Pokémon:");
        availablePokemons.forEach((pokemon, index) => {
            console.log(`${index + 1}. ${pokemon}`);
        });

        rl.question('Choose your Pokémon (enter the number): ', (answer) => {
            const selectedIndex = parseInt(answer) - 1;
            if (selectedIndex >= 0 && selectedIndex < availablePokemons.length) {
                const selectedPokemon = availablePokemons[selectedIndex];
                console.log(`You chose ${selectedPokemon}`);
                rl.close();
                resolve(selectedPokemon);
            } else {
                console.log('Invalid choice. Defaulting to Pikachu.');
                rl.close();
                resolve('pikachu');
            }
        });
    });
}

async function startGame() {
    const playerPokemonName = await choosePokemon(); 
    const botPokemonName = 'bulbasaur';

    const playerPokemonData = await getPokemon(playerPokemonName);
    const botPokemonData = await getPokemon(botPokemonName);

    if (!playerPokemonData || !botPokemonData) {
        console.error('Failed to fetch Pokémon data');
        return;
    }

    const playerPokemon = {
        name: playerPokemonData.name,
        moves: await selectMoves(playerPokemonData.moves),
    };

    const botPokemon = {
        name: botPokemonData.name,
        moves: await selectMoves(botPokemonData.moves),
    };

    console.log(`Player selected ${playerPokemon.name}`);
    console.log(`Bot selected ${botPokemon.name}`);

    await battle(playerPokemon, botPokemon);
}

startGame();
