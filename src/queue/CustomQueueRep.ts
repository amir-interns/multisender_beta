import {EntityRepository, Repository} from "typeorm";
import {RequestEntity} from "../entity/request.entity";
import {InjectRepository} from "@nestjs/typeorm";

@EntityRepository(RequestEntity)
export class RequestRepository extends Repository<RequestEntity> {
  constructor(@InjectRepository(RequestEntity)
              public rep: Repository<RequestEntity>) {
    super();
  }
}