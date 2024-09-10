import json

# Carregar dados do JSON
with open('././src/recintos-zoo.json') as json_file:
    data = json.load(json_file)

    BIOMES = {biome['id']: biome for biome in data['biomes']}
    
    ANIMALS = {animal['id']: animal for animal in data['animals']}
    ANIMALS_ID = {animal['name']: animal['id'] for animal in data['animals']}


class RecintosZoo:
    def analisa_recintos(self, animal: str, quantidade: int):
        if quantidade <= 0:
            return {"erro": "Quantidade inválida"}

        animal_id = self.get_animal_id(animal)
        if not animal_id:
            return {"erro": "Animal inválido"}

        valid_biomes = self.valid_biomes(animal_id)
        needed_space = ANIMALS[animal_id]["size"] * quantidade
        free_spaces = self.free_space(valid_biomes, needed_space, animal_id)
        final_biomes = self.apply_animal_rules(animal, quantidade, free_spaces)

        if not final_biomes:
            return {"erro": "Não há recinto viável"}

        return self.format_response(final_biomes, needed_space)

    def get_animal_id(self, animal):
        return ANIMALS_ID.get(animal)

    def apply_animal_rules(self, animal, quantidade, free_biomes):
        flags = []

        if animal == "MACACO":
            flags = self.monkey_rule(quantidade, free_biomes)

        if animal == "HIPOPOTAMO":
            flags = self.hippo_rule(free_biomes)

        for flag in flags:
            del free_biomes[flag]

        return free_biomes

    def monkey_rule(self, quantidade, free_biomes):
        return [
            biome for biome in free_biomes
            if quantidade < 2 and free_biomes[biome] == BIOMES[biome]['total_size']
        ]

    def hippo_rule(self, free_biomes):
        hippo_id = ANIMALS_ID["HIPOPOTAMO"]
        return [
            biome for biome in free_biomes
            if free_biomes[biome] < BIOMES[biome]['total_size'] and hippo_id not in BIOMES[biome]['animals']
            and not ("savana" in BIOMES[biome]['name'] and "rio" in BIOMES[biome]['name'])
        ]

    def valid_biomes(self, animal_id):
        animal_biomes = ANIMALS[animal_id]['biomes']
        valid_biomes = [biome for biome in BIOMES if any(b in BIOMES[biome]['name'] for b in animal_biomes)]

        if ANIMALS[animal_id]['carnivore']:
            # Para carnívoros, o bioma deve conter apenas o animal em questão (mas podem ser vários do mesmo tipo)
            return [biome for biome in valid_biomes if
                    all(ANIMALS[int(a)]['carnivore'] and int(a) == animal_id for a in BIOMES[biome]['animals'])]
        else:
            # Para não carnívoros, o bioma não deve conter animais carnívoros
            return [biome for biome in valid_biomes if
                    not any(ANIMALS[int(a)]['carnivore'] for a in BIOMES[biome]['animals'])]

    def free_space(self, valid_biomes, needed_space, animal_id):
        free_spaces = {}

        for biome in valid_biomes:
            # Cálculo do espaço atual disponível no bioma
            current_space = BIOMES[biome]['total_size'] - sum(
                ANIMALS[int(a)]['size'] * BIOMES[biome]['animals'][a] for a in BIOMES[biome]['animals']
            )
            existing_animals = set(BIOMES[biome]['animals'].keys())

            # Se o bioma contém algum animal diferente do que está sendo inserido, reduz o espaço uma vez
            if str(animal_id) not in existing_animals and len(existing_animals) > 0:
                # Reduz o espaço apenas se houver mais de um tipo de animal no bioma
                current_space -= 1

            # Adiciona o bioma à lista de biomas livres se houver espaço suficiente
            if current_space >= needed_space:
                free_spaces[biome] = current_space

        return free_spaces

    def format_response(self, final_biomes, needed_space):
        return {
            "recintosViaveis": [
                f"Recinto {biome} (espaço livre: {final_biomes[biome] - needed_space} total: {BIOMES[biome]['total_size']})"
                for biome in sorted(final_biomes.keys())
            ]
        }


zoo = RecintosZoo()

# Lista de exemplos de uso
test_animals = [
    ("HIPOPOTAMO", 1),
    ("MACACO", 2),
    ("LEOPARDO", 2),
    ("CROCODILO", 2),
    ("GAZELA", 2),
    ("MACACO", 10),
    ("LEAO", 2),
    ("MACACO", 1)
]

# Loop para imprimir os resultados
for animal, quantidade in test_animals:
    print(f"{animal} {quantidade}", zoo.analisa_recintos(animal, quantidade))
    print("-" * 50)