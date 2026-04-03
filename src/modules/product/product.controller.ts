import { FastifyReply, FastifyRequest } from "fastify";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { ProductService } from "./product.service";

const service = new ProductService();

export async function createProductController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = createProductSchema.parse(request.body);
  const product = await service.create(body);
  reply.status(201).send(product);
}

export async function listProductController(_: FastifyRequest, reply: FastifyReply): Promise<void> {
  const products = await service.list();
  reply.send(products);
}

export async function updateProductController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = updateProductSchema.parse(request.body);
  const { productId } = request.params as { productId: string };
  const product = await service.update(productId, body);
  reply.send(product);
}
