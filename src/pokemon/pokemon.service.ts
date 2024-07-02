import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(query: string) {
    let pokemon: Pokemon;

    if (!isNaN(+query)) {
      pokemon = await this.pokemonModel.findOne({ no: query });
    }

    //TODO: MongoID
    if (!pokemon && isValidObjectId(query)) {
      pokemon = await this.pokemonModel.findById(query);
    }
    //TODO: Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: query.toLowerCase().trim()
      });
    }

    if (!pokemon)
      throw new NotFoundException(`La busqueda de ${query} no dio resultados`);

    return pokemon;
  }

  async update(query: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(query);
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto);

      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    /*   const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); */
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({
      _id: id
    });

    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon con el ${id} not found`);
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in DB ${JSON.stringify(error.keyValue)}`
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`
    );
  }
}
