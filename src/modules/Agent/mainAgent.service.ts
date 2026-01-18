import { Inject, Injectable } from '@nestjs/common';
import {
  Agent,
  tool,
} from '@openai/agents';

import z from 'zod';
import { sendMessage } from 'src/utils/telegram';


@Injectable()
export class MainAgentService {
  public mainAgent: Agent;

  constructor() {

    this.mainAgent = new Agent({
      name: 'Main Agent',
      model: 'gpt-4o-mini',
      instructions: [
        "You are a car accessories sales assistant.",
        "Main focus: always prioritize selling windshield wipers as the default product.",
        "Tasks: greet the customer politely (use 'anh/chị' for the customer and refer to yourself as 'em' in Vietnamese). If the customer does not mention any product, assume they are asking about windshield wipers.",
        // "If the product is a wiper, always check whether the customer's vehicle is suitable for the product before placing an order.",
        // "When the customer wants to buy windshield wipers, ALWAYS call the tool `check_product_compatibility` first to verify the wiper fits the customer's car. Only if the compatibility check passes, then call `place_order`.",
        "Besides wipers, whenever possible, naturally upsell other car accessories (such as air filters, cabin filters, engine oil, etc.), with a clear reason why the customer might need them.",
        "Only when the sale is completed or the customer does not buy the main product is it allowed to invite the customer to buy another product.",
        "Handle customer questions, assist with purchase decisions, and create an order by calling the tool.",
        "Always speak naturally, friendly, concise, and focus on selling.",
        "Do NOT invent discounts or reduce prices on your own. Only use the information provided by the tool/service. If there are promotions, mention them naturally.",
        "Encourage purchases in a smooth, persuasive, and polite manner.",
        "If the tool response contains handoff: true, do not generate any reply. Stop the conversation and wait for a human to take over.",
        "NOTE: Do not disclose that you are an AI model or developed by OpenAI.",
        "NOTE: Always answer in Vietnamese."
      ].join('\\n'),
      // tools: this.tools,
    });
  }


  // private tools = [
  //   tool({
  //     name: 'get_current_date',
  //     description: "Get today's date",
  //     parameters: z.object({}),
  //     execute: async () => {
  //       const today = new Date().toDateString();
  //       return { date: today };
  //     },
  //   }),
  //   tool({
  //     name: "get_product_price",
  //     description: "Retrieve the price and promotions of a product by product name",
  //     parameters: z.object({
  //       productName: z.string().describe(
  //         "Tên sản phẩm mà khách quan tâm, ví dụ: 'gạt mưa', 'lọc gió', 'nhớt ô tô'. Mặc định là bán gạt mưa"
  //       ),
  //     }),
  //     execute: async ({ productName }) => {
  //       const product = await this.productService.getProductPrice(productName);

  //       if (!product) {
  //         sendMessage(`❌ [Báo giá] Không tìm thấy sản phẩm ${productName}`);

  //         return {
  //           success: false,
  //           handoff: true,
  //           reason: "Product not found. Human support required.",
  //         }
  //       }

  //       return product;
  //     }
  //   }),
  //   tool({
  //     name: 'check_product_compatibility',
  //     description: "Use this tool to check if there are wiper products compatible with the customer's vehicle. If compatible products exist, present them to the customer in a friendly sales style (like a shop assistant), including basic details such as price and promotion. If not, politely inform the customer that there are no matching products.",
  //     parameters: z.object({
  //       carBrand: z.string().nullable().describe("Car brand, e.g. Toyota, Ford, Honda"),
  //       carModel: z.string().nullable().describe("Car model, e.g. Corolla, Ranger, Civic"),
  //       year: z.number().int().nullable().describe("Year of manufacture (e.g., 2018). Required for wiper blade products"),
  //     }),
  //     execute: async ({ carBrand, carModel, year }) => {
  //       console.log({ carBrand, carModel, year })

  //       const products = await this.productService.findAll({ carBrand, carModel, year });
  //       console.log('products: ', products)

  //       if (!products || products.length === 0) {
  //         return { compatible: false, products: [] }
  //       }

  //       // Chỉ trả về thông tin cơ bản để AI trả lời
  //       const minimalProducts = products.map(p => {
  //         const item: any = {
  //           productId: p.productId,
  //           productName: p.name,
  //           price: p.price,
  //         }
  //         if (p.note) item.note = p.note
  //         if (p.upsellMessage) item.upsellMessage = p.upsellMessage
  //     });

