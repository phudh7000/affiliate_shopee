import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/mongodb';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)
        private productModel: Model<Product>,
    ) { 
        this.getProductPrice("gạt mưa")
    }

    async create(product: Product) {
        const inserted_product = await this.productModel.insertOne(product);
        console.log('inserted_product: ', inserted_product)
        return inserted_product;
    }

    async getProductPrice(productName: string) {
        const product = await this.productModel.findOne(
            { $text: { $search: productName } }
        )

        const data = {
            productName: product?.name,
            price: product?.price,
            unitPrice: product?.unitPrice
        }

        if (product?.upsellMessage) {
            data["upsellMessage"] = product?.upsellMessage;
        }

        console.log('find text: ', product)

        return data;
    }

    async findAll(param: { carBrand: string | null, carModel: string | null, year: number | null }): Promise<Product[]> {
        const { carBrand, carModel, year } = param;
        const query = {};
        if (carBrand) { query["carBrand"] = { $regex: carBrand, $options: "i" } };
        if (carModel) { query["carModel"] = { $regex: carModel, $options: "i" } };
        if (year) { query["year"] = year };
        console.log({ query })

        const products = await this.productModel.find(query);
        return products;
    }

    async findOne(param: { productId: string | null, productName?: string | null, carModel?: string | null, year?: number | null }) {
        const { productId, productName, carModel, year } = param;
        let product: Product | null = null;
        if (productId) {
            product = await this.productModel.findOne({
                productId: { $regex: productId, $options: "i" }
            })
        }
        if (!product && productName && carModel && year) {
            product = await this.productModel.findOne({
                name: { $regex: productName, $options: "i" },
                carModel: { $regex: carModel, $options: "i" },
                year: year
            })
        }

        return product;
    }
}
