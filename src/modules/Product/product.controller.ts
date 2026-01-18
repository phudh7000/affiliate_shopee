
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from 'src/mongodb';

@Controller('api/product')
export class ProductController {
  constructor(
    private productService: ProductService,
  ) { }

  @Get()
  findAll(@Query() query: {carBrand: string, carModel: string, year: number}) {
    return this.productService.findAll(query);
  }

  @Post()
  create(@Body() body: Product) {
    return this.productService.create(body);
  }
}