  //       return { compatible: true, products: minimalProducts }
  //     },
  //   }),
  //   tool({
  //     name: 'place_order',
  //     description: "Finalize the customer's order (always COD). Return full order details so the assistant can confirm with the customer. When the customer wants to buy windshield wipers, ALWAYS call the tool `check_product_compatibility` first to verify the wiper fits the customer's car. Only if the compatibility check passes, then call `place_order`",
  //     parameters: z.object({
  //       productId: z.string().nullable().describe("The ID of the selected product"),
  //       productName: z.string().optional().nullable().describe("Name of the selected product"),
  //       carModel: z.string().optional().nullable().describe("Name of the selected product"),
  //       year: z.number().int().optional().nullable().describe("Year of manufacture (e.g., 2018). Required for wiper blade products"),
  //       quantity: z.number().int().min(1).default(1).describe("Quantity of the product the customer wants to buy"),
  //       customerName: z.string().describe("Customer's name"),
  //       customerPhone: z.string().describe("Customer's phone number"),
  //       customerAddress: z.string().describe("Customer's delivery address. Detailed address: province, commune, ward, hamlet, house number"),
  //       note: z.string().optional().nullable().describe("Additional notes from the customer"),
  //     }),
  //     execute: async ({ productId, productName, carModel, year, quantity, customerName, customerPhone, customerAddress, note }) => {
  //       console.log('New order request:', { quantity, productName, carModel, year, customerName, customerPhone, customerAddress, note });

  //       const product = await this.productService.findOne({ productId, productName, carModel, year });

  //       if (!product) {
  //         sendMessage(`❌ [Tạo đơn] Hệ thống không tìm thấy sản phẩm phù hợp\nID SP: ${productId}\nTên SP: ${productName}\nModel: ${carModel}\nNăm SX:${year}`);

  //         return {
  //           success: false,
  //           handoff: true,
  //           reason: "Product not found. Human support required.",
  //         }
  //       }
  //       // const content = `
  //       // Dạ em đã tạo đơn hàng cho anh/chị rồi ạ.
  //       // Sản phẩm: Gạt mưa Toyota Vios 2018 (2 cặp)
  //       // Tổng tiền: 199.000đ
  //       // Địa chỉ: ${customerAddress}
  //       // SĐT: ${customerPhone}
  //       // Đơn hàng sẽ được giao trong vòng 2-4 ngày. Thanh toán khi nhận hàng (COD). Anh/chị chú ý điện thoại giúp em khi shipper gọi nhé.`

  //       let totalPrice = (product.unitPrice * (quantity || 1));
  //       let totalPriceText = totalPrice.toString();
  //       if (quantity >= 2 && product.productId.includes('P123')) {
  //         // totalPrice = totalPrice;
  //         totalPriceText = `${this.formatVND(totalPrice)} (Miễn ship)`;
  //       } else {
  //         totalPrice = totalPrice + 30000;
  //         totalPriceText = `${this.formatVND(totalPrice)} (Đã bao gồm phí ship)`;
  //       }

  //       let quantityText = quantity.toString();
  //       if (product.productId.includes('P123')) {
  //         quantityText = `${quantity} cặp`
  //       }

  //       sendMessage(`🍀 [Có đơn mới]\nKhách:  ${customerName}\nSĐT: ${customerPhone}\nĐịa chỉ: ${customerAddress}\nSản phẩm: ${productName}\nSố lượng: ${quantityText}\nTổng thanh toán: ${quantityText}`)

  //       const order = {
  //         customerName,
  //         customerPhone,
  //         customerAddress,
  //         productName: product?.name || productName,
  //         year: product?.year,
  //         quantity: quantityText,
  //         totalPrice: totalPriceText,
  //         paymentMethod: 'COD',
  //         deliveryTime: '2-4 ngày',
  //         message: `Đơn hàng đã được tạo thành công.`
  //       };

  //       let toolMessage = 'Dạ, em đã tạo đơn hàng cho anh/chị rồi ạ:';
  //       toolMessage += `\nSản phẩm: ${order.productName}`;
  //       if (order.quantity) toolMessage += `\nSố lượng: ${order.quantity}`;
  //       if (order.totalPrice) toolMessage += `\nTổng thanh toán: ${order.totalPrice}`;
  //       if (order.customerAddress) toolMessage += `\nĐịa chỉ: ${order.customerAddress}`;
  //       if (order.paymentMethod) toolMessage += `\nThanh toán khi nhận hàng`;
  //       toolMessage += '🚚 Hàng sẽ được giao trong 2-4 ngày tới. Anh/chị chú ý điện thoại giúp em khi shipper gọi nhé.';
  //       toolMessage += 'Cảm ơn anh/chị đã tin tưởng và ủng hộ bên em! ❤️ Chúc anh/chị lái xe an toàn và nhiều niềm vui ạ.';

  //       return toolMessage;
  //     },
  //   })

  // ];

  formatVND(number: number) {
    const formatterUSD = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });

    return formatterUSD.format(number);
  }
}
