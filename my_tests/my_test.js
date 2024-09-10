import { RecintosZoo } from '../src/recintos-zoo.js';

// Crie uma instância da classe RecintosZoo
const zoo = new RecintosZoo();

// Lista de exemplos de uso
const testAnimals = [
    ["HIPOPOTAMO", 1],
    ["MACACO", 2],
    ["LEOPARDO", 2],
    ["CROCODILO", 2],
    ["GAZELA", 2],
    ["MACACO", 10],
    ["LEAO", 2],
    ["MACACO", 1],
    ["HIPOPOTAMO", 2]
];

// Loop para imprimir os resultados
testAnimals.forEach(([animal, quantidade]) => {
    console.log(`${animal} ${quantidade}`, zoo.analisaRecintos(animal, quantidade));
    console.log("-".repeat(50));
});
