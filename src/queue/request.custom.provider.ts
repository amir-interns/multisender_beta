
import {EntityRepository, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {RequestEntity} from "../entity/request.entity";


@EntityRepository(RequestEntity)
export class RequestRepository extends Repository<RequestEntity> {
  constructor(@InjectRepository(RequestEntity)
              public rep: Repository<RequestEntity>) {
    super();
  }
}

