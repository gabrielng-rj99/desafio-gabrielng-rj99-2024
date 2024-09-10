import fs from 'fs';

class RecintosZoo {
    constructor() {
        this.loadData();
    }

    loadData() {
        const jsonData = fs.readFileSync('././src/recintos-zoo.json', 'utf8');
        const data = JSON.parse(jsonData);

        this.biomes = data.biomes.reduce((acc, biome) => {
            acc[biome.id] = biome;
            return acc;
        }, {});

        this.animals = data.animals.reduce((acc, animal) => {
            acc[animal.id] = animal;
            return acc;
        }, {});

        this.animalsId = data.animals.reduce((acc, animal) => {
            acc[animal.name] = animal.id;
            return acc;
        }, {});
    }

    analisaRecintos(animal, quantidade) {
        if (quantidade <= 0) {
            return { erro: "Quantidade inválida" };
        }

        const animalId = this.getAnimalId(animal);
        if (animalId === undefined) {
            return { erro: "Animal inválido" };
        }

        const validBiomes = this.validBiomes(animalId);
        const neededSpace = this.animals[animalId].size * quantidade;
        const freeSpaces = this.freeSpace(validBiomes, neededSpace);
        const finalBiomes = this.applyAnimalRules(animal, quantidade, freeSpaces);

        if (Object.keys(finalBiomes).length === 0) {
            return { erro: "Não há recinto viável" };
        }

        return this.formatResponse(finalBiomes, neededSpace);
    }

    getAnimalId(animal) {
        return this.animalsId[animal];
    }

    applyAnimalRules(animal, quantidade, freeBiomes) {
        let flags = [];

        if (animal === "MACACO") {
            flags = this.monkeyRule(quantidade, freeBiomes);
        }

        if (animal === "HIPOPOTAMO") {
            flags = this.hippoRule(freeBiomes);
        }

        flags.forEach(flag => {
            delete freeBiomes[flag];
        });

        return freeBiomes;
    }

    monkeyRule(quantidade, freeBiomes) {
        return Object.keys(freeBiomes).filter(biome => 
            quantidade < 2 && freeBiomes[biome] === this.biomes[biome].total_size
        );
    }

    hippoRule(freeBiomes) {
        const hippoId = this.animalsId["HIPOPOTAMO"];
        const filteredBiomes = [];
    
        for (let biome in freeBiomes) {
            const freeSpace = freeBiomes[biome];
            const totalSize = this.biomes[biome].total_size;
            const biomeName = this.biomes[biome].name;
            const biomeAnimals = this.biomes[biome].animals;
    
            // Condição 1: Verifica se o bioma ainda tem espaço disponível
            if (freeSpace >= totalSize) {
                continue; // Se o bioma está cheio, pula para o próximo
            }
    
            // Condição 2: Verifica se o hipopótamo já está no bioma
            if (hippoId in biomeAnimals) {
                continue; // Se o hipopótamo já está no bioma, pula para o próximo
            }
    
            // Condição 3: Verifica se o bioma contém "savana" e "rio" no nome
            if (biomeName.includes("savana") && biomeName.includes("rio")) {
                continue; // Se o bioma contém "savana" e "rio", pula para o próximo
            }
    
            // Se passou por todas as verificações, adiciona à lista de biomas válidos
            filteredBiomes.push(biome);
        }
    
        return filteredBiomes;
    }    
    
    validBiomes(animalId) {
        const animalBiomes = this.animals[animalId].biomes;
        let validBiomes = Object.keys(this.biomes).filter(biome => 
            animalBiomes.some(b => this.biomes[biome].name.includes(b))
        );
    
        if (this.animals[animalId].carnivore) {
            validBiomes = validBiomes.filter(biome => {
                const animalIds = Object.keys(this.biomes[biome].animals);
                // Para carnívoros, o bioma deve conter apenas o animal em questão
                return animalIds.every(id => this.animals[id].carnivore && parseInt(id) === animalId);
            });
        } else {
            validBiomes = validBiomes.filter(biome => {
                const animalIds = Object.keys(this.biomes[biome].animals);
                // Para herbívoros, o bioma não deve conter carnívoros
                return !animalIds.some(id => this.animals[id].carnivore);
            });
        }
    
        return validBiomes;
    }     

    freeSpace(validBiomes, neededSpace) {
        const freeSpaces = {};

        validBiomes.forEach(biome => {
            let currentSpace = this.biomes[biome].total_size;

            Object.keys(this.biomes[biome].animals).forEach(animalId => {
                currentSpace -= this.animals[parseInt(animalId)].size * this.biomes[biome].animals[animalId];
            });

            if (currentSpace >= neededSpace) {
                freeSpaces[biome] = currentSpace;
            }
        });

        return freeSpaces;
    }
    
    formatResponse(finalBiomes, neededSpace) {
        return {
            recintosViaveis: Object.keys(finalBiomes).sort().map(biome => {
                const freeSpace = finalBiomes[biome] - neededSpace;
                const totalSize = this.biomes[biome].total_size;
                return `Recinto ${biome} (espaço livre: ${freeSpace} total: ${totalSize})`;
            })
        };
    }
}

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

export { RecintosZoo };